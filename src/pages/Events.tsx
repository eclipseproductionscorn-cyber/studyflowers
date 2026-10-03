import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Trophy, Zap, Target, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SeasonalEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  rewards: any;
}

interface EventMission {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  target: number;
  xp_reward: number;
  coin_reward: number;
}

interface UserProgress {
  mission_id: string;
  current: number;
  is_completed: boolean;
}

const EVENT_ICONS: Record<string, typeof Calendar> = {
  marathon: Zap, challenge: Target, review: Star, seasonal: Gift,
};

const EVENT_COLORS: Record<string, string> = {
  marathon: "from-amber-500 to-orange-600",
  challenge: "from-blue-500 to-indigo-600",
  review: "from-green-500 to-emerald-600",
  seasonal: "from-purple-500 to-pink-600",
};

const Events = () => {
  const { profile, user } = useAuth();
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [missions, setMissions] = useState<EventMission[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    supabase.functions.invoke("seasonal-ai-events").finally(fetchEvents);
    if (user) fetchProgress();
  }, [user]);

  const fetchEvents = async () => {
    const { data } = await supabase.from("seasonal_events").select("*").eq("is_active", true).order("starts_at", { ascending: false });
    setEvents((data as SeasonalEvent[]) || []);
  };

  const fetchMissions = async (eventId: string) => {
    const { data } = await supabase.from("event_missions").select("*").eq("event_id", eventId);
    setMissions((data as EventMission[]) || []);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_event_progress").select("mission_id, current, is_completed").eq("user_id", user.id);
    setProgress((data as UserProgress[]) || []);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
    fetchMissions(eventId);
  };

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Encerrado";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h restantes` : `${hours}h restantes`;
  };

  const getMissionProgress = (missionId: string) => progress.find((p) => p.mission_id === missionId);

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="text-primary" /> Eventos Especiais
          </h1>
          <p className="text-muted-foreground mt-1">Participe de eventos temáticos e ganhe recompensas exclusivas</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground">Nenhum evento ativo</h3>
            <p className="text-muted-foreground mt-1">Novos eventos em breve! Fique ligado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event, i) => {
              const IconComp = EVENT_ICONS[event.event_type] || Calendar;
              const gradientClass = EVENT_COLORS[event.event_type] || "from-primary to-accent";
              const isSelected = selectedEvent === event.id;

              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div
                    className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${isSelected ? "border-primary shadow-lg" : "border-border/50 hover:border-primary/30"}`}
                    onClick={() => handleSelectEvent(event.id)}
                  >
                    {/* Banner */}
                    <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <IconComp size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{event.title}</h3>
                            <p className="text-white/80 text-sm">{event.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-white/20 text-white border-0">
                            <Clock size={12} className="mr-1" /> {getTimeRemaining(event.ends_at)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Missions */}
                    {isSelected && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="p-4 space-y-3 bg-card/50">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Target size={16} /> Missões do Evento
                        </h4>
                        {missions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma missão disponível</p>
                        ) : missions.map((mission) => {
                          const prog = getMissionProgress(mission.id);
                          const pct = prog ? Math.min((prog.current / mission.target) * 100, 100) : 0;
                          return (
                            <div key={mission.id} className={`p-3 rounded-xl border ${prog?.is_completed ? "border-green-500/30 bg-green-500/5" : "border-border/50"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground text-sm">{mission.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary" className="text-xs">{mission.xp_reward} XP</Badge>
                                  <Badge variant="outline" className="text-xs">{mission.coin_reward} 🪙</Badge>
                                </div>
                              </div>
                              {mission.description && <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>}
                              <div className="flex items-center gap-3">
                                <Progress value={pct} className="flex-1 h-2" />
                                <span className="text-xs font-medium text-muted-foreground">{prog?.current || 0}/{mission.target}</span>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
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

export default Events;
