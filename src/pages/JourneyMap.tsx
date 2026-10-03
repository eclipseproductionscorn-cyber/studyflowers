import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Lock, Play, CheckCircle, Star, Zap, Crown, Swords, BookOpen, HelpCircle, RotateCcw, Gift } from "lucide-react";
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

const PHASE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  lesson: { icon: <BookOpen size={16} />, label: "Aula", gradient: "from-blue-500 to-blue-600" },
  quiz: { icon: <HelpCircle size={16} />, label: "Quiz", gradient: "from-violet-500 to-purple-600" },
  review: { icon: <RotateCcw size={16} />, label: "Revisão", gradient: "from-teal-500 to-cyan-600" },
  challenge: { icon: <Swords size={16} />, label: "Desafio", gradient: "from-orange-500 to-red-600" },
  boss: { icon: <Crown size={16} />, label: "Chefão", gradient: "from-red-600 to-rose-700" },
  reward: { icon: <Gift size={16} />, label: "Recompensa", gradient: "from-amber-500 to-yellow-500" },
};

const JourneyMap = () => {
  const { profile, user } = useAuth();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [phases, setPhases] = useState<TrailPhase[]>([]);
  const [progress, setProgress] = useState<UserTrailProgress[]>([]);
  const [activePhase, setActivePhase] = useState<TrailPhase | null>(null);

  useEffect(() => {
    fetchTrails();
    if (user) fetchProgress();
  }, [user]);

  const fetchTrails = async () => {
    const { data } = await supabase.from("study_trails").select("*").eq("is_published", true).order("created_at");
    const t = (data as Trail[]) || [];
    setTrails(t);
    if (t.length > 0 && !selectedTrail) {
      setSelectedTrail(t[0]);
      fetchPhases(t[0].id);
    }
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
    await supabase.from("user_trail_progress").insert({ user_id: user.id, trail_id: trailId });
    toast.success("Trilha iniciada! 🚀");
    fetchProgress();
  };

  const getProgress = (trailId: string) => progress.find((p) => p.trail_id === trailId);

  const selectTrail = (trail: Trail) => {
    setSelectedTrail(trail);
    fetchPhases(trail.id);
  };

  const prog = selectedTrail ? getProgress(selectedTrail.id) : null;
  const pct = prog && selectedTrail ? (prog.completed_phases.length / selectedTrail.total_phases) * 100 : 0;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Map className="text-primary" /> Mapa de Jornada
          </h1>
          <p className="text-muted-foreground mt-1">Avance fase por fase e conquiste cada território do conhecimento</p>
        </div>

        {/* Trail selector tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {trails.map((trail) => {
            const tp = getProgress(trail.id);
            return (
              <button
                key={trail.id}
                onClick={() => selectTrail(trail)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                  selectedTrail?.id === trail.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-lg">{trail.icon}</span>
                <span className="font-medium text-sm">{trail.title}</span>
                {tp?.is_completed && <CheckCircle size={14} className="text-green-500" />}
              </button>
            );
          })}
        </div>

        {selectedTrail && (
          <>
            {/* Trail header card */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5" style={{ borderLeftColor: selectedTrail.color, borderLeftWidth: 4 }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="text-2xl">{selectedTrail.icon}</span> {selectedTrail.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTrail.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary">{selectedTrail.objective}</Badge>
                    <Badge variant="outline">{selectedTrail.total_phases} fases</Badge>
                    {selectedTrail.subjects.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                {!prog && (
                  <Button onClick={() => startTrail(selectedTrail.id)} className="gap-2">
                    <Play size={16} /> Começar Jornada
                  </Button>
                )}
              </div>
              {prog && (
                <div className="flex items-center gap-3 mt-4">
                  <Progress value={pct} className="flex-1 h-3" />
                  <span className="text-sm font-bold text-primary">{Math.round(pct)}%</span>
                </div>
              )}
            </div>

            {/* Journey map - visual path */}
            <div className="relative">
              {phases.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Map size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Fases em construção...</p>
                </div>
              ) : (
                <div className="relative py-4">
                  {/* Connecting path line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-accent/30 to-muted -translate-x-1/2 rounded-full hidden md:block" />

                  {phases.map((phase, i) => {
                    const isCompleted = prog?.completed_phases.includes(phase.phase_number);
                    const isCurrent = prog?.current_phase === phase.phase_number;
                    const isLocked = prog ? phase.phase_number > prog.current_phase : i > 0;
                    const config = PHASE_TYPE_CONFIG[phase.phase_type] || PHASE_TYPE_CONFIG.lesson;
                    const isEven = i % 2 === 0;

                    return (
                      <motion.div
                        key={phase.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative flex items-center gap-4 mb-6 md:mb-8 ${
                          isEven ? "md:flex-row" : "md:flex-row-reverse"
                        } flex-col md:flex-row`}
                      >
                        {/* Content card - alternating sides on desktop */}
                        <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                          <motion.div
                            role={!isLocked && prog ? "button" : undefined}
                            onClick={() => { if (!isLocked && prog) setActivePhase(phase); }}
                            whileHover={!isLocked ? { scale: 1.02 } : {}}
                            className={`inline-block w-full max-w-sm p-4 rounded-2xl border transition-all ${
                              isCompleted
                                ? "border-green-500/30 bg-green-500/5 shadow-sm"
                                : isCurrent
                                ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                                : isLocked
                                ? "border-border/30 bg-muted/20 opacity-50"
                                : "border-border/50 bg-card/50"
                            }`}
                          >
                            <div className={`flex items-center gap-2 ${isEven ? "md:flex-row-reverse" : ""}`}>
                              <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                              <span className="font-bold text-foreground text-sm">{phase.title}</span>
                            </div>
                            {phase.description && (
                              <p className="text-xs text-muted-foreground mt-1.5">{phase.description}</p>
                            )}
                            <div className={`flex gap-2 mt-2 ${isEven ? "md:justify-end" : ""}`}>
                              <span className="text-xs text-primary font-medium">{phase.xp_reward} XP</span>
                              <span className="text-xs text-amber-500 font-medium">{phase.coin_reward} 🪙</span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Center node */}
                        <div className="relative z-10 flex-shrink-0">
                          <motion.div
                            animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                            transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border-[3px] shadow-lg ${
                              isCompleted
                                ? "bg-green-500 border-green-400 text-white"
                                : isCurrent
                                ? "bg-gradient-to-br from-primary to-accent border-primary text-white shadow-primary/30"
                                : isLocked
                                ? "bg-muted border-border text-muted-foreground"
                                : "bg-card border-border text-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={22} />
                            ) : isLocked ? (
                              <Lock size={18} />
                            ) : (
                              config.icon
                            )}
                          </motion.div>
                          {/* Phase number */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                            <span className="text-[10px] font-bold text-foreground">{phase.phase_number}</span>
                          </div>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="flex-1 hidden md:block" />
                      </motion.div>
                    );
                  })}

                  {/* Final trophy */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: phases.length * 0.08 }}
                    className="flex justify-center"
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-[3px] ${
                      prog?.is_completed
                        ? "bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 shadow-lg shadow-amber-500/30"
                        : "bg-muted/30 border-border/50"
                    }`}>
                      <Star size={32} className={prog?.is_completed ? "text-white" : "text-muted-foreground"} />
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </>
        )}

        {trails.length === 0 && (
          <div className="text-center py-16">
            <Map className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground">Nenhuma trilha disponível</h3>
            <p className="text-muted-foreground mt-1">Em breve novas jornadas serão adicionadas!</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default JourneyMap;
