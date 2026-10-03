import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Coins,
  Lock,
  Sparkles,
  Box,
  Zap,
  Palette,
  Crown,
  Check,
  Gift,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  shopItems,
  getItemsByCategory,
  getRarityColor,
  getRarityLabel,
  type ShopItem,
} from "@/lib/shopItems";
import { appThemes, getRarityColor as getThemeRarityColor, getRarityLabel as getThemeRarityLabel } from "@/lib/themes";
import { parseRankString, ranks } from "@/lib/ranks";
import { toast } from "sonner";

const categoryIcons = {
  boxes: Box,
  boosts: Zap,
  cosmetics: Palette,
  special: Crown,
  themes: Palette,
};

const categoryLabels = {
  boxes: "Caixas",
  boosts: "Boosts",
  cosmetics: "Cosméticos",
  special: "Especiais",
  themes: "Temas",
};

const Shop = () => {
  const { profile, updateProfile } = useAuth();
  const { currentTheme, setTheme, ownedThemes, purchaseTheme, isDark, toggleDarkMode } = useTheme();
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [isOpening, setIsOpening] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<{
    type: string;
    amount?: number;
    name?: string;
  } | null>(null);

  const canAfford = (price: number) => (profile?.coins || 0) >= price;

  const meetsRankRequirement = (requiredRank?: string) => {
    if (!requiredRank) return true;
    if (!profile?.current_rank) return false;

    const { rankId: currentRankId, level: currentLevel } = parseRankString(
      profile.current_rank
    );
    const { rankId: requiredRankId, level: requiredLevel } =
      parseRankString(requiredRank);

    const currentRankIndex = ranks.findIndex((r) => r.id === currentRankId);
    const requiredRankIndex = ranks.findIndex((r) => r.id === requiredRankId);

    if (currentRankIndex > requiredRankIndex) return true;
    if (currentRankIndex < requiredRankIndex) return false;
    return currentLevel >= requiredLevel;
  };

  const getRequiredRankName = (requiredRank: string) => {
    const { rankId, level } = parseRankString(requiredRank);
    const rank = ranks.find((r) => r.id === rankId);
    if (!rank) return requiredRank;
    return `${rank.name} ${["I", "II", "III"][level - 1]}`;
  };

  const purchaseItem = async (item: ShopItem) => {
    if (!canAfford(item.price) || !meetsRankRequirement(item.requiredRank)) {
      return;
    }

    await updateProfile({ coins: (profile?.coins || 0) - item.price });

    if (item.category === "boxes") {
      setIsOpening(item.id);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const rewards = [
        {
          type: "coins",
          amount:
            item.rarity === "legendary"
              ? 500
              : item.rarity === "epic"
              ? 250
              : item.rarity === "rare"
              ? 150
              : 50,
          weight: 40,
        },
        {
          type: "xp",
          amount:
            item.rarity === "legendary"
              ? 300
              : item.rarity === "epic"
              ? 150
              : item.rarity === "rare"
              ? 100
              : 50,
          weight: 35,
        },
        {
          type: "item",
          name:
            item.rarity === "legendary"
              ? "Avatar Lendário"
              : item.rarity === "epic"
              ? "Emblema Épico"
              : "Emblema Raro",
          weight: 25,
        },
      ];

      const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedReward = rewards[0];

      for (const reward of rewards) {
        random -= reward.weight;
        if (random <= 0) {
          selectedReward = reward;
          break;
        }
      }

      setLastReward(selectedReward);

      if (selectedReward.type === "coins" && selectedReward.amount) {
        await updateProfile({
          coins: (profile?.coins || 0) - item.price + selectedReward.amount,
        });
        toast.success(`💰 Você ganhou ${selectedReward.amount} moedas!`);
      } else if (selectedReward.type === "xp" && selectedReward.amount) {
        await updateProfile({ xp: (profile?.xp || 0) + selectedReward.amount });
        toast.success(`⚡ Você ganhou ${selectedReward.amount} XP!`);
      } else {
        toast.success(`🎁 Você ganhou: ${selectedReward.name}!`);
      }

      setIsOpening(null);
    } else if (item.category === "boosts") {
      if (profile?.user_id) {
        const { data: existing } = await supabase.from("user_inventory").select("id, quantity").eq("user_id", profile.user_id).eq("item_id", item.id).maybeSingle();
        if (existing) await supabase.from("user_inventory").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
        else await supabase.from("user_inventory").insert({ user_id: profile.user_id, item_id: item.id, item_type: "boost", quantity: 1 });
      }
      toast.success(`✅ ${item.name} comprado! Compre quantos quiser.`);
    } else {
      setPurchasedItems((prev) => [...prev, item.id]);
      toast.success(`✅ ${item.name} comprado com sucesso!`);
    }
  };

  const purchaseAndApplyTheme = async (themeId: string, price: number, requiredRank?: string) => {
    if (!canAfford(price)) {
      toast.error("Moedas insuficientes!");
      return;
    }
    if (!meetsRankRequirement(requiredRank)) {
      toast.error("Rank insuficiente!");
      return;
    }

    await updateProfile({ coins: (profile?.coins || 0) - price });
    purchaseTheme(themeId);
    setTheme(themeId);
    toast.success("🎨 Tema aplicado com sucesso!");
  };

  const renderItem = (item: ShopItem) => {
    const affordable = canAfford(item.price);
    const meetsRank = meetsRankRequirement(item.requiredRank);
    const isLocked = !meetsRank;
    const isPurchased =
      purchasedItems.includes(item.id) && item.category !== "boxes";
    const isCurrentlyOpening = isOpening === item.id;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!isLocked && !isPurchased ? { scale: 1.02 } : {}}
        className={`relative bg-card/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
          isLocked
            ? "opacity-50 border-border/30"
            : isPurchased
            ? "border-success/50 bg-success/5"
            : `border-border/50 hover:border-primary/30 ${getRarityColor(
                item.rarity
              )}`
        }`}
      >
        <div className="absolute top-3 right-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${getRarityColor(
              item.rarity
            )} bg-background/50`}
          >
            {getRarityLabel(item.rarity)}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <motion.div
              animate={
                isCurrentlyOpening
                  ? { rotate: [0, 10, -10, 10, -10, 0], scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: isCurrentlyOpening ? Infinity : 0,
              }}
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto`}
            >
              <item.icon className="text-white" size={32} />
            </motion.div>
            {isCurrentlyOpening && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-white/30 rounded-xl"
              />
            )}
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </div>

          {isLocked && item.requiredRank && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock size={12} />
              <span>Requer {getRequiredRankName(item.requiredRank)}</span>
            </div>
          )}

          <div className="mt-auto">
            <div className="flex items-center justify-center gap-1 mb-3">
              <Coins size={18} className="text-rank-gold" />
              <span className="text-lg font-bold">
                {item.price.toLocaleString()}
              </span>
            </div>

            {isPurchased ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <Check size={18} />
                <span className="font-medium">Comprado</span>
              </div>
            ) : (
              <Button
                onClick={() => purchaseItem(item)}
                disabled={!affordable || isLocked || isCurrentlyOpening}
                className="w-full"
                variant={affordable && !isLocked ? "default" : "secondary"}
              >
                {isCurrentlyOpening ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : isLocked ? (
                  <>
                    <Lock size={16} className="mr-1" />
                    Bloqueado
                  </>
                ) : !affordable ? (
                  "Moedas insuficientes"
                ) : (
                  <>
                    <ShoppingBag size={16} className="mr-1" />
                    Comprar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="text-primary" />
              Loja
            </h1>
            <p className="text-muted-foreground mt-1">
              Gaste suas moedas em itens exclusivos
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 bg-card/50 border border-border/50 rounded-full">
              <Sun size={16} className="text-muted-foreground" />
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
              <Moon size={16} className="text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rank-gold/20 to-amber-500/20 border border-rank-gold/30 rounded-full">
              <Coins className="text-rank-gold" size={22} />
              <span className="font-bold text-lg">
                {profile?.coins?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Last Reward */}
        <AnimatePresence>
          {lastReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="text-purple-500" size={20} />
                <span className="font-semibold text-foreground">
                  Última Recompensa
                </span>
              </div>
              <p className="text-lg font-bold text-purple-400">
                {lastReward.type === "coins" && `💰 ${lastReward.amount} moedas`}
                {lastReward.type === "xp" && `⚡ ${lastReward.amount} XP`}
                {lastReward.type === "item" && `🎁 ${lastReward.name}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shop Tabs */}
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-card/50 border border-border/50">
            {(["themes", "boxes", "boosts", "cosmetics", "special"] as const).map(
              (category) => {
                const Icon = categoryIcons[category];
                return (
                  <TabsTrigger key={category} value={category} className="gap-2">
                    <Icon size={16} />
                    <span className="hidden md:inline">
                      {categoryLabels[category]}
                    </span>
                  </TabsTrigger>
                );
              }
            )}
          </TabsList>

          {/* Themes Tab */}
          <TabsContent value="themes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {appThemes.map((theme) => {
                const isOwned = ownedThemes.includes(theme.id);
                const isActive = currentTheme.id === theme.id;
                const affordable = canAfford(theme.price);
                const meetsRank = meetsRankRequirement(theme.requiredRank);
                const isLocked = !meetsRank;

                return (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!isLocked ? { scale: 1.02 } : {}}
                    className={`relative bg-card/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
                      isActive
                        ? "border-primary ring-2 ring-primary/20"
                        : isLocked
                        ? "opacity-50 border-border/30"
                        : `border-border/50 hover:border-primary/30`
                    }`}
                  >
                    {/* Rarity Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getThemeRarityColor(
                          theme.rarity
                        )} bg-background/50`}
                      >
                        {getThemeRarityLabel(theme.rarity)}
                      </span>
                    </div>

                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Ativo
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {/* Preview */}
                      <div
                        className={`w-full h-20 rounded-xl bg-gradient-to-r ${theme.preview} flex items-center justify-center`}
                      >
                        <theme.icon className="text-white drop-shadow-lg" size={32} />
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {theme.description}
                        </p>
                      </div>

                      {/* Lock Reason */}
                      {isLocked && theme.requiredRank && (
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Lock size={12} />
                          <span>
                            Requer {getRequiredRankName(theme.requiredRank)}
                          </span>
                        </div>
                      )}

                      {/* Action */}
                      <div className="mt-auto">
                        {!isOwned && (
                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Coins size={18} className="text-rank-gold" />
                            <span className="text-lg font-bold">
                              {theme.price.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {isOwned ? (
                          isActive ? (
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <Check size={18} />
                              <span className="font-medium">Em Uso</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setTheme(theme.id)}
                              className="w-full"
                              variant="outline"
                            >
                              <Palette size={16} className="mr-1" />
                              Aplicar
                            </Button>
                          )
                        ) : (
                          <Button
                            onClick={() =>
                              purchaseAndApplyTheme(
                                theme.id,
                                theme.price,
                                theme.requiredRank
                              )
                            }
                            disabled={!affordable || isLocked}
                            className="w-full"
                            variant={affordable && !isLocked ? "default" : "secondary"}
                          >
                            {isLocked ? (
                              <>
                                <Lock size={16} className="mr-1" />
                                Bloqueado
                              </>
                            ) : !affordable ? (
                              "Moedas insuficientes"
                            ) : (
                              <>
                                <ShoppingBag size={16} className="mr-1" />
                                Comprar e Aplicar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {(["boxes", "boosts", "cosmetics", "special"] as const).map(
            (category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {getItemsByCategory(category).map(renderItem)}
                </div>

                {category === "special" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 text-center"
                  >
                    <Crown className="mx-auto text-amber-500 mb-2" size={32} />
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      Itens Especiais
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Esses itens exclusivos só estão disponíveis para jogadores de
                      rank{" "}
                      <span className="text-rank-mythic font-medium">Mítico</span>.
                      Continue evoluindo para desbloquear!
                    </p>
                  </motion.div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>

        {/* Earning Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            Como ganhar moedas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Atividades diárias</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Manter ofensiva</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Metas semanais</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Pomodoro</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Shop;
