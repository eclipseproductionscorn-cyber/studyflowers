import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Lock,
  Check,
  Gift,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { achievements, getRarityColor, getRarityLabel, getAchievementProgress, type Achievement } from "@/lib/achievements";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Achievements = () => {
  const { profile, user, addXP, addCoins } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    flashcardsCorrect: 0,
    currentStreak: 0,
    rankPosition: 0,
    totalXP: profile?.xp || 0,
    totalCoins: profile?.coins || 0,
  });
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchStats();
      loadUnlockedAchievements();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    if (!user) return;

    // Fetch completed activities count
    const { data: activities } = await supabase
      .from("ai_activities")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_completed", true);

    // Fetch streak data
    const { data: streak } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single();

    setStats({
      lessonsCompleted: activities?.length || 0,
      flashcardsCorrect: Math.floor((activities?.length || 0) * 2.5), // Estimate based on activities
      currentStreak: streak?.current_streak || 0,
      rankPosition: 50, // Would need leaderboard query
      totalXP: profile?.xp || 0,
      totalCoins: profile?.coins || 0,
    });
  };

  const loadUnlockedAchievements = () => {
    const saved = localStorage.getItem(`achievements-${user?.id}`);
    if (saved) {
      setUnlockedIds(JSON.parse(saved));
    }
  };

  const claimAchievement = async (achievement: Achievement) => {
    if (claimingId) return;
    
    setClaimingId(achievement.id);
    
    // Add rewards
    await addXP(achievement.xpReward);
    await addCoins(achievement.coinReward);
    
    // Save as claimed
    const newUnlocked = [...unlockedIds, achievement.id];
    setUnlockedIds(newUnlocked);
    localStorage.setItem(`achievements-${user?.id}`, JSON.stringify(newUnlocked));
    
    toast.success(
      `🏆 Conquista desbloqueada: ${achievement.name}! +${achievement.xpReward} XP e +${achievement.coinReward} moedas!`
    );
    
    setClaimingId(null);
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const progress = getAchievementProgress(achievement, stats);
    const isClaimed = unlockedIds.includes(achievement.id);
    const canClaim = progress.unlocked && !isClaimed;

    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={canClaim ? { scale: 1.02 } : {}}
        className={`relative bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all ${
          isClaimed
            ? "border-success/50 bg-success/5"
            : canClaim
            ? `border-primary/50 ring-2 ring-primary/20 ${getRarityColor(achievement.rarity)}`
            : "border-border/50 opacity-70"
        }`}
      >
        {/* Rarity Badge */}
        <Badge className={`absolute top-3 right-3 ${getRarityColor(achievement.rarity)}`}>
          {getRarityLabel(achievement.rarity)}
        </Badge>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              progress.unlocked
                ? `${achievement.bgColor}/20`
                : "bg-muted/50"
            }`}
          >
            {progress.unlocked ? (
              <achievement.icon className={achievement.color} size={28} />
            ) : (
              <Lock className="text-muted-foreground" size={24} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>

            {/* Progress */}
            {!isClaimed && (
              <div className="space-y-1">
                <Progress value={progress.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {progress.current} / {achievement.requirement}
                  </span>
                  <span>{Math.round(progress.percentage)}%</span>
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-primary">
                <Sparkles size={14} />
                +{achievement.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-rank-gold">
                <Star size={14} />
                +{achievement.coinReward}
              </span>
            </div>

            {/* Claim Button */}
            {canClaim && (
              <motion.button
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={() => claimAchievement(achievement)}
                disabled={claimingId === achievement.id}
                className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Gift size={16} />
                Resgatar Recompensa
              </motion.button>
            )}

            {isClaimed && (
              <div className="mt-3 flex items-center gap-2 text-success">
                <Check size={16} />
                <span className="text-sm font-medium">Resgatado</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const filterByType = (type: string) => {
    if (type === "all") return achievements;
    return achievements.filter((a) => a.type === type);
  };

  const unlockedCount = achievements.filter((a) => 
    getAchievementProgress(a, stats).unlocked
  ).length;

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy className="text-amber-500" />
              Conquistas
            </h1>
            <p className="text-muted-foreground mt-1">
              Desbloqueie badges e ganhe recompensas épicas
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
            <Trophy className="text-amber-500" size={20} />
            <span className="font-bold">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Progresso Geral</h3>
                <p className="text-sm text-muted-foreground">
                  {unlockedIds.length} conquistas resgatadas
                </p>
              </div>
            </div>
          </div>

          <Progress
            value={(unlockedCount / achievements.length) * 100}
            className="h-3"
          />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="lessons">Lições</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="streak">Ofensiva</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="xp">XP</TabsTrigger>
          </TabsList>

          {["all", "lessons", "flashcards", "streak", "ranking", "xp"].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filterByType(type).map(renderAchievementCard)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Achievements;
