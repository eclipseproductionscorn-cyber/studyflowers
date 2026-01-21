import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Shield, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const streakMilestones = [
  { days: 7, reward: 100, icon: "🔥", title: "1 Semana" },
  { days: 14, reward: 250, icon: "⚡", title: "2 Semanas" },
  { days: 30, reward: 500, icon: "🌟", title: "1 Mês" },
  { days: 60, reward: 1000, icon: "💎", title: "2 Meses" },
  { days: 90, reward: 2000, icon: "👑", title: "3 Meses" },
  { days: 180, reward: 5000, icon: "🏆", title: "6 Meses" },
  { days: 365, reward: 10000, icon: "🎖️", title: "1 Ano" },
];

const Streak = () => {
  const { profile, user, streak, addCoins, refetchStreak } = useAuth();
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (streak) {
      const today = new Date().toISOString().split("T")[0];
      const lastActivity = streak.last_activity_date;
      setCanClaimToday(lastActivity !== today);
    }
  }, [streak]);

  const claimDailyStreak = async () => {
    if (!user || !streak || loading) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let newStreak = streak.current_streak;
    const lastActivity = streak.last_activity_date;

    // Check if streak should continue or reset
    if (lastActivity === yesterday) {
      newStreak += 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak);

    const { error } = await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating streak:", error);
      toast.error("Erro ao registrar ofensiva");
      setLoading(false);
      return;
    }

    // Update profile streak_days
    await supabase
      .from("profiles")
      .update({ streak_days: newStreak })
      .eq("user_id", user.id);

    // Give daily coins
    await addCoins(10);

    // Check milestones
    const milestone = streakMilestones.find((m) => m.days === newStreak);
    if (milestone) {
      await addCoins(milestone.reward);
      toast.success(`🎉 Marco atingido: ${milestone.title}! +${milestone.reward} moedas!`);
    } else {
      toast.success(`🔥 Ofensiva: ${newStreak} dias! +10 moedas`);
    }

    refetchStreak();
    setCanClaimToday(false);
    setLoading(false);
  };

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toUpperCase(),
      isToday: i === 6,
    };
  });

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Ofensiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Mantenha sua sequência de estudos ativa
          </p>
        </div>

        {/* Main Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 md:p-8"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-4"
            >
              <Flame className="text-white" size={48} />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-2">
              {currentStreak}
            </h2>
            <p className="text-xl text-muted-foreground">
              {currentStreak === 1 ? "dia de ofensiva" : "dias de ofensiva"}
            </p>

            {canClaimToday && (
              <Button
                onClick={claimDailyStreak}
                disabled={loading}
                size="lg"
                className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Flame className="mr-2" size={20} />
                    Registrar Ofensiva de Hoje
                  </>
                )}
              </Button>
            )}

            {!canClaimToday && (
              <div className="mt-6 flex items-center justify-center gap-2 text-success">
                <Shield size={20} />
                <span className="font-medium">Ofensiva de hoje registrada!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rank-gold/10">
                <Trophy className="text-rank-gold" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Sequência</p>
                <p className="text-2xl font-bold text-foreground">
                  {longestStreak} dias
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo Marco</p>
                <p className="text-2xl font-bold text-foreground">
                  {streakMilestones.find((m) => m.days > currentStreak)?.days || "🏆"} dias
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Últimos 7 dias</h3>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((day, index) => {
              const isActive = streak?.last_activity_date === day.date;
              const isPast = new Date(day.date) <= new Date();

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    day.isToday
                      ? "bg-primary/10 border border-primary/30"
                      : isActive
                      ? "bg-success/10"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {day.day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-success text-success-foreground"
                        : isPast
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {isActive ? (
                      <Flame size={16} />
                    ) : (
                      <span className="text-xs">
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift size={20} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Marcos de Ofensiva</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {streakMilestones.slice(0, 8).map((milestone, index) => {
              const isAchieved = currentStreak >= milestone.days;

              return (
                <motion.div
                  key={milestone.days}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isAchieved
                      ? "bg-gradient-to-br from-rank-gold/20 to-orange-500/20 border border-rank-gold/30"
                      : "bg-muted/30 border border-border/30 opacity-60"
                  }`}
                >
                  <div className="text-2xl mb-1">{milestone.icon}</div>
                  <p className="text-sm font-medium text-foreground">
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{milestone.reward} moedas
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Streak;
