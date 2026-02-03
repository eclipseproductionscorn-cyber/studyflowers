import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, CheckCircle2, XCircle, ArrowRight, Loader2, Trophy, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingElements } from "@/components/FloatingElements";
import { allSubjects } from "@/lib/subjects";

interface Question {
  id: number;
  difficulty: "easy" | "normal" | "hard";
  type: "multiple_choice" | "true_false";
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizResult {
  easy: { correct: number; total: number };
  normal: { correct: number; total: number };
  hard: { correct: number; total: number };
}

const LevelingQuiz = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentSubject = profile?.subjects?.[0] || "matematica";
  const subjectInfo = allSubjects.find(s => s.id === currentSubject);

  useEffect(() => {
    generateQuiz();
  }, [profile?.school_year, currentSubject]);

  const generateQuiz = async () => {
    if (!profile?.school_year) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("generate-quiz", {
        body: {
          subject: subjectInfo?.label || currentSubject,
          schoolYear: profile.school_year,
          questionsPerLevel: 5,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.questions) {
        setQuestions(response.data.questions);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Erro ao gerar quiz. Usando perguntas padrão.");
      
      // Fallback questions
      setQuestions([
        {
          id: 1,
          difficulty: "easy",
          type: "multiple_choice",
          question: "Quanto é 2 + 2?",
          options: ["A) 3", "B) 4", "C) 5", "D) 6"],
          correct_answer: "B",
          explanation: "2 + 2 = 4 é uma soma básica.",
        },
        {
          id: 2,
          difficulty: "easy",
          type: "true_false",
          question: "O Brasil é o maior país da América do Sul.",
          options: ["Verdadeiro", "Falso"],
          correct_answer: "Verdadeiro",
          explanation: "O Brasil é o maior país da América do Sul em área territorial.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    const results: QuizResult = {
      easy: { correct: 0, total: 0 },
      normal: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correct_answer || 
                        (q.type === "multiple_choice" && userAnswer?.charAt(0) === q.correct_answer);
      
      results[q.difficulty].total++;
      if (isCorrect) {
        results[q.difficulty].correct++;
      }
    });

    setResult(results);
    setQuizComplete(true);

    // Save quiz level to profile (you might want to add a column for this)
    const easyScore = results.easy.total > 0 ? results.easy.correct / results.easy.total : 0;
    const normalScore = results.normal.total > 0 ? results.normal.correct / results.normal.total : 0;
    const hardScore = results.hard.total > 0 ? results.hard.correct / results.hard.total : 0;

    let determinedLevel: "easy" | "normal" | "hard" = "normal";
    if (hardScore >= 0.6) {
      determinedLevel = "hard";
    } else if (normalScore >= 0.6) {
      determinedLevel = "normal";
    } else {
      determinedLevel = "easy";
    }

    // Award XP based on performance
    const totalCorrect = results.easy.correct + results.normal.correct * 2 + results.hard.correct * 3;
    const xpGained = totalCorrect * 10;

    await updateProfile({
      xp: (profile?.xp || 0) + xpGained,
      coins: (profile?.coins || 0) + Math.floor(xpGained / 2),
    } as any);

    toast.success(`+${xpGained} XP pelo quiz de nivelamento!`);
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy": return "Fácil";
      case "normal": return "Normal";
      case "hard": return "Difícil";
      default: return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "normal": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "hard": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingElements count={15} />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full mb-4"
          />
          <p className="text-muted-foreground">Gerando quiz personalizado...</p>
          <p className="text-sm text-muted-foreground mt-2">
            🧠 Teacher Samuk está preparando perguntas para você!
          </p>
        </div>
      </div>
    );
  }

  if (quizComplete && result) {
    const totalQuestions = result.easy.total + result.normal.total + result.hard.total;
    const totalCorrect = result.easy.correct + result.normal.correct + result.hard.correct;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingElements count={20} />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-full max-w-lg bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl p-8 shadow-xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6"
            >
              <Trophy className="text-white" size={40} />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Quiz Concluído! 🎉
            </h1>
            <p className="text-muted-foreground mb-6">
              O StudyFlow agora entende seu nível!
            </p>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 mb-6">
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                {totalCorrect} de {totalQuestions} corretas
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-2xl font-bold text-green-500">
                  {result.easy.correct}/{result.easy.total}
                </p>
                <p className="text-xs text-muted-foreground">Fácil</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-500">
                  {result.normal.correct}/{result.normal.total}
                </p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-500">
                  {result.hard.correct}/{result.hard.total}
                </p>
                <p className="text-xs text-muted-foreground">Difícil</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <p className="text-sm text-emerald-500 font-medium flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Agora o Teacher Samuk vai criar atividades no seu nível!
              </p>
            </div>

            <Button
              onClick={goToDashboard}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Começar a Estudar
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements count={15} />
      
      <div className="relative z-10 min-h-screen flex flex-col p-4">
        {/* Header */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="text-primary" size={24} />
              <span className="font-semibold text-foreground">Quiz de Nivelamento</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} de {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-2xl bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl p-8 shadow-xl"
            >
              {/* Difficulty Badge */}
              <div className="flex justify-between items-center mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(currentQuestion?.difficulty)}`}>
                  {getDifficultyLabel(currentQuestion?.difficulty)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {subjectInfo?.icon} {subjectInfo?.label}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {currentQuestion?.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = answers[currentIndex] === option;
                  const isCorrect = showExplanation && (
                    option === currentQuestion.correct_answer ||
                    option.charAt(0) === currentQuestion.correct_answer
                  );
                  const isWrong = showExplanation && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showExplanation ? { scale: 1.01 } : {}}
                      whileTap={!showExplanation ? { scale: 0.99 } : {}}
                      onClick={() => !showExplanation && handleAnswer(option)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isWrong
                          ? "border-red-500 bg-red-500/10"
                          : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-background/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          isCorrect ? "text-green-500" : 
                          isWrong ? "text-red-500" : 
                          isSelected ? "text-primary" : "text-foreground"
                        }`}>
                          {option}
                        </span>
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="text-green-500" size={20} />
                        )}
                        {isWrong && (
                          <XCircle className="text-red-500" size={20} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-500 font-medium mb-1">💡 Explicação:</p>
                      <p className="text-sm text-foreground">{currentQuestion?.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Próxima
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    ) : (
                      <>
                        Ver Resultado
                        <Trophy size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LevelingQuiz;
