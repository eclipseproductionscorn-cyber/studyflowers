import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Coins,
  Sparkles,
  Box,
  User,
  Star,
  Trophy,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const mysteryBoxRewards = [
  { type: "coins", amount: 50, rarity: "common", icon: "💰" },
  { type: "coins", amount: 100, rarity: "uncommon", icon: "💰" },
  { type: "coins", amount: 250, rarity: "rare", icon: "💰" },
  { type: "xp", amount: 50, rarity: "common", icon: "⚡" },
  { type: "xp", amount: 100, rarity: "uncommon", icon: "⚡" },
  { type: "avatar", name: "Avatar Especial", rarity: "rare", icon: "👤" },
  { type: "badge", name: "Emblema Estudante", rarity: "uncommon", icon: "🏅" },
];

const shopItems = [
  {
    id: "mystery_box",
    name: "Caixa Misteriosa",
    description: "Contém recompensas aleatórias",
    price: 100,
    icon: Box,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "xp_boost",
    name: "Boost de XP",
    description: "+50% XP por 1 hora",
    price: 200,
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
    locked: true,
  },
  {
    id: "streak_shield",
    name: "Escudo de Ofensiva",
    description: "Protege sua ofensiva por 1 dia",
    price: 300,
    icon: Trophy,
    color: "from-blue-500 to-cyan-500",
    locked: true,
  },
];

const RewardsPage = () => {
  const { profile, addCoins, addXP, updateProfile } = useAuth();
  const [isOpening, setIsOpening] = useState(false);
  const [lastReward, setLastReward] = useState<typeof mysteryBoxRewards[0] | null>(null);

  const openMysteryBox = async () => {
    if (!profile || profile.coins < 100) {
      toast.error("Moedas insuficientes!");
      return;
    }

    setIsOpening(true);
    await updateProfile({ coins: profile.coins - 100 });

    // Simulate opening animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random reward
    const rarityRoll = Math.random();
    let rarity: string;
    if (rarityRoll < 0.6) rarity = "common";
    else if (rarityRoll < 0.9) rarity = "uncommon";
    else rarity = "rare";

    const possibleRewards = mysteryBoxRewards.filter((r) => r.rarity === rarity);
    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

    setLastReward(reward);

    if (reward.type === "coins" && reward.amount) {
      await addCoins(reward.amount);
      toast.success(`${reward.icon} Você ganhou ${reward.amount} moedas!`);
    } else if (reward.type === "xp" && reward.amount) {
      await addXP(reward.amount);
      toast.success(`${reward.icon} Você ganhou ${reward.amount} XP!`);
    } else {
      toast.success(`${reward.icon} Você ganhou: ${reward.name}!`);
    }

    setIsOpening(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-muted-foreground";
      case "uncommon":
        return "text-green-500";
      case "rare":
        return "text-purple-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Recompensas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gaste suas moedas em itens especiais
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-rank-gold/10 rounded-full">
            <Coins className="text-rank-gold" size={20} />
            <span className="font-bold text-lg">
              {profile?.coins?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        {/* Mystery Box Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <motion.div
              animate={isOpening ? { rotate: [0, 10, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isOpening ? Infinity : 0 }}
              className="relative"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Gift className="text-white" size={64} />
              </div>
              {isOpening && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30 rounded-2xl"
                />
              )}
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Caixa Misteriosa
              </h2>
              <p className="text-muted-foreground mb-4">
                Abra para ganhar moedas, XP, avatares exclusivos ou emblemas raros!
              </p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                  60% Comum
                </span>
                <span className="text-xs px-2 py-1 bg-green-500/10 rounded-full text-green-500">
                  30% Incomum
                </span>
                <span className="text-xs px-2 py-1 bg-purple-500/10 rounded-full text-purple-500">
                  10% Raro
                </span>
              </div>

              <Button
                onClick={openMysteryBox}
                disabled={isOpening || (profile?.coins || 0) < 100}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                {isOpening ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Gift className="mr-2" size={20} />
                    Abrir por 100 moedas
                  </>
                )}
              </Button>
            </div>
          </div>

          {lastReward && !isOpening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-card/50 rounded-xl text-center"
            >
              <p className="text-sm text-muted-foreground">Última recompensa:</p>
              <p className={`text-lg font-bold ${getRarityColor(lastReward.rarity)}`}>
                {lastReward.icon}{" "}
                {lastReward.type === "coins" || lastReward.type === "xp"
                  ? `${lastReward.amount} ${lastReward.type === "coins" ? "moedas" : "XP"}`
                  : lastReward.name}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Shop Items */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Loja</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shopItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 ${
                  item.locked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.color}`}
                  >
                    <item.icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {item.name}
                      </h4>
                      {item.locked && <Lock size={14} className="text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Coins size={14} className="text-rank-gold" />
                      <span className="font-medium">{item.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Earning Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-3">Como ganhar moedas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-rank-gold" />
              <span className="text-muted-foreground">Atividades diárias</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-rank-gold" />
              <span className="text-muted-foreground">Manter ofensiva</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-rank-gold" />
              <span className="text-muted-foreground">Pomodoro completo</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-rank-gold" />
              <span className="text-muted-foreground">Subir de nível</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default RewardsPage;
