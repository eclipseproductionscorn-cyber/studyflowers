import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star, Zap, Shield, Trophy, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PET_STAGES = [
  { name: "Ovo", emoji: "🥚", minStreak: 0, description: "Seu pet ainda é um ovo! Estude para ele nascer." },
  { name: "Filhote", emoji: "🐣", minStreak: 3, description: "O ovo rachou! Um filhote curioso nasceu." },
  { name: "Jovem", emoji: "🐥", minStreak: 7, description: "Seu pet está crescendo forte e esperto!" },
  { name: "Adulto", emoji: "🦊", minStreak: 14, description: "Um companheiro adulto e leal!" },
  { name: "Guerreiro", emoji: "🐉", minStreak: 30, description: "Seu pet evoluiu para um guerreiro lendário!" },
  { name: "Lendário", emoji: "🦄", minStreak: 60, description: "Uma criatura lendária! Poucos chegam aqui." },
  { name: "Mítico", emoji: "🔮", minStreak: 100, description: "Poder mítico! Seu pet transcendeu o mundo mortal." },
];

const PET_MOODS = [
  { streak: 0, mood: "😴", label: "Dormindo", color: "text-muted-foreground" },
  { streak: 1, mood: "😊", label: "Feliz", color: "text-green-500" },
  { streak: 3, mood: "😄", label: "Animado", color: "text-yellow-500" },
  { streak: 7, mood: "🤩", label: "Empolgado", color: "text-orange-500" },
  { streak: 14, mood: "🔥", label: "Em Chamas", color: "text-red-500" },
  { streak: 30, mood: "⚡", label: "Elétrico", color: "text-purple-500" },
];

const ACCESSORIES = [
  { id: "hat", name: "Chapéu", emoji: "🎩", requiredStreak: 5 },
  { id: "glasses", name: "Óculos", emoji: "🕶️", requiredStreak: 10 },
  { id: "cape", name: "Capa", emoji: "🦸", requiredStreak: 20 },
  { id: "crown", name: "Coroa", emoji: "👑", requiredStreak: 40 },
  { id: "wings", name: "Asas", emoji: "🪽", requiredStreak: 60 },
  { id: "aura", name: "Aura", emoji: "✨", requiredStreak: 80 },
];

const VirtualPet = () => {
  const { profile, streak, loading } = useAuth();
  const [showParticles, setShowParticles] = useState(false);
  const [petAction, setPetAction] = useState("");

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  const getCurrentStage = () => {
    let stage = PET_STAGES[0];
    for (const s of PET_STAGES) {
      if (currentStreak >= s.minStreak) stage = s;
    }
    return stage;
  };

  const getNextStage = () => {
    const current = getCurrentStage();
    const idx = PET_STAGES.indexOf(current);
    return idx < PET_STAGES.length - 1 ? PET_STAGES[idx + 1] : null;
  };

  const getMood = () => {
    let mood = PET_MOODS[0];
    for (const m of PET_MOODS) {
      if (currentStreak >= m.streak) mood = m;
    }
    return mood;
  };

  const getUnlockedAccessories = () => ACCESSORIES.filter(a => longestStreak >= a.requiredStreak);

  const stage = getCurrentStage();
  const nextStage = getNextStage();
  const mood = getMood();
  const stageProgress = nextStage ? ((currentStreak - stage.minStreak) / (nextStage.minStreak - stage.minStreak)) * 100 : 100;

  const interactWithPet = (action: string) => {
    setPetAction(action);
    setShowParticles(true);
    setTimeout(() => { setPetAction(""); setShowParticles(false); }, 2000);
    
    const messages: Record<string, string> = {
      feed: `${stage.emoji} Seu pet adorou o lanche! Continue estudando!`,
      play: `${stage.emoji} Seu pet está se divertindo! Diversão = Aprendizado!`,
      train: `${stage.emoji} Treinamento completo! Seu pet ficou mais forte!`,
    };
    toast.success(messages[action] || "Interação realizada!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">🐾 Pet Virtual</h1>
          <p className="text-muted-foreground">Seu companheiro evolui com sua dedicação aos estudos!</p>
        </motion.div>

        {/* Pet Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 border border-primary/20 overflow-hidden">
          <AnimatePresence>
            {showParticles && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 1, x: "50%", y: "50%" }} animate={{ opacity: 0, x: `${20 + Math.random() * 60}%`, y: `${10 + Math.random() * 40}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className="absolute text-2xl">
                    {["⭐", "✨", "💫", "🌟", "❤️"][i % 5]}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <motion.div animate={petAction ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { y: [0, -8, 0] }} transition={petAction ? { duration: 0.5 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-8xl mb-4 inline-block">
              {stage.emoji}
            </motion.div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{stage.name}</h2>
              <span className={`text-xl ${mood.color}`}>{mood.mood}</span>
            </div>
            <p className="text-muted-foreground mb-1">{stage.description}</p>
            <Badge variant="outline" className={mood.color}>{mood.label}</Badge>

            {/* Unlocked Accessories */}
            {getUnlockedAccessories().length > 0 && (
              <div className="flex justify-center gap-2 mt-3">
                {getUnlockedAccessories().map(a => (
                  <span key={a.id} className="text-2xl" title={a.name}>{a.emoji}</span>
                ))}
              </div>
            )}
          </div>

          {/* Evolution Progress */}
          {nextStage && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-1">
                <span>{stage.emoji} {stage.name}</span>
                <span>{nextStage.emoji} {nextStage.name}</span>
              </div>
              <Progress value={stageProgress} className="h-3" />
              <p className="text-center text-xs text-muted-foreground mt-1">
                {nextStage.minStreak - currentStreak} dias de streak para evoluir
              </p>
            </div>
          )}
        </motion.div>

        {/* Interactions */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { action: "feed", icon: Heart, label: "Alimentar", color: "from-pink-500 to-rose-500" },
            { action: "play", icon: Sparkles, label: "Brincar", color: "from-yellow-500 to-orange-500" },
            { action: "train", icon: Zap, label: "Treinar", color: "from-blue-500 to-cyan-500" },
          ].map(({ action, icon: Icon, label, color }) => (
            <motion.div key={action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => interactWithPet(action)} className={`w-full h-20 bg-gradient-to-r ${color} text-white flex flex-col gap-1`} variant="ghost">
                <Icon size={24} />
                <span className="text-sm font-medium">{label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: "Streak Atual", value: `${currentStreak} dias`, color: "text-orange-500" },
            { icon: Trophy, label: "Maior Streak", value: `${longestStreak} dias`, color: "text-yellow-500" },
            { icon: Star, label: "Estágio", value: stage.name, color: "text-purple-500" },
            { icon: Gift, label: "Acessórios", value: `${getUnlockedAccessories().length}/${ACCESSORIES.length}`, color: "text-cyan-500" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-4 border border-border text-center">
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Evolution Timeline */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4">🗺️ Linha de Evolução</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PET_STAGES.map((s, i) => {
              const unlocked = currentStreak >= s.minStreak;
              return (
                <div key={i} className="flex items-center">
                  <motion.div whileHover={{ scale: 1.1 }} className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] ${unlocked ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border opacity-50"}`}>
                    <span className="text-3xl mb-1">{s.emoji}</span>
                    <span className="text-xs font-medium">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">{s.minStreak}d</span>
                  </motion.div>
                  {i < PET_STAGES.length - 1 && <div className={`w-6 h-0.5 ${unlocked ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessories Collection */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4">🎨 Coleção de Acessórios</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {ACCESSORIES.map(a => {
              const unlocked = longestStreak >= a.requiredStreak;
              return (
                <motion.div key={a.id} whileHover={{ scale: 1.05 }} className={`text-center p-3 rounded-xl border ${unlocked ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border opacity-40"}`}>
                  <span className="text-3xl block mb-1">{a.emoji}</span>
                  <span className="text-xs font-medium">{a.name}</span>
                  {!unlocked && <p className="text-[10px] text-muted-foreground">{a.requiredStreak}d streak</p>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VirtualPet;
