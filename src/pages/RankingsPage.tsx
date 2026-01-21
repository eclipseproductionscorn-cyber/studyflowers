import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  ChevronRight,
  User,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const ranks = [
  {
    name: "Bronze",
    levels: ["I", "II", "III"],
    color: "text-rank-bronze",
    bgColor: "bg-rank-bronze",
    borderColor: "border-rank-bronze",
    xpRequired: [0, 100, 250],
  },
  {
    name: "Prata",
    levels: ["I", "II", "III"],
    color: "text-rank-silver",
    bgColor: "bg-rank-silver",
    borderColor: "border-rank-silver",
    xpRequired: [500, 800, 1200],
  },
  {
    name: "Ouro",
    levels: ["I", "II", "III"],
    color: "text-rank-gold",
    bgColor: "bg-rank-gold",
    borderColor: "border-rank-gold",
    xpRequired: [1800, 2500, 3500],
  },
  {
    name: "Platina",
    levels: ["I", "II", "III"],
    color: "text-rank-platinum",
    bgColor: "bg-rank-platinum",
    borderColor: "border-rank-platinum",
    xpRequired: [5000, 7000, 10000],
  },
  {
    name: "Diamante",
    levels: ["I", "II", "III"],
    color: "text-rank-diamond",
    bgColor: "bg-rank-diamond",
    borderColor: "border-rank-diamond",
    xpRequired: [15000, 22000, 30000],
  },
  {
    name: "Ônix",
    levels: ["I", "II", "III"],
    color: "text-rank-onyx",
    bgColor: "bg-rank-onyx",
    borderColor: "border-rank-onyx",
    xpRequired: [40000, 55000, 75000],
  },
];

const getRankFromString = (rankStr: string) => {
  const [name, level] = rankStr.split("_");
  const rankName = name.charAt(0).toUpperCase() + name.slice(1);
  const levelNum = parseInt(level) || 1;
  return { name: rankName, level: levelNum };
};

const RankingsPage = () => {
  const { profile } = useAuth();

  const currentRank = getRankFromString(profile?.current_rank || "bronze_1");
  const currentRankData = ranks.find(
    (r) => r.name.toLowerCase() === currentRank.name.toLowerCase()
  );

  const totalXP = profile?.xp || 0;

  // Calculate progress to next rank
  const getCurrentRankIndex = () => {
    let flatIndex = 0;
    for (const rank of ranks) {
      for (let i = 0; i < rank.levels.length; i++) {
        if (
          rank.name.toLowerCase() === currentRank.name.toLowerCase() &&
          i + 1 === currentRank.level
        ) {
          return { rank, levelIndex: i, flatIndex };
        }
        flatIndex++;
      }
    }
    return { rank: ranks[0], levelIndex: 0, flatIndex: 0 };
  };

  const { rank: currentRankInfo, levelIndex, flatIndex } = getCurrentRankIndex();
  const currentXPRequired = currentRankInfo.xpRequired[levelIndex];
  
  // Find next rank
  let nextXPRequired = currentRankInfo.xpRequired[levelIndex + 1];
  if (!nextXPRequired && ranks.indexOf(currentRankInfo) < ranks.length - 1) {
    const nextRank = ranks[ranks.indexOf(currentRankInfo) + 1];
    nextXPRequired = nextRank.xpRequired[0];
  }

  const xpProgress = nextXPRequired
    ? Math.min(((totalXP - currentXPRequired) / (nextXPRequired - currentXPRequired)) * 100, 100)
    : 100;

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
            Sistema de Rankings
          </h1>
          <p className="text-muted-foreground mt-1">
            Suba de patente completando atividades
          </p>
        </div>

        {/* Current Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${currentRankData?.bgColor}/10 to-transparent border ${currentRankData?.borderColor}/30 rounded-2xl p-6`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-2xl ${currentRankData?.bgColor}/20 flex items-center justify-center`}
            >
              <Trophy className={currentRankData?.color} size={32} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sua Patente Atual</p>
              <h2 className={`text-3xl font-bold ${currentRankData?.color}`}>
                {currentRank.name} {["I", "II", "III"][currentRank.level - 1]}
              </h2>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {totalXP.toLocaleString()} XP
              </span>
              <span className="text-muted-foreground">
                {nextXPRequired ? `${nextXPRequired.toLocaleString()} XP` : "Máximo!"}
              </span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            {nextXPRequired && (
              <p className="text-xs text-muted-foreground text-center">
                Faltam {(nextXPRequired - totalXP).toLocaleString()} XP para a próxima patente
              </p>
            )}
          </div>
        </motion.div>

        {/* All Ranks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Todas as Patentes</h3>
          
          <div className="grid gap-3">
            {ranks.map((rank, rankIndex) => {
              const isCurrentRank =
                rank.name.toLowerCase() === currentRank.name.toLowerCase();

              return (
                <motion.div
                  key={rank.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + rankIndex * 0.1 }}
                  className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 ${
                    isCurrentRank
                      ? `${rank.borderColor}/50 bg-gradient-to-r ${rank.bgColor}/5 to-transparent`
                      : "border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${rank.bgColor}/20 flex items-center justify-center`}
                    >
                      {rankIndex === ranks.length - 1 ? (
                        <Crown className={rank.color} size={24} />
                      ) : rankIndex >= 4 ? (
                        <Star className={rank.color} size={24} />
                      ) : (
                        <Medal className={rank.color} size={24} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${rank.color}`}>
                          {rank.name}
                        </h4>
                        {isCurrentRank && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {rank.levels.map((level, levelIdx) => {
                          const isAchieved =
                            rankIndex < ranks.findIndex(
                              (r) =>
                                r.name.toLowerCase() ===
                                currentRank.name.toLowerCase()
                            ) ||
                            (isCurrentRank && levelIdx + 1 <= currentRank.level);

                          return (
                            <span
                              key={level}
                              className={`text-xs px-2 py-0.5 rounded ${
                                isAchieved
                                  ? `${rank.bgColor}/20 ${rank.color}`
                                  : "bg-muted/30 text-muted-foreground"
                              }`}
                            >
                              {level}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <span>{rank.xpRequired[0].toLocaleString()}+ XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-3">
            Como subir de patente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Complete Atividades
                </p>
                <p className="text-xs text-muted-foreground">
                  Missões diárias dão XP
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Mantenha Ofensiva
                </p>
                <p className="text-xs text-muted-foreground">
                  Bônus por dias seguidos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Use o Pomodoro
                </p>
                <p className="text-xs text-muted-foreground">
                  Ganhe XP estudando
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default RankingsPage;
