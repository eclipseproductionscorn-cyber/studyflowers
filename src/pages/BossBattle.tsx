import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Heart, Zap, Trophy, Star, Crown, Flame, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";

const BOSSES = [
  {
    id: "math", subject: "Matemática", name: "Guardião dos Números", emoji: "🧮",
    hp: 100, questions: 10, xpReward: 200, coinReward: 100,
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    description: "Domine operações, funções e geometria para derrotar este guardião ancestral.",
  },
  {
    id: "portuguese", subject: "Português", name: "Mestre da Interpretação", emoji: "📜",
    hp: 100, questions: 10, xpReward: 200, coinReward: 100,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    description: "Decifre textos, domine a gramática e derrote o guardião das palavras.",
  },
  {
    id: "history", subject: "História", name: "Senhor das Revoluções", emoji: "⚔️",
    hp: 100, questions: 10, xpReward: 200, coinReward: 100,
    gradient: "from-red-600 via-orange-600 to-amber-600",
    description: "Viaje pelo tempo e prove que conhece os grandes marcos da humanidade.",
  },
  {
    id: "science", subject: "Ciências", name: "Arquiteto dos Elementos", emoji: "🔬",
    hp: 100, questions: 10, xpReward: 200, coinReward: 100,
    gradient: "from-green-600 via-emerald-600 to-teal-600",
    description: "Enfrente o poder dos elementos e mostre seu domínio sobre a ciência.",
  },
  {
    id: "geography", subject: "Geografia", name: "Titã dos Continentes", emoji: "🌍",
    hp: 100, questions: 10, xpReward: 200, coinReward: 100,
    gradient: "from-cyan-600 via-sky-600 to-blue-700",
    description: "Navegue pelos continentes e prove seu conhecimento geográfico.",
  },
];

interface BattleState {
  bossId: string;
  bossHp: number;
  playerHp: number;
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
  questions: { question: string; options: string[]; correct: number }[];
  score: number;
}

const BossBattle = () => {
  const { profile, user } = useAuth();
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);

  useEffect(() => {
    if (user) fetchDefeated();
  }, [user]);

  const fetchDefeated = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_activities")
      .select("subject")
      .eq("user_id", user.id)
      .eq("question_type", "boss_battle")
      .eq("is_correct", true);
    const subjects = [...new Set((data || []).map((d) => d.subject))];
    setDefeatedBosses(subjects);
  };

  const startBattle = async (boss: typeof BOSSES[0]) => {
    // Generate simple questions locally for the boss battle
    const sampleQuestions = Array.from({ length: boss.questions }, (_, i) => ({
      question: `Pergunta ${i + 1} de ${boss.subject} — Desafio do ${boss.name}`,
      options: ["Opção A", "Opção B", "Opção C", "Opção D"],
      correct: Math.floor(Math.random() * 4),
    }));

    setBattle({
      bossId: boss.id,
      bossHp: boss.hp,
      playerHp: 100,
      currentQuestion: 0,
      totalQuestions: boss.questions,
      isActive: true,
      questions: sampleQuestions,
      score: 0,
    });
  };

  const handleAnswer = (answerIndex: number) => {
    if (!battle || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === battle.questions[battle.currentQuestion].correct;

    setTimeout(() => {
      setBattle((prev) => {
        if (!prev) return null;
        const newBossHp = isCorrect ? Math.max(0, prev.bossHp - 10) : prev.bossHp;
        const newPlayerHp = isCorrect ? prev.playerHp : Math.max(0, prev.playerHp - 15);
        const nextQ = prev.currentQuestion + 1;
        const isOver = nextQ >= prev.totalQuestions || newPlayerHp <= 0 || newBossHp <= 0;

        if (isOver && newBossHp <= 0) {
          const boss = BOSSES.find((b) => b.id === prev.bossId);
          if (boss && user) {
            supabase.from("ai_activities").insert({
              user_id: user.id,
              subject: boss.subject,
              title: `Chefão: ${boss.name}`,
              question: "Boss Battle",
              correct_answer: "victory",
              explanation: "Chefão derrotado!",
              content_text: `Vitória contra ${boss.name}`,
              question_type: "boss_battle",
              is_completed: true,
              is_correct: true,
              xp_reward: boss.xpReward,
              coin_reward: boss.coinReward,
              week_number: 1,
              day_of_week: new Date().getDay(),
            } as any).then();
            triggerConfetti();
            toast.success(`🎉 ${boss.name} derrotado! +${boss.xpReward} XP +${boss.coinReward} 🪙`);
            setDefeatedBosses((d) => [...d, boss.subject]);
          }
        }

        return {
          ...prev,
          bossHp: newBossHp,
          playerHp: newPlayerHp,
          currentQuestion: nextQ,
          score: isCorrect ? prev.score + 1 : prev.score,
          isActive: !isOver,
        };
      });
      setSelectedAnswer(null);
      setShowResult(false);
    }, 1200);
  };

  const boss = battle ? BOSSES.find((b) => b.id === battle.bossId) : null;
  const currentQ = battle ? battle.questions[battle.currentQuestion] : null;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        {!battle?.isActive ? (
          <>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Swords className="text-destructive" /> Chefões por Matéria
              </h1>
              <p className="text-muted-foreground mt-1">Enfrente os guardiões de cada disciplina em batalhas épicas</p>
            </div>

            {/* Victory summary if battle just ended */}
            {battle && !battle.isActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center"
              >
                <div className="text-5xl mb-3">{battle.bossHp <= 0 ? "🏆" : "💀"}</div>
                <h2 className="text-xl font-bold text-foreground">
                  {battle.bossHp <= 0 ? "Vitória!" : "Derrota..."}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Acertos: {battle.score}/{battle.totalQuestions}
                </p>
                <Button onClick={() => setBattle(null)} className="mt-4">Voltar aos Chefões</Button>
              </motion.div>
            )}

            {/* Boss grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {BOSSES.map((b, i) => {
                const isDefeated = defeatedBosses.includes(b.subject);
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                      isDefeated ? "border-green-500/30" : "border-border/50"
                    }`}
                  >
                    {/* Epic gradient header */}
                    <div className={`bg-gradient-to-r ${b.gradient} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative z-10">
                        <div className="text-4xl mb-2">{b.emoji}</div>
                        <h3 className="text-lg font-bold">{b.name}</h3>
                        <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">{b.subject}</Badge>
                      </div>
                      {isDefeated && (
                        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-card/50">
                      <p className="text-xs text-muted-foreground mb-3">{b.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs"><Zap size={10} className="mr-1" />{b.xpReward} XP</Badge>
                          <Badge variant="outline" className="text-xs">{b.coinReward} 🪙</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={12} className="text-destructive" />
                          <span className="text-xs text-muted-foreground">{b.questions} questões</span>
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        variant={isDefeated ? "outline" : "default"}
                        onClick={() => startBattle(b)}
                      >
                        <Swords size={14} />
                        {isDefeated ? "Desafiar Novamente" : "Iniciar Batalha"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : boss && currentQ ? (
          /* BATTLE SCREEN */
          <div className="max-w-2xl mx-auto">
            {/* Battle header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-2xl bg-gradient-to-r ${boss.gradient} p-5 text-white relative overflow-hidden mb-6`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl"
                  >
                    {boss.emoji}
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-lg">{boss.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Heart size={14} />
                      <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${battle.bossHp}%` }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                      <span className="text-xs font-bold">{battle.bossHp}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">Questão</p>
                  <p className="font-bold">{battle.currentQuestion + 1}/{battle.totalQuestions}</p>
                </div>
              </div>
            </motion.div>

            {/* Player HP */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-border/50 bg-card/50">
              <Shield size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Sua Vida</span>
              <div className="flex-1">
                <Progress value={battle.playerHp} className="h-2" />
              </div>
              <span className="text-sm font-bold text-primary">{battle.playerHp}%</span>
            </div>

            {/* Question */}
            <motion.div
              key={battle.currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-6"
            >
              <p className="font-semibold text-foreground mb-4">{currentQ.question}</p>
              <div className="space-y-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = selectedAnswer === oi;
                  const isCorrect = showResult && oi === currentQ.correct;
                  const isWrong = showResult && isSelected && oi !== currentQ.correct;

                  return (
                    <motion.button
                      key={oi}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(oi)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                          : isWrong
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/50 bg-background hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium text-sm">{String.fromCharCode(65 + oi)}. {opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : null}
      </motion.div>
    </DashboardLayout>
  );
};

export default BossBattle;
