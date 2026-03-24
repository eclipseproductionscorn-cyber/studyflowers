import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Clock, BookOpen, Trophy, Flame, Target, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Statistics = () => {
  const { profile, streak, user, loading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [tab, setTab] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [sessRes, actRes] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
        supabase.from("ai_activities").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      ]);
      setSessions(sessRes.data || []);
      setActivities(actRes.data || []);
    };
    fetchData();
  }, [user]);

  // Weekly study data
  const weeklyData = useMemo(() => {
    const now = new Date();
    const data = DAYS.map((day, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay() + i);
      const dateStr = d.toISOString().split("T")[0];
      const daySessions = sessions.filter(s => s.started_at?.startsWith(dateStr));
      const dayActivities = activities.filter(a => a.created_at?.startsWith(dateStr));
      return {
        name: day,
        minutos: daySessions.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0),
        atividades: dayActivities.length,
        acertos: dayActivities.filter((a: any) => a.is_correct).length,
      };
    });
    return data;
  }, [sessions, activities]);

  // Subject distribution
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((a: any) => { counts[a.subject] = (counts[a.subject] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [activities]);

  // Accuracy rate
  const accuracy = useMemo(() => {
    const completed = activities.filter((a: any) => a.is_completed);
    if (completed.length === 0) return 0;
    return Math.round((completed.filter((a: any) => a.is_correct).length / completed.length) * 100);
  }, [activities]);

  // Heatmap data (last 12 weeks)
  const heatmapData = useMemo(() => {
    const weeks: { date: string; count: number; day: number; week: number }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split("T")[0];
        const count = activities.filter((a: any) => a.created_at?.startsWith(dateStr)).length +
                      sessions.filter((s: any) => s.started_at?.startsWith(dateStr)).length;
        weeks.push({ date: dateStr, count, day: d, week: 11 - w });
      }
    }
    return weeks;
  }, [activities, sessions]);

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count <= 1) return "bg-green-200 dark:bg-green-900/50";
    if (count <= 3) return "bg-green-400 dark:bg-green-700/70";
    if (count <= 5) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  };

  const totalMinutes = sessions.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0);
  const totalActivities = activities.length;
  const totalXP = profile?.xp || 0;

  const chartConfig = {
    minutos: { label: "Minutos", color: "hsl(var(--primary))" },
    atividades: { label: "Atividades", color: "#f59e0b" },
    acertos: { label: "Acertos", color: "#10b981" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">📊 Estatísticas Avançadas</h1>
          <p className="text-muted-foreground">Acompanhe sua evolução em detalhes</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: "Tempo Total", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: "text-blue-500" },
            { icon: BookOpen, label: "Atividades", value: totalActivities.toString(), color: "text-green-500" },
            { icon: Target, label: "Precisão", value: `${accuracy}%`, color: "text-yellow-500" },
            { icon: Trophy, label: "XP Total", value: totalXP.toLocaleString(), color: "text-purple-500" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-4 border border-border">
              <Icon size={20} className={`${color} mb-2`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" /> Atividade Semanal
          </h3>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minutos" fill="var(--color-minutos)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atividades" fill="var(--color-atividades)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Pie Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain size={20} className="text-purple-500" /> Matérias Estudadas
            </h3>
            {subjectData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma atividade ainda</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {subjectData.map((s, i) => (
                <Badge key={s.name} variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full mr-1 inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.name} ({s.value})
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Accuracy Trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" /> Taxa de Acerto
            </h3>
            <div className="flex flex-col items-center justify-center h-[250px]">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" className="stroke-primary" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${accuracy * 2.51} 251`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{accuracy}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {accuracy >= 80 ? "🔥 Excelente!" : accuracy >= 60 ? "👍 Bom progresso!" : "💪 Continue praticando!"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-green-500" /> Mapa de Calor (12 semanas)
          </h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-[500px]">
              <div className="flex flex-col gap-1 mr-1">
                {DAYS.map(d => <span key={d} className="text-[10px] text-muted-foreground h-4 flex items-center">{d}</span>)}
              </div>
              {Array.from({ length: 12 }).map((_, week) => (
                <div key={week} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, day) => {
                    const cell = heatmapData.find(h => h.week === week && h.day === day);
                    return (
                      <motion.div
                        key={day}
                        whileHover={{ scale: 1.5 }}
                        className={`w-4 h-4 rounded-sm ${getHeatColor(cell?.count || 0)} cursor-pointer`}
                        title={cell ? `${cell.date}: ${cell.count} atividades` : ""}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>Menos</span>
              {[0, 1, 3, 5, 7].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${getHeatColor(n)}`} />)}
              <span>Mais</span>
            </div>
          </div>
        </motion.div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: "Streak Atual", value: `${streak?.current_streak || 0} dias`, color: "text-orange-500", bg: "from-orange-500/10 to-red-500/10" },
            { icon: Trophy, title: "Maior Streak", value: `${streak?.longest_streak || 0} dias`, color: "text-yellow-500", bg: "from-yellow-500/10 to-amber-500/10" },
            { icon: Target, title: "Nível", value: `Lv. ${profile?.level || 1}`, color: "text-purple-500", bg: "from-purple-500/10 to-indigo-500/10" },
          ].map(({ icon: Icon, title, value, color, bg }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className={`bg-gradient-to-br ${bg} rounded-xl p-6 border border-border text-center`}>
              <Icon size={28} className={`${color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
