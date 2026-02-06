import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, Sparkles, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  id: number;
  difficulty: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
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

const QuickQuiz = () => {
  const { profile, addXP, addCoins } = useAuth();
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error("Digite o tema do quiz!");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setQuizDone(false);
    setAnswers([]);

    try {
      const response = await supabase.functions.invoke("generate-quiz", {
        body: {
          subject: topic,
          schoolYear: profile?.school_year || "ensino médio",
          questionsPerLevel: 3,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const quizData = response.data;
      if (quizData.questions && quizData.questions.length > 0) {
        setQuestions(quizData.questions);
        toast.success(`Quiz com ${quizData.questions.length} perguntas gerado! 🎯`);
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error("Erro ao gerar quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const current = questions[currentIndex];
    const isCorrect =
      current.type === "true_false"
        ? selectedAnswer === current.correct_answer
        : selectedAnswer.charAt(0).toUpperCase() === current.correct_answer.charAt(0).toUpperCase();

    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers((prev) => [...prev, isCorrect]);
    setShowResult(true);
  };

  const nextQuestion = async () => {
    setSelectedAnswer("");
    setShowResult(false);

    if (currentIndex + 1 >= questions.length) {
      setQuizDone(true);
      const xpEarned = score * 15;
      const coinsEarned = score * 5;
      await addXP(xpEarned);
      await addCoins(coinsEarned);
      toast.success(`Quiz finalizado! +${xpEarned} XP +${coinsEarned} moedas 🏆`);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setQuizDone(false);
    setAnswers([]);
    setSelectedAnswer("");
    setShowResult(false);
    setTopic("");
  };

  // Quiz complete screen
  if (quizDone) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto"
        >
          <Trophy className="text-white" size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Quiz Finalizado!</h2>
        <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {percentage}%
        </div>
        <p className="text-muted-foreground">{score} de {questions.length} corretas</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {answers.map((correct, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              correct ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            }`}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full">
            <Sparkles className="text-primary" size={16} />
            <span className="font-medium text-sm">+{score * 15} XP</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-warning/10 rounded-full">
            <Coins className="text-warning" size={16} />
            <span className="font-medium text-sm">+{score * 5}</span>
          </div>
        </div>
        <Button onClick={resetQuiz} className="bg-gradient-to-r from-primary to-accent">
          <RotateCcw size={16} className="mr-2" /> Novo Quiz
        </Button>
      </motion.div>
    );
  }

  // Active question
  if (questions.length > 0) {
    const current = questions[currentIndex];
    const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={difficultyColors[current.difficulty]}>
            {difficultyLabels[current.difficulty] || current.difficulty}
          </Badge>
          <span className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{current.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showResult ? (
              <>
                {current.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all text-sm ${
                      selectedAnswer === option
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
                <Button onClick={submitAnswer} disabled={!selectedAnswer} className="w-full bg-gradient-to-r from-primary to-accent mt-2">
                  <ChevronRight size={18} className="mr-1" /> Confirmar
                </Button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className={`p-3 rounded-xl flex items-center gap-2 ${
                  answers[answers.length - 1] ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
                }`}>
                  {answers[answers.length - 1] ? (
                    <><CheckCircle2 className="text-success" size={20} /><span className="font-medium text-success">Correto! 🎉</span></>
                  ) : (
                    <><XCircle className="text-destructive" size={20} /><span className="font-medium text-destructive">Incorreto</span></>
                  )}
                </div>
                {!answers[answers.length - 1] && (
                  <p className="text-sm text-muted-foreground">Resposta: {current.correct_answer}</p>
                )}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                  {current.explanation}
                </div>
                <Button onClick={nextQuestion} className="w-full">
                  {currentIndex + 1 >= questions.length ? "Ver Resultado" : "Próxima"} <ChevronRight size={16} className="ml-1" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tema do quiz... Ex: Matemática - Frações"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && !loading && generateQuiz()}
        />
        <Button onClick={generateQuiz} disabled={loading} className="bg-gradient-to-r from-primary to-accent">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap size={18} />}
          <span className="ml-2 hidden sm:inline">Gerar Quiz</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Matemática básica", "História do Brasil", "Biologia celular", "Química orgânica"].map((s) => (
          <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setTopic(s)}>
            {s}
          </Badge>
        ))}
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center p-8 rounded-xl bg-primary/5 border border-primary/20">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-3 flex items-center justify-center"
            >
              <Zap className="text-white" size={24} />
            </motion.div>
            <p className="font-medium text-foreground">Gerando quiz...</p>
            <p className="text-sm text-muted-foreground">9 perguntas em 3 níveis</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuickQuiz;
