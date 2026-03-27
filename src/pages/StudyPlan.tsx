import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Brain, RefreshCw, Sparkles, Check, Clock, ChevronRight, Zap, Target, TrendingUp, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isToday, isBefore, differenceInMilliseconds, parse, set as setDate } from "date-fns";
import { ptBR } from "date-fns/locale";

const SUBJECT_COLORS: Record<string, string> = {
  "Matemática": "#6366f1",
  "Português": "#ef4444",
  "História": "#f59e0b",
  "Geografia": "#22c55e",
  "Ciências": "#06b6d4",
  "Física": "#8b5cf6",
  "Química": "#ec4899",
  "Biologia": "#10b981",
  "Inglês": "#f97316",
  "Redação": "#14b8a6",
};

// Spaced repetition intervals (Leitner system)
const SR_INTERVALS = [1, 3, 7, 14, 30, 60];

interface StudyBlock {
  id: string;
  subject: string;
  type: "study" | "review" | "practice";
  date: string;
  time: string;
  duration: number; // minutes
  completed: boolean;
  srLevel?: number;
}

const StudyPlan = () => {
  const { profile, user, loading } = useAuth();
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState("plan");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  const subjects = profile?.subjects || [];
  const PLAN_KEY = `studyflow_plan_${user?.id}`;
  const REVIEW_KEY = `studyflow_reviews_${user?.id}`;
  const NOTIF_KEY = `studyflow_notif_${user?.id}`;

  useEffect(() => {
    if (!user) return;
    loadPlan();
    loadReviews();
    loadCompletedActivities();
    // Load notification preference
    const savedNotif = localStorage.getItem(NOTIF_KEY);
    if (savedNotif) {
      const parsed = JSON.parse(savedNotif);
      setNotificationsEnabled(parsed.enabled);
      setReminderMinutes(parsed.minutes || 10);
    }
  }, [user]);

  // Schedule browser notifications for today's blocks
  useEffect(() => {
    if (!notificationsEnabled || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const timers: number[] = [];
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayStudyBlocks = studyBlocks.filter(b => b.date === todayStr && !b.completed);

    todayStudyBlocks.forEach(block => {
      const [hours, minutes] = block.time.split(":").map(Number);
      const blockTime = setDate(new Date(), { hours, minutes, seconds: 0 });
      const notifyTime = new Date(blockTime.getTime() - reminderMinutes * 60 * 1000);
      const msUntil = differenceInMilliseconds(notifyTime, new Date());

      if (msUntil > 0) {
        const timer = window.setTimeout(() => {
          new Notification(`📚 Hora de estudar!`, {
            body: `${block.subject} - ${block.type === "study" ? "Estudo" : block.type === "review" ? "Revisão" : "Prática"} em ${reminderMinutes} minutos (${block.time})`,
            icon: "/favicon.ico",
            tag: block.id,
          });
        }, msUntil);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => window.clearTimeout(t));
  }, [studyBlocks, notificationsEnabled, reminderMinutes]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        toast.error("Seu navegador não suporta notificações.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada. Ative nas configurações do navegador.");
        return;
      }
      setNotificationsEnabled(true);
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: true, minutes: reminderMinutes }));
      toast.success("🔔 Lembretes ativados!");
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false, minutes: reminderMinutes }));
      toast.success("🔕 Lembretes desativados.");
    }
  };

  const loadPlan = () => {
    try {
      const saved = localStorage.getItem(PLAN_KEY);
      if (saved) setStudyBlocks(JSON.parse(saved));
    } catch {}
  };

  const savePlan = (blocks: StudyBlock[]) => {
    localStorage.setItem(PLAN_KEY, JSON.stringify(blocks));
    setStudyBlocks(blocks);
  };

  const loadReviews = () => {
    try {
      const saved = localStorage.getItem(REVIEW_KEY);
      if (saved) setReviewItems(JSON.parse(saved));
    } catch {}
  };

  const saveReviews = (items: any[]) => {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(items));
    setReviewItems(items);
  };

  const loadCompletedActivities = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_activities")
      .select("subject, title, completed_at, is_correct")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .order("completed_at", { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      const existing = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
      const existingIds = new Set(existing.map((r: any) => r.activityTitle));

      const newReviews = data
        .filter(a => !existingIds.has(a.title) && !a.is_correct)
        .slice(0, 20)
        .map(a => ({
          activityTitle: a.title,
          subject: a.subject,
          completedAt: a.completed_at,
          srLevel: 0,
          nextReview: a.completed_at ? addDays(new Date(a.completed_at), SR_INTERVALS[0]).toISOString() : new Date().toISOString(),
        }));

      if (newReviews.length > 0) {
        saveReviews([...existing, ...newReviews]);
      }
    }
  };

  const generateWeeklyPlan = () => {
    if (subjects.length === 0) {
      toast.error("Configure suas matérias no onboarding ou configurações primeiro!");
      return;
    }

    setGenerating(true);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const blocks: StudyBlock[] = [];
    const studyTimes = ["08:00", "10:00", "14:00", "16:00", "19:00"];
    const durations = [45, 30, 45, 30, 60];

    for (let day = 0; day < 7; day++) {
      const date = format(addDays(weekStart, day), "yyyy-MM-dd");
      const daySubjects = [...subjects].sort(() => Math.random() - 0.5);
      const isWeekend = day >= 5;
      const slotsCount = isWeekend ? 2 : Math.min(3, daySubjects.length);

      for (let slot = 0; slot < slotsCount; slot++) {
        const subject = daySubjects[slot % daySubjects.length];
        const types: ("study" | "review" | "practice")[] = ["study", "practice", "review"];

        blocks.push({
          id: `${date}-${slot}`,
          subject,
          type: types[slot % 3],
          date,
          time: studyTimes[slot % studyTimes.length],
          duration: durations[slot % durations.length],
          completed: false,
        });
      }

      // Add spaced review if due
      const dueReviews = reviewItems.filter(r => {
        const next = new Date(r.nextReview);
        const d = new Date(date);
        return next <= d;
      });

      if (dueReviews.length > 0) {
        blocks.push({
          id: `${date}-review`,
          subject: dueReviews[0].subject,
          type: "review",
          date,
          time: "20:00",
          duration: 20,
          completed: false,
          srLevel: dueReviews[0].srLevel,
        });
      }
    }

    savePlan(blocks);
    autoPopulateCalendar(blocks);
    setGenerating(false);
    toast.success("✨ Plano semanal gerado com sucesso!");
  };

  const autoPopulateCalendar = async (blocks: StudyBlock[]) => {
    if (!user) return;
    // Insert blocks as study_events in the calendar
    const events = blocks.map(b => ({
      user_id: user.id,
      title: `${getTypeEmoji(b.type)} ${b.subject} - ${getTypeLabel(b.type)}`,
      description: `Sessão de ${b.duration}min de ${b.subject}`,
      event_date: b.date,
      event_time: b.time,
      subject: b.subject,
      color: SUBJECT_COLORS[b.subject] || "#6366f1",
      is_completed: false,
    }));

    // Remove old auto-generated events for this week
    const dates = [...new Set(blocks.map(b => b.date))];
    if (dates.length > 0) {
      await supabase.from("study_events").delete()
        .eq("user_id", user.id)
        .gte("event_date", dates[0])
        .lte("event_date", dates[dates.length - 1])
        .like("title", "%📖%");
    }

    await supabase.from("study_events").insert(events);
  };

  const completeBlock = (blockId: string) => {
    const updated = studyBlocks.map(b =>
      b.id === blockId ? { ...b, completed: true } : b
    );
    savePlan(updated);

    const block = studyBlocks.find(b => b.id === blockId);
    if (block?.type === "review") {
      // Advance spaced repetition level
      const updatedReviews = reviewItems.map(r => {
        if (r.subject === block.subject) {
          const newLevel = Math.min(r.srLevel + 1, SR_INTERVALS.length - 1);
          return { ...r, srLevel: newLevel, nextReview: addDays(new Date(), SR_INTERVALS[newLevel]).toISOString() };
        }
        return r;
      });
      saveReviews(updatedReviews);
    }
    toast.success("✅ Bloco concluído! +20 XP");
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "study": return "📖";
      case "review": return "🔄";
      case "practice": return "✍️";
      default: return "📚";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "study": return "Estudo";
      case "review": return "Revisão";
      case "practice": return "Prática";
      default: return "Estudo";
    }
  };

  const todayBlocks = studyBlocks.filter(b => isToday(new Date(b.date + "T00:00:00")));
  const upcomingBlocks = studyBlocks.filter(b => !isBefore(new Date(b.date + "T00:00:00"), new Date()) && !isToday(new Date(b.date + "T00:00:00")));
  const completedCount = studyBlocks.filter(b => b.completed).length;
  const totalProgress = studyBlocks.length > 0 ? (completedCount / studyBlocks.length) * 100 : 0;

  const dueReviews = reviewItems.filter(r => new Date(r.nextReview) <= new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">📋 Plano de Estudos Inteligente</h1>
            <p className="text-muted-foreground">Plano automático + Revisão espaçada + Calendário inteligente</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
              {notificationsEnabled ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
              <span className="text-sm">{reminderMinutes}min antes</span>
              <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
            </div>
            <Button onClick={generateWeeklyPlan} disabled={generating} className="bg-gradient-to-r from-primary to-accent text-white">
              <RefreshCw size={18} className={generating ? "animate-spin mr-2" : "mr-2"} />
              {studyBlocks.length > 0 ? "Regenerar Plano" : "Gerar Plano Semanal"}
            </Button>
          </div>
        </motion.div>

        {/* Progress Overview */}
        {studyBlocks.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                <span className="font-bold">Progresso Semanal</span>
              </div>
              <Badge variant="outline">{completedCount}/{studyBlocks.length} blocos</Badge>
            </div>
            <Progress value={totalProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{todayBlocks.length}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{dueReviews.length}</p>
                <p className="text-xs text-muted-foreground">Revisões Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{Math.round(totalProgress)}%</p>
                <p className="text-xs text-muted-foreground">Concluído</p>
              </div>
            </div>
          </motion.div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan" className="flex items-center gap-1"><BookOpen size={16} /> Plano</TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-1"><Brain size={16} /> Revisão</TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1"><Calendar size={16} /> Calendário</TabsTrigger>
          </TabsList>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-4 mt-4">
            {studyBlocks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-card rounded-xl border border-border">
                <Sparkles size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Gere seu Plano de Estudos</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Com base nas suas matérias ({subjects.join(", ") || "nenhuma configurada"}), vamos criar um plano semanal personalizado com revisão espaçada!
                </p>
                <Button onClick={generateWeeklyPlan} className="bg-gradient-to-r from-primary to-accent text-white">
                  <Zap size={18} className="mr-2" /> Gerar Plano Agora
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Today's Blocks */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Target size={18} className="text-primary" /> Hoje
                  </h3>
                  {todayBlocks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum bloco para hoje 🎉</p>
                  ) : (
                    <div className="space-y-2">
                      {todayBlocks.map((block, i) => (
                        <StudyBlockCard key={block.id} block={block} onComplete={completeBlock} index={i} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <ChevronRight size={18} className="text-muted-foreground" /> Próximos Dias
                  </h3>
                  <div className="space-y-2">
                    {upcomingBlocks.slice(0, 10).map((block, i) => (
                      <StudyBlockCard key={block.id} block={block} onComplete={completeBlock} index={i} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Brain size={20} className="text-yellow-500" /> Revisão Espaçada (Leitner)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conteúdos que você errou são automaticamente agendados para revisão em intervalos crescentes: 1, 3, 7, 14, 30, 60 dias.
              </p>
              <div className="flex gap-2 flex-wrap">
                {SR_INTERVALS.map((interval, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    Nível {i + 1}: {interval} dias
                  </Badge>
                ))}
              </div>
            </div>

            {dueReviews.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-bold text-red-500 flex items-center gap-2">
                  <Clock size={16} /> {dueReviews.length} revisões pendentes
                </h4>
                {dueReviews.map((review, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-3 h-3 rounded-full" style={{ background: SUBJECT_COLORS[review.subject] || "#6366f1" }} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{review.activityTitle}</p>
                      <p className="text-xs text-muted-foreground">{review.subject} · Nível {review.srLevel + 1}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Revisar</Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Check size={48} className="text-green-500 mx-auto mb-3" />
                <h4 className="font-bold">Tudo em dia!</h4>
                <p className="text-sm text-muted-foreground">Nenhuma revisão pendente no momento.</p>
              </div>
            )}

            {reviewItems.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Todos os itens de revisão ({reviewItems.length})</h4>
                <div className="space-y-1">
                  {reviewItems.slice(0, 15).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/20">
                      <div className="w-2 h-2 rounded-full" style={{ background: SUBJECT_COLORS[r.subject] || "#6366f1" }} />
                      <span className="flex-1 truncate">{r.activityTitle}</span>
                      <span className="text-xs text-muted-foreground">Nv.{r.srLevel + 1}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(r.nextReview), "dd/MM")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Visão Semanal
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
                ))}
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                  const day = addDays(weekStart, dayIdx);
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayBlocks = studyBlocks.filter(b => b.date === dayStr);
                  const isTodays = isToday(day);

                  return (
                    <div key={dayIdx} className={`min-h-[120px] rounded-lg border p-2 ${isTodays ? "border-primary bg-primary/5" : "border-border"}`}>
                      <p className={`text-sm font-bold mb-1 ${isTodays ? "text-primary" : ""}`}>
                        {format(day, "dd")}
                      </p>
                      <div className="space-y-1">
                        {dayBlocks.map(b => (
                          <div key={b.id} className={`text-[10px] p-1 rounded ${b.completed ? "bg-green-500/20 line-through" : "bg-muted/40"}`} style={{ borderLeft: `3px solid ${SUBJECT_COLORS[b.subject] || "#6366f1"}` }}>
                            {getTypeEmoji(b.type)} {b.subject}
                            <br />{b.time} · {b.duration}m
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-3">📊 Distribuição Semanal</h3>
              <div className="space-y-2">
                {subjects.map(subject => {
                  const count = studyBlocks.filter(b => b.subject === subject).length;
                  const total = studyBlocks.length || 1;
                  return (
                    <div key={subject} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: SUBJECT_COLORS[subject] || "#6366f1" }} />
                      <span className="text-sm flex-1">{subject}</span>
                      <span className="text-xs text-muted-foreground">{count} blocos</span>
                      <div className="w-24">
                        <Progress value={(count / total) * 100} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const StudyBlockCard = ({ block, onComplete, index }: { block: StudyBlock; onComplete: (id: string) => void; index: number }) => {
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "study": return "📖";
      case "review": return "🔄";
      case "practice": return "✍️";
      default: return "📚";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "study": return "Estudo";
      case "review": return "Revisão";
      case "practice": return "Prática";
      default: return "Estudo";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl border ${block.completed ? "bg-green-500/5 border-green-500/20 opacity-70" : "bg-card border-border"}`}
    >
      <div className="w-4 h-4 rounded-full shrink-0" style={{ background: SUBJECT_COLORS[block.subject] || "#6366f1" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeEmoji(block.type)}</span>
          <span className={`font-medium ${block.completed ? "line-through" : ""}`}>{block.subject}</span>
          <Badge variant="outline" className="text-xs">{getTypeLabel(block.type)}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><Clock size={12} /> {block.time}</span>
          <span>{block.duration}min</span>
          <span>{format(new Date(block.date + "T00:00:00"), "dd/MM", { locale: ptBR })}</span>
        </div>
      </div>
      {!block.completed && (
        <Button size="sm" variant="outline" onClick={() => onComplete(block.id)} className="shrink-0">
          <Check size={16} className="mr-1" /> Feito
        </Button>
      )}
      {block.completed && <Check size={20} className="text-green-500 shrink-0" />}
    </motion.div>
  );
};

export default StudyPlan;
