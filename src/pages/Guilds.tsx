import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Crown, Plus, Send, Trophy, Star, Swords,
  LogOut, Settings, MessageCircle, TrendingUp, Search, Lock, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GUILD_EMBLEMS = ["⚔️", "🛡️", "🐉", "🦁", "🔥", "⚡", "🌟", "💎", "🏰", "🎯", "🦅", "🐺", "🌙", "☀️", "🗡️", "🏆"];
const GUILD_COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
const GUILD_LEVEL_XP = [0, 1000, 3000, 7000, 15000, 30000, 60000, 100000, 200000, 500000];

interface Guild {
  id: string;
  name: string;
  description: string | null;
  emblem: string;
  color: string;
  leader_id: string;
  max_members: number;
  total_xp: number;
  total_wins: number;
  level: number;
  is_public: boolean;
  created_at: string;
}

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: string;
  xp_contributed: number;
  joined_at: string;
  profile?: { public_name: string; xp: number; current_rank: string; avatar_url: string | null };
}

interface GuildMessage {
  id: string;
  guild_id: string;
  user_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

const Guilds = () => {
  const { profile, user } = useAuth();
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [myMembership, setMyMembership] = useState<GuildMember | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [allGuilds, setAllGuilds] = useState<Guild[]>([]);
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newGuild, setNewGuild] = useState({ name: "", description: "", emblem: "⚔️", color: "#6366f1", is_public: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!myGuild) return;
    const channel = supabase
      .channel(`guild-chat-${myGuild.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guild_messages", filter: `guild_id=eq.${myGuild.id}` },
        (payload) => {
          const msg = payload.new as GuildMessage;
          setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myGuild?.id]);

  const loadData = async () => {
    setLoading(true);
    // Check membership
    const { data: membership } = await supabase
      .from("guild_members")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (membership) {
      setMyMembership(membership as GuildMember);
      // Load guild
      const { data: guild } = await supabase.from("guilds").select("*").eq("id", membership.guild_id).single();
      if (guild) setMyGuild(guild as Guild);
      // Load members
      const { data: mems } = await supabase.from("guild_members").select("*").eq("guild_id", membership.guild_id);
      if (mems) {
        const memberProfiles = await Promise.all(
          mems.map(async (m: any) => {
            const { data: p } = await supabase.from("profiles").select("public_name, xp, current_rank, avatar_url").eq("user_id", m.user_id).single();
            return { ...m, profile: p } as GuildMember;
          })
        );
        setMembers(memberProfiles);
      }
      // Load messages
      const { data: msgs } = await supabase.from("guild_messages").select("*").eq("guild_id", membership.guild_id).order("created_at", { ascending: true }).limit(100);
      if (msgs) {
        const msgsWithNames = await Promise.all(
          msgs.map(async (m: any) => {
            const { data: p } = await supabase.from("profiles").select("public_name").eq("user_id", m.user_id).single();
            return { ...m, sender_name: p?.public_name || "?" } as GuildMessage;
          })
        );
        setMessages(msgsWithNames);
      }
    }

    // Load all guilds for browsing
    const { data: guilds } = await supabase.from("guilds").select("*").order("total_xp", { ascending: false });
    if (guilds) setAllGuilds(guilds as Guild[]);
    setLoading(false);
  };

  const createGuild = async () => {
    if (!newGuild.name.trim()) { toast.error("Nome obrigatório!"); return; }
    const { data, error } = await supabase.from("guilds").insert({
      name: newGuild.name, description: newGuild.description, emblem: newGuild.emblem,
      color: newGuild.color, leader_id: user!.id, is_public: newGuild.is_public,
    }).select().single();
    if (error) { toast.error(error.message.includes("unique") ? "Esse nome já existe!" : "Erro ao criar guilda"); return; }
    // Add self as leader
    await supabase.from("guild_members").insert({ guild_id: data.id, user_id: user!.id, role: "leader" });
    setShowCreate(false);
    toast.success("⚔️ Guilda criada com sucesso!");
    loadData();
  };

  const joinGuild = async (guildId: string) => {
    const { error } = await supabase.from("guild_members").insert({ guild_id: guildId, user_id: user!.id });
    if (error) { toast.error("Erro ao entrar na guilda"); return; }
    toast.success("🎉 Você entrou na guilda!");
    loadData();
  };

  const leaveGuild = async () => {
    if (!myMembership) return;
    if (myMembership.role === "leader") { toast.error("Transfira a liderança antes de sair!"); return; }
    await supabase.from("guild_members").delete().eq("id", myMembership.id);
    setMyGuild(null); setMyMembership(null); setMembers([]); setMessages([]);
    toast.success("Você saiu da guilda");
    loadData();
  };

  const sendMessage = async () => {
    if (!chatMsg.trim() || !myGuild) return;
    await supabase.from("guild_messages").insert({ guild_id: myGuild.id, user_id: user!.id, message: chatMsg });
    setChatMsg("");
  };

  const guildLevelProgress = (xp: number, level: number) => {
    const current = GUILD_LEVEL_XP[level - 1] || 0;
    const next = GUILD_LEVEL_XP[level] || GUILD_LEVEL_XP[GUILD_LEVEL_XP.length - 1];
    return ((xp - current) / (next - current)) * 100;
  };

  const filteredGuilds = allGuilds.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-primary" /> Guildas
            </h1>
            <p className="text-muted-foreground mt-1">Forme alianças e conquiste juntos</p>
          </div>
          {!myGuild && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={16} /> Criar Guilda</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Criar Nova Guilda</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Nome da Guilda" value={newGuild.name} onChange={(e) => setNewGuild(p => ({ ...p, name: e.target.value }))} maxLength={30} />
                  <Textarea placeholder="Descrição (opcional)" value={newGuild.description} onChange={(e) => setNewGuild(p => ({ ...p, description: e.target.value }))} maxLength={200} />
                  <div>
                    <p className="text-sm font-medium mb-2">Emblema</p>
                    <div className="flex flex-wrap gap-2">
                      {GUILD_EMBLEMS.map(e => (
                        <button key={e} onClick={() => setNewGuild(p => ({ ...p, emblem: e }))}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${newGuild.emblem === e ? "border-primary bg-primary/10 scale-110" : "border-border/50 hover:border-primary/30"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Cor</p>
                    <div className="flex gap-2">
                      {GUILD_COLORS.map(c => (
                        <button key={c} onClick={() => setNewGuild(p => ({ ...p, color: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${newGuild.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={newGuild.is_public} onChange={(e) => setNewGuild(p => ({ ...p, is_public: e.target.checked }))} className="rounded" />
                    <span className="text-sm">Guilda pública (qualquer um pode entrar)</span>
                  </div>
                  <Button onClick={createGuild} className="w-full">Criar Guilda</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {myGuild ? (
          /* My Guild View */
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-card/50 border border-border/50">
              <TabsTrigger value="overview" className="gap-2"><Shield size={16} /><span className="hidden md:inline">Guilda</span></TabsTrigger>
              <TabsTrigger value="members" className="gap-2"><Users size={16} /><span className="hidden md:inline">Membros</span></TabsTrigger>
              <TabsTrigger value="chat" className="gap-2"><MessageCircle size={16} /><span className="hidden md:inline">Chat</span></TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: myGuild.color + "20", borderColor: myGuild.color, borderWidth: 2 }}>
                    {myGuild.emblem}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{myGuild.name}</h2>
                    <p className="text-muted-foreground text-sm">{myGuild.description || "Sem descrição"}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="gap-1"><Star size={12} /> Nível {myGuild.level}</Badge>
                      <Badge variant="outline" className="gap-1"><Users size={12} /> {members.length}/{myGuild.max_members}</Badge>
                      <Badge variant="outline" className="gap-1"><Trophy size={12} /> {myGuild.total_wins} vitórias</Badge>
                    </div>
                  </div>
                </div>

                {/* Guild XP Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">XP da Guilda</span>
                    <span className="font-medium">{myGuild.total_xp.toLocaleString()} XP</span>
                  </div>
                  <Progress value={guildLevelProgress(myGuild.total_xp, myGuild.level)} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Próximo nível: {(GUILD_LEVEL_XP[myGuild.level] || 0).toLocaleString()} XP</p>
                </div>

                {/* Top Contributors */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Top Contribuidores</h3>
                  <div className="space-y-2">
                    {members.sort((a, b) => b.xp_contributed - a.xp_contributed).slice(0, 5).map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <span className="font-bold text-sm w-6">{i + 1}º</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {(m.profile?.public_name || "?")[0]}
                        </div>
                        <span className="flex-1 text-sm font-medium">{m.profile?.public_name}</span>
                        <span className="text-xs text-muted-foreground">{m.xp_contributed.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {myMembership?.role !== "leader" && (
                  <Button variant="outline" onClick={leaveGuild} className="gap-2 text-destructive"><LogOut size={16} /> Sair da Guilda</Button>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="members">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {members.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {(m.profile?.public_name || "?")[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{m.profile?.public_name}</span>
                        {m.role === "leader" && <Crown size={14} className="text-amber-500" />}
                        {m.role === "officer" && <Shield size={14} className="text-blue-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.xp_contributed.toLocaleString()} XP contribuídos</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{m.role === "leader" ? "Líder" : m.role === "officer" ? "Oficial" : "Membro"}</Badge>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden mt-4">
                <div className="h-80 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">Nenhuma mensagem ainda. Seja o primeiro!</p>
                  )}
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, x: msg.user_id === user?.id ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.user_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-xl ${msg.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {msg.user_id !== user?.id && <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-[10px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="border-t border-border/50 p-3 flex gap-2">
                  <Input placeholder="Mensagem..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1" />
                  <Button size="icon" onClick={sendMessage}><Send size={16} /></Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Browse Guilds */
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Buscar guildas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {filteredGuilds.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma guilda encontrada</h3>
                <p className="text-muted-foreground mb-4">Crie a primeira guilda e lidere!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuilds.map((guild) => (
                  <motion.div key={guild.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: guild.color + "20", borderColor: guild.color, borderWidth: 2 }}>
                        {guild.emblem}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{guild.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star size={12} /> Nível {guild.level}
                          {guild.is_public ? <Globe size={12} /> : <Lock size={12} />}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{guild.description || "Sem descrição"}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs gap-1"><Trophy size={10} />{guild.total_wins}</Badge>
                        <Badge variant="outline" className="text-xs gap-1"><TrendingUp size={10} />{guild.total_xp.toLocaleString()} XP</Badge>
                      </div>
                      {guild.is_public && (
                        <Button size="sm" onClick={() => joinGuild(guild.id)}>Entrar</Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Guilds;
