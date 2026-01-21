import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Brain,
  FileText,
  Clock,
  Coins,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  xp_reward: number;
  coin_reward: number;
  is_completed: boolean;
}

const activityIcons: Record<string, React.ElementType> = {
  study: BookOpen,
  quiz: Brain,
  reading: FileText,
  review: RefreshCw,
};

const defaultActivities = [
  {
    title: "Sessão de Estudos",
    description: "Complete uma sessão de estudos de 25 minutos",
    activity_type: "study",
    xp_reward: 25,
    coin_reward: 15,
  },
  {
    title: "Quiz Rápido",
    description: "Responda 5 perguntas sobre seu último conteúdo",
    activity_type: "quiz",
    xp_reward: 20,
    coin_reward: 10,
  },
  {
    title: "Leitura Diária",
    description: "Leia por 15 minutos qualquer material de estudo",
    activity_type: "reading",
    xp_reward: 15,
    coin_reward: 8,
  },
  {
    title: "Revisão de Anotações",
    description: "Revise suas anotações da semana",
    activity_type: "review",
    xp_reward: 20,
    coin_reward: 12,
  },
];

const Activities = () => {
  const { profile, user, addCoins, addXP } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("daily_activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    if (error) {
      console.error("Error fetching activities:", error);
    }

    if (!data || data.length === 0) {
      await generateDailyActivities();
    } else {
      setActivities(data);
    }
    setLoading(false);
  };

  const generateDailyActivities = async () => {
    if (!user) return;

    const newActivities = defaultActivities.map((activity) => ({
      ...activity,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("daily_activities")
      .insert(newActivities)
      .select();

    if (error) {
      console.error("Error generating activities:", error);
      toast.error("Erro ao gerar atividades");
    } else if (data) {
      setActivities(data);
    }
  };

  const completeActivity = async (activity: Activity) => {
    if (activity.is_completed) return;

    const { error } = await supabase
      .from("daily_activities")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", activity.id);

    if (error) {
      console.error("Error completing activity:", error);
      toast.error("Erro ao completar atividade");
      return;
    }

    await addCoins(activity.coin_reward);
    await addXP(activity.xp_reward);

    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id ? { ...a, is_completed: true } : a
      )
    );

    toast.success(
      `+${activity.xp_reward} XP e +${activity.coin_reward} moedas!`,
      {
        icon: "🎉",
      }
    );
  };

  const completedCount = activities.filter((a) => a.is_completed).length;
  const progress = activities.length > 0 ? (completedCount / activities.length) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

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
            Atividades Diárias
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete suas missões para ganhar recompensas
          </p>
        </div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Progresso Diário</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} de {activities.length} concluídas
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </motion.div>

        {/* Activities List */}
        <div className="grid gap-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.activity_type] || BookOpen;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 transition-all duration-300 ${
                  activity.is_completed ? "opacity-70" : "hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => completeActivity(activity)}
                    disabled={activity.is_completed}
                    className="mt-0.5 transition-transform hover:scale-110 disabled:cursor-default"
                  >
                    {activity.is_completed ? (
                      <CheckCircle2 className="text-success" size={24} />
                    ) : (
                      <Circle className="text-muted-foreground hover:text-primary" size={24} />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`font-semibold ${
                            activity.is_completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {activity.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 p-1.5 rounded-lg bg-muted/50">
                        <Icon size={16} className="text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-muted-foreground">
                          +{activity.xp_reward} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Coins size={14} className="text-rank-gold" />
                        <span className="text-muted-foreground">
                          +{activity.coin_reward}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Bonus */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-success/20 to-accent/20 border border-success/30 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-foreground">Parabéns!</h3>
            <p className="text-muted-foreground">
              Você completou todas as atividades de hoje!
            </p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Activities;
