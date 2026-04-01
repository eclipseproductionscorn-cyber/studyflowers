import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Trash2, Users, Search, Loader2, AlertTriangle, Crown, XCircle, Ban, Clock,
  CheckCircle, MessageCircle, Activity, BarChart3, Send, Eye, Calendar, Zap, FileText,
  Swords, Plus, Edit, BookOpen, TrendingUp, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getRankData } from "@/lib/ranks";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AdminUser {
  id: string; user_id: string; public_name: string; full_name: string; email: string;
  xp: number; level: number; coins: number; current_rank: string; streak_days: number; created_at: string;
}
interface UserBan { id: string; user_id: string; reason: string; ban_type: string; expires_at: string | null; is_active: boolean; banned_at: string; }
interface AdminLog { id: string; admin_id: string; action: string; target_user_id: string | null; details: string | null; created_at: string; }
interface AdminMessage { id: string; user_id: string; admin_id: string | null; message: string; is_from_admin: boolean; is_read: boolean; status: string; created_at: string; }

const BAN_DURATIONS = [
  { label: "1 hora", value: "1h" }, { label: "1 dia", value: "1d" }, { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" }, { label: "90 dias", value: "90d" }, { label: "1 ano", value: "365d" },
  { label: "Permanente", value: "permanent" },
];

const CHART_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

const getExpiresAt = (duration: string): string | null => {
  if (duration === "permanent") return null;
  const now = new Date();
  const map: Record<string, number> = { "1h": 3600000, "1d": 86400000, "7d": 604800000, "30d": 2592000000, "90d": 7776000000, "365d": 31536000000 };
  return new Date(now.getTime() + (map[duration] || 0)).toISOString();
};

type Tab = "dashboard" | "users" | "bans" | "messages" | "logs" | "activities" | "events" | "bosses" | "metrics";

const AdminPanel = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banDuration, setBanDuration] = useState("7d");
  const [banReason, setBanReason] = useState("Violação das regras");
  const [banning, setBanning] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [replyTo, setReplyTo] = useState<{ userId: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  // Activities management
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  // Events management
  const [events, setEvents] = useState<any[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", starts_at: "", ends_at: "", event_type: "marathon" });
  // Boss management
  const [showCreateBoss, setShowCreateBoss] = useState(false);
  const [bossForm, setBossForm] = useState({ subject: "Matemática", name: "", description: "", difficulty: "medium", xp_reward: 200, coin_reward: 100 });
  const [customBosses, setCustomBosses] = useState<any[]>([]);
  // Metrics
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => { if (user) checkAdminAndFetch(); }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) { setIsAdmin(false); setLoading(false); return; }
    setIsAdmin(true);
    await Promise.all([fetchUsers(), fetchBans(), fetchLogs(), fetchMessages(), fetchActivities(), fetchEvents(), fetchCustomBosses(), fetchSessions()]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/admin-users?action=list`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const result = await response.json();
    if (result.users) setUsers(result.users);
    setLoading(false);
  };

  const fetchBans = async () => { const { data } = await supabase.from("user_bans").select("*").eq("is_active", true).order("banned_at", { ascending: false }); setBans((data as UserBan[]) || []); };
  const fetchLogs = async () => { const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(50); setLogs((data as AdminLog[]) || []); };
  const fetchMessages = async () => { const { data } = await supabase.from("admin_messages").select("*").order("created_at", { ascending: false }).limit(100); setMessages((data as AdminMessage[]) || []); };
  const fetchActivities = async () => { const { data } = await supabase.from("ai_activities").select("*").order("created_at", { ascending: false }).limit(100); setAdminActivities(data || []); };
  const fetchEvents = async () => { const { data } = await supabase.from("seasonal_events").select("*").order("created_at", { ascending: false }); setEvents(data || []); };
  const fetchCustomBosses = async () => {
    const saved = localStorage.getItem("admin_custom_bosses");
    if (saved) setCustomBosses(JSON.parse(saved));
  };
  const fetchSessions = async () => { const { data } = await supabase.from("study_sessions").select("*").order("created_at", { ascending: false }).limit(500); setSessions(data || []); };

  const logAction = async (action: string, targetUserId?: string, details?: string) => {
    if (!user) return;
    await supabase.from("admin_logs").insert({ admin_id: user.id, action, target_user_id: targetUserId || null, details: details || null });
  };

  const handleBan = async () => {
    if (!banTarget || !user) return;
    setBanning(true);
    const expiresAt = getExpiresAt(banDuration);
    const { error } = await supabase.from("user_bans").insert({ user_id: banTarget.user_id, banned_by: user.id, reason: banReason, ban_type: banDuration === "permanent" ? "permanent" : "temporary", expires_at: expiresAt });
    if (error) { toast.error("Erro ao banir"); } else {
      toast.success(`${banTarget.public_name} foi banido!`);
      await logAction("ban_user", banTarget.user_id, `${banDuration} - ${banReason}`);
      fetchBans(); fetchLogs();
    }
    setBanTarget(null); setBanReason("Violação das regras"); setBanDuration("7d"); setBanning(false);
  };

  const handleUnban = async (banId: string, userId?: string) => {
    await supabase.from("user_bans").update({ is_active: false }).eq("id", banId);
    toast.success("Banimento removido!");
    if (userId) await logAction("unban_user", userId);
    fetchBans(); fetchLogs();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/admin-users?action=delete`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: deleteTarget.user_id }),
    });
    const result = await response.json();
    if (result.success) {
      toast.success(`Conta excluída!`);
      await logAction("delete_user", deleteTarget.user_id);
      setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
      fetchLogs();
    } else toast.error(result.error || "Erro");
    setDeleteTarget(null); setDeleting(false);
  };

  const handleReply = async () => {
    if (!replyTo || !replyText.trim() || !user) return;
    await supabase.from("admin_messages").insert({ user_id: replyTo.userId, admin_id: user.id, message: replyText, is_from_admin: true });
    await logAction("reply_message", replyTo.userId);
    toast.success("Resposta enviada!");
    setReplyTo(null); setReplyText("");
    fetchMessages(); fetchLogs();
  };

  const deleteActivity = async (id: string) => {
    await supabase.from("ai_activities").delete().eq("id", id);
    toast.success("Atividade excluída");
    await logAction("delete_activity", undefined, `ID: ${id}`);
    fetchActivities();
  };

  const createEvent = async () => {
    if (!eventForm.title || !eventForm.starts_at || !eventForm.ends_at || !user) return;
    const { error } = await supabase.from("seasonal_events").insert({
      title: eventForm.title, description: eventForm.description || null,
      starts_at: new Date(eventForm.starts_at).toISOString(), ends_at: new Date(eventForm.ends_at).toISOString(),
      event_type: eventForm.event_type, created_by: user.id,
    });
    if (error) { toast.error("Erro ao criar evento"); return; }
    toast.success("Evento criado!");
    await logAction("create_event", undefined, eventForm.title);
    setShowCreateEvent(false); setEventForm({ title: "", description: "", starts_at: "", ends_at: "", event_type: "marathon" });
    fetchEvents(); fetchLogs();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("seasonal_events").delete().eq("id", id);
    toast.success("Evento excluído");
    await logAction("delete_event", undefined, `ID: ${id}`);
    fetchEvents();
  };

  const createBoss = () => {
    if (!bossForm.name) return;
    const boss = { ...bossForm, id: `custom-${Date.now()}`, emoji: "⚔️", hp: 100, questions: 10, gradient: "from-purple-600 via-pink-600 to-red-600" };
    const updated = [...customBosses, boss];
    setCustomBosses(updated);
    localStorage.setItem("admin_custom_bosses", JSON.stringify(updated));
    toast.success("Chefão criado!");
    logAction("create_boss", undefined, bossForm.name);
    setShowCreateBoss(false); setBossForm({ subject: "Matemática", name: "", description: "", difficulty: "medium", xp_reward: 200, coin_reward: 100 });
  };

  const deleteBoss = (id: string) => {
    const updated = customBosses.filter(b => b.id !== id);
    setCustomBosses(updated);
    localStorage.setItem("admin_custom_bosses", JSON.stringify(updated));
    toast.success("Chefão excluído");
  };

  const filtered = users.filter(u =>
    u.public_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getUserBan = (userId: string) => bans.find(b => b.user_id === userId);
  const unreadMessages = messages.filter(m => !m.is_from_admin && !m.is_read).length;
  const todayUsers = users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length;

  // Metrics data
  const usersByLevel = users.reduce((acc: Record<number, number>, u) => { acc[u.level] = (acc[u.level] || 0) + 1; return acc; }, {});
  const levelData = Object.entries(usersByLevel).map(([level, count]) => ({ name: `Nv.${level}`, value: count })).sort((a, b) => parseInt(a.name.slice(3)) - parseInt(b.name.slice(3)));
  const avgXP = users.length ? Math.round(users.reduce((a, u) => a + u.xp, 0) / users.length) : 0;
  const avgStreak = users.length ? Math.round(users.reduce((a, u) => a + u.streak_days, 0) / users.length) : 0;
  const retentionRate = users.length ? Math.round((users.filter(u => u.streak_days > 0).length / users.length) * 100) : 0;

  const chartConfig = { value: { label: "Usuários", color: "hsl(var(--primary))" } };

  if (loading) return <DashboardLayout profile={profile}><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  if (!isAdmin) return (
    <DashboardLayout profile={profile}>
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <XCircle className="text-destructive" size={48} />
        <h2 className="text-xl font-bold text-foreground">Acesso Negado</h2>
        <Button onClick={() => navigate("/dashboard")}>Voltar</Button>
      </div>
    </DashboardLayout>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Painel", icon: <BarChart3 size={16} /> },
    { id: "users", label: "Usuários", icon: <Users size={16} /> },
    { id: "bans", label: "Banidos", icon: <Ban size={16} />, badge: bans.length },
    { id: "messages", label: "Chat", icon: <MessageCircle size={16} />, badge: unreadMessages },
    { id: "activities", label: "Atividades", icon: <BookOpen size={16} /> },
    { id: "events", label: "Eventos", icon: <Calendar size={16} />, badge: events.filter(e => e.is_active).length },
    { id: "bosses", label: "Chefões", icon: <Swords size={16} /> },
    { id: "metrics", label: "Métricas", icon: <TrendingUp size={16} /> },
    { id: "logs", label: "Logs", icon: <Activity size={16} /> },
  ];

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2"><Shield className="text-destructive" /> Central Administrativa</h1>
            <p className="text-muted-foreground mt-1">Gerencie toda a plataforma</p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1"><Crown size={14} className="mr-1" />Super Admin</Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)} className="gap-1.5 whitespace-nowrap text-xs">
              {t.icon} {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 w-4 p-0 flex items-center justify-center rounded-full">{t.badge}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Total Usuários", value: users.length, color: "text-primary" },
                { icon: Zap, label: "Novos Hoje", value: todayUsers, color: "text-green-500" },
                { icon: Ban, label: "Banidos", value: bans.length, color: "text-amber-500" },
                { icon: MessageCircle, label: "Msgs Pendentes", value: unreadMessages, color: "text-blue-500" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card/50 border border-border/50 rounded-xl p-4">
                  <stat.icon className={`${stat.color} mb-2`} size={22} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Activity size={18} /> Ações Recentes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{log.action}</span>
                    {log.details && <span className="text-muted-foreground truncate">{log.details}</span>}
                    <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma ação</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Usuários", icon: Users, action: () => setTab("users") },
                { label: "Eventos", icon: Calendar, action: () => setTab("events") },
                { label: "Chefões", icon: Swords, action: () => setTab("bosses") },
                { label: "Métricas", icon: TrendingUp, action: () => setTab("metrics") },
              ].map((qa, i) => (
                <Button key={i} variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={qa.action}><qa.icon size={20} /><span className="text-xs">{qa.label}</span></Button>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="space-y-2">
              {filtered.map((u, index) => {
                const rankData = getRankData(u.current_rank);
                const isYou = u.user_id === user?.id;
                const activeBan = getUserBan(u.user_id);
                return (
                  <motion.div key={u.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isYou ? "bg-primary/5 border-primary/30" : activeBan ? "bg-destructive/5 border-destructive/30" : "bg-card/50 border-border/50 hover:bg-card/80"}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{u.public_name?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">{u.public_name}</span>
                        {isYou && <Badge variant="outline" className="text-xs">Você</Badge>}
                        {activeBan && <Badge variant="destructive" className="text-xs"><Ban size={10} className="mr-1" />Banido</Badge>}
                        {rankData && <Badge className={`${rankData.rank.bgColor}/20 ${rankData.rank.color} text-xs`}>{rankData.rank.name}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Nv.{u.level}</span><span>{u.xp.toLocaleString()} XP</span><span>{u.coins.toLocaleString()} 🪙</span>
                      </div>
                    </div>
                    {!isYou && (
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}><Eye size={14} /></Button>
                        {activeBan ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnban(activeBan.id, u.user_id)}><CheckCircle size={14} /></Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => setBanTarget(u)}><Ban size={14} /></Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)}><Trash2 size={14} /></Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">Nenhum usuário</div>}
            </div>
          </>
        )}

        {/* Bans Tab */}
        {tab === "bans" && (
          <div className="space-y-2">
            {bans.length === 0 ? <div className="text-center py-12 text-muted-foreground">Nenhum banimento ativo</div> :
              bans.map(ban => {
                const banUser = users.find(u => u.user_id === ban.user_id);
                return (
                  <div key={ban.id} className="flex items-center gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <Ban className="text-destructive flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{banUser?.public_name || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground">{ban.reason}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>{ban.ban_type === "permanent" ? "Permanente" : `Expira: ${ban.expires_at ? new Date(ban.expires_at).toLocaleDateString("pt-BR") : "—"}`}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUnban(ban.id, ban.user_id)}><CheckCircle size={14} className="mr-1" />Desbanir</Button>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 ? <div className="text-center py-12 text-muted-foreground">Nenhuma mensagem</div> :
              Array.from(new Set(messages.map(m => m.user_id))).map(userId => {
                const userMsgs = messages.filter(m => m.user_id === userId);
                const userName = users.find(u => u.user_id === userId)?.public_name || "Usuário";
                const hasUnread = userMsgs.some(m => !m.is_from_admin && !m.is_read);
                return (
                  <div key={userId} className={`rounded-xl border p-4 ${hasUnread ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold">{userName}</span>
                        {hasUnread && <Badge variant="default" className="text-xs">Nova</Badge>}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setReplyTo({ userId, name: userName })}><Send size={14} className="mr-1" />Responder</Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userMsgs.slice(0, 5).map(msg => (
                        <div key={msg.id} className={`text-sm p-2 rounded-lg ${msg.is_from_admin ? "bg-primary/10 ml-4" : "bg-muted/50 mr-4"}`}>
                          <p>{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{msg.is_from_admin ? "Admin" : userName} • {new Date(msg.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* Activities Tab */}
        {tab === "activities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Gerenciar Atividades</h3>
              <Badge variant="outline">{adminActivities.length} atividades</Badge>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Matéria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminActivities.slice(0, 30).map(act => (
                    <TableRow key={act.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{act.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{act.subject}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{act.question_type}</TableCell>
                      <TableCell>{act.is_completed ? <Badge className="bg-green-500/20 text-green-600 text-xs">Feita</Badge> : <Badge variant="outline" className="text-xs">Pendente</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => deleteActivity(act.id)}><Trash2 size={12} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {adminActivities.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma atividade</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {tab === "events" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Calendar size={18} /> Eventos Especiais</h3>
              <Button size="sm" onClick={() => setShowCreateEvent(true)} className="gap-1"><Plus size={14} />Criar Evento</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {events.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/50 bg-card/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-foreground">{event.title}</h4>
                    <Badge variant={event.is_active ? "default" : "secondary"} className="text-xs">{event.is_active ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  {event.description && <p className="text-sm text-muted-foreground mb-2">{event.description}</p>}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Início: {new Date(event.starts_at).toLocaleDateString("pt-BR")}</span>
                    <span>Fim: {new Date(event.ends_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                    <Button size="sm" variant="destructive" className="ml-auto" onClick={() => deleteEvent(event.id)}><Trash2 size={12} className="mr-1" />Excluir</Button>
                  </div>
                </motion.div>
              ))}
              {events.length === 0 && <div className="col-span-2 text-center py-12 text-muted-foreground">Nenhum evento criado</div>}
            </div>
          </div>
        )}

        {/* Bosses Tab */}
        {tab === "bosses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Swords size={18} /> Chefões Personalizados</h3>
              <Button size="sm" onClick={() => setShowCreateBoss(true)} className="gap-1"><Plus size={14} />Criar Chefão</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {customBosses.map(boss => (
                <div key={boss.id} className="rounded-xl border border-border/50 overflow-hidden">
                  <div className={`bg-gradient-to-r ${boss.gradient} p-4 text-white`}>
                    <span className="text-3xl">{boss.emoji}</span>
                    <h4 className="font-bold mt-1">{boss.name}</h4>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs mt-1">{boss.subject}</Badge>
                  </div>
                  <div className="p-3 bg-card/50">
                    <p className="text-xs text-muted-foreground mb-2">{boss.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{boss.xp_reward} XP</Badge>
                        <Badge variant="outline" className="text-xs">{boss.coin_reward} 🪙</Badge>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteBoss(boss.id)}><Trash2 size={12} /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {customBosses.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">Nenhum chefão criado. Crie chefões personalizados!</div>}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {tab === "metrics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "XP Médio", value: avgXP.toLocaleString(), icon: Zap, color: "text-primary" },
                { label: "Streak Médio", value: `${avgStreak}d`, icon: Target, color: "text-orange-500" },
                { label: "Retenção", value: `${retentionRate}%`, icon: TrendingUp, color: "text-green-500" },
                { label: "Sessões", value: sessions.length.toString(), icon: BookOpen, color: "text-purple-500" },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card/50 border border-border/50 rounded-xl p-4">
                  <m.icon className={`${m.color} mb-2`} size={20} />
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Distribuição por Nível</h3>
              {levelData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart data={levelData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : <p className="text-center text-muted-foreground py-8">Sem dados</p>}
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">📊 Engajamento</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><span className="text-sm w-32">Usuários Ativos</span><Progress value={retentionRate} className="flex-1 h-2" /><span className="text-sm font-bold">{retentionRate}%</span></div>
                <div className="flex items-center gap-3"><span className="text-sm w-32">Com Streak</span><Progress value={users.length ? (users.filter(u => u.streak_days >= 3).length / users.length) * 100 : 0} className="flex-1 h-2" /><span className="text-sm font-bold">{users.filter(u => u.streak_days >= 3).length}</span></div>
                <div className="flex items-center gap-3"><span className="text-sm w-32">Nível 5+</span><Progress value={users.length ? (users.filter(u => u.level >= 5).length / users.length) * 100 : 0} className="flex-1 h-2" /><span className="text-sm font-bold">{users.filter(u => u.level >= 5).length}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {tab === "logs" && (
          <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Ação</TableHead><TableHead>Detalhes</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{log.details || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum log</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhes do Usuário</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{selectedUser.public_name?.charAt(0).toUpperCase()}</span>
                </div>
                <div><p className="font-bold text-lg">{selectedUser.public_name}</p><p className="text-sm text-muted-foreground">{selectedUser.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nível", value: selectedUser.level }, { label: "XP", value: selectedUser.xp.toLocaleString() },
                  { label: "Moedas", value: selectedUser.coins.toLocaleString() }, { label: "Streak", value: `${selectedUser.streak_days}d` },
                ].map((item, i) => <div key={i} className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="font-semibold">{item.value}</p></div>)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setReplyTo({ userId: selectedUser.user_id, name: selectedUser.public_name }); setSelectedUser(null); }}><MessageCircle size={14} className="mr-1" />Mensagem</Button>
                <Button variant="secondary" className="flex-1" onClick={() => { setBanTarget(selectedUser); setSelectedUser(null); }}><Ban size={14} className="mr-1" />Banir</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={!!replyTo} onOpenChange={o => !o && setReplyTo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mensagem para {replyTo?.name}</DialogTitle></DialogHeader>
          <Textarea placeholder="Digite sua mensagem..." value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTo(null)}>Cancelar</Button>
            <Button onClick={handleReply} disabled={!replyText.trim()}><Send size={16} className="mr-2" />Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={!!banTarget} onOpenChange={o => !o && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Ban className="text-amber-500" size={20} /> Banir {banTarget?.public_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={banDuration} onValueChange={setBanDuration}>
              <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
              <SelectContent>{BAN_DURATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Motivo..." value={banReason} onChange={e => setBanReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)} disabled={banning}>Cancelar</Button>
            <Button variant="destructive" onClick={handleBan} disabled={banning}>{banning ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Ban size={16} className="mr-2" />}Banir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Evento Especial</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome do evento" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Descrição" value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Início</label><Input type="datetime-local" value={eventForm.starts_at} onChange={e => setEventForm(f => ({ ...f, starts_at: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Fim</label><Input type="datetime-local" value={eventForm.ends_at} onChange={e => setEventForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
            </div>
            <Select value={eventForm.event_type} onValueChange={v => setEventForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="marathon">Maratona</SelectItem>
                <SelectItem value="challenge">Desafio</SelectItem>
                <SelectItem value="tournament">Torneio</SelectItem>
                <SelectItem value="seasonal">Sazonal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>Cancelar</Button>
            <Button onClick={createEvent}>Criar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Boss Dialog */}
      <Dialog open={showCreateBoss} onOpenChange={setShowCreateBoss}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Chefão Personalizado</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome do Chefão" value={bossForm.name} onChange={e => setBossForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={bossForm.subject} onValueChange={v => setBossForm(f => ({ ...f, subject: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Matemática", "Português", "História", "Geografia", "Ciências", "Física", "Química", "Biologia", "Inglês", "Redação"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Descrição do chefão" value={bossForm.description} onChange={e => setBossForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            <Select value={bossForm.difficulty} onValueChange={v => setBossForm(f => ({ ...f, difficulty: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">XP Recompensa</label><Input type="number" value={bossForm.xp_reward} onChange={e => setBossForm(f => ({ ...f, xp_reward: parseInt(e.target.value) || 0 }))} /></div>
              <div><label className="text-xs text-muted-foreground">Moedas</label><Input type="number" value={bossForm.coin_reward} onChange={e => setBossForm(f => ({ ...f, coin_reward: parseInt(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBoss(false)}>Cancelar</Button>
            <Button onClick={createBoss}>Criar Chefão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" size={20} /> Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir <strong>{deleteTarget?.public_name}</strong>? <strong className="text-destructive">Irreversível!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminPanel;
