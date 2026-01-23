import { Zap, Eye, Shield, Clock, Brain, Sparkles, Target, Flame, Star, Crown, Gem, Rocket, Heart, Lightbulb } from "lucide-react";

export interface Power {
  id: string;
  name: string;
  description: string;
  effect: string;
  price: number;
  icon: typeof Zap;
  color: string;
  rarity: "rare" | "epic" | "legendary" | "mythic";
  requiredRank?: string;
  category: "learning" | "boost" | "protection" | "special";
}

export const powers: Power[] = [
  // Learning Powers
  {
    id: "hint_master",
    name: "Mestre das Dicas",
    description: "Revela uma dica extra em qualquer atividade",
    effect: "Mostra uma dica adicional para ajudar na resolução",
    price: 10000,
    icon: Lightbulb,
    color: "from-yellow-400 to-orange-500",
    rarity: "rare",
    category: "learning",
  },
  {
    id: "second_chance",
    name: "Segunda Chance",
    description: "Permite tentar novamente uma questão errada",
    effect: "Apaga a resposta errada e permite nova tentativa",
    price: 12000,
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    rarity: "rare",
    category: "learning",
  },
  {
    id: "time_freeze",
    name: "Congelar Tempo",
    description: "Para o tempo em atividades cronometradas",
    effect: "Congela o cronômetro por 5 minutos",
    price: 15000,
    icon: Clock,
    color: "from-cyan-400 to-blue-500",
    rarity: "epic",
    category: "learning",
    requiredRank: "gold_1",
  },
  {
    id: "reveal_answer",
    name: "Revelar Resposta",
    description: "Mostra a resposta correta e a explicação",
    effect: "Revela a resposta sem ganhar XP, apenas para aprender",
    price: 18000,
    icon: Eye,
    color: "from-purple-500 to-indigo-500",
    rarity: "epic",
    category: "learning",
    requiredRank: "platinum_1",
  },
  {
    id: "eliminate_wrong",
    name: "Eliminar Erradas",
    description: "Remove 2 alternativas incorretas",
    effect: "Elimina metade das opções erradas em múltipla escolha",
    price: 14000,
    icon: Target,
    color: "from-red-500 to-orange-500",
    rarity: "epic",
    category: "learning",
  },
  
  // Boost Powers
  {
    id: "xp_surge",
    name: "Surto de XP",
    description: "Triplica o XP da próxima atividade",
    effect: "3x XP na próxima atividade completada",
    price: 20000,
    icon: Zap,
    color: "from-yellow-500 to-amber-600",
    rarity: "epic",
    category: "boost",
    requiredRank: "diamond_1",
  },
  {
    id: "coin_explosion",
    name: "Explosão de Moedas",
    description: "Quintuplica as moedas da próxima recompensa",
    effect: "5x moedas na próxima atividade",
    price: 25000,
    icon: Sparkles,
    color: "from-amber-400 to-yellow-500",
    rarity: "legendary",
    category: "boost",
    requiredRank: "ruby_1",
  },
  {
    id: "genius_mode",
    name: "Modo Gênio",
    description: "Todas as atividades dão XP dobrado por 1 hora",
    effect: "2x XP por 60 minutos em todas as atividades",
    price: 35000,
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    rarity: "legendary",
    category: "boost",
    requiredRank: "master_1",
  },
  {
    id: "rocket_start",
    name: "Início Foguete",
    description: "Ganha 500 XP instantaneamente",
    effect: "+500 XP imediatos",
    price: 30000,
    icon: Rocket,
    color: "from-orange-500 to-red-600",
    rarity: "legendary",
    category: "boost",
    requiredRank: "onyx_1",
  },
  
  // Protection Powers
  {
    id: "streak_guardian",
    name: "Guardião da Ofensiva",
    description: "Protege sua ofensiva por 3 dias",
    effect: "Sua streak não será perdida por 3 dias",
    price: 22000,
    icon: Shield,
    color: "from-blue-500 to-cyan-600",
    rarity: "epic",
    category: "protection",
    requiredRank: "gold_1",
  },
  {
    id: "eternal_flame",
    name: "Chama Eterna",
    description: "Protege sua ofensiva por uma semana inteira",
    effect: "7 dias de proteção total da streak",
    price: 40000,
    icon: Flame,
    color: "from-orange-600 to-red-700",
    rarity: "legendary",
    category: "protection",
    requiredRank: "ruby_1",
  },
  
  // Special Powers (Mythic only)
  {
    id: "golden_touch",
    name: "Toque Dourado",
    description: "Toda atividade dá moedas extras por 24h",
    effect: "+100% moedas em todas as atividades por 24 horas",
    price: 50000,
    icon: Crown,
    color: "from-yellow-400 via-amber-500 to-orange-600",
    rarity: "mythic",
    category: "special",
    requiredRank: "mythic_1",
  },
  {
    id: "diamond_mind",
    name: "Mente de Diamante",
    description: "Desbloqueia explicações avançadas da IA",
    effect: "A IA Tutora dá explicações mais profundas e detalhadas",
    price: 45000,
    icon: Gem,
    color: "from-cyan-400 via-blue-500 to-purple-600",
    rarity: "mythic",
    category: "special",
    requiredRank: "mythic_1",
  },
  {
    id: "star_student",
    name: "Estudante Estrela",
    description: "Ganha emblema exclusivo e XP bônus permanente",
    effect: "+10% XP permanente e emblema 'Estrela' no perfil",
    price: 75000,
    icon: Star,
    color: "from-yellow-300 via-amber-400 to-orange-500",
    rarity: "mythic",
    category: "special",
    requiredRank: "mythic_2",
  },
];

export const getPowersByCategory = (category: Power["category"]) => {
  return powers.filter(p => p.category === category);
};

export const getRarityColor = (rarity: Power["rarity"]) => {
  switch (rarity) {
    case "rare":
      return "text-blue-500 border-blue-500/30";
    case "epic":
      return "text-purple-500 border-purple-500/30";
    case "legendary":
      return "text-amber-500 border-amber-500/30";
    case "mythic":
      return "text-pink-500 border-pink-500/30";
  }
};

export const getRarityLabel = (rarity: Power["rarity"]) => {
  switch (rarity) {
    case "rare":
      return "Raro";
    case "epic":
      return "Épico";
    case "legendary":
      return "Lendário";
    case "mythic":
      return "Mítico";
  }
};
