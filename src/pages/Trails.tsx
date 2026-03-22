import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Lock, Play, CheckCircle, ChevronRight, Star, Coins, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trail {
  id: string;
  title: string;
  description: string | null;
  objective: string;
  icon: string;
  color: string;
  total_phases: number;
  difficulty: string;
  subjects: string[];
}

interface TrailPhase {
  id: string;
  trail_id: string;
  phase_number: number;
  title: string;
  description: string | null;
  phase_type: string;
  xp_reward: number;
  coin_reward: number;
}

interface UserTrailProgress {
  trail_id: string;
  current_phase: number;
  completed_phases: number[];
  is_completed: boolean;
}

const PHASE_ICONS: Record<string, string> = {
  lesson: "📖", quiz: "❓", review: "🔁", challenge: "⚔️", boss: "🐉", reward: "🎁",
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "Fácil", color: "text-green-500" },
  medium: { label: "Médio", color: "text-amber-500" },
  hard: { label: "Difícil", color: "text-red-500" },
};

const Trails = () => {
  const { profile, user } = useAuth();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [phases, setPhases] = useState<TrailPhase[]>([]);
  const [progress, setProgress] = useState<UserTrailProgress[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);

  useEffect(() => {
    fetchTrails();
    if (user) fetchProgress();
  }, [user]);

  const fetchTrails = async () => {
    const { data } = await supabase.from("study_trails").select("*").eq("is_published", true).order("created_at");
    setTrails((data as Trail[]) || []);
  };

  const fetchPhases = async (trailId: string) => {
    const { data } = await supabase.from("trail_phases").select("*").eq("trail_id", trailId).order("phase_number");
    setPhases((data as TrailPhase[]) || []);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_trail_progress").select("trail_id, current_phase, completed_phases, is_completed").eq("user_id", user.id);
    setProgress((data as UserTrailProgress[]) || []);
  };

  const startTrail = async (trailId: string) => {
    if (!user) return;
    const existing = progress.find((p) => p.trail_id === trailId);
    if (existing) return;
    await supabase.from("user_trail_progress").insert({ user_id: user.id, trail_id: trailId });
    toast.success("Trilha iniciada! Boa sorte! 🎯");
    fetchProgress();
  };

  const getTrailProgress = (trailId: string) => progress.find((p) => p.trail_id === trailId);

  const handleSelectTrail = (trailId: string) => {
    setSelectedTrail(selectedTrail === trailId ? null : trailId);
    if (selectedTrail !== trailId) fetchPhases(trailId);
  };

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Map className="text-primary" /> Trilhas de Estudo
          </h1>
          <p className="text-muted-foreground mt-1">Escolha sua trilha e avance fase por fase até dominar o conteúdo</p>
        </div>

        {trails.length === 0 ? (
          <div className="text-center py-16">
            <Map className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground">Nenhuma trilha disponível</h3>
            <p className="text-muted-foreground mt-1">Em breve novas trilhas serão adicionadas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trails.map((trail, i) => {
              const prog = getTrailProgress(trail.id);
              const pct = prog ? (prog.completed_phases.length / trail.total_phases) * 100 : 0;
              const diff = DIFFICULTY_LABELS[trail.difficulty] || DIFFICULTY_LABELS.medium;
              const isSelected = selectedTrail === trail.id;

              return (
                <motion.div key={trail.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div
                    className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${isSelected ? "border-primary shadow-lg" : "border-border/50 hover:border-primary/30"}`}
                    onClick={() => handleSelectTrail(trail.id)}
                  >
                    {/* Trail Header */}
                    <div className="p-5 flex items-center gap-4" style={{ borderLeft: `4px solid ${trail.color}` }}>
                      <div className="text-3xl">{trail.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground">{trail.title}</h3>
                          <Badge variant="outline" className={`text-xs ${diff.color}`}>{diff.label}</Badge>
                          {prog?.is_completed && <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs"><Trophy size={10} className="mr-1" />Concluída</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{trail.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs">{trail.objective}</Badge>
                          <span className="text-xs text-muted-foreground">{trail.total_phases} fases</span>
                          {trail.subjects.length > 0 && trail.subjects.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                        {prog && (
                          <div className="flex items-center gap-3 mt-3">
                            <Progress value={pct} className="flex-1 h-2" />
                            <span className="text-xs font-medium text-muted-foreground">{Math.round(pct)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {!prog ? (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); startTrail(trail.id); }}>
                            <Play size={14} className="mr-1" /> Começar
                          </Button>
                        ) : (
                          <ChevronRight size={20} className={`text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
                        )}
                      </div>
                    </div>

                    {/* Trail Phases (Journey Map) */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-5 pb-5"
                        >
                          <div className="relative ml-8">
                            {/* Vertical line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                            {phases.map((phase, pi) => {
                              const isCompleted = prog?.completed_phases.includes(phase.phase_number);
                              const isCurrent = prog?.current_phase === phase.phase_number;
                              const isLocked = prog ? phase.phase_number > prog.current_phase : pi > 0;

                              return (
                                <motion.div
                                  key={phase.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: pi * 0.05 }}
                                  className={`relative flex items-center gap-4 py-3 pl-10 ${isLocked ? "opacity-50" : ""}`}
                                >
                                  {/* Node */}
                                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isCompleted ? "bg-green-500 border-green-500" :
                                    isCurrent ? "bg-primary border-primary animate-pulse" :
                                    "bg-muted border-border"
                                  }`}>
                                    {isCompleted ? <CheckCircle size={12} className="text-white" /> :
                                     isLocked ? <Lock size={10} className="text-muted-foreground" /> :
                                     <span className="text-[10px]">{PHASE_ICONS[phase.phase_type] || "📖"}</span>
                                    }
                                  </div>

                                  <div className={`flex-1 p-3 rounded-xl border ${
                                    isCurrent ? "border-primary/50 bg-primary/5" :
                                    isCompleted ? "border-green-500/30 bg-green-500/5" :
                                    "border-border/30 bg-muted/20"
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{PHASE_ICONS[phase.phase_type] || "📖"}</span>
                                        <span className="font-medium text-sm text-foreground">{phase.title}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Badge variant="secondary" className="text-[10px] px-1.5">{phase.xp_reward} XP</Badge>
                                        <Badge variant="outline" className="text-[10px] px-1.5">{phase.coin_reward} 🪙</Badge>
                                      </div>
                                    </div>
                                    {phase.description && <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>}
                                  </div>
                                </motion.div>
                              );
                            })}

                            {phases.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-6 pl-10">Fases em construção...</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Trails;
