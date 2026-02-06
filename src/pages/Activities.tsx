import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  Gamepad2,
  Target,
  Wand2,
  Settings,
  Rocket,
  Zap,
  Youtube,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import DailyMissions from "@/components/DailyMissions";
import CustomActivityCreator from "@/components/CustomActivityCreator";
import QuickQuiz from "@/components/QuickQuiz";
import YouTubeSearch from "@/components/YouTubeSearch";
import StudyMaterialGenerator from "@/components/StudyMaterialGenerator";
import { ActivityIllustration, SamukSpeechBubble, ActivityDecorations } from "@/components/ActivityIllustrations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getSubjectLabel, getSubjectIcon } from "@/lib/subjects";
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
      const transformedData = (data || []).map((activity) => ({
        ...activity,
        options: activity.options ? (activity.options as string[]) : null,
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

    const randomSubject =
      profile.subjects[Math.floor(Math.random() * profile.subjects.length)];
    const difficulties = ["easy", "normal", "hard"];
    const randomDifficulty =
      difficulties[Math.floor(Math.random() * difficulties.length)];

    try {
      const response = await supabase.functions.invoke("generate-activity", {
        body: {
          subject: getSubjectLabel(randomSubject),
          difficulty: randomDifficulty,
          schoolYear: profile.school_year,
          questionType: Math.random() > 0.7 ? "essay" : "multiple_choice",
        },
      });

      if (response.error) throw new Error(response.error.message);

      const activity = response.data.activity;

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
          xp_reward:
            randomDifficulty === "hard"
              ? 50
              : randomDifficulty === "normal"
              ? 30
              : 20,
          coin_reward:
            randomDifficulty === "hard"
              ? 30
              : randomDifficulty === "normal"
              ? 20
              : 10,
        })
        .select()
        .single();

      if (error) throw error;

      const newActivity = {
        ...data,
        options: data.options ? (data.options as string[]) : null,
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

    const answer =
      selectedActivity.question_type === "essay" ? essayAnswer : selectedAnswer;
    if (!answer) {
      toast.error("Selecione ou escreva uma resposta!");
      return;
    }

    setSubmitting(true);

    let isCorrect = false;
    if (selectedActivity.question_type === "multiple_choice") {
      isCorrect =
        answer.charAt(0).toUpperCase() ===
        selectedActivity.correct_answer.charAt(0).toUpperCase();
    } else {
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

    if (isCorrect) {
      await addXP(selectedActivity.xp_reward);
      await addCoins(selectedActivity.coin_reward);
      toast.success(
        `Correto! +${selectedActivity.xp_reward} XP e +${selectedActivity.coin_reward} moedas! 🎉`
      );
    } else {
      await addXP(Math.floor(selectedActivity.xp_reward / 3));
      toast.info(
        `Resposta incorreta. +${Math.floor(
          selectedActivity.xp_reward / 3
        )} XP pelo esforço!`
      );
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

    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("last_activity_date, current_streak, longest_streak")
      .eq("user_id", user.id)
      .single();

    if (streakData?.last_activity_date === today) {
      toast.info("Você já marcou sua ofensiva hoje!");
      return;
    }

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
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

  // Activity Detail Modal
  if (selectedActivity) {
    return (
      <DashboardLayout profile={profile}>
        <FloatingElements />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={closeActivity}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={difficultyColors[selectedActivity.difficulty]}>
                {difficultyLabels[selectedActivity.difficulty]}
              </Badge>
              <Badge variant="outline">
                {getSubjectIcon(selectedActivity.subject)}{" "}
                {getSubjectLabel(selectedActivity.subject)}
              </Badge>
            </div>
          </div>

          {/* Content Card with Illustration */}
          <Card className="mb-6 overflow-hidden relative">
            <ActivityDecorations difficulty={selectedActivity.difficulty} />
            <CardHeader>
              <div className="flex items-start gap-4">
                <ActivityIllustration subject={selectedActivity.subject} size="md" />
                <div className="flex-1">
                  <CardTitle className="text-xl">{selectedActivity.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {getSubjectIcon(selectedActivity.subject)}{" "}
                      {getSubjectLabel(selectedActivity.subject)}
                    </Badge>
                    <Badge className={difficultyColors[selectedActivity.difficulty]}>
                      {difficultyLabels[selectedActivity.difficulty]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-xl border border-border/30">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedActivity.content_text}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Samuk Hint */}
          {!showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <SamukSpeechBubble 
                message={
                  selectedActivity.difficulty === "hard" 
                    ? "Essa é difícil! Leia o texto com atenção e pense bem antes de responder. Você consegue! 💪" 
                    : selectedActivity.difficulty === "easy"
                    ? "Essa é fácil! Confie no seu conhecimento e manda ver! 🚀"
                    : "Analise bem as opções antes de escolher. Boa sorte! 🍀"
                }
                type="hint"
              />
            </motion.div>
          )}

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="text-primary" size={20} />
                Questão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium text-foreground">
                {selectedActivity.question}
              </p>

              {/* Answer Options */}
              {!showResult && selectedActivity.question_type === "multiple_choice" && (
                <div className="space-y-2">
                  {selectedActivity.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswer === option
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Essay Answer */}
              {!showResult && selectedActivity.question_type === "essay" && (
                <Textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="min-h-[150px]"
                />
              )}

              {/* Submit Button */}
              {!showResult && (
                <Button
                  onClick={submitAnswer}
                  disabled={
                    submitting ||
                    (selectedActivity.question_type === "multiple_choice"
                      ? !selectedAnswer
                      : !essayAnswer.trim())
                  }
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ChevronRight className="mr-2" size={18} />
                  )}
                  Enviar Resposta
                </Button>
              )}

              {/* Result */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={`p-4 rounded-xl ${
                      selectedActivity.is_correct
                        ? "bg-success/10 border border-success/30"
                        : "bg-destructive/10 border border-destructive/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedActivity.is_correct ? (
                        <>
                          <CheckCircle2 className="text-success" size={24} />
                          <span className="font-semibold text-success">
                            Resposta Correta! 🎉
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-destructive" size={24} />
                          <span className="font-semibold text-destructive">
                            Resposta Incorreta
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Resposta correta: {selectedActivity.correct_answer}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="text-primary" size={20} />
                      <span className="font-semibold text-foreground">
                        Explicação
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedActivity.explanation}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <Sparkles className="text-primary" size={18} />
                      <span className="font-medium">
                        +
                        {selectedActivity.is_correct
                          ? selectedActivity.xp_reward
                          : Math.floor(selectedActivity.xp_reward / 3)}{" "}
                        XP
                      </span>
                    </div>
                    {selectedActivity.is_correct && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-rank-gold/10 rounded-full">
                        <Coins className="text-rank-gold" size={18} />
                        <span className="font-medium">
                          +{selectedActivity.coin_reward}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button onClick={closeActivity} className="w-full" variant="outline">
                    Continuar Estudando
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
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
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <Gamepad2 className="text-primary" />
              Modo Jogo
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete atividades, ganhe XP e suba de nível!
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
            Gerar Atividade
          </Button>
        </div>

        {/* Daily Missions */}
        <DailyMissions />

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
                  {completedCount} de 5 atividades para ofensiva
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
                {canClaimStreak
                  ? "Marcar Ofensiva!"
                  : `${5 - completedCount} restantes`}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`${
                  completedCount >= num ? "text-primary font-semibold" : ""
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tabs for different study modes */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="activities" className="flex items-center gap-1 text-xs sm:text-sm py-2">
              <Gamepad2 size={14} />
              <span className="hidden sm:inline">Atividades</span>
              <span className="sm:hidden">Ativ.</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-1 text-xs sm:text-sm py-2">
              <Zap size={14} />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-1 text-xs sm:text-sm py-2">
              <Youtube size={14} />
              <span className="hidden sm:inline">Vídeos</span>
              <span className="sm:hidden">Vídeo</span>
            </TabsTrigger>
            <TabsTrigger value="material" className="flex items-center gap-1 text-xs sm:text-sm py-2">
              <FileText size={14} />
              <span className="hidden sm:inline">Material</span>
              <span className="sm:hidden">Texto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-4 space-y-4">
            {/* Custom Activity Creator */}
            <CustomActivityCreator onActivityCreated={fetchTodayActivities} />

            {/* No subjects warning */}
            {(!profile?.subjects || profile.subjects.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-warning/10 border border-warning/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-warning/20">
                    <GraduationCap className="text-warning" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Configure seu perfil primeiro! 🎓
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione seu ano escolar e matérias para receber atividades
                      personalizadas pela IA.
                    </p>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" size="sm">
                      <Settings size={16} className="mr-2" />
                      Configurar
                    </Button>
                  </Link>
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
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4"
            >
              <Rocket className="text-white" size={32} />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Pronto para começar! 🎮
            </h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Gerar Atividade" e deixe a IA criar um desafio personalizado para você!
            </p>
            <SamukSpeechBubble 
              message="E aí, bora estudar? Gera uma atividade e vamos jogar juntos! 💪"
              type="celebrate"
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 relative overflow-hidden ${
                    activity.is_completed ? "opacity-80" : ""
                  }`}
                  onClick={() =>
                    !selectedActivity && setSelectedActivity(activity)
                  }
                >
                  <ActivityDecorations difficulty={activity.difficulty} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <ActivityIllustration subject={activity.subject} size="sm" animate={!activity.is_completed} />
                        <Badge variant="outline" className="text-xs">
                          {getSubjectLabel(activity.subject)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={difficultyColors[activity.difficulty]}>
                          {difficultyLabels[activity.difficulty]}
                        </Badge>
                        {activity.is_completed &&
                          (activity.is_correct ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                            >
                              <CheckCircle2 className="text-success" size={20} />
                            </motion.div>
                          ) : (
                            <XCircle className="text-destructive" size={20} />
                          ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {activity.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {activity.content_text.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles size={14} />
                          {activity.xp_reward} XP
                        </span>
                        <span className="flex items-center gap-1 text-rank-gold">
                          <Coins size={14} />
                          {activity.coin_reward}
                        </span>
                      </div>
                      {!activity.is_completed && (
                        <Button size="sm" variant="ghost" className="text-primary">
                          <Gamepad2 size={16} className="mr-1" />
                          Jogar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <QuickQuiz />
          </TabsContent>

          <TabsContent value="youtube" className="mt-4">
            <YouTubeSearch />
          </TabsContent>

          <TabsContent value="material" className="mt-4">
            <StudyMaterialGenerator />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Activities;
