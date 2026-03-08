import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Trash2, Users, Search, Loader2, AlertTriangle, Crown, XCircle, Ban, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getRankData } from "@/lib/ranks";

interface AdminUser {
  id: string;
  user_id: string;
  public_name: string;
  full_name: string;
  email: string;
  xp: number;
  level: number;
  coins: number;
  current_rank: string;
  streak_days: number;
  created_at: string;
}

interface UserBan {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  expires_at: string | null;
  is_active: boolean;
  banned_at: string;
}

const BAN_DURATIONS = [
  { label: "1 hora", value: "1h" },
  { label: "1 dia", value: "1d" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "1 ano", value: "365d" },
  { label: "Permanente", value: "permanent" },
];

const getExpiresAt = (duration: string): string | null => {
  if (duration === "permanent") return null;
  const now = new Date();
  const map: Record<string, number> = { "1h": 3600000, "1d": 86400000, "7d": 604800000, "30d": 2592000000, "90d": 7776000000, "365d": 31536000000 };
  return new Date(now.getTime() + (map[duration] || 0)).toISOString();
};

const AdminPanel = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banDuration, setBanDuration] = useState("7d");
  const [banReason, setBanReason] = useState("Violação das regras");
  const [banning, setBanning] = useState(false);
  const [tab, setTab] = useState<"users" | "bans">("users");

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) { setIsAdmin(false); setLoading(false); return; }
    setIsAdmin(true);
    await Promise.all([fetchUsers(), fetchBans()]);
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
    else toast.error("Erro ao carregar usuários");
    setLoading(false);
  };

  const fetchBans = async () => {
    const { data } = await supabase.from("user_bans").select("*").eq("is_active", true).order("banned_at", { ascending: false });
    setBans((data as UserBan[]) || []);
  };

  const handleBan = async () => {
    if (!banTarget || !user) return;
    setBanning(true);
    const expiresAt = getExpiresAt(banDuration);
    const { error } = await supabase.from("user_bans").insert({
      user_id: banTarget.user_id,
      banned_by: user.id,
      reason: banReason,
      ban_type: banDuration === "permanent" ? "permanent" : "temporary",
      expires_at: expiresAt,
    });
    if (error) { toast.error("Erro ao banir"); } else {
      toast.success(`${banTarget.public_name} foi banido!`);
      fetchBans();
    }
    setBanTarget(null);
    setBanReason("Violação das regras");
    setBanDuration("7d");
    setBanning(false);
  };

  const handleUnban = async (banId: string) => {
    await supabase.from("user_bans").update({ is_active: false }).eq("id", banId);
    toast.success("Banimento removido!");
    fetchBans();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/admin-users?action=delete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: deleteTarget.user_id }),
    });
    const result = await response.json();
    if (result.success) {
      toast.success(`Conta de ${deleteTarget.public_name} excluída!`);
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id));
    } else toast.error(result.error || "Erro ao excluir");
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = users.filter((u) =>
    u.public_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getUserBan = (userId: string) => bans.find((b) => b.user_id === userId);

  if (loading) {
    return <DashboardLayout profile={profile}><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!isAdmin) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <XCircle className="text-destructive" size={48} />
          <h2 className="text-xl font-bold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-destructive" /> Painel Admin
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie usuários e banimentos</p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1"><Crown size={14} className="mr-1" />Admin</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <Users className="mx-auto text-primary mb-2" size={24} />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Usuários</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <Ban className="mx-auto text-amber-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-foreground">{bans.length}</p>
            <p className="text-xs text-muted-foreground">Banidos</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <Shield className="mx-auto text-destructive mb-2" size={24} />
            <p className="text-2xl font-bold text-foreground">1</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}>
            <Users size={16} className="mr-2" /> Usuários
          </Button>
          <Button variant={tab === "bans" ? "default" : "outline"} onClick={() => setTab("bans")}>
            <Ban size={16} className="mr-2" /> Banidos ({bans.length})
          </Button>
        </div>

        {tab === "users" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="space-y-2">
              {filtered.map((u, index) => {
                const rankData = getRankData(u.current_rank);
                const isYou = u.user_id === user?.id;
                const activeBan = getUserBan(u.user_id);

                return (
                  <motion.div key={u.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isYou ? "bg-primary/5 border-primary/30" : activeBan ? "bg-destructive/5 border-destructive/30" : "bg-card/50 border-border/50 hover:bg-card/80"}`}
                  >
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
                        <span>Nv. {u.level}</span>
                        <span>{u.xp.toLocaleString()} XP</span>
                        <span>{u.coins.toLocaleString()} moedas</span>
                      </div>
                    </div>
                    {!isYou && (
                      <div className="flex gap-2">
                        {activeBan ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnban(activeBan.id)}>
                            <CheckCircle size={14} className="mr-1" /> Desbanir
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => setBanTarget(u)}>
                            <Ban size={14} className="mr-1" /> Banir
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)}>
                          <Trash2 size={14} className="mr-1" /> Excluir
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado</div>}
            </div>
          </>
        )}

        {tab === "bans" && (
          <div className="space-y-2">
            {bans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhum banimento ativo</div>
            ) : (
              bans.map((ban) => {
                const banUser = users.find((u) => u.user_id === ban.user_id);
                return (
                  <div key={ban.id} className="flex items-center gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <Ban className="text-destructive flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{banUser?.public_name || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground">{ban.reason}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {ban.ban_type === "permanent" ? "Permanente" : `Expira: ${ban.expires_at ? new Date(ban.expires_at).toLocaleDateString("pt-BR") : "—"}`}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUnban(ban.id)}>
                      <CheckCircle size={14} className="mr-1" /> Desbanir
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* Ban Dialog */}
      <Dialog open={!!banTarget} onOpenChange={(o) => !o && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ban className="text-amber-500" size={20} /> Banir {banTarget?.public_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={banDuration} onValueChange={setBanDuration}>
              <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
              <SelectContent>
                {BAN_DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Motivo do banimento..." value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)} disabled={banning}>Cancelar</Button>
            <Button variant="destructive" onClick={handleBan} disabled={banning}>
              {banning ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Ban size={16} className="mr-2" />} Banir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" size={20} /> Excluir Conta Permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta de <strong>{deleteTarget?.public_name}</strong> ({deleteTarget?.email})?
              <br /><br /><strong className="text-destructive">Esta ação não pode ser desfeita!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminPanel;
