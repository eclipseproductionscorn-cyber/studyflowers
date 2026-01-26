import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Shield, Zap, Gift, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
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
  const [todayActivitiesCount, setTodayActivitiesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayActivities();
    }
  }, [user]);

  const fetchTodayActivities = async () => {
    if (!user) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    const { data, error } = await supabase
      .from("ai_activities")
      .select("id")
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .eq("week_number", weekNumber)
      .eq("is_completed", true);

    if (!error && data) {
      setTodayActivitiesCount(data.length);
    }
  };

  const canClaimStreak = todayActivitiesCount >= 5;
  const alreadyClaimedToday = streak?.last_activity_date === new Date().toISOString().split("T")[0];

  const claimDailyStreak = async () => {
    if (!user || !streak || loading || !canClaimStreak || alreadyClaimedToday) return;
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
    await addCoins(20);

    // Check milestones
    const milestone = streakMilestones.find((m) => m.days === newStreak);
    if (milestone) {
      await addCoins(milestone.reward);
      toast.success(`🎉 Marco atingido: ${milestone.title}! +${milestone.reward} moedas!`);
    } else {
      toast.success(`🔥 Ofensiva: ${newStreak} dias! +20 moedas`);
    }

    refetchStreak();
    setLoading(false);
  };

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const activitiesProgress = Math.min((todayActivitiesCount / 5) * 100, 100);

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
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Ofensiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete 5 atividades para registrar sua ofensiva diária
          </p>
        </div>

        {/* Main Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 md:p-8"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg shadow-orange-500/30"
            >
              <Flame className="text-white" size={48} />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-2">
              {currentStreak}
            </h2>
            <p className="text-xl text-muted-foreground">
              {currentStreak === 1 ? "dia de ofensiva" : "dias de ofensiva"}
            </p>

            {/* Activities Progress */}
            <div className="mt-6 bg-background/50 rounded-xl p-4 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Atividades de hoje</span>
                <span className="text-sm font-semibold text-foreground">
                  {todayActivitiesCount}/5
                </span>
              </div>
              <Progress value={activitiesProgress} className="h-2 mb-3" />
              
              {alreadyClaimedToday ? (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">Ofensiva de hoje registrada!</span>
                </div>
              ) : canClaimStreak ? (
                <Button
                  onClick={claimDailyStreak}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 animate-pulse"
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
                      Marcar Ofensiva!
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Lock size={18} />
                  <span className="text-sm">Complete {5 - todayActivitiesCount} atividades para liberar</span>
                </div>
              )}
            </div>
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-rank-gold/20 to-amber-500/20">
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
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
              const isPast = new Date(day.date) < new Date(new Date().toISOString().split("T")[0]);

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    day.isToday
                      ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
                      : isActive
                      ? "bg-success/10 border border-success/30"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {day.day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
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
                  {isAchieved && (
                    <CheckCircle2 className="mx-auto mt-1 text-success" size={16} />
                  )}
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
