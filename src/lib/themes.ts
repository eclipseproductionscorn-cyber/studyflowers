import { Palette, Sparkles, Moon, Sun, Flame, Snowflake, Leaf, Stars, Gem } from "lucide-react";

export interface ThemeColors {
  primary: string;
  primarySoft: string;
  primaryGlow: string;
  accent: string;
  accentSoft: string;
  background: string;
  card: string;
  border: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  icon: typeof Palette;
  price: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  requiredRank?: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  preview: string; // Gradient preview
}

export const appThemes: AppTheme[] = [
  {
    id: "default",
    name: "Clássico",
    description: "O tema padrão do StudyFlow",
    icon: Sun,
    price: 0,
    rarity: "common",
    preview: "from-blue-500 to-cyan-500",
    colors: {
      light: {
        primary: "215 70% 50%",
        primarySoft: "215 60% 95%",
        primaryGlow: "215 80% 60%",
        accent: "175 50% 45%",
        accentSoft: "175 40% 92%",
        background: "210 20% 98%",
        card: "0 0% 100%",
        border: "220 15% 90%",
      },
      dark: {
        primary: "215 70% 55%",
        primarySoft: "215 40% 20%",
        primaryGlow: "215 80% 65%",
        accent: "175 50% 50%",
        accentSoft: "175 30% 18%",
        background: "220 25% 8%",
        card: "220 25% 12%",
        border: "220 20% 20%",
      },
    },
  },
  {
    id: "aurora",
    name: "Aurora Boreal",
    description: "Cores mágicas do norte",
    icon: Stars,
    price: 500,
    rarity: "rare",
    preview: "from-emerald-400 via-purple-500 to-pink-500",
    colors: {
      light: {
        primary: "280 60% 55%",
        primarySoft: "280 50% 95%",
        primaryGlow: "280 70% 65%",
        accent: "160 60% 45%",
        accentSoft: "160 50% 92%",
        background: "270 15% 98%",
        card: "0 0% 100%",
        border: "280 15% 90%",
      },
      dark: {
        primary: "280 65% 60%",
        primarySoft: "280 40% 20%",
        primaryGlow: "280 75% 70%",
        accent: "160 55% 50%",
        accentSoft: "160 35% 18%",
        background: "270 25% 8%",
        card: "270 25% 12%",
        border: "280 20% 20%",
      },
    },
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    description: "Tons quentes e acolhedores",
    icon: Flame,
    price: 400,
    rarity: "uncommon",
    preview: "from-orange-400 via-rose-500 to-purple-600",
    colors: {
      light: {
        primary: "25 85% 55%",
        primarySoft: "25 70% 95%",
        primaryGlow: "25 90% 65%",
        accent: "340 65% 50%",
        accentSoft: "340 55% 92%",
        background: "30 20% 98%",
        card: "0 0% 100%",
        border: "30 15% 90%",
      },
      dark: {
        primary: "25 80% 55%",
        primarySoft: "25 50% 20%",
        primaryGlow: "25 85% 65%",
        accent: "340 60% 55%",
        accentSoft: "340 40% 18%",
        background: "15 25% 8%",
        card: "15 25% 12%",
        border: "25 20% 20%",
      },
    },
  },
  {
    id: "ocean",
    name: "Oceano Profundo",
    description: "Mergulhe nas profundezas",
    icon: Snowflake,
    price: 600,
    rarity: "rare",
    preview: "from-blue-600 via-cyan-500 to-teal-400",
    colors: {
      light: {
        primary: "200 80% 50%",
        primarySoft: "200 65% 95%",
        primaryGlow: "200 85% 60%",
        accent: "185 70% 45%",
        accentSoft: "185 60% 92%",
        background: "195 20% 98%",
        card: "0 0% 100%",
        border: "200 15% 90%",
      },
      dark: {
        primary: "200 75% 55%",
        primarySoft: "200 45% 20%",
        primaryGlow: "200 80% 65%",
        accent: "185 65% 50%",
        accentSoft: "185 40% 18%",
        background: "200 30% 6%",
        card: "200 28% 10%",
        border: "200 22% 18%",
      },
    },
  },
  {
    id: "forest",
    name: "Floresta Encantada",
    description: "Natureza e tranquilidade",
    icon: Leaf,
    price: 450,
    rarity: "uncommon",
    preview: "from-green-500 via-emerald-500 to-teal-500",
    colors: {
      light: {
        primary: "145 60% 45%",
        primarySoft: "145 50% 95%",
        primaryGlow: "145 70% 55%",
        accent: "165 55% 40%",
        accentSoft: "165 45% 92%",
        background: "140 15% 98%",
        card: "0 0% 100%",
        border: "145 15% 88%",
      },
      dark: {
        primary: "145 55% 50%",
        primarySoft: "145 35% 18%",
        primaryGlow: "145 65% 60%",
        accent: "165 50% 45%",
        accentSoft: "165 30% 16%",
        background: "150 25% 7%",
        card: "150 22% 11%",
        border: "145 18% 18%",
      },
    },
  },
  {
    id: "midnight",
    name: "Meia-Noite",
    description: "Elegância noturna",
    icon: Moon,
    price: 800,
    rarity: "epic",
    requiredRank: "gold_1",
    preview: "from-indigo-600 via-purple-700 to-slate-900",
    colors: {
      light: {
        primary: "250 60% 55%",
        primarySoft: "250 50% 95%",
        primaryGlow: "250 70% 65%",
        accent: "280 55% 50%",
        accentSoft: "280 45% 92%",
        background: "240 15% 97%",
        card: "0 0% 100%",
        border: "250 15% 88%",
      },
      dark: {
        primary: "250 65% 60%",
        primarySoft: "250 40% 18%",
        primaryGlow: "250 75% 70%",
        accent: "280 60% 55%",
        accentSoft: "280 35% 16%",
        background: "250 30% 5%",
        card: "250 28% 9%",
        border: "250 22% 16%",
      },
    },
  },
  {
    id: "neon",
    name: "Neon Cyber",
    description: "Estilo futurista cyberpunk",
    icon: Sparkles,
    price: 1200,
    rarity: "epic",
    requiredRank: "platinum_1",
    preview: "from-pink-500 via-fuchsia-500 to-cyan-400",
    colors: {
      light: {
        primary: "320 80% 55%",
        primarySoft: "320 65% 95%",
        primaryGlow: "320 90% 65%",
        accent: "185 85% 50%",
        accentSoft: "185 70% 92%",
        background: "300 15% 97%",
        card: "0 0% 100%",
        border: "320 15% 88%",
      },
      dark: {
        primary: "320 85% 60%",
        primarySoft: "320 50% 18%",
        primaryGlow: "320 95% 70%",
        accent: "185 80% 55%",
        accentSoft: "185 45% 16%",
        background: "280 35% 5%",
        card: "280 32% 8%",
        border: "320 25% 15%",
      },
    },
  },
  {
    id: "royal",
    name: "Realeza",
    description: "Ouro e elegância real",
    icon: Gem,
    price: 2500,
    rarity: "legendary",
    requiredRank: "diamond_1",
    preview: "from-yellow-400 via-amber-500 to-orange-600",
    colors: {
      light: {
        primary: "42 90% 50%",
        primarySoft: "42 75% 95%",
        primaryGlow: "42 95% 60%",
        accent: "25 80% 50%",
        accentSoft: "25 65% 92%",
        background: "40 15% 98%",
        card: "0 0% 100%",
        border: "42 20% 88%",
      },
      dark: {
        primary: "42 85% 55%",
        primarySoft: "42 50% 18%",
        primaryGlow: "42 90% 65%",
        accent: "25 75% 55%",
        accentSoft: "25 40% 16%",
        background: "35 30% 6%",
        card: "35 28% 10%",
        border: "42 22% 18%",
      },
    },
  },
];

export const getThemeById = (id: string) => {
  return appThemes.find((t) => t.id === id) || appThemes[0];
};

export const getRarityColor = (rarity: AppTheme["rarity"]) => {
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

export const getRarityLabel = (rarity: AppTheme["rarity"]) => {
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
