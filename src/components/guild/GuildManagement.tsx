import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, Shield, UserMinus, Settings, Palette, Save,
  ChevronUp, Users, Target, Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GUILD_EMBLEMS = ["⚔️", "🛡️", "🐉", "🦁", "🔥", "⚡", "🌟", "💎", "🏰", "🎯", "🦅", "🐺", "🌙", "☀️", "🗡️", "🏆"];
const GUILD_COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

interface Guild {
  id: string; name: string; description: string | null; emblem: string; color: string;
  leader_id: string; max_members: number; total_xp: number; total_wins: number; level: number;
  is_public: boolean;
}

interface GuildMember {
  id: string; guild_id: string; user_id: string; role: string; xp_contributed: number;
  profile?: { public_name: string; xp: number; current_rank: string; avatar_url: string | null };
}

interface Props {
  guild: Guild;
  members: GuildMember[];
  currentUserId: string;
  onRefresh: () => void;
}

const GuildManagement = ({ guild, members, currentUserId, onRefresh }: Props) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: guild.name,
    description: guild.description || "",
    emblem: guild.emblem,
    color: guild.color,
    is_public: guild.is_public,
    max_members: guild.max_members,
  });

  const isLeader = guild.leader_id === currentUserId;
  if (!isLeader) return null;

  const saveGuild = async () => {
    const { error } = await supabase.from("guilds").update({
      name: form.name, description: form.description, emblem: form.emblem,
      color: form.color, is_public: form.is_public, max_members: form.max_members,
    }).eq("id", guild.id);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("✅ Guilda atualizada!");
    setEditing(false);
    onRefresh();
  };

  const promoteMember = async (member: GuildMember) => {
    const newRole = member.role === "member" ? "officer" : "member";
    await supabase.from("guild_members").update({ role: newRole }).eq("id", member.id);
    toast.success(newRole === "officer" ? `🎖️ ${member.profile?.public_name} promovido a Oficial!` : `${member.profile?.public_name} rebaixado a Membro`);
    onRefresh();
  };

  const kickMember = async (member: GuildMember) => {
    if (member.user_id === currentUserId) return;
    await supabase.from("guild_members").delete().eq("id", member.id);
    toast.success(`${member.profile?.public_name} foi removido da guilda`);
    onRefresh();
  };

  const transferLeadership = async (member: GuildMember) => {
    await supabase.from("guilds").update({ leader_id: member.user_id }).eq("id", guild.id);
    await supabase.from("guild_members").update({ role: "leader" }).eq("id", member.id);
    await supabase.from("guild_members").update({ role: "member" }).eq("user_id", currentUserId).eq("guild_id", guild.id);
    toast.success(`👑 Liderança transferida para ${member.profile?.public_name}!`);
    onRefresh();
  };

  const otherMembers = members.filter(m => m.user_id !== currentUserId);

  return (
    <div className="space-y-6 mt-4">
      {/* Customize Guild */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 border border-border/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Personalizar Guilda
          </h3>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
              <Edit2 size={14} /> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button size="sm" onClick={saveGuild} className="gap-1"><Save size={14} /> Salvar</Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome" maxLength={30} />
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição" maxLength={200} />
            <div>
              <p className="text-sm font-medium mb-2">Emblema</p>
              <div className="flex flex-wrap gap-2">
                {GUILD_EMBLEMS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, emblem: e }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${form.emblem === e ? "border-primary bg-primary/10 scale-110" : "border-border/50"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Cor</p>
              <div className="flex gap-2">
                {GUILD_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_public} onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))} className="rounded" />
                Guilda pública
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Máx membros:</span>
                <Input type="number" value={form.max_members} onChange={e => setForm(p => ({ ...p, max_members: parseInt(e.target.value) || 20 }))}
                  className="w-20" min={5} max={50} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2"
              style={{ backgroundColor: guild.color + "20", borderColor: guild.color }}>{guild.emblem}</div>
            <div>
              <p className="font-bold text-foreground">{guild.name}</p>
              <p className="text-sm text-muted-foreground">{guild.description || "Sem descrição"}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{guild.is_public ? "Pública" : "Privada"}</Badge>
                <Badge variant="outline" className="text-xs"><Users size={10} className="mr-1" />{members.length}/{guild.max_members}</Badge>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Member Management */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card/50 border border-border/50 rounded-xl p-5">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
          <Users size={16} className="text-primary" /> Gerenciar Membros ({otherMembers.length})
        </h3>

        {otherMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum outro membro na guilda</p>
        ) : (
          <div className="space-y-2">
            {otherMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {(m.profile?.public_name || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{m.profile?.public_name}</span>
                    {m.role === "officer" && <Shield size={12} className="text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{m.xp_contributed.toLocaleString()} XP • {m.role === "officer" ? "Oficial" : "Membro"}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => promoteMember(m)}
                    title={m.role === "officer" ? "Rebaixar" : "Promover"} className="h-8 w-8 p-0">
                    <ChevronUp size={14} className={m.role === "officer" ? "rotate-180 text-orange-500" : "text-green-500"} />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-500" title="Transferir liderança">
                        <Crown size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle>Transferir Liderança</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground">Tem certeza que deseja transferir a liderança para <strong>{m.profile?.public_name}</strong>? Você se tornará membro comum.</p>
                      <div className="flex gap-2 justify-end mt-2">
                        <Button variant="outline" size="sm">Cancelar</Button>
                        <Button size="sm" onClick={() => transferLeadership(m)} className="bg-amber-600 hover:bg-amber-700">Confirmar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" title="Expulsar">
                        <UserMinus size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle>Expulsar Membro</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground">Tem certeza que deseja expulsar <strong>{m.profile?.public_name}</strong>?</p>
                      <div className="flex gap-2 justify-end mt-2">
                        <Button variant="outline" size="sm">Cancelar</Button>
                        <Button size="sm" variant="destructive" onClick={() => kickMember(m)}>Expulsar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GuildManagement;
