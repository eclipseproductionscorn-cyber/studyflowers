import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Settings = () => {
  const { profile, user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    public_name: profile?.public_name || "",
    full_name: profile?.full_name || "",
  });

  const handleSave = async () => {
    if (!formData.public_name.trim()) {
      toast.error("Nome público é obrigatório");
      return;
    }

    setLoading(true);
    const success = await updateProfile({
      public_name: formData.public_name.trim(),
      full_name: formData.full_name.trim(),
    });

    if (success) {
      toast.success("Perfil atualizado com sucesso!");
    } else {
      toast.error("Erro ao atualizar perfil");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-2xl"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu perfil e preferências
          </p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={20} />
            Informações do Perfil
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {formData.public_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formData.public_name || "Estudante"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="public_name">Nome Público</Label>
                <Input
                  id="public_name"
                  value={formData.public_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, public_name: e.target.value }))
                  }
                  placeholder="Como você quer ser chamado"
                />
                <p className="text-xs text-muted-foreground">
                  Este nome será exibido para outros usuários
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Estatísticas da Conta
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {profile?.level || 1}
              </p>
              <p className="text-xs text-muted-foreground">Nível</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {profile?.xp?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {profile?.coins?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Moedas</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {profile?.streak_days || 0}
              </p>
              <p className="text-xs text-muted-foreground">Dias de Ofensiva</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
