import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Heart, Zap, Trophy, Star, Crown, Flame, CheckCircle, Loader2, Lock, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

const BOSSES = [
  // Tier 1 - Aprendiz (Easy)
  { id: "math-1", subject: "Matemática", name: "Aprendiz Numérico", emoji: "🔢", hp: 60, questions: 5, xpReward: 100, coinReward: 50, tier: 1, gradient: "from-blue-500 to-indigo-600", description: "Operações básicas e aritmética.", ability: "Confusão Numérica" },
  { id: "port-1", subject: "Português", name: "Guardião Gramatical", emoji: "📝", hp: 60, questions: 5, xpReward: 100, coinReward: 50, tier: 1, gradient: "from-emerald-500 to-teal-600", description: "Gramática e ortografia fundamental.", ability: "Embaralhamento" },
  { id: "sci-1", subject: "Ciências", name: "Elemental Aprendiz", emoji: "🌿", hp: 60, questions: 5, xpReward: 100, coinReward: 50, tier: 1, gradient: "from-green-500 to-lime-600", description: "Seres vivos e ecossistemas.", ability: "Esporos Confusos" },
  { id: "geo-1", subject: "Geografia", name: "Explorador Novato", emoji: "🗺️", hp: 60, questions: 5, xpReward: 100, coinReward: 50, tier: 1, gradient: "from-teal-500 to-cyan-600", description: "Mapas, capitais e biomas.", ability: "Névoa Geográfica" },
  { id: "hist-1", subject: "História", name: "Cronista Iniciante", emoji: "📜", hp: 60, questions: 5, xpReward: 100, coinReward: 50, tier: 1, gradient: "from-amber-500 to-orange-600", description: "Primeiras civilizações.", ability: "Ilusão Temporal" },
  // Tier 2 - Guardião (Medium)
  { id: "math-2", subject: "Matemática", name: "Guardião dos Números", emoji: "🧮", hp: 100, questions: 10, xpReward: 200, coinReward: 100, tier: 2, gradient: "from-blue-600 via-indigo-600 to-violet-700", description: "Funções, equações e geometria.", ability: "Cálculo Sombrio" },
  { id: "port-2", subject: "Português", name: "Mestre da Interpretação", emoji: "📖", hp: 100, questions: 10, xpReward: 200, coinReward: 100, tier: 2, gradient: "from-emerald-600 via-teal-600 to-cyan-700", description: "Interpretação textual avançada.", ability: "Verbo Enigma" },
  { id: "hist-2", subject: "História", name: "Senhor das Revoluções", emoji: "⚔️", hp: 100, questions: 10, xpReward: 200, coinReward: 100, tier: 2, gradient: "from-red-600 via-orange-600 to-amber-600", description: "Grandes marcos da humanidade.", ability: "Paradoxo Temporal" },
  { id: "sci-2", subject: "Ciências", name: "Arquiteto dos Elementos", emoji: "🔬", hp: 100, questions: 10, xpReward: 200, coinReward: 100, tier: 2, gradient: "from-green-600 via-emerald-600 to-teal-600", description: "Poder dos elementos.", ability: "Reação em Cadeia" },
  { id: "geo-2", subject: "Geografia", name: "Titã dos Continentes", emoji: "🌍", hp: 100, questions: 10, xpReward: 200, coinReward: 100, tier: 2, gradient: "from-cyan-600 via-sky-600 to-blue-700", description: "Cartografia e geopolítica.", ability: "Terremoto Mental" },
  { id: "art-2", subject: "Artes", name: "Pintor Fantasma", emoji: "🎨", hp: 90, questions: 8, xpReward: 180, coinReward: 90, tier: 2, gradient: "from-pink-500 via-fuchsia-500 to-purple-600", description: "Movimentos artísticos e pintores.", ability: "Ilusão Cromática" },
  { id: "eng-2", subject: "Inglês", name: "Grammar Knight", emoji: "🗡️", hp: 90, questions: 8, xpReward: 180, coinReward: 90, tier: 2, gradient: "from-orange-500 via-amber-500 to-yellow-600", description: "Grammar, vocabulary & tenses.", ability: "Verb Confusion" },
  { id: "phil-2", subject: "Filosofia", name: "Pensador Sombrio", emoji: "🧠", hp: 90, questions: 8, xpReward: 180, coinReward: 90, tier: 2, gradient: "from-slate-600 via-gray-600 to-zinc-700", description: "Grandes filósofos e correntes.", ability: "Dilema Existencial" },
  // Tier 3 - Mestre (Hard)
  { id: "phys-3", subject: "Física", name: "Senhor da Gravidade", emoji: "⚛️", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-purple-600 via-violet-700 to-indigo-800", description: "Leis de Newton e termodinâmica.", ability: "Campo Gravitacional" },
  { id: "chem-3", subject: "Química", name: "Alquimista Sombrio", emoji: "🧪", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-pink-600 via-rose-700 to-red-800", description: "Reações e tabela periódica.", ability: "Transmutação" },
  { id: "bio-3", subject: "Biologia", name: "Dragão Genético", emoji: "🧬", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-green-600 via-lime-700 to-emerald-800", description: "Genética e evolução.", ability: "Mutação Caótica" },
  { id: "eng-3", subject: "Inglês", name: "Phantom Speaker", emoji: "👻", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-orange-500 via-amber-600 to-yellow-700", description: "Grammar & comprehension.", ability: "Language Barrier" },
  { id: "math-3", subject: "Matemática", name: "Arquimago Algébrico", emoji: "∞", hp: 160, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-indigo-600 via-blue-700 to-violet-800", description: "Cálculo, matrizes e logaritmos.", ability: "Paradoxo Infinito" },
  { id: "hist-3", subject: "História", name: "Imperatriz das Eras", emoji: "🏛️", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-amber-600 via-orange-700 to-red-800", description: "Guerras mundiais e era moderna.", ability: "Maré da História" },
  { id: "geo-3", subject: "Geografia", name: "Titã Climático", emoji: "🌪️", hp: 150, questions: 12, xpReward: 350, coinReward: 175, tier: 3, gradient: "from-sky-600 via-blue-700 to-indigo-800", description: "Clima, geologia e urbanização.", ability: "Tempestade Caótica" },
  { id: "soc-3", subject: "Sociologia", name: "Oráculo Social", emoji: "🏙️", hp: 140, questions: 10, xpReward: 300, coinReward: 150, tier: 3, gradient: "from-rose-600 via-pink-700 to-fuchsia-800", description: "Sociedade, cultura e desigualdade.", ability: "Reflexo Sociológico" },
  // Tier 4 - Lendário
  { id: "red-4", subject: "Redação", name: "Imperador do Conhecimento", emoji: "👑", hp: 200, questions: 15, xpReward: 500, coinReward: 250, tier: 4, gradient: "from-yellow-500 via-amber-600 to-red-700", description: "O chefão final. Domine todas as habilidades.", ability: "Onisciência" },
  { id: "enem-4", subject: "ENEM", name: "Hydra do ENEM", emoji: "🐉", hp: 220, questions: 15, xpReward: 600, coinReward: 300, tier: 4, gradient: "from-red-600 via-rose-700 to-purple-800", description: "Questões multidisciplinares do ENEM.", ability: "Multi-Cabeça" },
  { id: "logic-4", subject: "Raciocínio Lógico", name: "Esfinge Lógica", emoji: "🦁", hp: 200, questions: 15, xpReward: 550, coinReward: 275, tier: 4, gradient: "from-violet-600 via-purple-700 to-indigo-800", description: "Lógica, probabilidade e enigmas.", ability: "Enigma Fatal" },
  { id: "all-4", subject: "Todas as Matérias", name: "Deus do Saber", emoji: "⚡", hp: 250, questions: 20, xpReward: 800, coinReward: 400, tier: 4, gradient: "from-yellow-400 via-orange-500 to-red-600", description: "O desafio supremo. Perguntas de todas as áreas.", ability: "Julgamento Final" },
];

const TIER_NAMES = ["", "Aprendiz", "Guardião", "Mestre", "Lendário"];
const TIER_COLORS = ["", "text-green-500", "text-blue-500", "text-purple-500", "text-yellow-500"];

interface BattleQuestion { question: string; options: string[]; correct: number; explanation?: string; }
interface BattleState { bossId: string; bossHp: number; playerHp: number; currentQuestion: number; totalQuestions: number; isActive: boolean; questions: BattleQuestion[]; score: number; combo: number; maxCombo: number; }

const BossBattle = () => {
  const { profile, user } = useAuth();
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);
  const [loadingBattle, setLoadingBattle] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  useEffect(() => { if (user) fetchDefeated(); }, [user]);

  const fetchDefeated = async () => {
    if (!user) return;
    const { data } = await supabase.from("ai_activities").select("title").eq("user_id", user.id).eq("question_type", "boss_battle").eq("is_correct", true);
    const titles = (data || []).map(d => d.title);
    const defeated = BOSSES.filter(b => titles.some(t => t.includes(b.name))).map(b => b.id);
    setDefeatedBosses(defeated);
  };

  const isBossUnlocked = (boss: typeof BOSSES[0]) => {
    if (boss.tier <= 1) return true;
    const prevTierBosses = BOSSES.filter(b => b.tier === boss.tier - 1);
    return prevTierBosses.some(b => defeatedBosses.includes(b.id));
  };

  const startBattle = async (boss: typeof BOSSES[0]) => {
    if (!isBossUnlocked(boss)) { toast.error("Derrote chefões do tier anterior primeiro!"); return; }
    setLoadingBattle(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-boss-questions", {
        body: { subject: boss.subject, bossName: boss.name, questionCount: boss.questions },
      });
      if (error || !data?.questions) throw new Error("Erro ao gerar perguntas");
      setBattle({ bossId: boss.id, bossHp: boss.hp, playerHp: 100, currentQuestion: 0, totalQuestions: data.questions.length, isActive: true, questions: data.questions, score: 0, combo: 0, maxCombo: 0 });
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar batalha");
    } finally { setLoadingBattle(false); }
  };

  const handleAnswer = (answerIndex: number) => {
    if (!battle || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    const currentQ = battle.questions[battle.currentQuestion];
    const isCorrect = answerIndex === currentQ.correct;

    setTimeout(() => {
      setBattle(prev => {
        if (!prev) return null;
        const boss = BOSSES.find(b => b.id === prev.bossId)!;
        const damageMultiplier = 1 + (prev.combo * 0.1);
        const baseDamage = Math.ceil(boss.hp / boss.questions);
        const newBossHp = isCorrect ? Math.max(0, prev.bossHp - Math.ceil(baseDamage * damageMultiplier)) : prev.bossHp;
        const newPlayerHp = isCorrect ? prev.playerHp : Math.max(0, prev.playerHp - (boss.tier >= 3 ? 20 : 15));
        const newCombo = isCorrect ? prev.combo + 1 : 0;
        const nextQ = prev.currentQuestion + 1;
        const isOver = nextQ >= prev.totalQuestions || newPlayerHp <= 0 || newBossHp <= 0;

        if (isOver && newBossHp <= 0 && user) {
          const bonusXP = prev.maxCombo >= 5 ? 50 : 0;
          supabase.from("ai_activities").insert({
            user_id: user.id, subject: boss.subject, title: `Chefão: ${boss.name}`,
            question: "Boss Battle", correct_answer: "victory", explanation: "Chefão derrotado!",
            content_text: `Vitória contra ${boss.name}`, question_type: "boss_battle",
            is_completed: true, is_correct: true, xp_reward: boss.xpReward + bonusXP, coin_reward: boss.coinReward,
            week_number: 1, day_of_week: new Date().getDay(),
          } as any).then();
          fireConfetti();
          toast.success(`🎉 ${boss.name} derrotado! +${boss.xpReward + bonusXP} XP +${boss.coinReward} 🪙`);
          setDefeatedBosses(d => [...d, boss.id]);
        }

        return { ...prev, bossHp: newBossHp, playerHp: newPlayerHp, currentQuestion: nextQ, score: isCorrect ? prev.score + 1 : prev.score, isActive: !isOver, combo: newCombo, maxCombo: Math.max(prev.maxCombo, newCombo) };
      });
      setSelectedAnswer(null); setShowResult(false);
    }, 2000);
  };

  const boss = battle ? BOSSES.find(b => b.id === battle.bossId) : null;
  const currentQ = battle ? battle.questions[battle.currentQuestion] : null;
  const tiersAvailable = [...new Set(BOSSES.map(b => b.tier))];

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        {loadingBattle ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>
              <Swords size={48} className="text-primary" />
            </motion.div>
            <p className="text-lg font-bold">Invocando o Chefão...</p>
            <p className="text-sm text-muted-foreground">A IA está gerando perguntas de combate</p>
          </div>
        ) : !battle?.isActive ? (
          <>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2"><Swords className="text-destructive" /> Arena de Chefões</h1>
              <p className="text-muted-foreground mt-1">Derrote guardiões com perguntas geradas por IA · {defeatedBosses.length}/{BOSSES.length} derrotados</p>
            </div>

            {/* Victory/Defeat screen */}
            {battle && !battle.isActive && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center">
                <div className="text-6xl mb-3">{battle.bossHp <= 0 ? "🏆" : "💀"}</div>
                <h2 className="text-2xl font-bold">{battle.bossHp <= 0 ? "Vitória Épica!" : "Derrota..."}</h2>
                <p className="text-muted-foreground mt-1">Acertos: {battle.score}/{battle.totalQuestions} · Combo Máx: {battle.maxCombo}x</p>
                <Button onClick={() => setBattle(null)} className="mt-4">Voltar à Arena</Button>
              </motion.div>
            )}

            {/* Tier selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button variant={selectedTier === null ? "default" : "outline"} size="sm" onClick={() => setSelectedTier(null)}>Todos</Button>
              {tiersAvailable.map(tier => (
                <Button key={tier} variant={selectedTier === tier ? "default" : "outline"} size="sm" onClick={() => setSelectedTier(tier)} className="gap-1">
                  {tier === 1 ? "⭐" : tier === 2 ? "⭐⭐" : tier === 3 ? "⭐⭐⭐" : "👑"} {TIER_NAMES[tier]}
                </Button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="bg-card/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Arena</span>
                <span className="text-sm font-bold text-primary">{defeatedBosses.length}/{BOSSES.length}</span>
              </div>
              <Progress value={(defeatedBosses.length / BOSSES.length) * 100} className="h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {BOSSES.filter(b => selectedTier === null || b.tier === selectedTier).map((b, i) => {
                const isDefeated = defeatedBosses.includes(b.id);
                const unlocked = isBossUnlocked(b);
                return (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`relative rounded-2xl border overflow-hidden transition-all ${isDefeated ? "border-green-500/30" : !unlocked ? "border-border/30 opacity-60" : "border-border/50 hover:shadow-lg hover:-translate-y-1"}`}>
                    <div className={`bg-gradient-to-r ${b.gradient} p-5 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      {!unlocked && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><Lock size={32} className="text-white/70" /></div>}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <motion.div animate={!isDefeated && unlocked ? { y: [0, -5, 0] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-4xl">{b.emoji}</motion.div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">{TIER_NAMES[b.tier]}</Badge>
                            {b.ability && <span className="text-[10px] text-white/70">⚡ {b.ability}</span>}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mt-2">{b.name}</h3>
                        <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">{b.subject}</Badge>
                      </div>
                      {isDefeated && <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 z-20"><CheckCircle size={16} className="text-white" /></div>}
                    </div>
                    <div className="p-4 bg-card/50">
                      <p className="text-xs text-muted-foreground mb-3">{b.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs"><Zap size={10} className="mr-1" />{b.xpReward}</Badge>
                          <Badge variant="outline" className="text-xs">{b.coinReward} 🪙</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={12} className="text-destructive" />
                          <span className="text-xs text-muted-foreground">{b.questions}q</span>
                        </div>
                      </div>
                      <Button className="w-full gap-2" variant={isDefeated ? "outline" : "default"} onClick={() => startBattle(b)} disabled={!unlocked}>
                        <Swords size={14} /> {!unlocked ? "Bloqueado" : isDefeated ? "Revanche" : "Batalhar"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : boss && currentQ ? (
          <div className="max-w-2xl mx-auto">
            {/* Boss Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className={`rounded-2xl bg-gradient-to-r ${boss.gradient} p-5 text-white relative overflow-hidden mb-6`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-4xl">{boss.emoji}</motion.div>
                  <div>
                    <h2 className="font-bold text-lg">{boss.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Heart size={14} />
                      <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${(battle.bossHp / boss.hp) * 100}%` }} className="h-full bg-white rounded-full" />
                      </div>
                      <span className="text-xs font-bold">{battle.bossHp}/{boss.hp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">Questão</p>
                  <p className="font-bold">{battle.currentQuestion + 1}/{battle.totalQuestions}</p>
                </div>
              </div>
            </motion.div>

            {/* Player Stats */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-border/50 bg-card/50">
              <Shield size={20} className="text-primary" />
              <span className="text-sm font-medium">Vida</span>
              <div className="flex-1"><Progress value={battle.playerHp} className="h-2" /></div>
              <span className="text-sm font-bold text-primary">{battle.playerHp}%</span>
              {battle.combo > 0 && (
                <Badge className="bg-orange-500/20 text-orange-500 text-xs animate-pulse">
                  <Flame size={10} className="mr-1" />{battle.combo}x Combo
                </Badge>
              )}
            </div>

            {/* Question */}
            <motion.div key={battle.currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-border/50 bg-card/50 p-6">
              <p className="font-semibold text-foreground mb-4">{currentQ.question}</p>
              <div className="space-y-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = selectedAnswer === oi;
                  const isCorrect = showResult && oi === currentQ.correct;
                  const isWrong = showResult && isSelected && oi !== currentQ.correct;
                  return (
                    <motion.button key={oi} whileHover={!showResult ? { scale: 1.01 } : {}} whileTap={!showResult ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(oi)} disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400" : isWrong ? "border-destructive bg-destructive/10 text-destructive" : isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-background hover:border-primary/30"}`}>
                      <span className="font-medium text-sm">{String.fromCharCode(65 + oi)}. {opt}</span>
                    </motion.button>
                  );
                })}
              </div>
              {showResult && currentQ.explanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground"><span className="font-bold">💡</span> {currentQ.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : null}
      </motion.div>
    </DashboardLayout>
  );
};

export default BossBattle;
