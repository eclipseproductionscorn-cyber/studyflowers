import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Trash2, Users, Search, Loader2, AlertTriangle, Crown, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const AdminPanel = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) return;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: null,
      method: "GET",
      headers: {},
    });

    // Use query params via direct fetch
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users?action=list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.users) {
      setUsers(result.users);
    } else {
      toast.error("Erro ao carregar usuários");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users?action=delete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target_user_id: deleteTarget.user_id }),
      }
    );

    const result = await response.json();
    if (result.success) {
      toast.success(`Conta de ${deleteTarget.public_name} excluída com sucesso!`);
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id));
    } else {
      toast.error(result.error || "Erro ao excluir conta");
    }

    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = users.filter(
    (u) =>
      u.public_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-destructive" />
              Painel Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os usuários da plataforma
            </p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <Crown size={14} className="mr-1" />
            Admin
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <Users className="mx-auto text-primary mb-2" size={24} />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Usuários</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <Shield className="mx-auto text-destructive mb-2" size={24} />
            <p className="text-2xl font-bold text-foreground">1</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filtered.map((u, index) => {
            const rankData = getRankData(u.current_rank);
            const isYou = u.user_id === user?.id;

            return (
              <motion.div
                key={u.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isYou
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card/50 border-border/50 hover:bg-card/80"
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {u.public_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {u.public_name}
                    </span>
                    {isYou && <Badge variant="outline" className="text-xs">Você</Badge>}
                    {rankData && (
                      <Badge className={`${rankData.rank.bgColor}/20 ${rankData.rank.color} text-xs`}>
                        {rankData.rank.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Nv. {u.level}</span>
                    <span>{u.xp.toLocaleString()} XP</span>
                    <span>{u.coins.toLocaleString()} moedas</span>
                  </div>
                </div>

                {/* Actions */}
                {!isYou && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Excluir
                  </Button>
                )}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" size={20} />
              Excluir Conta Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta de{" "}
              <strong>{deleteTarget?.public_name}</strong> ({deleteTarget?.email})?
              <br /><br />
              Isso irá remover permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Perfil e dados pessoais</li>
                <li>Todas as atividades e progresso</li>
                <li>Inventário e moedas</li>
                <li>Ofensivas e conquistas</li>
                <li>Participação no ranking</li>
              </ul>
              <br />
              <strong className="text-destructive">Esta ação não pode ser desfeita!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminPanel;
