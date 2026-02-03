import { Sparkles, Crown, Zap, Star, Rocket, Brain, Flame, Target, Award, Shield, Gem, Trophy } from "lucide-react";

export interface LevelReward {
  type: "feature" | "cosmetic" | "boost" | "item";
  id: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
}

export interface Level {
  level: number;
  xpRequired: number;
  title: string;
  rewards: LevelReward[];
  color: string;
}

export const levels: Level[] = [
  {
    level: 1,
    xpRequired: 0,
    title: "Iniciante",
    color: "text-gray-500",
    rewards: [],
  },
  {
    level: 2,
    xpRequired: 100,
    title: "Aprendiz",
    color: "text-green-500",
    rewards: [
      { type: "feature", id: "flashcards_basic", name: "Flashcards Básicos", description: "Acesso à geração de flashcards", icon: Brain },
    ],
  },
  {
    level: 3,
    xpRequired: 250,
    title: "Estudante",
    color: "text-blue-500",
    rewards: [
      { type: "cosmetic", id: "badge_student", name: "Emblema Estudante", description: "Emblema exclusivo de estudante", icon: Award },
    ],
  },
  {
    level: 5,
    xpRequired: 500,
    title: "Dedicado",
    color: "text-purple-500",
    rewards: [
      { type: "feature", id: "custom_activities", name: "Atividades Personalizadas", description: "Crie atividades com IA", icon: Sparkles },
      { type: "boost", id: "xp_boost_5", name: "+5% XP Permanente", description: "Bônus permanente de XP", icon: Zap },
    ],
  },
  {
    level: 7,
    xpRequired: 800,
    title: "Focado",
    color: "text-cyan-500",
    rewards: [
      { type: "cosmetic", id: "frame_focused", name: "Moldura Focado", description: "Moldura especial para avatar", icon: Target },
    ],
  },
  {
    level: 10,
    xpRequired: 1200,
    title: "Avançado",
    color: "text-amber-500",
    rewards: [
      { type: "feature", id: "teacher_samuk_pro", name: "Teacher Samuk Pro", description: "Conversas mais profundas com IA", icon: Brain },
      { type: "cosmetic", id: "badge_advanced", name: "Emblema Avançado", description: "Emblema dourado exclusivo", icon: Star },
    ],
  },
  {
    level: 15,
    xpRequired: 2000,
    title: "Expert",
    color: "text-orange-500",
    rewards: [
      { type: "boost", id: "coin_boost_10", name: "+10% Moedas", description: "Bônus permanente de moedas", icon: Gem },
      { type: "item", id: "streak_shield_gift", name: "Escudo de Ofensiva", description: "1 escudo de ofensiva grátis", icon: Shield },
    ],
  },
  {
    level: 20,
    xpRequired: 3500,
    title: "Mestre",
    color: "text-pink-500",
    rewards: [
      { type: "feature", id: "hard_mode", name: "Modo Difícil", description: "Desafios extras com mais XP", icon: Flame },
      { type: "cosmetic", id: "title_master", name: "Título: Mestre", description: "Título exclusivo no perfil", icon: Crown },
    ],
  },
  {
    level: 25,
    xpRequired: 5000,
    title: "Guru",
    color: "text-indigo-500",
    rewards: [
      { type: "cosmetic", id: "aura_guru", name: "Aura Guru", description: "Efeito visual especial", icon: Sparkles },
    ],
  },
  {
    level: 30,
    xpRequired: 7500,
    title: "Sábio",
    color: "text-violet-500",
    rewards: [
      { type: "feature", id: "create_challenges", name: "Criar Desafios", description: "Crie desafios para outros", icon: Target },
      { type: "boost", id: "xp_boost_15", name: "+15% XP Total", description: "Mega bônus de XP", icon: Zap },
    ],
  },
  {
    level: 40,
    xpRequired: 12000,
    title: "Prodígio",
    color: "text-rose-500",
    rewards: [
      { type: "cosmetic", id: "frame_prodigy", name: "Moldura Prodígio", description: "Moldura animada exclusiva", icon: Star },
    ],
  },
  {
    level: 50,
    xpRequired: 20000,
    title: "Lenda",
    color: "text-yellow-500",
    rewards: [
      { type: "cosmetic", id: "title_legend", name: "Título: Lenda", description: "O título mais prestigioso", icon: Trophy },
      { type: "cosmetic", id: "aura_legendary", name: "Aura Lendária", description: "Efeito de partículas douradas", icon: Crown },
      { type: "feature", id: "beta_access", name: "Acesso Beta", description: "Teste novos recursos antes", icon: Rocket },
    ],
  },
];

export const getLevelFromXP = (xp: number): Level => {
  let currentLevel = levels[0];
  for (const level of levels) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

export const getNextLevel = (xp: number): Level | null => {
  for (const level of levels) {
    if (xp < level.xpRequired) {
      return level;
    }
  }
  return null;
};

export const getLevelProgress = (xp: number): { current: number; next: number; progress: number } => {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = getNextLevel(xp);
  
  if (!nextLevel) {
    return { current: currentLevel.xpRequired, next: currentLevel.xpRequired, progress: 100 };
  }
  
  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);
  
  return { current: xp, next: nextLevel.xpRequired, progress };
};

export const getUnlockedRewards = (xp: number): LevelReward[] => {
  const currentLevel = getLevelFromXP(xp);
  const rewards: LevelReward[] = [];
  
  for (const level of levels) {
    if (level.level <= currentLevel.level) {
      rewards.push(...level.rewards);
    }
  }
  
  return rewards;
};

export const hasFeatureUnlocked = (xp: number, featureId: string): boolean => {
  const rewards = getUnlockedRewards(xp);
  return rewards.some(r => r.type === "feature" && r.id === featureId);
};
