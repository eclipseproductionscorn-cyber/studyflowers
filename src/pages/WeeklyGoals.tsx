import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Flame,
  Trophy,
  Gift,
  Coins,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: "study_time" | "activities" | "streak" | "pomodoro" | "xp";
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

const defaultWeeklyGoals: Omit<WeeklyGoal, "id" | "current" | "isCompleted" | "isClaimed">[] = [
  {
    title: "Mestre do Tempo",
    description: "Estude por 5 horas esta semana",
    target: 300,
    type: "study_time",
    xpReward: 200,
    coinReward: 100,
  },
  {
    title: "Atividades em Dia",
    description: "Complete 20 atividades diárias",
    target: 20,
    type: "activities",
    xpReward: 150,
    coinReward: 75,
  },
  {
    title: "Fogo Constante",
    description: "Mantenha uma ofensiva de 7 dias",
    target: 7,
    type: "streak",
    xpReward: 300,
    coinReward: 150,
  },
  {
    title: "Foco Total",
    description: "Complete 10 sessões Pomodoro",
    target: 10,
    type: "pomodoro",
    xpReward: 175,
    coinReward: 85,
  },
  {
    title: "Caçador de XP",
    description: "Ganhe 500 XP esta semana",
    target: 500,
    type: "xp",
    xpReward: 250,
    coinReward: 125,
  },
];

const goalIcons = {
  study_time: Clock,
  activities: BookOpen,
  streak: Flame,
  pomodoro: Target,
  xp: Sparkles,
};

const goalColors = {
  study_time: "from-blue-500 to-cyan-500",
  activities: "from-green-500 to-emerald-500",
  streak: "from-orange-500 to-red-500",
  pomodoro: "from-purple-500 to-pink-500",
  xp: "from-yellow-500 to-amber-500",
};

const WeeklyGoals = () => {
  const { profile, streak, addCoins, addXP } = useAuth();
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);

  useEffect(() => {
    // Simulate loading goals with current progress
    const simulatedGoals: WeeklyGoal[] = defaultWeeklyGoals.map((goal, index) => {
      let current = 0;
      
      switch (goal.type) {
        case "streak":
          current = streak?.current_streak || 0;
          break;
        case "xp":
          current = Math.min(profile?.xp || 0, goal.target);
          break;
        case "study_time":
          current = Math.floor(Math.random() * 200);
          break;
        case "activities":
          current = Math.floor(Math.random() * 15);
          break;
        case "pomodoro":
          current = Math.floor(Math.random() * 8);
          break;
      }

      const isCompleted = current >= goal.target;

      return {
        ...goal,
        id: `goal_${index}`,
        current,
        isCompleted,
        isClaimed: false,
      };
    });

    setGoals(simulatedGoals);
  }, [profile, streak]);

  const claimReward = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.isCompleted || goal.isClaimed) return;

    await addXP(goal.xpReward);
    await addCoins(goal.coinReward);

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, isClaimed: true } : g
      )
    );

    toast.success(
      `🎉 +${goal.xpReward} XP e +${goal.coinReward} moedas!`
    );
  };

  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const claimedGoals = goals.filter((g) => g.isClaimed).length;
  const totalProgress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  // Calculate days remaining in the week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysRemaining = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="text-primary" />
              Metas Semanais
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete metas para ganhar recompensas extras
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-card/50 border border-border/50 rounded-xl">
            <Calendar className="text-muted-foreground" size={18} />
            <div className="text-sm">
              <span className="text-muted-foreground">Restam </span>
              <span className="font-bold text-foreground">{daysRemaining} dias</span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 via-accent/10 to-purple-500/10 border border-border/50 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Trophy className="text-white" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Progresso Semanal</h3>
                <p className="text-sm text-muted-foreground">
                  {completedGoals} de {goals.length} metas completadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</p>
                <p className="text-xs text-muted-foreground">Completo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{claimedGoals}</p>
                <p className="text-xs text-muted-foreground">Resgatadas</p>
              </div>
            </div>
          </div>

          <Progress value={totalProgress} className="h-3" />

          {completedGoals === goals.length && claimedGoals === goals.length && (
            <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-center">
              <p className="text-success font-medium">
                🎉 Parabéns! Todas as metas foram completadas e resgatadas!
              </p>
            </div>
          )}
        </motion.div>

        {/* Goals List */}
        <div className="grid gap-4">
          {goals.map((goal, index) => {
            const Icon = goalIcons[goal.type];
            const colorClass = goalColors[goal.type];
            const progress = Math.min((goal.current / goal.target) * 100, 100);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`bg-card/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
                  goal.isCompleted && !goal.isClaimed
                    ? "border-success/50 bg-success/5"
                    : goal.isClaimed
                    ? "border-border/30 opacity-60"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} shrink-0`}
                    >
                      <Icon className="text-white" size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${goal.isClaimed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {goal.title}
                        </h3>
                        {goal.isCompleted && (
                          <CheckCircle2 
                            size={18} 
                            className={goal.isClaimed ? "text-muted-foreground" : "text-success"} 
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {goal.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {goal.current} / {goal.target}{" "}
                            {goal.type === "study_time" ? "min" : ""}
                          </span>
                          <span className="font-medium text-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Action */}
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Sparkles size={14} className="text-primary" />
                        <span className="font-medium">+{goal.xpReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins size={14} className="text-rank-gold" />
                        <span className="font-medium">+{goal.coinReward}</span>
                      </div>
                    </div>

                    {goal.isCompleted && !goal.isClaimed ? (
                      <Button
                        onClick={() => claimReward(goal.id)}
                        size="sm"
                        className="bg-gradient-to-r from-success to-accent hover:opacity-90"
                      >
                        <Gift size={16} className="mr-1" />
                        Resgatar
                      </Button>
                    ) : goal.isClaimed ? (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        Resgatado
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                        Em progresso
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bonus Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Gift className="text-purple-500" size={24} />
            <h3 className="font-semibold text-foreground">Bônus Semanal</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete todas as 5 metas semanais para ganhar uma{" "}
            <span className="text-purple-500 font-medium">Caixa Épica</span>{" "}
            gratuita e{" "}
            <span className="text-primary font-medium">500 XP extras</span>!
          </p>

          {completedGoals === goals.length && claimedGoals < goals.length && (
            <div className="mt-3 p-2 bg-purple-500/10 rounded-lg">
              <p className="text-xs text-purple-400">
                ✨ Resgate todas as recompensas para desbloquear o bônus!
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default WeeklyGoals;
