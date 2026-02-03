import { Eye, Ghost, Sparkles, Moon, Flame, Zap, Heart, Crown, Star, Rocket, Brain, Coffee, Gamepad2, Music, Sun } from "lucide-react";

export interface SecretAchievement {
  id: string;
  name: string;
  description: string;
  hint: string;
  icon: typeof Eye;
  color: string;
  xpReward: number;
  coinReward: number;
  trigger: string; // Identificador interno do trigger
  rarity: "secret" | "mythical" | "impossible";
}

export const secretAchievements: SecretAchievement[] = [
  {
    id: "night_owl",
    name: "Coruja Noturna",
    description: "Estudou após a meia-noite",
    hint: "Quando todos dormem, você brilha...",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
    xpReward: 100,
    coinReward: 200,
    trigger: "study_after_midnight",
    rarity: "secret",
  },
  {
    id: "early_bird",
    name: "Madrugador",
    description: "Estudou antes das 6h da manhã",
    hint: "O sol ainda dorme, mas você já está acordado...",
    icon: Sun,
    color: "from-amber-400 to-orange-500",
    xpReward: 100,
    coinReward: 200,
    trigger: "study_before_6am",
    rarity: "secret",
  },
  {
    id: "perfectionist",
    name: "Perfeccionista",
    description: "Acertou 10 questões seguidas",
    hint: "A perfeição é alcançável...",
    icon: Star,
    color: "from-yellow-400 to-amber-500",
    xpReward: 150,
    coinReward: 300,
    trigger: "10_correct_streak",
    rarity: "secret",
  },
  {
    id: "flash_master",
    name: "Mestre dos Flashcards",
    description: "Revisou 50 flashcards em uma sessão",
    hint: "Sua memória é uma máquina...",
    icon: Zap,
    color: "from-cyan-400 to-blue-500",
    xpReward: 200,
    coinReward: 400,
    trigger: "50_flashcards_session",
    rarity: "secret",
  },
  {
    id: "curious_mind",
    name: "Mente Curiosa",
    description: "Explorou todas as páginas do app",
    hint: "Cada canto esconde um segredo...",
    icon: Eye,
    color: "from-emerald-400 to-teal-500",
    xpReward: 100,
    coinReward: 150,
    trigger: "visit_all_pages",
    rarity: "secret",
  },
  {
    id: "chatty",
    name: "Tagarela",
    description: "Enviou 100 mensagens ao Teacher Samuk",
    hint: "A conversa é a chave do conhecimento...",
    icon: Brain,
    color: "from-purple-400 to-pink-500",
    xpReward: 150,
    coinReward: 300,
    trigger: "100_messages_samuk",
    rarity: "secret",
  },
  {
    id: "speed_demon",
    name: "Velocista",
    description: "Completou uma atividade em menos de 30 segundos",
    hint: "Rápido como um raio...",
    icon: Rocket,
    color: "from-red-400 to-orange-500",
    xpReward: 100,
    coinReward: 200,
    trigger: "complete_under_30s",
    rarity: "secret",
  },
  {
    id: "comeback_king",
    name: "Rei do Retorno",
    description: "Recuperou uma ofensiva perdida",
    hint: "Cair é humano, levantar é divino...",
    icon: Crown,
    color: "from-violet-400 to-purple-600",
    xpReward: 200,
    coinReward: 500,
    trigger: "recover_streak",
    rarity: "mythical",
  },
  {
    id: "ghost_mode",
    name: "Modo Fantasma",
    description: "Ficou 30 dias sem usar o app e voltou",
    hint: "Desapareceu, mas não foi esquecido...",
    icon: Ghost,
    color: "from-gray-400 to-slate-600",
    xpReward: 50,
    coinReward: 100,
    trigger: "return_after_30_days",
    rarity: "secret",
  },
  {
    id: "fire_keeper",
    name: "Guardião do Fogo",
    description: "Manteve uma ofensiva de 100 dias",
    hint: "A chama eterna queima em você...",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    xpReward: 500,
    coinReward: 1000,
    trigger: "100_day_streak",
    rarity: "mythical",
  },
  {
    id: "love_learning",
    name: "Amor ao Saber",
    description: "Completou atividades em todas as matérias",
    hint: "O conhecimento não tem fronteiras...",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    xpReward: 200,
    coinReward: 400,
    trigger: "all_subjects_completed",
    rarity: "secret",
  },
  {
    id: "zen_master",
    name: "Mestre Zen",
    description: "Usou o Pomodoro por 5 horas no total",
    hint: "A paciência é a maior virtude...",
    icon: Coffee,
    color: "from-amber-300 to-yellow-500",
    xpReward: 150,
    coinReward: 300,
    trigger: "5h_pomodoro",
    rarity: "secret",
  },
  {
    id: "gamer",
    name: "Jogador Nato",
    description: "Ganhou 10.000 XP total",
    hint: "O jogo está no seu sangue...",
    icon: Gamepad2,
    color: "from-green-400 to-emerald-500",
    xpReward: 300,
    coinReward: 600,
    trigger: "10000_total_xp",
    rarity: "mythical",
  },
  {
    id: "unstoppable",
    name: "Imparável",
    description: "Completou 50 atividades em um dia",
    hint: "Nada pode te deter...",
    icon: Sparkles,
    color: "from-blue-400 to-indigo-600",
    xpReward: 400,
    coinReward: 800,
    trigger: "50_activities_day",
    rarity: "impossible",
  },
  {
    id: "maestro",
    name: "Maestro",
    description: "Atingiu nível 50",
    hint: "A sinfonia do conhecimento toca para você...",
    icon: Music,
    color: "from-violet-500 to-purple-700",
    xpReward: 1000,
    coinReward: 2000,
    trigger: "reach_level_50",
    rarity: "impossible",
  },
];

export const getSecretAchievementById = (id: string): SecretAchievement | undefined => {
  return secretAchievements.find(a => a.id === id);
};

export const getRarityColor = (rarity: SecretAchievement["rarity"]): string => {
  switch (rarity) {
    case "secret":
      return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    case "mythical":
      return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    case "impossible":
      return "text-red-400 border-red-500/30 bg-red-500/10";
  }
};

export const getRarityLabel = (rarity: SecretAchievement["rarity"]): string => {
  switch (rarity) {
    case "secret":
      return "🔮 Secreta";
    case "mythical":
      return "✨ Mítica";
    case "impossible":
      return "💀 Impossível";
  }
};
