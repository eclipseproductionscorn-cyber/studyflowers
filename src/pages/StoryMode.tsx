import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Lock, Check, Sparkles, Star, Trophy, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storyChapters, getChapterById, type StoryChoice } from "@/lib/storyChapters";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

interface Progress {
  current_chapter: number;
  current_scene: number;
  choices: Record<string, string>;
  completed_chapters: number[];
  total_score: number;
  is_completed: boolean;
}

const StoryMode = () => {
  const { profile, user, addCoins, addXP } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    const { data } = await supabase.from("story_progress").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setProgress({
        current_chapter: data.current_chapter,
        current_scene: data.current_scene,
        choices: (data.choices as Record<string, string>) || {},
        completed_chapters: data.completed_chapters || [],
        total_score: data.total_score,
        is_completed: data.is_completed,
      });
    } else {
      const { data: created } = await supabase.from("story_progress").insert({ user_id: user.id }).select().single();
      if (created) {
        setProgress({
          current_chapter: 1, current_scene: 0, choices: {},
          completed_chapters: [], total_score: 0, is_completed: false,
        });
      }
    }
    setLoading(false);
  };

  const startChapter = (chapterId: number) => {
    setActiveChapter(chapterId);
    setCurrentScene(0);
    setShowChoice(false);
    setTimeout(() => setShowChoice(true), 600);
  };

  const handleChoice = async (chapterId: number, sceneId: number, choice: StoryChoice) => {
    if (!user || !progress) return;
    setShowChoice(false);
    
    await addXP(choice.rewards.xp);
    await addCoins(choice.rewards.coins);
    
    toast.success(`+${choice.rewards.xp} XP, +${choice.rewards.coins} 🪙`, {
      description: choice.consequence,
    });

    const newChoices = { ...progress.choices, [`${chapterId}-${sceneId}`]: choice.id };
    const newScore = progress.total_score + choice.rewards.xp;
    
    await supabase.from("story_progress").update({
      choices: newChoices,
      total_score: newScore,
    }).eq("user_id", user.id);

    setProgress({ ...progress, choices: newChoices, total_score: newScore });

    setTimeout(() => {
      const chapter = getChapterById(chapterId)!;
      const nextScene = sceneId + 1;
      if (nextScene >= chapter.scenes.length) {
        completeChapter(chapterId);
      } else {
        setCurrentScene(nextScene);
        setTimeout(() => setShowChoice(true), 600);
      }
    }, 1500);
  };

  const completeChapter = async (chapterId: number) => {
    if (!user || !progress) return;
    const chapter = getChapterById(chapterId)!;
    
    if (!progress.completed_chapters.includes(chapterId)) {
      await addXP(chapter.completionReward.xp);
      await addCoins(chapter.completionReward.coins);
      fireConfetti();
      toast.success(`🎉 Capítulo Completo!`, {
        description: `+${chapter.completionReward.xp} XP, +${chapter.completionReward.coins} 🪙`,
      });

      const newCompleted = [...progress.completed_chapters, chapterId];
      const isFinished = newCompleted.length === storyChapters.length;
      
      await supabase.from("story_progress").update({
        completed_chapters: newCompleted,
        current_chapter: Math.min(chapterId + 1, storyChapters.length),
        is_completed: isFinished,
      }).eq("user_id", user.id);

      setProgress({
        ...progress,
        completed_chapters: newCompleted,
        current_chapter: Math.min(chapterId + 1, storyChapters.length),
        is_completed: isFinished,
      });
    }
    
    setActiveChapter(null);
  };

  const advanceEndingScene = (chapterId: number) => {
    completeChapter(chapterId);
  };

  if (loading) return <DashboardLayout profile={profile}><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  // Active chapter view
  if (activeChapter !== null) {
    const chapter = getChapterById(activeChapter)!;
    const scene = chapter.scenes[currentScene];
    
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${scene.background} overflow-y-auto`}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-white hover:bg-white/20"
            onClick={() => setActiveChapter(null)}
          >
            <ArrowLeft size={18} className="mr-2" /> Sair
          </Button>

          <div className="absolute top-4 right-4 flex gap-2">
            {chapter.scenes.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentScene ? "w-8 bg-white" : i < currentScene ? "w-4 bg-white/70" : "w-4 bg-white/30"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeChapter}-${currentScene}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl w-full text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-8xl md:text-9xl filter drop-shadow-2xl"
              >
                {scene.emoji}
              </motion.div>

              {scene.speaker && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur text-base px-4 py-1">
                  💬 {scene.speaker}
                </Badge>
              )}

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white text-lg md:text-2xl leading-relaxed font-medium drop-shadow-lg bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/20"
              >
                {scene.narration}
              </motion.p>

              <AnimatePresence>
                {showChoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 pt-4"
                  >
                    {scene.isEnding ? (
                      <Button
                        size="lg"
                        className="bg-white text-foreground hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-2xl"
                        onClick={() => advanceEndingScene(activeChapter)}
                      >
                        <Trophy className="mr-2" /> Concluir Capítulo
                      </Button>
                    ) : (
                      scene.choices?.map((choice, i) => (
                        <motion.div
                          key={choice.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/25 hover:scale-[1.02] transition-all text-left justify-start text-base md:text-lg py-6 h-auto whitespace-normal"
                            onClick={() => handleChoice(activeChapter, scene.id, choice)}
                          >
                            <Sparkles className="mr-3 flex-shrink-0" size={18} /> {choice.text}
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Chapter list view
  const completedCount = progress?.completed_chapters.length || 0;
  const totalChapters = storyChapters.length;
  const progressPct = (completedCount / totalChapters) * 100;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <BookOpen size={36} /> Modo História
                </h1>
                <p className="text-white/90 mt-2 text-base md:text-lg">Sua jornada épica de aprendizado começa aqui</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{progress?.total_score || 0}</div>
                <div className="text-white/80 text-sm">Pontuação Lendária</div>
              </div>
            </div>
            <div className="mt-6 bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white"
              />
            </div>
            <p className="text-sm mt-2 text-white/90">{completedCount} / {totalChapters} capítulos completos</p>
          </div>
        </div>

        <div className="grid gap-4">
          {storyChapters.map((chapter, i) => {
            const isCompleted = progress?.completed_chapters.includes(chapter.id);
            const isUnlocked = chapter.id === 1 || progress?.completed_chapters.includes(chapter.id - 1);
            
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && startChapter(chapter.id)}
                  className={`w-full text-left bg-gradient-to-r ${chapter.color} rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden transition-all ${
                    isUnlocked ? "hover:scale-[1.02] hover:shadow-2xl cursor-pointer" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl md:text-6xl flex-shrink-0">{chapter.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-white/25 text-white border-white/40 text-xs">{chapter.subtitle}</Badge>
                        {isCompleted && <Badge className="bg-green-500 border-0"><Check size={12} className="mr-1" /> Completo</Badge>}
                        {!isUnlocked && <Badge className="bg-black/40 border-0"><Lock size={12} className="mr-1" /> Bloqueado</Badge>}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold">{chapter.title}</h3>
                      <p className="text-white/90 text-sm md:text-base mt-1">{chapter.description}</p>
                      <div className="flex gap-3 mt-3 text-xs md:text-sm">
                        <span className="bg-white/20 px-2 py-1 rounded-full">⚡ +{chapter.completionReward.xp} XP</span>
                        <span className="bg-white/20 px-2 py-1 rounded-full">🪙 +{chapter.completionReward.coins}</span>
                      </div>
                    </div>
                    {isCompleted && <Star className="text-yellow-300 fill-yellow-300 flex-shrink-0" size={32} />}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {progress?.is_completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center shadow-2xl"
          >
            <Trophy className="mx-auto mb-3" size={48} />
            <h3 className="text-2xl font-bold">🌟 Lenda Eterna 🌟</h3>
            <p className="text-white/90 mt-2">Você completou toda a sua jornada! Seu nome ressoa pelos séculos.</p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default StoryMode;
