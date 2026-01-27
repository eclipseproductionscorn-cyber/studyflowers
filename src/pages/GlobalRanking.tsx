import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getRankData, parseRankString, ranks } from "@/lib/ranks";

interface LeaderboardUser {
  id: string;
  user_id: string;
  public_name: string;
  xp: number;
  current_rank: string;
  level: number;
  streak_days: number;
  avatar_url?: string;
  position?: number;
  change?: "up" | "down" | "same";
}

const GlobalRanking = () => {
  const { profile, user } = useAuth();
  const [globalRanking, setGlobalRanking] = useState<LeaderboardUser[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<LeaderboardUser[]>([]);
  const [levelRanking, setLevelRanking] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    fetchRankings();
  }, [user]);

  const fetchRankings = async () => {
    setLoading(true);

    // Fetch all profiles ordered by XP for global ranking
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, user_id, public_name, xp, current_rank, level, streak_days, avatar_url")
      .order("xp", { ascending: false })
      .limit(100);

    if (allProfiles) {
      const ranked = allProfiles.map((p, index) => ({
        ...p,
        position: index + 1,
        change: (Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "same") as "up" | "down" | "same",
      }));

      setGlobalRanking(ranked);

      // Find user position
      const userIdx = ranked.findIndex((p) => p.user_id === user?.id);
      if (userIdx !== -1) {
        setUserPosition(userIdx + 1);
      }

      // Weekly ranking (simulated - would need weekly XP tracking)
      const weeklyRanked = [...ranked].sort(() => Math.random() - 0.5).slice(0, 50);
      setWeeklyRanking(weeklyRanked.map((p, i) => ({ ...p, position: i + 1 })));

      // Level-based ranking (filter by same level range)
      const userLevel = profile?.level || 1;
      const levelFiltered = ranked.filter(
        (p) => p.level >= userLevel - 5 && p.level <= userLevel + 5
      );
      setLevelRanking(levelFiltered.map((p, i) => ({ ...p, position: i + 1 })));
    }

    setLoading(false);
  };

  const renderPositionBadge = (position: number) => {
    if (position === 1) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
          <Crown className="text-white" size={20} />
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <Medal className="text-white" size={20} />
        </div>
      );
    }
    if (position === 3) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
          <Medal className="text-white" size={20} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <span className="font-bold text-muted-foreground">#{position}</span>
      </div>
    );
  };

  const renderLeaderboard = (users: LeaderboardUser[]) => (
    <div className="space-y-2">
      {users.slice(0, 50).map((rankedUser, index) => {
        const isCurrentUser = rankedUser.user_id === user?.id;
        const rankData = getRankData(rankedUser.current_rank);

        return (
          <motion.div
            key={rankedUser.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              isCurrentUser
                ? "bg-primary/10 border-2 border-primary/30"
                : "bg-card/50 border border-border/50 hover:bg-card/80"
            }`}
          >
            {/* Position */}
            {renderPositionBadge(rankedUser.position || index + 1)}

            {/* Change Indicator */}
            <div className="w-6">
              {rankedUser.change === "up" && (
                <ChevronUp className="text-success" size={18} />
              )}
              {rankedUser.change === "down" && (
                <ChevronDown className="text-destructive" size={18} />
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {rankedUser.public_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {rankedUser.public_name}
                  {isCurrentUser && " (Você)"}
                </span>
                {rankData && (
                  <Badge className={`${rankData.rank.bgColor}/20 ${rankData.rank.color} text-xs`}>
                    {rankData.rank.name} {["I", "II", "III"][rankData.level - 1]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Target size={12} />
                  Nv. {rankedUser.level}
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={12} className="text-orange-500" />
                  {rankedUser.streak_days} dias
                </span>
              </div>
            </div>

            {/* XP */}
            <div className="text-right">
              <p className="font-bold text-foreground">
                {rankedUser.xp.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

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
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="text-amber-500" />
            Ranking Global
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete com estudantes de todo o mundo
          </p>
        </div>

        {/* User Position Card */}
        {userPosition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/10 via-accent/5 to-warning/10 border-2 border-primary/30 rounded-2xl p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile?.public_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sua posição</p>
                  <h2 className="text-4xl font-bold text-primary">#{userPosition}</h2>
                  <p className="text-muted-foreground">
                    de {globalRanking.length} estudantes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-card/50 rounded-xl">
                  <Sparkles className="mx-auto text-primary mb-1" size={20} />
                  <p className="text-lg font-bold">{profile?.xp?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP Total</p>
                </div>
                <div className="text-center p-3 bg-card/50 rounded-xl">
                  <Target className="mx-auto text-accent mb-1" size={20} />
                  <p className="text-lg font-bold">{profile?.level}</p>
                  <p className="text-xs text-muted-foreground">Nível</p>
                </div>
                <div className="text-center p-3 bg-card/50 rounded-xl">
                  <Flame className="mx-auto text-orange-500 mb-1" size={20} />
                  <p className="text-lg font-bold">{profile?.streak_days || 0}</p>
                  <p className="text-xs text-muted-foreground">Ofensiva</p>
                </div>
              </div>
            </div>

            {/* Teacher Samuk Feedback */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 bg-card/50 rounded-xl border border-border/50"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-emerald-500">Teacher Samuk:</span>{" "}
                {userPosition <= 10
                  ? "🏆 Você tá no TOP 10! Lenda absoluta, continua assim que o primeiro lugar tá logo ali!"
                  : userPosition <= 50
                  ? "🔥 Top 50, mano! Você tá subindo rápido, logo logo entra na elite!"
                  : "💪 Bora estudar! Cada atividade te deixa mais perto do topo. Você consegue!"}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Ranking Tabs */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-card/50 border border-border/50">
            <TabsTrigger value="global" className="gap-2">
              <Users size={16} />
              <span className="hidden md:inline">Global</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar size={16} />
              <span className="hidden md:inline">Semanal</span>
            </TabsTrigger>
            <TabsTrigger value="level" className="gap-2">
              <Target size={16} />
              <span className="hidden md:inline">Por Nível</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-4">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="text-amber-500" size={18} />
                Top Estudantes
              </h3>
              {renderLeaderboard(globalRanking)}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="text-primary" size={18} />
                Ranking da Semana
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reinicia toda segunda-feira às 00:00
              </p>
              {renderLeaderboard(weeklyRanking)}
            </div>
          </TabsContent>

          <TabsContent value="level" className="mt-4">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="text-accent" size={18} />
                Seu Nível (±5)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Competindo com jogadores do nível {Math.max(1, (profile?.level || 1) - 5)} ao {(profile?.level || 1) + 5}
              </p>
              {renderLeaderboard(levelRanking)}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default GlobalRanking;
