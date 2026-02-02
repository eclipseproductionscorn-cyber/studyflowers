import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy,
  Flame,
  Coins,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  Gift,
  ShoppingBag,
  TrendingUp,
  Brain,
  Gamepad2,
  Zap,
  Award,
  Star,
  Crown,
  Swords,
  Rocket,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import DailyMissions from "@/components/DailyMissions";
import { useAuth } from "@/hooks/useAuth";
import { getRankData, getRankProgress } from "@/lib/ranks";

const Dashboard = () => {
  const { profile, streak, loading } = useAuth();

  const rankData = getRankData(profile?.current_rank || "bronze_1");
  const { next: nextXP, progress: xpProgress } = getRankProgress(profile?.xp || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Modo Jogo",
      description: "Atividades e quizzes",
      icon: Gamepad2,
      path: "/activities",
      color: "from-green-500 to-emerald-500",
      badge: "XP",
    },
    {
      title: "Flashcards IA",
      description: "Memorize com IA",
      icon: Brain,
      path: "/flashcards",
      color: "from-purple-500 to-pink-500",
      badge: "IA",
    },
    {
      title: "Teacher Samuk",
      description: "Seu mentor virtual",
      icon: Swords,
      path: "/teacher-samuk",
      color: "from-emerald-500 to-cyan-500",
      badge: "Chat",
    },
    {
      title: "Loja & Temas",
      description: "Personalize seu app",
      icon: ShoppingBag,
      path: "/shop",
      color: "from-amber-500 to-orange-500",
      badge: "Novo",
    },
  ];

  const stats = [
    {
      label: "Moedas",
      value: profile?.coins?.toLocaleString() || "0",
      icon: Coins,
      color: "text-rank-gold",
      bg: "bg-rank-gold/20",
    },
    {
      label: "Nível",
      value: profile?.level || 1,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      label: "XP Total",
      value: profile?.xp?.toLocaleString() || "0",
      icon: Sparkles,
      color: "text-accent",
      bg: "bg-accent/20",
    },
    {
      label: "Ofensiva",
      value: `${streak?.current_streak || 0}🔥`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/20",
    },
  ];

  const getSamukMessage = () => {
    const streakCount = streak?.current_streak || 0;
    const hour = new Date().getHours();

    if (streakCount >= 30) {
      return "30 dias de ofensiva?! Você é uma LENDA! 🏆👑";
    } else if (streakCount >= 7) {
      return `${streakCount} dias seguidos! Você tá VOANDO! 🚀🔥`;
    } else if (streakCount > 0) {
      return `${streakCount} dias de ofensiva! Bora manter esse ritmo! 💪`;
    } else if (hour < 12) {
      return "Bom dia! Que tal começar o dia com uma atividade? ☀️";
    } else if (hour < 18) {
      return "Boa tarde! Hora de estudar e ganhar XP! 📚";
    } else {
      return "Boa noite! Ainda dá tempo de evoluir hoje! 🌙";
    }
  };

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Welcome Section with Teacher Samuk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 w-fit"
            >
              <Rocket className="text-white" size={32} />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                E aí, {profile?.public_name || "Estudante"}! 🎮
              </h1>
              <p className="text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">Teacher Samuk:</span>{" "}
                {getSamukMessage()}
              </p>
            </div>
            <Link to="/activities">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90">
                <Gamepad2 className="mr-2" size={18} />
                Jogar Agora
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rank Progress */}
        {rankData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${rankData.rank.bgColor}/10 to-transparent border ${rankData.rank.borderColor}/30 rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`p-2 rounded-lg ${rankData.rank.bgColor}/20`}
                >
                  <Trophy className={rankData.rank.color} size={24} />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground">Patente Atual</h3>
                  <p className={`text-sm ${rankData.rank.color} font-medium`}>
                    {rankData.rank.name} {["I", "II", "III"][rankData.level - 1]}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/rankings">
                  <Button variant="ghost" size="sm">
                    Patentes
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
                <Link to="/global-ranking">
                  <Button variant="outline" size="sm">
                    <Crown size={16} className="mr-1" />
                    Ranking
                  </Button>
                </Link>
              </div>
            </div>
            
            <Progress value={xpProgress} className="h-3 mb-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{profile?.xp?.toLocaleString() || 0} XP</span>
              <span>{nextXP ? `${nextXP.toLocaleString()} XP` : "Máximo!"}</span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="text-primary" size={20} />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
              >
                <Link
                  to={action.path}
                  className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all group relative overflow-hidden"
                >
                  {action.badge && (
                    <Badge className="absolute top-2 right-2 text-xs bg-primary/20 text-primary">
                      {action.badge}
                    </Badge>
                  )}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}
                  >
                    <action.icon className="text-white" size={24} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Missions Component */}
        <DailyMissions />

        {/* Achievement & Ranking Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Achievements Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <Link to="/achievements">
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/30 rounded-xl p-5 hover:border-amber-500/50 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"
                    >
                      <Award className="text-white" size={24} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground">Conquistas</h3>
                      <p className="text-sm text-muted-foreground">
                        Desbloqueie badges épicos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Global Ranking Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.01 }}
          >
            <Link to="/global-ranking">
              <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-indigo-500/10 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
                    >
                      <Crown className="text-white" size={24} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground">Ranking Global</h3>
                      <p className="text-sm text-muted-foreground">
                        Compete com todos os jogadores
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500"
            >
              <Gift className="text-white" size={40} />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-1">
                🎨 Novos Temas na Loja!
              </h3>
              <p className="text-muted-foreground">
                Personalize seu app com temas exclusivos! Aurora Boreal, Neon Cyber, Realeza e muito mais!
              </p>
            </div>
            <Link to="/shop">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                <ShoppingBag className="mr-2" size={18} />
                Ver Temas
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
