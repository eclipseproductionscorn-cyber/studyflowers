import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  Gem,
  Sparkles,
  TrendingUp,
  Gift,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { ranks, getRankData, getRankProgress, parseRankString } from "@/lib/ranks";

const iconMap = {
  medal: Medal,
  star: Star,
  crown: Crown,
  gem: Gem,
  flame: Flame,
};

const RankingsPage = () => {
  const { profile } = useAuth();

  const currentRankData = getRankData(profile?.current_rank || "bronze_1");
  const totalXP = profile?.xp || 0;
  const { current: currentXPRequired, next: nextXPRequired, progress: xpProgress } = getRankProgress(totalXP);

  const { rankId: currentRankId, level: currentLevel } = parseRankString(profile?.current_rank || "bronze_1");

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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-rank-gold" />
            Sistema de Patentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Suba de patente ganhando XP em suas atividades
          </p>
        </div>

        {/* Current Rank Card */}
        {currentRankData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative overflow-hidden bg-gradient-to-br ${currentRankData.rank.bgColor}/20 to-transparent border-2 ${currentRankData.rank.borderColor}/50 rounded-2xl p-6`}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-24 h-24 rounded-2xl ${currentRankData.rank.bgColor}/30 flex items-center justify-center border-2 ${currentRankData.rank.borderColor}/50`}
              >
                {(() => {
                  const Icon = iconMap[currentRankData.rank.icon];
                  return <Icon className={currentRankData.rank.color} size={48} />;
                })()}
              </motion.div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Sua Patente Atual</p>
                <h2 className={`text-4xl font-bold ${currentRankData.rank.color}`}>
                  {currentRankData.rank.name} {["I", "II", "III"][currentRankData.level - 1]}
                </h2>
                <p className="text-lg text-muted-foreground mt-1">
                  {totalXP.toLocaleString()} XP total
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-xl border border-border/50">
                <TrendingUp className="text-success" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Nível</p>
                  <p className="text-xl font-bold text-foreground">{profile?.level || 1}</p>
                </div>
              </div>
            </div>

            {/* Progress to Next Rank */}
            <div className="relative mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso para próxima patente</span>
                <span className={currentRankData.rank.color}>
                  {nextXPRequired ? `${(nextXPRequired - totalXP).toLocaleString()} XP restantes` : "Máximo atingido!"}
                </span>
              </div>
              <div className="relative">
                <Progress value={xpProgress} className="h-4" />
                <div 
                  className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-white/20 to-transparent"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentXPRequired.toLocaleString()} XP</span>
                <span>{nextXPRequired ? `${nextXPRequired.toLocaleString()} XP` : "∞"}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mythic Rewards Banner */}
        {currentRankId === "mythic" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
                <Gift className="text-white" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">Recompensas Míticas</h3>
                <p className="text-sm text-muted-foreground">
                  Como jogador Mítico, você ganha <span className="text-amber-500 font-medium">50 moedas diárias</span> e acesso a itens exclusivos na loja!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* All Ranks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            Todas as Patentes
          </h3>

          <div className="grid gap-3">
            {ranks.map((rank, rankIndex) => {
              const isCurrentRank = rank.id === currentRankId;
              const isPassed = ranks.findIndex((r) => r.id === currentRankId) > rankIndex;
              const Icon = iconMap[rank.icon];

              return (
                <motion.div
                  key={rank.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + rankIndex * 0.05 }}
                  className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all ${
                    isCurrentRank
                      ? `${rank.borderColor}/50 bg-gradient-to-r ${rank.bgColor}/10 to-transparent border-2`
                      : isPassed
                      ? "border-success/30 bg-success/5"
                      : "border-border/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${rank.bgColor}/20 flex items-center justify-center border ${rank.borderColor}/30`}
                    >
                      <Icon className={rank.color} size={28} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-bold text-lg ${rank.color}`}>{rank.name}</h4>
                        {isCurrentRank && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                            Atual
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                            ✓ Conquistado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {rank.levels.map((level, levelIdx) => {
                          const isAchieved = isPassed || (isCurrentRank && levelIdx + 1 <= currentLevel);

                          return (
                            <span
                              key={level}
                              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                                isAchieved
                                  ? `${rank.bgColor}/30 ${rank.color} border ${rank.borderColor}/50`
                                  : "bg-muted/30 text-muted-foreground"
                              }`}
                            >
                              {level}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">
                        {rank.xpRequired[0].toLocaleString()}+ XP
                      </p>
                      {rank.id === "mythic" && (
                        <p className="text-xs text-amber-500 mt-1">Máximo</p>
                      )}
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
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 rounded-xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary" size={18} />
            Como subir de patente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Star size={18} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Complete Atividades</p>
                <p className="text-xs text-muted-foreground">Missões diárias dão XP</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Mantenha Ofensiva</p>
                <p className="text-xs text-muted-foreground">Bônus por dias seguidos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Trophy size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Metas Semanais</p>
                <p className="text-xs text-muted-foreground">XP extra toda semana</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default RankingsPage;
