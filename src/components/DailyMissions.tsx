import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Check, Coins, Sparkles, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDailyMissions, getTimeUntilReset, DailyMission } from "@/lib/dailyMissions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MissionProgress {
  missionId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

const DailyMissions = () => {
  const { addXP, addCoins } = useAuth();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [progress, setProgress] = useState<Record<string, MissionProgress>>({});
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());

  // Load missions and progress
  useEffect(() => {
    const todaysMissions = getDailyMissions();
    setMissions(todaysMissions);

    // Load progress from localStorage
    const today = new Date().toDateString();
    const savedProgress = localStorage.getItem("mission-progress");
    const savedDate = localStorage.getItem("mission-date");

    if (savedProgress && savedDate === today) {
      setProgress(JSON.parse(savedProgress));
    } else {
      // Reset for new day
      const initialProgress: Record<string, MissionProgress> = {};
      todaysMissions.forEach((m) => {
        initialProgress[m.id] = {
          missionId: m.id,
          current: Math.floor(Math.random() * (m.target / 2)), // Simulate some progress
          completed: false,
          claimed: false,
        };
      });
      setProgress(initialProgress);
      localStorage.setItem("mission-date", today);
      localStorage.setItem("mission-progress", JSON.stringify(initialProgress));
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilReset());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save progress
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem("mission-progress", JSON.stringify(progress));
    }
  }, [progress]);

  const claimReward = async (mission: DailyMission) => {
    const missionProgress = progress[mission.id];
    if (!missionProgress || missionProgress.current < mission.target || missionProgress.claimed) {
      return;
    }

    await addXP(mission.xpReward);
    await addCoins(mission.coinReward);

    setProgress((prev) => ({
      ...prev,
      [mission.id]: {
        ...prev[mission.id],
        claimed: true,
      },
    }));

    toast.success(
      `🎉 Missão completa! +${mission.xpReward} XP e +${mission.coinReward} moedas!`
    );
  };

  const allCompleted = missions.every(
    (m) => progress[m.id]?.current >= m.target && progress[m.id]?.claimed
  );

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Gift className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Missões Diárias</h3>
            <p className="text-xs text-muted-foreground">
              Complete para ganhar recompensas exclusivas
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-sm font-mono text-foreground">
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {missions.map((mission, index) => {
          const missionProgress = progress[mission.id];
          const current = missionProgress?.current || 0;
          const isComplete = current >= mission.target;
          const isClaimed = missionProgress?.claimed;
          const progressPercent = Math.min((current / mission.target) * 100, 100);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isClaimed
                  ? "bg-success/5 border-success/30"
                  : isComplete
                  ? "bg-primary/5 border-primary/30"
                  : "bg-background/50 border-border/50 hover:border-primary/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${mission.gradient} shrink-0`}
                >
                  <mission.icon className="text-white" size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-foreground truncate">
                      {mission.title}
                    </h4>
                    {isClaimed && (
                      <Badge className="bg-success/20 text-success border-0 shrink-0">
                        <Check size={12} className="mr-1" />
                        Resgatado
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-0.5">
                    {mission.description}
                  </p>

                  {/* Progress */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {current} / {mission.target}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles size={12} />
                          {mission.xpReward}
                        </span>
                        <span className="flex items-center gap-1 text-rank-gold">
                          <Coins size={12} />
                          {mission.coinReward}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={progressPercent}
                      className="h-2"
                    />
                  </div>

                  {/* Claim Button */}
                  {isComplete && !isClaimed && (
                    <Button
                      size="sm"
                      onClick={() => claimReward(mission)}
                      className={`mt-3 bg-gradient-to-r ${mission.gradient} hover:opacity-90`}
                    >
                      <Gift size={14} className="mr-1" />
                      Resgatar Recompensa
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All Complete Bonus */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-br from-rank-gold/20 to-amber-500/20 border border-rank-gold/30 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-rank-gold font-semibold">
            <Sparkles size={18} />
            Todas as missões completas! Você é incrível! 🎉
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DailyMissions;
