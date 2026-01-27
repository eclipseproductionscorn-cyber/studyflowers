import { Trophy, Flame, BookOpen, Star, Target, Crown, Zap, Award, Medal, Sparkles, Brain, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  requirement: number;
  type: "lessons" | "flashcards" | "streak" | "activities" | "ranking" | "xp" | "coins" | "login";
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  coinReward: number;
}

export const achievements: Achievement[] = [
  // Lessons & Activities
  {
    id: "first_lesson",
    name: "Primeiro Passo",
    description: "Complete sua primeira lição",
    icon: BookOpen,
    color: "text-green-500",
    bgColor: "bg-green-500",
    requirement: 1,
    type: "lessons",
    rarity: "common",
    xpReward: 25,
    coinReward: 10,
  },
  {
    id: "lesson_10",
    name: "Estudante Dedicado",
    description: "Complete 10 lições",
    icon: BookOpen,
    color: "text-green-500",
    bgColor: "bg-green-500",
    requirement: 10,
    type: "lessons",
    rarity: "common",
    xpReward: 100,
    coinReward: 50,
  },
  {
    id: "lesson_50",
    name: "Mestre do Conhecimento",
    description: "Complete 50 lições",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    requirement: 50,
    type: "lessons",
    rarity: "rare",
    xpReward: 500,
    coinReward: 200,
  },
  {
    id: "lesson_100",
    name: "Lenda Acadêmica",
    description: "Complete 100 lições",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    requirement: 100,
    type: "lessons",
    rarity: "legendary",
    xpReward: 1000,
    coinReward: 500,
  },

  // Flashcards
  {
    id: "flashcard_10",
    name: "Memória Afiada",
    description: "Acerte 10 flashcards",
    icon: Zap,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    requirement: 10,
    type: "flashcards",
    rarity: "common",
    xpReward: 50,
    coinReward: 25,
  },
  {
    id: "flashcard_100",
    name: "Mente Brilhante",
    description: "Acerte 100 flashcards",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500",
    requirement: 100,
    type: "flashcards",
    rarity: "epic",
    xpReward: 300,
    coinReward: 150,
  },
  {
    id: "flashcard_500",
    name: "Gênio Absoluto",
    description: "Acerte 500 flashcards",
    icon: Brain,
    color: "text-violet-500",
    bgColor: "bg-violet-500",
    requirement: 500,
    type: "flashcards",
    rarity: "legendary",
    xpReward: 1000,
    coinReward: 500,
  },

  // Streak
  {
    id: "streak_3",
    name: "Começando Bem",
    description: "Mantenha 3 dias de ofensiva",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    requirement: 3,
    type: "streak",
    rarity: "common",
    xpReward: 50,
    coinReward: 30,
  },
  {
    id: "streak_7",
    name: "Semana Perfeita",
    description: "Mantenha 7 dias de ofensiva",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    requirement: 7,
    type: "streak",
    rarity: "rare",
    xpReward: 200,
    coinReward: 100,
  },
  {
    id: "streak_30",
    name: "Mês Lendário",
    description: "Mantenha 30 dias de ofensiva",
    icon: Flame,
    color: "text-red-500",
    bgColor: "bg-red-500",
    requirement: 30,
    type: "streak",
    rarity: "epic",
    xpReward: 1000,
    coinReward: 500,
  },
  {
    id: "streak_100",
    name: "Imparável",
    description: "Mantenha 100 dias de ofensiva",
    icon: Flame,
    color: "text-red-600",
    bgColor: "bg-red-600",
    requirement: 100,
    type: "streak",
    rarity: "legendary",
    xpReward: 5000,
    coinReward: 2500,
  },

  // Ranking
  {
    id: "ranking_top50",
    name: "Subindo nas Paradas",
    description: "Entre no Top 50 do ranking",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    requirement: 50,
    type: "ranking",
    rarity: "rare",
    xpReward: 300,
    coinReward: 150,
  },
  {
    id: "ranking_top10",
    name: "Elite do Conhecimento",
    description: "Entre no Top 10 do ranking",
    icon: Trophy,
    color: "text-amber-400",
    bgColor: "bg-amber-400",
    requirement: 10,
    type: "ranking",
    rarity: "epic",
    xpReward: 750,
    coinReward: 400,
  },
  {
    id: "ranking_top1",
    name: "Número Um",
    description: "Conquiste o 1º lugar do ranking",
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400",
    requirement: 1,
    type: "ranking",
    rarity: "legendary",
    xpReward: 2000,
    coinReward: 1000,
  },

  // XP Milestones
  {
    id: "xp_1000",
    name: "Mil Experiências",
    description: "Acumule 1.000 XP",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    requirement: 1000,
    type: "xp",
    rarity: "common",
    xpReward: 100,
    coinReward: 50,
  },
  {
    id: "xp_10000",
    name: "Veterano",
    description: "Acumule 10.000 XP",
    icon: Medal,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500",
    requirement: 10000,
    type: "xp",
    rarity: "rare",
    xpReward: 500,
    coinReward: 250,
  },
  {
    id: "xp_100000",
    name: "Mestre Supremo",
    description: "Acumule 100.000 XP",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-600",
    requirement: 100000,
    type: "xp",
    rarity: "legendary",
    xpReward: 2500,
    coinReward: 1250,
  },
];

export const getRarityColor = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "common": return "border-gray-400/50 text-gray-600";
    case "rare": return "border-blue-400/50 text-blue-500";
    case "epic": return "border-purple-400/50 text-purple-500";
    case "legendary": return "border-amber-400/50 text-amber-500";
    default: return "border-gray-400/50 text-gray-600";
  }
};

export const getRarityLabel = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "common": return "Comum";
    case "rare": return "Raro";
    case "epic": return "Épico";
    case "legendary": return "Lendário";
    default: return "Comum";
  }
};

export const getAchievementProgress = (
  achievement: Achievement,
  stats: {
    lessonsCompleted: number;
    flashcardsCorrect: number;
    currentStreak: number;
    rankPosition: number;
    totalXP: number;
    totalCoins: number;
  }
): { current: number; percentage: number; unlocked: boolean } => {
  let current = 0;
  let requirement = achievement.requirement;

  switch (achievement.type) {
    case "lessons":
      current = stats.lessonsCompleted;
      break;
    case "flashcards":
      current = stats.flashcardsCorrect;
      break;
    case "streak":
      current = stats.currentStreak;
      break;
    case "ranking":
      // For ranking, lower is better
      if (stats.rankPosition > 0 && stats.rankPosition <= requirement) {
        current = requirement;
      } else {
        current = 0;
      }
      break;
    case "xp":
      current = stats.totalXP;
      break;
    case "coins":
      current = stats.totalCoins;
      break;
    default:
      current = 0;
  }

  const percentage = Math.min((current / requirement) * 100, 100);
  const unlocked = current >= requirement;

  return { current, percentage, unlocked };
};
