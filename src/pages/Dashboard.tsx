import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy,
  Flame,
  Coins,
  Target,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Gift,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
      title: "Atividades",
      description: "Complete missões diárias",
      icon: BookOpen,
      path: "/activities",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Metas Semanais",
      description: "Acompanhe seu progresso",
      icon: Target,
      path: "/weekly-goals",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Pomodoro",
      description: "Foque nos estudos",
      icon: Clock,
      path: "/pomodoro",
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Loja",
      description: "Gaste suas moedas",
      icon: ShoppingBag,
      path: "/shop",
      color: "from-yellow-500 to-amber-500",
    },
  ];

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, {profile?.public_name || "Estudante"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Continue sua jornada de estudos
            </p>
          </div>

          <Link to="/streak">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl cursor-pointer"
            >
              <Flame className="text-orange-500" size={24} />
              <div>
                <p className="text-sm text-muted-foreground">Ofensiva</p>
                <p className="text-lg font-bold text-foreground">
                  {streak?.current_streak || 0} dias 🔥
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rank-gold/20">
                <Coins size={20} className="text-rank-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moedas</p>
                <p className="text-xl font-bold">{profile?.coins?.toLocaleString() || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nível</p>
                <p className="text-xl font-bold">{profile?.level || 1}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">XP Total</p>
                <p className="text-xl font-bold">{profile?.xp?.toLocaleString() || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 ${rankData ? rankData.rank.borderColor + "/30" : "border-border/50"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${rankData ? rankData.rank.bgColor + "/20" : "bg-muted"}`}>
                <Trophy size={20} className={rankData ? rankData.rank.color : "text-muted-foreground"} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Patente</p>
                <p className={`text-lg font-bold ${rankData ? rankData.rank.color : ""}`}>
                  {rankData ? `${rankData.rank.name} ${["I", "II", "III"][rankData.level - 1]}` : "Bronze I"}
                </p>
              </div>
            </div>
          </motion.div>
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
                <Trophy className={rankData.rank.color} size={24} />
                <div>
                  <h3 className="font-semibold text-foreground">Progresso da Patente</h3>
                  <p className={`text-sm ${rankData.rank.color}`}>
                    {rankData.rank.name} {["I", "II", "III"][rankData.level - 1]}
                  </p>
                </div>
              </div>
              <Link to="/rankings">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <Link
                  to={action.path}
                  className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="text-white" size={24} />
                  </div>
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

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Gift className="text-white" size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Caixas Misteriosas na Loja!
              </h3>
              <p className="text-muted-foreground">
                Abra caixas para ganhar moedas, XP, avatares exclusivos e muito mais!
              </p>
            </div>
            <Link to="/shop">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                <ShoppingBag className="mr-2" size={18} />
                Ir para Loja
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
