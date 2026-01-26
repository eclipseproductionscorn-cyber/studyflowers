import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Sparkles,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  GraduationCap,
  Coins,
  Flame,
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIActivity {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  content_text: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  xp_reward: number;
  coin_reward: number;
  is_completed: boolean | null;
  is_correct: boolean | null;
  user_answer: string | null;
  day_of_week: number;
  week_number: number;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-success/10 text-success border-success/30",
  normal: "bg-warning/10 text-warning border-warning/30",
  hard: "bg-destructive/10 text-destructive border-destructive/30",
};

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  normal: "Normal",
  hard: "Difícil",
};

const subjectIcons: Record<string, React.ElementType> = {
  "Matemática": Brain,
  "Português": BookOpen,
  "História": GraduationCap,
  "Geografia": GraduationCap,
  "Ciências": Lightbulb,
  "Física": Brain,
  "Química": Lightbulb,
  "Biologia": Lightbulb,
  "Inglês": BookOpen,
  "Filosofia": GraduationCap,
  "Sociologia": GraduationCap,
};

const Activities = () => {
  const { profile, user, addCoins, addXP, refetchStreak } = useAuth();
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AIActivity | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [essayAnswer, setEssayAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekNumber = getWeekNumber(today);

  function getWeekNumber(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  useEffect(() => {
    if (user && profile) {
      fetchTodayActivities();
    }
  }, [user, profile]);

  const fetchTodayActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("ai_activities")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .eq("week_number", weekNumber)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching activities:", error);
      toast.error("Erro ao carregar atividades");
    } else {
      // Transform options from Json to string array
      const transformedData = (data || []).map(activity => ({
        ...activity,
        options: activity.options ? (activity.options as string[]) : null
      }));
      setActivities(transformedData);
    }
    setLoading(false);
  };

  const generateNewActivity = async () => {
    if (!profile?.subjects || profile.subjects.length === 0) {
      toast.error("Configure suas matérias no perfil primeiro!");
      return;
    }

    setGenerating(true);

    // Pick a random subject from user's subjects
    const randomSubject = profile.subjects[Math.floor(Math.random() * profile.subjects.length)];
    const difficulties = ["easy", "normal", "hard"];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    try {
      const response = await supabase.functions.invoke("generate-activity", {
        body: {
          subject: randomSubject,
          difficulty: randomDifficulty,
          schoolYear: profile.school_year,
          questionType: Math.random() > 0.7 ? "essay" : "multiple_choice",
        },
      });

      if (response.error) throw new Error(response.error.message);

      const activity = response.data.activity;

      // Save to database
      const { data, error } = await supabase
        .from("ai_activities")
        .insert({
          user_id: user!.id,
          title: activity.title,
          subject: randomSubject,
          difficulty: randomDifficulty,
          content_text: activity.content_text,
          question: activity.question,
          question_type: activity.question_type || "multiple_choice",
          options: activity.options,
          correct_answer: activity.correct_answer,
          explanation: activity.explanation,
          day_of_week: dayOfWeek,
          week_number: weekNumber,
          xp_reward: randomDifficulty === "hard" ? 50 : randomDifficulty === "normal" ? 30 : 20,
          coin_reward: randomDifficulty === "hard" ? 30 : randomDifficulty === "normal" ? 20 : 10,
        })
        .select()
        .single();

      if (error) throw error;

      const newActivity = {
        ...data,
        options: data.options ? (data.options as string[]) : null
      };
      setActivities((prev) => [...prev, newActivity]);
      toast.success("Nova atividade gerada! 🎉");
    } catch (error) {
      console.error("Error generating activity:", error);
      toast.error("Erro ao gerar atividade. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedActivity || submitting) return;

    const answer = selectedActivity.question_type === "essay" ? essayAnswer : selectedAnswer;
    if (!answer) {
      toast.error("Selecione ou escreva uma resposta!");
      return;
    }

    setSubmitting(true);

    let isCorrect = false;
    if (selectedActivity.question_type === "multiple_choice") {
      isCorrect = answer.charAt(0).toUpperCase() === selectedActivity.correct_answer.charAt(0).toUpperCase();
    } else {
      // For essay, always mark as correct (teacher would review)
      isCorrect = true;
    }

    const { error } = await supabase
      .from("ai_activities")
      .update({
        is_completed: true,
        is_correct: isCorrect,
        user_answer: answer,
        completed_at: new Date().toISOString(),
      })
      .eq("id", selectedActivity.id);

    if (error) {
      console.error("Error submitting answer:", error);
      toast.error("Erro ao enviar resposta");
      setSubmitting(false);
      return;
    }

    // Award XP and coins
    if (isCorrect) {
      await addXP(selectedActivity.xp_reward);
      await addCoins(selectedActivity.coin_reward);
      toast.success(`Correto! +${selectedActivity.xp_reward} XP e +${selectedActivity.coin_reward} moedas! 🎉`);
    } else {
      await addXP(Math.floor(selectedActivity.xp_reward / 3));
      toast.info(`Resposta incorreta. +${Math.floor(selectedActivity.xp_reward / 3)} XP pelo esforço!`);
    }

    setActivities((prev) =>
      prev.map((a) =>
        a.id === selectedActivity.id
          ? { ...a, is_completed: true, is_correct: isCorrect, user_answer: answer }
          : a
      )
    );

    setSelectedActivity({
      ...selectedActivity,
      is_completed: true,
      is_correct: isCorrect,
      user_answer: answer,
    });

    setShowResult(true);
    setSubmitting(false);
  };

  const closeActivity = () => {
    setSelectedActivity(null);
    setSelectedAnswer("");
    setEssayAnswer("");
    setShowResult(false);
  };

  const completedCount = activities.filter((a) => a.is_completed).length;
  const canClaimStreak = completedCount >= 5;
  const progress = Math.min((completedCount / 5) * 100, 100);

  const claimStreak = async () => {
    if (!canClaimStreak || !user) return;

    const today = new Date().toISOString().split("T")[0];
    
    // Check if already claimed today
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("last_activity_date, current_streak, longest_streak")
      .eq("user_id", user.id)
      .single();

    if (streakData?.last_activity_date === today) {
      toast.info("Você já marcou sua ofensiva hoje!");
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = 1;
    
    if (streakData?.last_activity_date === yesterday) {
      newStreak = (streakData.current_streak || 0) + 1;
    }

    const longestStreak = Math.max(newStreak, streakData?.longest_streak || 0);

    await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq("user_id", user.id);

    await supabase
      .from("profiles")
      .update({ streak_days: newStreak })
      .eq("user_id", user.id);

    await addCoins(20);
    refetchStreak();
    
    toast.success(`🔥 Ofensiva de ${newStreak} dias! +20 moedas bônus!`);
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Atividades do Dia
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete 5 atividades para registrar sua ofensiva diária
            </p>
          </div>
          <Button
            onClick={generateNewActivity}
            disabled={generating}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Gerar Nova Atividade
          </Button>
        </div>

        {/* Progress & Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 via-accent/5 to-warning/10 border border-border/50 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Progresso Diário</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} de 5 atividades completas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={claimStreak}
                disabled={!canClaimStreak}
                className={`${
                  canClaimStreak
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Flame className="mr-2 h-4 w-4" />
                {canClaimStreak ? "Marcar Ofensiva!" : `${5 - completedCount} restantes`}
              </Button>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`${completedCount >= num ? "text-primary font-semibold" : ""}`}
              >
                {num}
              </span>
            ))}
          </div>
        </motion.div>

        {/* No subjects warning */}
        {(!profile?.subjects || profile.subjects.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="text-warning" size={24} />
              <div>
                <h3 className="font-semibold text-foreground">Configure seu perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione seu ano escolar e matérias para receber atividades personalizadas.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma atividade ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Gerar Nova Atividade" para começar a estudar!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => {
              const Icon = subjectIcons[activity.subject] || BookOpen;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
                      activity.is_completed ? "opacity-80" : ""
                    }`}
                    onClick={() => !selectedActivity && setSelectedActivity(activity)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="text-primary" size={18} />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.subject}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={difficultyColors[activity.difficulty]}>
                            {difficultyLabels[activity.difficulty]}
                          </Badge>
                          {activity.is_completed && (
                            activity.is_correct ? (
                              <CheckCircle2 className="text-success" size={20} />
                            ) : (
                              <XCircle className="text-destructive" size={20} />
                            )
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {activity.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {activity.content_text.substring(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-primary">
                            <Sparkles size={14} />
                            +{activity.xp_reward} XP
                          </span>
                          <span className="flex items-center gap-1 text-rank-gold">
                            <Coins size={14} />
                            +{activity.coin_reward}
                          </span>
                        </div>
                        <ChevronRight className="text-muted-foreground" size={18} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Activity Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeActivity}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{selectedActivity.subject}</Badge>
                    <Badge className={difficultyColors[selectedActivity.difficulty]}>
                      {difficultyLabels[selectedActivity.difficulty]}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedActivity.title}
                  </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={closeActivity}>
                  <XCircle size={20} />
                </Button>
              </div>

              {/* Content Text */}
              <div className="bg-muted/30 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  Texto Base
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedActivity.content_text}
                </p>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Brain size={18} className="text-accent" />
                  Questão
                </h3>
                <p className="text-foreground mb-4">{selectedActivity.question}</p>

                {!showResult ? (
                  <>
                    {selectedActivity.question_type === "multiple_choice" && selectedActivity.options ? (
                      <div className="space-y-2">
                        {selectedActivity.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswer(option)}
                            disabled={selectedActivity.is_completed}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedAnswer === option
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            } ${selectedActivity.is_completed ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="text-sm">{option}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={essayAnswer}
                        onChange={(e) => setEssayAnswer(e.target.value)}
                        placeholder="Escreva sua resposta aqui..."
                        className="min-h-32"
                        disabled={selectedActivity.is_completed}
                      />
                    )}

                    {!selectedActivity.is_completed && (
                      <Button
                        onClick={submitAnswer}
                        disabled={submitting || (!selectedAnswer && !essayAnswer)}
                        className="w-full mt-4 bg-gradient-to-r from-primary to-accent"
                      >
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Enviar Resposta
                      </Button>
                    )}
                  </>
                ) : (
                  /* Result */
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${
                        selectedActivity.is_correct
                          ? "bg-success/10 border border-success/30"
                          : "bg-destructive/10 border border-destructive/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {selectedActivity.is_correct ? (
                          <CheckCircle2 className="text-success" size={24} />
                        ) : (
                          <XCircle className="text-destructive" size={24} />
                        )}
                        <span className="font-semibold text-foreground">
                          {selectedActivity.is_correct ? "Correto!" : "Resposta Incorreta"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sua resposta: {selectedActivity.user_answer}
                      </p>
                      {!selectedActivity.is_correct && (
                        <p className="text-sm text-foreground mt-1">
                          Resposta correta: {selectedActivity.correct_answer}
                        </p>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="text-primary" size={18} />
                        Explicação
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedActivity.explanation}
                      </p>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center justify-center gap-4 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles size={20} />
                        <span className="font-semibold">
                          +{selectedActivity.is_correct ? selectedActivity.xp_reward : Math.floor(selectedActivity.xp_reward / 3)} XP
                        </span>
                      </div>
                      {selectedActivity.is_correct && (
                        <div className="flex items-center gap-2 text-rank-gold">
                          <Coins size={20} />
                          <span className="font-semibold">+{selectedActivity.coin_reward}</span>
                        </div>
                      )}
                    </div>

                    <Button onClick={closeActivity} variant="outline" className="w-full">
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Activities;
