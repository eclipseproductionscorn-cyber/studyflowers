import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Coins, Trophy, Flame, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/studyflow-logo.png";

interface Profile {
  public_name: string;
  full_name: string;
  coins: number;
  level: number;
  xp: number;
  current_rank: string;
  streak_days: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        // Defer profile fetch
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Até logo!");
      navigate("/");
    }
  };

  const getRankDisplay = (rank: string) => {
    const ranks: Record<string, { name: string; color: string }> = {
      bronze_1: { name: "Bronze I", color: "text-rank-bronze" },
      bronze_2: { name: "Bronze II", color: "text-rank-bronze" },
      bronze_3: { name: "Bronze III", color: "text-rank-bronze" },
      silver_1: { name: "Prata I", color: "text-rank-silver" },
      silver_2: { name: "Prata II", color: "text-rank-silver" },
      silver_3: { name: "Prata III", color: "text-rank-silver" },
      gold_1: { name: "Ouro I", color: "text-rank-gold" },
      gold_2: { name: "Ouro II", color: "text-rank-gold" },
      gold_3: { name: "Ouro III", color: "text-rank-gold" },
    };
    return ranks[rank] || { name: "Bronze I", color: "text-rank-bronze" };
  };

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

  const rankInfo = getRankDisplay(profile?.current_rank || "bronze_1");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Studio Flow" className="h-10 w-auto rounded-lg" />
          </a>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins size={18} className="text-rank-gold" />
              <span className="font-medium">{profile?.coins?.toLocaleString() || 0}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Olá, {profile?.public_name || "Estudante"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Continue sua jornada de estudos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rank-gold/10">
                  <Coins size={20} className="text-rank-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moedas</p>
                  <p className="text-xl font-bold">{profile?.coins?.toLocaleString() || 0}</p>
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
                <div className="p-2 rounded-lg bg-primary/10">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nível</p>
                  <p className="text-xl font-bold">{profile?.level || 1}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rankInfo.color.replace('text-', 'bg-')}/10`}>
                  <Trophy size={20} className={rankInfo.color} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patente</p>
                  <p className={`text-xl font-bold ${rankInfo.color}`}>{rankInfo.name}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ofensiva</p>
                  <p className="text-xl font-bold">{profile?.streak_days || 0} dias</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🚀 Em breve...
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Atividades diárias, trilhas de estudo, IA Tutora e muito mais estão chegando! 
              Continue acompanhando para não perder nenhuma novidade.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
