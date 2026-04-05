import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Crown, Plus, Send, Trophy, Star, Swords,
  LogOut, MessageCircle, TrendingUp, Search, Lock, Globe,
  Target, Flame, Zap, Award, Timer,
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

const COOP_MISSION_TEMPLATES = [
  { title: "Maratona de Estudos", description: "Membros devem acumular minutos de estudo juntos", type: "study_time", target: 500, xp: 800, coins: 400 },
  { title: "Caçada de XP", description: "Acumulem XP coletivamente como guilda", type: "xp_hunt", target: 5000, xp: 1000, coins: 500 },
  { title: "Desafio Quiz", description: "Completem quizzes juntos para ganhar pontos", type: "quiz", target: 50, xp: 600, coins: 300 },
  { title: "Streak Coletivo", description: "Todos os membros devem manter streak ativo", type: "streak", target: 30, xp: 1200, coins: 600 },
  { title: "Caça aos Chefões", description: "Derrotem chefões na arena em grupo", type: "boss", target: 20, xp: 1500, coins: 700 },
  { title: "Revisão em Massa", description: "Completem sessões de revisão espaçada", type: "review", target: 100, xp: 900, coins: 450 },
];

interface Guild {
  id: string; name: string; description: string | null; emblem: string; color: string;
  leader_id: string; max_members: number; total_xp: number; total_wins: number; level: number;
  is_public: boolean; created_at: string;
}
interface GuildMember {
  id: string; guild_id: string; user_id: string; role: string; xp_contributed: number; joined_at: string;
  profile?: { public_name: string; xp: number; current_rank: string; avatar_url: string | null };
}
interface GuildMessage { id: string; guild_id: string; user_id: string; message: string; created_at: string; sender_name?: string; }
interface GuildMission { id: string; guild_id: string; title: string; description: string | null; mission_type: string; target: number; current: number; xp_reward: number; coin_reward: number; is_completed: boolean; completed_at: string | null; expires_at: string; created_at: string; }
interface GuildWar { id: string; guild_a_id: string; guild_b_id: string; guild_a_score: number; guild_b_score: number; winner_id: string | null; status: string; started_at: string; ends_at: string; rewards_claimed: boolean; guild_a?: Guild; guild_b?: Guild; }

const Guilds = () => {
  const { profile, user } = useAuth();
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [myMembership, setMyMembership] = useState<GuildMember | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [allGuilds, setAllGuilds] = useState<Guild[]>([]);
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [missions, setMissions] = useState<GuildMission[]>([]);
  const [wars, setWars] = useState<GuildWar[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [showDeclareWar, setShowDeclareWar] = useState(false);
  const [newGuild, setNewGuild] = useState({ name: "", description: "", emblem: "⚔️", color: "#6366f1", is_public: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  useEffect(() => {
    if (!myGuild) return;
    const channel = supabase
      .channel(`guild-all-${myGuild.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guild_messages", filter: `guild_id=eq.${myGuild.id}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as GuildMessage]); })
      .on("postgres_changes", { event: "*", schema: "public", table: "guild_missions", filter: `guild_id=eq.${myGuild.id}` },
        () => { loadMissions(myGuild.id); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myGuild?.id]);

  const loadData = async () => {
    setLoading(true);
    const { data: membership } = await supabase.from("guild_members").select("*").eq("user_id", user!.id).maybeSingle();
    if (membership) {
      setMyMembership(membership as GuildMember);
      const { data: guild } = await supabase.from("guilds").select("*").eq("id", membership.guild_id).single();
      if (guild) setMyGuild(guild as Guild);
      const { data: mems } = await supabase.from("guild_members").select("*").eq("guild_id", membership.guild_id);
      if (mems) {
        const memberProfiles = await Promise.all(mems.map(async (m: any) => {
          const { data: p } = await supabase.from("profiles").select("public_name, xp, current_rank, avatar_url").eq("user_id", m.user_id).single();
          return { ...m, profile: p } as GuildMember;
        }));
        setMembers(memberProfiles);
      }
      const { data: msgs } = await supabase.from("guild_messages").select("*").eq("guild_id", membership.guild_id).order("created_at", { ascending: true }).limit(100);
      if (msgs) {
        const msgsWithNames = await Promise.all(msgs.map(async (m: any) => {
          const { data: p } = await supabase.from("profiles").select("public_name").eq("user_id", m.user_id).single();
          return { ...m, sender_name: p?.public_name || "?" } as GuildMessage;
        }));
        setMessages(msgsWithNames);
      }
      await loadMissions(membership.guild_id);
      await loadWars(membership.guild_id);
    }
    const { data: guilds } = await supabase.from("guilds").select("*").order("total_xp", { ascending: false });
    if (guilds) setAllGuilds(guilds as Guild[]);
    setLoading(false);
  };

  const loadMissions = async (guildId: string) => {
    const { data } = await supabase.from("guild_missions").select("*").eq("guild_id", guildId).order("created_at", { ascending: false });
    if (data) setMissions(data as GuildMission[]);
  };

  const loadWars = async (guildId: string) => {
    const { data } = await supabase.from("guild_wars").select("*").or(`guild_a_id.eq.${guildId},guild_b_id.eq.${guildId}`).order("created_at", { ascending: false });
    if (data) {
      const warsWithGuilds = await Promise.all(data.map(async (w: any) => {
        const [{ data: a }, { data: b }] = await Promise.all([
          supabase.from("guilds").select("*").eq("id", w.guild_a_id).single(),
          supabase.from("guilds").select("*").eq("id", w.guild_b_id).single(),
        ]);
        return { ...w, guild_a: a, guild_b: b } as GuildWar;
      }));
      setWars(warsWithGuilds);
    }
  };

  const createGuild = async () => {
    if (!newGuild.name.trim()) { toast.error("Nome obrigatório!"); return; }
    const { data, error } = await supabase.from("guilds").insert({
      name: newGuild.name, description: newGuild.description, emblem: newGuild.emblem,
      color: newGuild.color, leader_id: user!.id, is_public: newGuild.is_public,
    }).select().single();
    if (error) { toast.error(error.message.includes("unique") ? "Esse nome já existe!" : "Erro ao criar guilda"); return; }
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

  const createMission = async (template: typeof COOP_MISSION_TEMPLATES[0]) => {
    if (!myGuild) return;
    await supabase.from("guild_missions").insert({
      guild_id: myGuild.id, title: template.title, description: template.description,
      mission_type: template.type, target: template.target, xp_reward: template.xp, coin_reward: template.coins,
    });
    setShowCreateMission(false);
    toast.success("🎯 Missão cooperativa criada!");
    loadMissions(myGuild.id);
  };

  const contributeMission = async (mission: GuildMission) => {
    if (mission.is_completed) return;
    const newCurrent = Math.min(mission.current + 10, mission.target);
    const completed = newCurrent >= mission.target;
    await supabase.from("guild_missions").update({
      current: newCurrent, is_completed: completed, completed_at: completed ? new Date().toISOString() : null,
    }).eq("id", mission.id);
    if (completed) toast.success(`🏆 Missão "${mission.title}" completada!`);
    else toast.success(`+10 progresso na missão!`);
    loadMissions(myGuild!.id);
  };

  const declareWar = async (targetGuildId: string) => {
    if (!myGuild) return;
    await supabase.from("guild_wars").insert({ guild_a_id: myGuild.id, guild_b_id: targetGuildId });
    setShowDeclareWar(false);
    toast.success("⚔️ Guerra declarada!");
    loadWars(myGuild.id);
  };

  const contributeWar = async (war: GuildWar) => {
    if (war.status !== "active" || !myGuild) return;
    const isA = war.guild_a_id === myGuild.id;
    await supabase.from("guild_wars").update({
      [isA ? "guild_a_score" : "guild_b_score"]: (isA ? war.guild_a_score : war.guild_b_score) + 10,
    }).eq("id", war.id);
    toast.success("⚔️ +10 pontos de guerra!");
    loadWars(myGuild.id);
  };

  const guildLevelProgress = (xp: number, level: number) => {
    const current = GUILD_LEVEL_XP[level - 1] || 0;
    const next = GUILD_LEVEL_XP[level] || GUILD_LEVEL_XP[GUILD_LEVEL_XP.length - 1];
    return ((xp - current) / (next - current)) * 100;
  };

  const filteredGuilds = allGuilds.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const otherGuilds = allGuilds.filter(g => g.id !== myGuild?.id);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-primary" /> Guildas
            </h1>
            <p className="text-muted-foreground mt-1">Forme alianças, complete missões e vença guerras!</p>
          </div>
          {!myGuild && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button className="gap-2"><Plus size={16} /> Criar Guilda</Button></DialogTrigger>
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
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${newGuild.emblem === e ? "border-primary bg-primary/10 scale-110" : "border-border/50 hover:border-primary/30"}`}>{e}</button>
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
                    <span className="text-sm">Guilda pública</span>
                  </div>
                  <Button onClick={createGuild} className="w-full">Criar Guilda</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {myGuild ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-card/50 border border-border/50">
              <TabsTrigger value="overview" className="gap-1 text-xs"><Shield size={14} /><span className="hidden md:inline">Guilda</span></TabsTrigger>
              <TabsTrigger value="missions" className="gap-1 text-xs"><Target size={14} /><span className="hidden md:inline">Missões</span></TabsTrigger>
              <TabsTrigger value="wars" className="gap-1 text-xs"><Swords size={14} /><span className="hidden md:inline">Guerras</span></TabsTrigger>
              <TabsTrigger value="members" className="gap-1 text-xs"><Users size={14} /><span className="hidden md:inline">Membros</span></TabsTrigger>
              <TabsTrigger value="chat" className="gap-1 text-xs"><MessageCircle size={14} /><span className="hidden md:inline">Chat</span></TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: myGuild.color + "20", borderColor: myGuild.color, borderWidth: 2 }}>{myGuild.emblem}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{myGuild.name}</h2>
                    <p className="text-muted-foreground text-sm">{myGuild.description || "Sem descrição"}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="outline" className="gap-1"><Star size={12} /> Nível {myGuild.level}</Badge>
                      <Badge variant="outline" className="gap-1"><Users size={12} /> {members.length}/{myGuild.max_members}</Badge>
                      <Badge variant="outline" className="gap-1"><Trophy size={12} /> {myGuild.total_wins} vitórias</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">XP da Guilda</span>
                    <span className="font-medium">{myGuild.total_xp.toLocaleString()} XP</span>
                  </div>
                  <Progress value={guildLevelProgress(myGuild.total_xp, myGuild.level)} className="h-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Top Contribuidores</h3>
                  <div className="space-y-2">
                    {members.sort((a, b) => b.xp_contributed - a.xp_contributed).slice(0, 5).map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <span className="font-bold text-sm w-6">{i + 1}º</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xs font-bold text-primary-foreground">{(m.profile?.public_name || "?")[0]}</div>
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

            {/* Cooperative Missions */}
            <TabsContent value="missions">
              <div className="space-y-4 mt-4">
                {myMembership?.role === "leader" && (
                  <Dialog open={showCreateMission} onOpenChange={setShowCreateMission}>
                    <DialogTrigger asChild><Button className="gap-2"><Plus size={16} /> Nova Missão</Button></DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>🎯 Criar Missão Cooperativa</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        {COOP_MISSION_TEMPLATES.map((t, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.02 }} onClick={() => createMission(t)}
                            className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <h4 className="font-bold text-sm">{t.title}</h4>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px]">Meta: {t.target}</Badge>
                              <Badge variant="outline" className="text-[10px]">{t.xp} XP</Badge>
                              <Badge variant="outline" className="text-[10px]">{t.coins} 🪙</Badge>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {missions.length === 0 ? (
                  <div className="text-center py-16"><Target className="mx-auto text-muted-foreground mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma missão ativa</h3>
                    <p className="text-muted-foreground">O líder pode criar missões cooperativas!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {missions.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-card/50 border rounded-xl p-5 transition-all ${m.is_completed ? "border-green-500/30 bg-green-500/5" : "border-border/50"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-foreground flex items-center gap-2">
                              {m.is_completed ? <Award size={16} className="text-green-500" /> : <Target size={16} className="text-primary" />}
                              {m.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                          </div>
                          {m.is_completed && <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completa!</Badge>}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{m.current}/{m.target}</span>
                            <span>{Math.round((m.current / m.target) * 100)}%</span>
                          </div>
                          <Progress value={(m.current / m.target) * 100} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] gap-1"><Zap size={10} />{m.xp_reward} XP</Badge>
                            <Badge variant="outline" className="text-[10px]">{m.coin_reward} 🪙</Badge>
                          </div>
                          {!m.is_completed && (
                            <Button size="sm" onClick={() => contributeMission(m)} className="gap-1">
                              <Flame size={14} /> Contribuir
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                          <Timer size={10} /> Expira: {new Date(m.expires_at).toLocaleDateString("pt-BR")}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Guild Wars */}
            <TabsContent value="wars">
              <div className="space-y-4 mt-4">
                {myMembership?.role === "leader" && (
                  <Dialog open={showDeclareWar} onOpenChange={setShowDeclareWar}>
                    <DialogTrigger asChild><Button className="gap-2 bg-red-600 hover:bg-red-700"><Swords size={16} /> Declarar Guerra</Button></DialogTrigger>
                    <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>⚔️ Declarar Guerra</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground mb-4">Escolha uma guilda para desafiar. A guerra dura 7 dias!</p>
                      <div className="space-y-3">
                        {otherGuilds.map(g => (
                          <motion.button key={g.id} whileHover={{ scale: 1.02 }} onClick={() => declareWar(g.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: g.color + "20" }}>{g.emblem}</div>
                            <div className="flex-1">
                              <span className="font-bold text-sm">{g.name}</span>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>Nv.{g.level}</span>
                                <span>{g.total_xp.toLocaleString()} XP</span>
                              </div>
                            </div>
                            <Swords size={16} className="text-red-500" />
                          </motion.button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {wars.length === 0 ? (
                  <div className="text-center py-16"><Swords className="mx-auto text-muted-foreground mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma guerra em andamento</h3>
                    <p className="text-muted-foreground">O líder pode declarar guerra a outra guilda!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wars.map((w) => {
                      const isGuildA = w.guild_a_id === myGuild?.id;
                      const myScore = isGuildA ? w.guild_a_score : w.guild_b_score;
                      const enemyScore = isGuildA ? w.guild_b_score : w.guild_a_score;
                      const enemyGuild = isGuildA ? w.guild_b : w.guild_a;
                      const totalScore = myScore + enemyScore || 1;
                      const daysLeft = Math.max(0, Math.ceil((new Date(w.ends_at).getTime() - Date.now()) / 86400000));
                      return (
                        <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`bg-card/50 border rounded-xl p-6 ${w.status === "active" ? "border-red-500/30" : "border-border/50"}`}>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant={w.status === "active" ? "destructive" : "outline"} className="gap-1">
                              <Swords size={12} />{w.status === "active" ? `⚔️ Guerra Ativa — ${daysLeft}d restantes` : "Encerrada"}
                            </Badge>
                          </div>
                          {/* VS Display */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2" style={{ backgroundColor: myGuild!.color + "20" }}>{myGuild!.emblem}</div>
                              <p className="font-bold text-sm">{myGuild!.name}</p>
                              <p className="text-2xl font-black text-primary">{myScore}</p>
                            </div>
                            <div className="text-center">
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-3xl font-black text-red-500">VS</motion.div>
                            </div>
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2" style={{ backgroundColor: (enemyGuild?.color || "#666") + "20" }}>{enemyGuild?.emblem || "?"}</div>
                              <p className="font-bold text-sm">{enemyGuild?.name || "?"}</p>
                              <p className="text-2xl font-black text-destructive">{enemyScore}</p>
                            </div>
                          </div>
                          {/* Score bar */}
                          <div className="mt-4 h-4 rounded-full bg-muted overflow-hidden flex">
                            <motion.div animate={{ width: `${(myScore / totalScore) * 100}%` }} className="bg-primary h-full" />
                            <motion.div animate={{ width: `${(enemyScore / totalScore) * 100}%` }} className="bg-destructive h-full" />
                          </div>
                          {w.status === "active" && (
                            <Button onClick={() => contributeWar(w)} className="w-full mt-4 gap-2"><Swords size={16} /> Atacar (+10 pts)</Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {members.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-lg font-bold text-primary-foreground">{(m.profile?.public_name || "?")[0]}</div>
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

            {/* Chat */}
            <TabsContent value="chat">
              <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden mt-4">
                <div className="h-80 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && <p className="text-center text-muted-foreground py-10">Nenhuma mensagem ainda.</p>}
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Buscar guildas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            {filteredGuilds.length === 0 ? (
              <div className="text-center py-16"><Shield className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-semibold mb-2">Nenhuma guilda encontrada</h3>
                <p className="text-muted-foreground mb-4">Crie a primeira guilda e lidere!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuilds.map((guild) => (
                  <motion.div key={guild.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                    className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: guild.color + "20", borderColor: guild.color, borderWidth: 2 }}>{guild.emblem}</div>
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
                      {guild.is_public && <Button size="sm" onClick={() => joinGuild(guild.id)}>Entrar</Button>}
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
