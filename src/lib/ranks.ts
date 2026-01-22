export interface Rank {
  id: string;
  name: string;
  levels: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  xpRequired: number[];
  icon: "medal" | "star" | "crown" | "gem" | "flame";
}

export const ranks: Rank[] = [
  {
    id: "bronze",
    name: "Bronze",
    levels: ["I", "II", "III"],
    color: "text-rank-bronze",
    bgColor: "bg-rank-bronze",
    borderColor: "border-rank-bronze",
    xpRequired: [0, 100, 250],
    icon: "medal",
  },
  {
    id: "silver",
    name: "Prata",
    levels: ["I", "II", "III"],
    color: "text-rank-silver",
    bgColor: "bg-rank-silver",
    borderColor: "border-rank-silver",
    xpRequired: [500, 800, 1200],
    icon: "medal",
  },
  {
    id: "gold",
    name: "Ouro",
    levels: ["I", "II", "III"],
    color: "text-rank-gold",
    bgColor: "bg-rank-gold",
    borderColor: "border-rank-gold",
    xpRequired: [1800, 2500, 3500],
    icon: "medal",
  },
  {
    id: "platinum",
    name: "Platina",
    levels: ["I", "II", "III"],
    color: "text-rank-platinum",
    bgColor: "bg-rank-platinum",
    borderColor: "border-rank-platinum",
    xpRequired: [5000, 7000, 10000],
    icon: "star",
  },
  {
    id: "diamond",
    name: "Diamante",
    levels: ["I", "II", "III"],
    color: "text-rank-diamond",
    bgColor: "bg-rank-diamond",
    borderColor: "border-rank-diamond",
    xpRequired: [15000, 22000, 30000],
    icon: "gem",
  },
  {
    id: "onyx",
    name: "Ônix",
    levels: ["I", "II", "III"],
    color: "text-rank-onyx",
    bgColor: "bg-rank-onyx",
    borderColor: "border-rank-onyx",
    xpRequired: [40000, 55000, 75000],
    icon: "star",
  },
  {
    id: "ruby",
    name: "Rubi",
    levels: ["I", "II", "III"],
    color: "text-rank-ruby",
    bgColor: "bg-rank-ruby",
    borderColor: "border-rank-ruby",
    xpRequired: [100000, 130000, 170000],
    icon: "flame",
  },
  {
    id: "master",
    name: "Mestre",
    levels: ["I", "II", "III"],
    color: "text-rank-master",
    bgColor: "bg-rank-master",
    borderColor: "border-rank-master",
    xpRequired: [220000, 280000, 350000],
    icon: "crown",
  },
  {
    id: "mythic",
    name: "Mítico",
    levels: ["I", "II", "III"],
    color: "text-rank-mythic",
    bgColor: "bg-rank-mythic",
    borderColor: "border-rank-mythic",
    xpRequired: [450000, 600000, 800000],
    icon: "crown",
  },
];

export const getRankFromXP = (xp: number): { rankId: string; level: number } => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    const rank = ranks[i];
    for (let j = rank.levels.length - 1; j >= 0; j--) {
      if (xp >= rank.xpRequired[j]) {
        return { rankId: rank.id, level: j + 1 };
      }
    }
  }
  return { rankId: "bronze", level: 1 };
};

export const getRankString = (rankId: string, level: number): string => {
  return `${rankId}_${level}`;
};

export const parseRankString = (rankStr: string): { rankId: string; level: number } => {
  const [rankId, levelStr] = rankStr.split("_");
  return { rankId, level: parseInt(levelStr) || 1 };
};

export const getRankData = (rankStr: string): { rank: Rank; level: number } | null => {
  const { rankId, level } = parseRankString(rankStr);
  const rank = ranks.find((r) => r.id === rankId);
  if (!rank) return null;
  return { rank, level };
};

export const getNextRankXP = (currentXP: number): number | null => {
  for (const rank of ranks) {
    for (const xpRequired of rank.xpRequired) {
      if (xpRequired > currentXP) {
        return xpRequired;
      }
    }
  }
  return null;
};

export const getRankProgress = (xp: number): { current: number; next: number | null; progress: number } => {
  const { rankId, level } = getRankFromXP(xp);
  const rank = ranks.find((r) => r.id === rankId);
  if (!rank) return { current: 0, next: 100, progress: 0 };

  const currentRequired = rank.xpRequired[level - 1];
  const nextRequired = getNextRankXP(xp);

  if (!nextRequired) {
    return { current: currentRequired, next: null, progress: 100 };
  }

  const progress = ((xp - currentRequired) / (nextRequired - currentRequired)) * 100;
  return { current: currentRequired, next: nextRequired, progress: Math.min(progress, 100) };
};
