import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star, Zap, Shield, Trophy, Gift, TrendingUp, ShoppingBag, Palette, Music, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PET_SPECIES = [
  { id: "fox", name: "Raposa", stages: ["🥚", "🦊", "🦊", "🦊", "🔥🦊", "⚡🦊", "🌟🦊"], color: "from-orange-500 to-red-500", trait: "Astúcia — Bônus em estratégia", description: "Esperta e ágil" },
  { id: "dragon", name: "Dragão", stages: ["🥚", "🐣", "🐉", "🐲", "🔥🐲", "⚡🐲", "🌟🐲"], color: "from-red-500 to-purple-600", trait: "Poder — Bônus em combate", description: "Força bruta e fogo" },
  { id: "owl", name: "Coruja", stages: ["🥚", "🐣", "🦉", "🦉", "🔮🦉", "⚡🦉", "🌟🦉"], color: "from-indigo-500 to-blue-600", trait: "Sabedoria — Bônus em revisão", description: "Inteligente e sábia" },
  { id: "wolf", name: "Lobo", stages: ["🥚", "🐣", "🐺", "🐺", "🔥🐺", "⚡🐺", "🌟🐺"], color: "from-gray-600 to-blue-700", trait: "Lealdade — Bônus em streak", description: "Fiel e determinado" },
  { id: "phoenix", name: "Fênix", stages: ["🥚", "🐣", "🐦", "🦅", "🔥🦅", "⚡🦅", "🌟🦅"], color: "from-yellow-500 to-orange-600", trait: "Resiliência — Bônus em recuperação", description: "Renasce sempre mais forte" },
  { id: "cat", name: "Gato", stages: ["🥚", "🐱", "🐱", "🐈", "🔮🐈", "⚡🐈", "🌟🐈"], color: "from-pink-500 to-purple-500", trait: "Curiosidade — Bônus em exploração", description: "Curioso e independente" },
  // New species
  { id: "bear", name: "Urso", stages: ["🥚", "🐻", "🐻", "🐻‍❄️", "🔥🐻‍❄️", "⚡🐻‍❄️", "🌟🐻‍❄️"], color: "from-amber-600 to-yellow-700", trait: "Força — Bônus em resistência", description: "Forte e resiliente" },
  { id: "rabbit", name: "Coelho", stages: ["🥚", "🐰", "🐰", "🐇", "🔥🐇", "⚡🐇", "🌟🐇"], color: "from-pink-400 to-rose-500", trait: "Velocidade — Bônus em tempo", description: "Rápido e ágil" },
  { id: "turtle", name: "Tartaruga", stages: ["🥚", "🐢", "🐢", "🐢", "🔮🐢", "⚡🐢", "🌟🐢"], color: "from-green-500 to-emerald-600", trait: "Paciência — Bônus em precisão", description: "Calma e precisa" },
  { id: "eagle", name: "Águia", stages: ["🥚", "🐣", "🦅", "🦅", "🔥🦅", "⚡🦅", "🌟🦅"], color: "from-sky-500 to-blue-600", trait: "Visão — Bônus em detalhes", description: "Olhos afiados e perspicaz" },
  { id: "lion", name: "Leão", stages: ["🥚", "🐱", "🦁", "🦁", "🔥🦁", "⚡🦁", "🌟🦁"], color: "from-yellow-500 to-amber-600", trait: "Coragem — Bônus em desafios", description: "Corajoso e líder nato" },
  { id: "panda", name: "Panda", stages: ["🥚", "🐼", "🐼", "🐼", "🔮🐼", "⚡🐼", "🌟🐼"], color: "from-gray-400 to-gray-600", trait: "Equilíbrio — Bônus em foco", description: "Zen e equilibrado" },
  { id: "shark", name: "Tubarão", stages: ["🥚", "🐟", "🦈", "🦈", "🔥🦈", "⚡🦈", "🌟🦈"], color: "from-blue-600 to-cyan-700", trait: "Instinto — Bônus em quiz", description: "Predador implacável" },
  { id: "unicorn", name: "Unicórnio", stages: ["🥚", "🐴", "🦄", "🦄", "🔮🦄", "⚡🦄", "🌟🦄"], color: "from-violet-500 to-pink-500", trait: "Magia — Bônus em XP", description: "Mágico e raro" },
  { id: "monkey", name: "Macaco", stages: ["🥚", "🐒", "🐒", "🐵", "🔥🐵", "⚡🐵", "🌟🐵"], color: "from-orange-400 to-brown-500", trait: "Inteligência — Bônus em lógica", description: "Esperto e brincalhão" },
  { id: "penguin", name: "Pinguim", stages: ["🥚", "🐧", "🐧", "🐧", "🔮🐧", "⚡🐧", "🌟🐧"], color: "from-slate-500 to-blue-600", trait: "Persistência — Bônus em missões", description: "Determinado e fiel" },
];

const PET_STAGE_NAMES = ["Ovo", "Filhote", "Jovem", "Adulto", "Guerreiro", "Lendário", "Mítico"];
const PET_STAGE_MIN_STREAK = [0, 3, 7, 14, 30, 60, 100];

const PET_MOODS = [
  { streak: 0, mood: "😴", label: "Dormindo", color: "text-muted-foreground" },
  { streak: 1, mood: "😊", label: "Feliz", color: "text-green-500" },
  { streak: 3, mood: "😄", label: "Animado", color: "text-yellow-500" },
  { streak: 7, mood: "🤩", label: "Empolgado", color: "text-orange-500" },
  { streak: 14, mood: "🔥", label: "Em Chamas", color: "text-red-500" },
  { streak: 30, mood: "⚡", label: "Elétrico", color: "text-purple-500" },
  { streak: 60, mood: "🌟", label: "Radiante", color: "text-yellow-400" },
  { streak: 100, mood: "💎", label: "Transcendente", color: "text-cyan-400" },
];

const SHOP_ITEMS = [
  // Roupas
  { id: "hat", name: "Chapéu Mágico", emoji: "🎩", price: 100, category: "roupa", requiredStreak: 0 },
  { id: "glasses", name: "Óculos Estilosos", emoji: "🕶️", price: 150, category: "roupa", requiredStreak: 0 },
  { id: "scarf", name: "Cachecol Nerd", emoji: "🧣", price: 120, category: "roupa", requiredStreak: 0 },
  { id: "bowtie", name: "Gravata Borboleta", emoji: "🎀", price: 80, category: "roupa", requiredStreak: 0 },
  { id: "headband", name: "Bandana Ninja", emoji: "🥷", price: 200, category: "roupa", requiredStreak: 5 },
  { id: "hoodie", name: "Moletom Gamer", emoji: "🧥", price: 250, category: "roupa", requiredStreak: 7 },
  { id: "armor", name: "Armadura Leve", emoji: "🛡️", price: 400, category: "roupa", requiredStreak: 15 },
  { id: "kimono", name: "Kimono Sábio", emoji: "👘", price: 350, category: "roupa", requiredStreak: 12 },
  // Acessórios
  { id: "cape", name: "Capa Heroica", emoji: "🦸", price: 300, category: "acessório", requiredStreak: 10 },
  { id: "crown", name: "Coroa Real", emoji: "👑", price: 500, category: "acessório", requiredStreak: 20 },
  { id: "wings", name: "Asas Celestiais", emoji: "🪽", price: 800, category: "acessório", requiredStreak: 40 },
  { id: "aura", name: "Aura Mítica", emoji: "✨", price: 1000, category: "acessório", requiredStreak: 60 },
  { id: "halo", name: "Auréola Divina", emoji: "😇", price: 1200, category: "acessório", requiredStreak: 70 },
  { id: "sword", name: "Espada Flamejante", emoji: "🗡️", price: 600, category: "acessório", requiredStreak: 25 },
  { id: "shield_acc", name: "Escudo Ancestral", emoji: "🛡️", price: 550, category: "acessório", requiredStreak: 20 },
  { id: "wand", name: "Varinha Arcana", emoji: "🪄", price: 700, category: "acessório", requiredStreak: 30 },
  { id: "orb", name: "Orbe Cósmico", emoji: "🔮", price: 900, category: "acessório", requiredStreak: 50 },
  { id: "necklace", name: "Colar de Poder", emoji: "📿", price: 450, category: "acessório", requiredStreak: 18 },
  // Skins
  { id: "golden", name: "Skin Dourada", emoji: "🌟", price: 600, category: "skin", requiredStreak: 15 },
  { id: "crystal", name: "Skin Cristal", emoji: "💎", price: 900, category: "skin", requiredStreak: 30 },
  { id: "shadow", name: "Skin Sombria", emoji: "🌑", price: 700, category: "skin", requiredStreak: 25 },
  { id: "rainbow", name: "Skin Arco-Íris", emoji: "🌈", price: 1200, category: "skin", requiredStreak: 50 },
  { id: "fire", name: "Skin Infernal", emoji: "🔥", price: 800, category: "skin", requiredStreak: 20 },
  { id: "ice", name: "Skin Glacial", emoji: "❄️", price: 850, category: "skin", requiredStreak: 22 },
  { id: "galaxy", name: "Skin Galáxia", emoji: "🌌", price: 1500, category: "skin", requiredStreak: 60 },
  { id: "neon", name: "Skin Neon", emoji: "💜", price: 1000, category: "skin", requiredStreak: 35 },
  { id: "sakura", name: "Skin Sakura", emoji: "🌸", price: 750, category: "skin", requiredStreak: 18 },
  { id: "thunder", name: "Skin Trovão", emoji: "⚡", price: 1100, category: "skin", requiredStreak: 45 },
];

const PET_KEY = "studyflow_pet";
const SHOP_KEY = "studyflow_pet_shop";

const VirtualPet = () => {
  const { profile, streak, user, loading } = useAuth();
  const [showParticles, setShowParticles] = useState(false);
  const [petAction, setPetAction] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [showSpeciesSelect, setShowSpeciesSelect] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [shopTab, setShopTab] = useState<"roupa" | "acessório" | "skin">("roupa");

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const coins = profile?.coins || 0;

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`${PET_KEY}_${user.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedSpecies(parsed.species);
      setEquippedItems(parsed.equipped || []);
    } else {
      setShowSpeciesSelect(true);
    }
    const shopSaved = localStorage.getItem(`${SHOP_KEY}_${user.id}`);
    if (shopSaved) setOwnedItems(JSON.parse(shopSaved));
  }, [user]);

  const savePet = (species: string, equipped: string[]) => {
    if (!user) return;
    localStorage.setItem(`${PET_KEY}_${user.id}`, JSON.stringify({ species, equipped }));
  };

  const chooseSpecies = (speciesId: string) => {
    setSelectedSpecies(speciesId);
    setShowSpeciesSelect(false);
    savePet(speciesId, []);
    toast.success(`🐾 Você escolheu o ${PET_SPECIES.find(s => s.id === speciesId)?.name}!`);
  };

  const species = PET_SPECIES.find(s => s.id === selectedSpecies) || PET_SPECIES[0];

  const getCurrentStageIdx = () => {
    let idx = 0;
    for (let i = 0; i < PET_STAGE_MIN_STREAK.length; i++) {
      if (currentStreak >= PET_STAGE_MIN_STREAK[i]) idx = i;
    }
    return idx;
  };

  const stageIdx = getCurrentStageIdx();
  const nextStageIdx = stageIdx < PET_STAGE_NAMES.length - 1 ? stageIdx + 1 : null;
  const stageProgress = nextStageIdx ? ((currentStreak - PET_STAGE_MIN_STREAK[stageIdx]) / (PET_STAGE_MIN_STREAK[nextStageIdx] - PET_STAGE_MIN_STREAK[stageIdx])) * 100 : 100;

  const getMood = () => {
    let mood = PET_MOODS[0];
    for (const m of PET_MOODS) { if (currentStreak >= m.streak) mood = m; }
    return mood;
  };
  const mood = getMood();

  const buyItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (ownedItems.includes(item.id)) { toast.error("Você já possui esse item!"); return; }
    if (coins < item.price) { toast.error("Moedas insuficientes!"); return; }
    if (currentStreak < item.requiredStreak) { toast.error(`Precisa de ${item.requiredStreak} dias de streak!`); return; }
    if (user) {
      await supabase.from("profiles").update({ coins: coins - item.price }).eq("user_id", user.id);
    }
    const newOwned = [...ownedItems, item.id];
    setOwnedItems(newOwned);
    if (user) localStorage.setItem(`${SHOP_KEY}_${user.id}`, JSON.stringify(newOwned));
    toast.success(`🎉 ${item.name} comprado!`);
  };

  const toggleEquip = (itemId: string) => {
    if (!ownedItems.includes(itemId)) return;
    const newEquipped = equippedItems.includes(itemId) ? equippedItems.filter(e => e !== itemId) : [...equippedItems, itemId];
    setEquippedItems(newEquipped);
    if (selectedSpecies) savePet(selectedSpecies, newEquipped);
  };

  const interactWithPet = (action: string) => {
    setPetAction(action);
    setShowParticles(true);
    setTimeout(() => { setPetAction(""); setShowParticles(false); }, 2000);
    const messages: Record<string, string> = {
      feed: `${species.stages[stageIdx]} Adorou o lanche!`,
      play: `${species.stages[stageIdx]} Se divertindo!`,
      train: `${species.stages[stageIdx]} Ficou mais forte!`,
      sing: `${species.stages[stageIdx]} Cantando feliz! 🎵`,
    };
    toast.success(messages[action] || "✨");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">🐾 Pet Virtual</h1>
            <p className="text-muted-foreground">Seu companheiro evolui com sua dedicação!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSpeciesSelect(true)} className="gap-1"><Palette size={14} />Trocar</Button>
            <Button variant="outline" size="sm" onClick={() => setShowShop(true)} className="gap-1"><ShoppingBag size={14} />Loja</Button>
          </div>
        </motion.div>

        {/* Pet Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={`relative bg-gradient-to-br ${species.color}/10 rounded-2xl p-8 border border-primary/20 overflow-hidden`}>
          <AnimatePresence>
            {showParticles && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 1, x: "50%", y: "50%" }} animate={{ opacity: 0, x: `${15 + Math.random() * 70}%`, y: `${5 + Math.random() * 50}%` }} transition={{ duration: 1.5, delay: i * 0.08 }} className="absolute text-2xl">
                    {["⭐", "✨", "💫", "🌟", "❤️", "💜"][i % 6]}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <motion.div animate={petAction ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : { y: [0, -10, 0] }} transition={petAction ? { duration: 0.6 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-8xl mb-4 inline-block">
              {species.stages[stageIdx]}
            </motion.div>

            {equippedItems.length > 0 && (
              <div className="flex justify-center gap-1 mb-2">
                {equippedItems.map(id => {
                  const item = SHOP_ITEMS.find(i => i.id === id);
                  return item ? <span key={id} className="text-2xl">{item.emoji}</span> : null;
                })}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{species.name} — {PET_STAGE_NAMES[stageIdx]}</h2>
              <span className={`text-xl ${mood.color}`}>{mood.mood}</span>
            </div>
            <p className="text-muted-foreground mb-1 text-sm">{species.trait}</p>
            <Badge variant="outline" className={mood.color}>{mood.label}</Badge>
          </div>

          {nextStageIdx !== null && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-1">
                <span>{PET_STAGE_NAMES[stageIdx]}</span>
                <span>{PET_STAGE_NAMES[nextStageIdx]}</span>
              </div>
              <Progress value={stageProgress} className="h-3" />
              <p className="text-center text-xs text-muted-foreground mt-1">
                {PET_STAGE_MIN_STREAK[nextStageIdx] - currentStreak} dias para evoluir
              </p>
            </div>
          )}
        </motion.div>

        {/* Interactions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { action: "feed", icon: Heart, label: "Alimentar", color: "from-pink-500 to-rose-500" },
            { action: "play", icon: Gamepad2, label: "Brincar", color: "from-yellow-500 to-orange-500" },
            { action: "train", icon: Zap, label: "Treinar", color: "from-blue-500 to-cyan-500" },
            { action: "sing", icon: Music, label: "Cantar", color: "from-violet-500 to-purple-500" },
          ].map(({ action, icon: Icon, label, color }) => (
            <motion.div key={action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => interactWithPet(action)} className={`w-full h-20 bg-gradient-to-r ${color} text-white flex flex-col gap-1 border-0`} variant="ghost">
                <Icon size={24} /><span className="text-sm font-medium">{label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: "Streak", value: `${currentStreak}d`, color: "text-orange-500" },
            { icon: Trophy, label: "Recorde", value: `${longestStreak}d`, color: "text-yellow-500" },
            { icon: Star, label: "Estágio", value: PET_STAGE_NAMES[stageIdx], color: "text-purple-500" },
            { icon: Gift, label: "Itens", value: `${ownedItems.length}/${SHOP_ITEMS.length}`, color: "text-cyan-500" },
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
            {PET_STAGE_NAMES.map((name, i) => {
              const unlocked = currentStreak >= PET_STAGE_MIN_STREAK[i];
              return (
                <div key={i} className="flex items-center">
                  <motion.div whileHover={{ scale: 1.1 }} className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] transition-all ${unlocked ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border opacity-50"}`}>
                    <span className="text-3xl mb-1">{species.stages[i]}</span>
                    <span className="text-xs font-medium">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{PET_STAGE_MIN_STREAK[i]}d</span>
                  </motion.div>
                  {i < PET_STAGE_NAMES.length - 1 && <div className={`w-6 h-0.5 ${unlocked ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipped Items */}
        {ownedItems.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-bold mb-4">🎨 Meus Itens</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {SHOP_ITEMS.filter(i => ownedItems.includes(i.id)).map(item => {
                const equipped = equippedItems.includes(item.id);
                return (
                  <motion.button key={item.id} whileHover={{ scale: 1.05 }} onClick={() => toggleEquip(item.id)}
                    className={`text-center p-3 rounded-xl border transition-all ${equipped ? "bg-primary/15 border-primary/50 ring-2 ring-primary/30" : "bg-muted/20 border-border"}`}>
                    <span className="text-3xl block mb-1">{item.emoji}</span>
                    <span className="text-xs font-medium">{item.name}</span>
                    {equipped && <Badge className="mt-1 text-[10px]">Equipado</Badge>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Species Selection Dialog */}
      <Dialog open={showSpeciesSelect} onOpenChange={setShowSpeciesSelect}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-center text-xl">🐾 Escolha seu Companheiro</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PET_SPECIES.map(sp => (
              <motion.button key={sp.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => chooseSpecies(sp.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${selectedSpecies === sp.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                <div className="text-4xl mb-2">{sp.stages[1]}</div>
                <h4 className="font-bold text-sm">{sp.name}</h4>
                <p className="text-xs text-muted-foreground">{sp.description}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{sp.trait}</Badge>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Dialog */}
      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2">🛍️ Loja do Pet <Badge variant="outline">{coins} 🪙</Badge></DialogTitle></DialogHeader>
          <div className="flex gap-2 mb-4">
            {(["roupa", "acessório", "skin"] as const).map(cat => (
              <Button key={cat} variant={shopTab === cat ? "default" : "outline"} size="sm" onClick={() => setShopTab(cat)} className="capitalize text-xs">{cat === "roupa" ? "👕 Roupas" : cat === "acessório" ? "💍 Acessórios" : "🎨 Skins"}</Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SHOP_ITEMS.filter(i => i.category === shopTab).map(item => {
              const owned = ownedItems.includes(item.id);
              const canBuy = coins >= item.price && currentStreak >= item.requiredStreak;
              return (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border transition-all ${owned ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                  <span className="text-3xl block mb-2">{item.emoji}</span>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-yellow-600">{item.price} 🪙</span>
                    {item.requiredStreak > 0 && <span className="text-[10px] text-muted-foreground">{item.requiredStreak}d streak</span>}
                  </div>
                  <Button size="sm" className="w-full mt-2" variant={owned ? "outline" : "default"} disabled={owned || !canBuy} onClick={() => buyItem(item)}>
                    {owned ? "✅ Adquirido" : !canBuy ? "🔒 Bloqueado" : "Comprar"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VirtualPet;
