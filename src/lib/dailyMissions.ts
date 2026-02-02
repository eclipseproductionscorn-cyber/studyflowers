import { Target, Brain, Clock, Flame, BookOpen, Zap, Trophy, Star } from "lucide-react";

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: typeof Target;
  target: number;
  xpReward: number;
  coinReward: number;
  type: "activities" | "flashcards" | "pomodoro" | "streak" | "xp" | "perfect";
  gradient: string;
}

// Missions pool - 3 are selected daily
export const missionPool: DailyMission[] = [
  {
    id: "complete_3_activities",
    title: "Estudante Dedicado",
    description: "Complete 3 atividades",
    icon: Target,
    target: 3,
    xpReward: 50,
    coinReward: 25,
    type: "activities",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "complete_5_activities",
    title: "Maratona de Estudos",
    description: "Complete 5 atividades",
    icon: Trophy,
    target: 5,
    xpReward: 100,
    coinReward: 50,
    type: "activities",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "review_10_flashcards",
    title: "Mestre da Memória",
    description: "Revise 10 flashcards",
    icon: Brain,
    target: 10,
    xpReward: 40,
    coinReward: 20,
    type: "flashcards",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "review_20_flashcards",
    title: "Cérebro Turbo",
    description: "Revise 20 flashcards",
    icon: Zap,
    target: 20,
    xpReward: 80,
    coinReward: 40,
    type: "flashcards",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    id: "pomodoro_2",
    title: "Foco Total",
    description: "Complete 2 sessões Pomodoro",
    icon: Clock,
    target: 2,
    xpReward: 60,
    coinReward: 30,
    type: "pomodoro",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "pomodoro_4",
    title: "Produtividade Máxima",
    description: "Complete 4 sessões Pomodoro",
    icon: Clock,
    target: 4,
    xpReward: 120,
    coinReward: 60,
    type: "pomodoro",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "maintain_streak",
    title: "Consistência é Chave",
    description: "Mantenha sua ofensiva ativa",
    icon: Flame,
    target: 1,
    xpReward: 30,
    coinReward: 15,
    type: "streak",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "earn_100_xp",
    title: "Caçador de XP",
    description: "Ganhe 100 XP hoje",
    icon: Star,
    target: 100,
    xpReward: 50,
    coinReward: 25,
    type: "xp",
    gradient: "from-teal-500 to-green-500",
  },
  {
    id: "perfect_3",
    title: "Perfeição",
    description: "Acerte 3 questões seguidas",
    icon: BookOpen,
    target: 3,
    xpReward: 75,
    coinReward: 35,
    type: "perfect",
    gradient: "from-rose-500 to-pink-500",
  },
];

// Generate daily missions based on date seed
export const getDailyMissions = (date: Date = new Date()): DailyMission[] => {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  // Simple seeded shuffle
  const shuffled = [...missionPool].sort((a, b) => {
    const hashA = (seed * 31 + a.id.charCodeAt(0)) % 1000;
    const hashB = (seed * 31 + b.id.charCodeAt(0)) % 1000;
    return hashA - hashB;
  });

  return shuffled.slice(0, 3);
};

// Get time remaining until mission reset
export const getTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};
