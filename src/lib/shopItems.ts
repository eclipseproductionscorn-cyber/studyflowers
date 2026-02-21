import { Box, Sparkles, Shield, Palette, Crown, Star, Zap, Heart, Gem, Flame, Award, Target, Clock, BookOpen, Rocket, Swords, Eye, Music } from "lucide-react";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: typeof Box;
  color: string;
  category: "boxes" | "boosts" | "cosmetics" | "special";
  requiredRank?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export const shopItems: ShopItem[] = [
  // Caixas
  {
    id: "mystery_box_common",
    name: "Caixa Misteriosa",
    description: "Contém recompensas aleatórias comuns",
    price: 100,
    icon: Box,
    color: "from-gray-500 to-gray-600",
    category: "boxes",
    rarity: "common",
  },
  {
    id: "mystery_box_rare",
    name: "Caixa Rara",
    description: "Maiores chances de itens raros",
    price: 300,
    icon: Box,
    color: "from-blue-500 to-cyan-500",
    category: "boxes",
    rarity: "rare",
    requiredRank: "gold_1",
  },
  {
    id: "mystery_box_epic",
    name: "Caixa Épica",
    description: "Itens exclusivos épicos",
    price: 750,
    icon: Box,
    color: "from-purple-500 to-pink-500",
    category: "boxes",
    rarity: "epic",
    requiredRank: "diamond_1",
  },
  {
    id: "mystery_box_legendary",
    name: "Caixa Lendária",
    description: "Os melhores itens do jogo",
    price: 2000,
    icon: Box,
    color: "from-yellow-400 to-orange-500",
    category: "boxes",
    rarity: "legendary",
    requiredRank: "ruby_1",
  },
  {
    id: "mystery_box_starter",
    name: "Caixa do Novato",
    description: "Perfeita para começar sua jornada!",
    price: 50,
    icon: Box,
    color: "from-green-400 to-emerald-500",
    category: "boxes",
    rarity: "common",
  },

  // Boosts
  {
    id: "xp_boost_1h",
    name: "Boost XP (1h)",
    description: "+50% XP por 1 hora",
    price: 150,
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    category: "boosts",
    rarity: "uncommon",
  },
  {
    id: "xp_boost_24h",
    name: "Boost XP (24h)",
    description: "+50% XP por 24 horas",
    price: 500,
    icon: Zap,
    color: "from-orange-500 to-red-500",
    category: "boosts",
    rarity: "rare",
    requiredRank: "silver_1",
  },
  {
    id: "xp_boost_double",
    name: "XP Dobrado (1h)",
    description: "+100% XP por 1 hora! O dobro de tudo!",
    price: 400,
    icon: Rocket,
    color: "from-red-500 to-pink-500",
    category: "boosts",
    rarity: "rare",
    requiredRank: "gold_1",
  },
  {
    id: "coin_boost_1h",
    name: "Boost Moedas (1h)",
    description: "+25% moedas por 1 hora",
    price: 200,
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    category: "boosts",
    rarity: "uncommon",
  },
  {
    id: "coin_boost_24h",
    name: "Boost Moedas (24h)",
    description: "+25% moedas por 24 horas",
    price: 600,
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
    category: "boosts",
    rarity: "rare",
    requiredRank: "silver_1",
  },
  {
    id: "streak_shield",
    name: "Escudo de Ofensiva",
    description: "Protege sua ofensiva por 1 dia",
    price: 350,
    icon: Shield,
    color: "from-blue-500 to-indigo-500",
    category: "boosts",
    rarity: "rare",
  },
  {
    id: "streak_shield_week",
    name: "Escudo Semanal",
    description: "Protege sua ofensiva por 7 dias",
    price: 1500,
    icon: Shield,
    color: "from-indigo-500 to-purple-500",
    category: "boosts",
    rarity: "epic",
    requiredRank: "platinum_1",
  },
  {
    id: "time_warp",
    name: "Distorção Temporal",
    description: "Recupera 1 dia perdido de ofensiva",
    price: 800,
    icon: Clock,
    color: "from-violet-500 to-purple-600",
    category: "boosts",
    rarity: "epic",
    requiredRank: "gold_1",
  },
  {
    id: "study_compass",
    name: "Bússola de Estudo",
    description: "Revela dicas extras nas atividades por 24h",
    price: 250,
    icon: BookOpen,
    color: "from-teal-400 to-cyan-500",
    category: "boosts",
    rarity: "uncommon",
  },

  // Cosméticos
  {
    id: "avatar_flame",
    name: "Avatar Chama",
    description: "Moldura de fogo para seu avatar",
    price: 500,
    icon: Flame,
    color: "from-orange-500 to-red-600",
    category: "cosmetics",
    rarity: "rare",
  },
  {
    id: "avatar_diamond",
    name: "Avatar Diamante",
    description: "Moldura cristalina exclusiva",
    price: 1200,
    icon: Gem,
    color: "from-cyan-400 to-blue-500",
    category: "cosmetics",
    rarity: "epic",
    requiredRank: "diamond_1",
  },
  {
    id: "avatar_crown",
    name: "Avatar Coroa",
    description: "Moldura dourada real",
    price: 2500,
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    category: "cosmetics",
    rarity: "legendary",
    requiredRank: "master_1",
  },
  {
    id: "avatar_neon",
    name: "Avatar Neon",
    description: "Moldura com efeito neon pulsante",
    price: 700,
    icon: Eye,
    color: "from-green-400 to-cyan-400",
    category: "cosmetics",
    rarity: "rare",
    requiredRank: "silver_1",
  },
  {
    id: "avatar_galaxy",
    name: "Avatar Galáxia",
    description: "Moldura cósmica com estrelas",
    price: 1800,
    icon: Sparkles,
    color: "from-indigo-500 to-purple-600",
    category: "cosmetics",
    rarity: "epic",
    requiredRank: "platinum_1",
  },
  {
    id: "name_color_gold",
    name: "Nome Dourado",
    description: "Seu nome aparece em dourado",
    price: 800,
    icon: Palette,
    color: "from-yellow-500 to-amber-500",
    category: "cosmetics",
    rarity: "rare",
    requiredRank: "gold_1",
  },
  {
    id: "name_color_rainbow",
    name: "Nome Arco-Íris",
    description: "Efeito arco-íris no seu nome",
    price: 3000,
    icon: Palette,
    color: "from-red-500 via-yellow-500 to-blue-500",
    category: "cosmetics",
    rarity: "legendary",
    requiredRank: "ruby_1",
  },
  {
    id: "name_color_ice",
    name: "Nome Gelo",
    description: "Seu nome brilha em azul glacial",
    price: 600,
    icon: Palette,
    color: "from-cyan-300 to-blue-400",
    category: "cosmetics",
    rarity: "uncommon",
  },
  {
    id: "badge_star",
    name: "Emblema Estrela",
    description: "Emblema brilhante exclusivo",
    price: 400,
    icon: Star,
    color: "from-yellow-400 to-orange-400",
    category: "cosmetics",
    rarity: "uncommon",
  },
  {
    id: "badge_heart",
    name: "Emblema Coração",
    description: "Mostre seu amor pelos estudos",
    price: 300,
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    category: "cosmetics",
    rarity: "uncommon",
  },
  {
    id: "badge_champion",
    name: "Emblema Campeão",
    description: "Para os verdadeiros campeões",
    price: 1500,
    icon: Award,
    color: "from-purple-500 to-indigo-500",
    category: "cosmetics",
    rarity: "epic",
    requiredRank: "onyx_1",
  },
  {
    id: "badge_sword",
    name: "Emblema Guerreiro",
    description: "Para quem luta pelos estudos diariamente",
    price: 900,
    icon: Swords,
    color: "from-red-600 to-orange-600",
    category: "cosmetics",
    rarity: "rare",
    requiredRank: "gold_1",
  },
  {
    id: "badge_music",
    name: "Emblema Harmonia",
    description: "Para os que estudam com ritmo",
    price: 350,
    icon: Music,
    color: "from-pink-400 to-violet-500",
    category: "cosmetics",
    rarity: "uncommon",
  },

  // Especiais
  {
    id: "mythic_aura",
    name: "Aura Mítica",
    description: "Efeito especial só para míticos",
    price: 10000,
    icon: Crown,
    color: "from-yellow-300 via-amber-400 to-orange-500",
    category: "special",
    rarity: "legendary",
    requiredRank: "mythic_1",
  },
  {
    id: "mythic_title",
    name: "Título: Lenda",
    description: "Título exclusivo 'Lenda' no perfil",
    price: 15000,
    icon: Target,
    color: "from-purple-400 via-pink-500 to-red-500",
    category: "special",
    rarity: "legendary",
    requiredRank: "mythic_2",
  },
  {
    id: "master_wings",
    name: "Asas de Mestre",
    description: "Efeito de asas no seu perfil",
    price: 5000,
    icon: Rocket,
    color: "from-sky-400 to-indigo-500",
    category: "special",
    rarity: "legendary",
    requiredRank: "master_1",
  },
  {
    id: "diamond_trail",
    name: "Trilha de Diamantes",
    description: "Partículas de diamante seguem seu avatar",
    price: 3500,
    icon: Gem,
    color: "from-cyan-300 to-blue-500",
    category: "special",
    rarity: "epic",
    requiredRank: "diamond_1",
  },
  {
    id: "onyx_shadow",
    name: "Sombra Ônix",
    description: "Aura sombria e misteriosa no perfil",
    price: 2500,
    icon: Eye,
    color: "from-gray-700 to-gray-900",
    category: "special",
    rarity: "epic",
    requiredRank: "onyx_1",
  },
];

export const getItemsByCategory = (category: ShopItem["category"]) => {
  return shopItems.filter((item) => item.category === category);
};

export const getRarityColor = (rarity: ShopItem["rarity"]) => {
  switch (rarity) {
    case "common":
      return "text-muted-foreground border-muted";
    case "uncommon":
      return "text-green-500 border-green-500/30";
    case "rare":
      return "text-blue-500 border-blue-500/30";
    case "epic":
      return "text-purple-500 border-purple-500/30";
    case "legendary":
      return "text-amber-500 border-amber-500/30";
  }
};

export const getRarityLabel = (rarity: ShopItem["rarity"]) => {
  switch (rarity) {
    case "common":
      return "Comum";
    case "uncommon":
      return "Incomum";
    case "rare":
      return "Raro";
    case "epic":
      return "Épico";
    case "legendary":
      return "Lendário";
  }
};
