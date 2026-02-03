import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, Loader2, Moon, Sun, Palette, GraduationCap, BookOpen, Brain, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { schoolYears, allSubjects } from "@/lib/subjects";
import { getLevelFromXP, getLevelProgress, getUnlockedRewards } from "@/lib/levelSystem";
import { Progress } from "@/components/ui/progress";

const Settings = () => {
  const { profile, user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    public_name: profile?.public_name || "",
    full_name: profile?.full_name || "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("studyflow-mode");
    setIsDark(savedTheme === "dark");
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        public_name: profile.public_name || "",
        full_name: profile.full_name || "",
      });
    }
  }, [profile]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("studyflow-mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("studyflow-mode", "light");
    }
    
    toast.success(newIsDark ? "Modo escuro ativado! 🌙" : "Modo claro ativado! ☀️");
  };

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

  const currentLevel = getLevelFromXP(profile?.xp || 0);
  const levelProgress = getLevelProgress(profile?.xp || 0);
  const unlockedRewards = getUnlockedRewards(profile?.xp || 0);

  const schoolYearLabel = schoolYears.find(y => y.value === profile?.school_year)?.label || "Não definido";
  const userSubjects = profile?.subjects?.map(id => allSubjects.find(s => s.id === id)) || [];

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements count={10} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-4xl relative z-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Configurações ⚙️
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu perfil, preferências e veja seu progresso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Informações do Perfil
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <span className="text-3xl font-bold text-white">
                    {formData.public_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </motion.div>
                <div>
                  <p className="font-medium text-foreground">
                    {formData.public_name || "Estudante"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className={`text-sm font-medium ${currentLevel.color}`}>
                    {currentLevel.title} • Nível {currentLevel.level}
                  </p>
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
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </motion.div>

          {/* Theme & Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Theme Toggle */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette size={20} className="text-accent" />
                Aparência
              </h2>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon size={24} className="text-indigo-400" />
                  ) : (
                    <Sun size={24} className="text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isDark ? "Modo Escuro" : "Modo Claro"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isDark ? "Perfeito para estudar à noite" : "Ideal para o dia"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>

            {/* School Info */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-green-500" />
                Dados Escolares
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ano Escolar</p>
                  <p className="font-semibold text-foreground">{schoolYearLabel}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Matérias</p>
                  <div className="flex flex-wrap gap-2">
                    {userSubjects.map(subject => subject && (
                      <span
                        key={subject.id}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {subject.icon} {subject.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 border border-primary/20 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain size={20} className="text-primary" />
            Progressão de Nível
          </h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">
                  {currentLevel.level}
                </span>
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${currentLevel.color}`}>
                  {currentLevel.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {profile?.xp?.toLocaleString() || 0} / {levelProgress.next.toLocaleString()} XP
                </span>
              </div>
              <Progress value={levelProgress.progress} className="h-3" />
            </div>
          </div>

          {/* Unlocked Rewards */}
          {unlockedRewards.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <Award size={14} className="inline mr-1" />
                Recompensas Desbloqueadas ({unlockedRewards.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {unlockedRewards.slice(0, 6).map(reward => (
                  <span
                    key={reward.id}
                    className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium"
                  >
                    {reward.name}
                  </span>
                ))}
                {unlockedRewards.length > 6 && (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    +{unlockedRewards.length - 6} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            📊 Estatísticas da Conta
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
              <p className="text-3xl font-bold text-primary">
                {profile?.level || 1}
              </p>
              <p className="text-xs text-muted-foreground">Nível</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
              <p className="text-3xl font-bold text-accent">
                {profile?.xp?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-rank-gold/10 to-amber-500/5 rounded-xl border border-rank-gold/20">
              <p className="text-3xl font-bold text-rank-gold">
                {profile?.coins?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Moedas</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl border border-orange-500/20">
              <p className="text-3xl font-bold text-orange-500">
                {profile?.streak_days || 0}🔥
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
