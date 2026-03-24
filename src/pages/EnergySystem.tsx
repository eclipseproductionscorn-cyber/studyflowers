import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Clock, ShoppingBag, Shield, Star, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MAX_HEARTS = 5;
const REGEN_INTERVAL_MS = 30 * 60 * 1000; // 30 min per heart
const ENERGY_KEY = "studyflow_energy";
const LAST_USED_KEY = "studyflow_energy_last";

interface EnergyState {
  hearts: number;
  lastUsedAt: number;
}

const BOOSTS = [
  { id: "extra_heart", name: "Coração Extra", emoji: "❤️‍🔥", cost: 100, description: "+1 coração instantâneo" },
  { id: "full_refill", name: "Recarga Total", emoji: "💖", cost: 300, description: "Recupera todos os corações" },
  { id: "shield", name: "Escudo", emoji: "🛡️", cost: 200, description: "Protege 1 coração por 1h" },
  { id: "double_xp", name: "XP Duplo", emoji: "⚡", cost: 150, description: "2x XP na próxima atividade" },
];

const EnergySystem = () => {
  const { profile, loading } = useAuth();
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [nextRegenIn, setNextRegenIn] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);

  const loadEnergy = useCallback(() => {
    try {
      const saved = localStorage.getItem(ENERGY_KEY);
      const lastUsed = localStorage.getItem(LAST_USED_KEY);
      if (saved && lastUsed) {
        const state: EnergyState = { hearts: parseInt(saved), lastUsedAt: parseInt(lastUsed) };
        const elapsed = Date.now() - state.lastUsedAt;
        const regened = Math.floor(elapsed / REGEN_INTERVAL_MS);
        const newHearts = Math.min(MAX_HEARTS, state.hearts + regened);
        setHearts(newHearts);
        saveEnergy(newHearts);
      }
    } catch {}
  }, []);

  const saveEnergy = (h: number) => {
    localStorage.setItem(ENERGY_KEY, h.toString());
    localStorage.setItem(LAST_USED_KEY, Date.now().toString());
  };

  useEffect(() => {
    loadEnergy();
  }, [loadEnergy]);

  useEffect(() => {
    if (hearts >= MAX_HEARTS) { setNextRegenIn(0); return; }
    const interval = setInterval(() => {
      const lastUsed = parseInt(localStorage.getItem(LAST_USED_KEY) || "0");
      const elapsed = Date.now() - lastUsed;
      const remaining = REGEN_INTERVAL_MS - (elapsed % REGEN_INTERVAL_MS);
      setNextRegenIn(remaining);

      if (elapsed >= REGEN_INTERVAL_MS) {
        const regened = Math.floor(elapsed / REGEN_INTERVAL_MS);
        setHearts(prev => {
          const newH = Math.min(MAX_HEARTS, prev + regened);
          saveEnergy(newH);
          return newH;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hearts]);

  const useHeart = () => {
    if (hearts <= 0) { toast.error("Sem corações! Espere regenerar ou compre na loja."); return; }
    if (shieldActive) { setShieldActive(false); toast.info("🛡️ Escudo usado! Coração protegido."); return; }
    const newH = hearts - 1;
    setHearts(newH);
    saveEnergy(newH);
    toast.success("❤️ Coração usado! Boa sorte na atividade!");
  };

  const buyBoost = (boost: typeof BOOSTS[0]) => {
    if (!profile || profile.coins < boost.cost) { toast.error("Moedas insuficientes!"); return; }
    switch (boost.id) {
      case "extra_heart":
        if (hearts >= MAX_HEARTS) { toast.error("Corações já estão cheios!"); return; }
        setHearts(prev => { const n = Math.min(MAX_HEARTS, prev + 1); saveEnergy(n); return n; });
        break;
      case "full_refill":
        setHearts(MAX_HEARTS); saveEnergy(MAX_HEARTS);
        break;
      case "shield":
        setShieldActive(true);
        break;
      case "double_xp":
        localStorage.setItem("studyflow_double_xp", "true");
        break;
    }
    toast.success(`${boost.emoji} ${boost.name} ativado!`);
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">❤️ Sistema de Energia</h1>
          <p className="text-muted-foreground">Gerencie seus corações para continuar estudando!</p>
        </motion.div>

        {/* Hearts Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-8 border border-red-500/20 text-center">
          <div className="flex justify-center gap-3 mb-4">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="relative">
                <motion.span animate={i < hearts ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: i < hearts ? Infinity : 0, delay: i * 0.3 }} className={`text-5xl ${i < hearts ? "" : "opacity-20 grayscale"}`}>
                  ❤️
                </motion.span>
                {shieldActive && i === hearts - 1 && (
                  <span className="absolute -top-1 -right-1 text-lg">🛡️</span>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-2xl font-bold">{hearts}/{MAX_HEARTS} Corações</p>

          {hearts < MAX_HEARTS && nextRegenIn > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>Próximo coração em <strong>{formatTime(nextRegenIn)}</strong></span>
              </div>
              <Progress value={((REGEN_INTERVAL_MS - nextRegenIn) / REGEN_INTERVAL_MS) * 100} className="h-2 mt-2 max-w-xs mx-auto" />
            </div>
          )}

          {hearts >= MAX_HEARTS && (
            <Badge className="mt-3 bg-green-500/20 text-green-500 border-green-500/30">✨ Energia Cheia!</Badge>
          )}
        </motion.div>

        {/* Use Heart Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={useHeart} disabled={hearts <= 0} className="w-full h-16 text-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <Heart className="mr-2" /> Usar Coração para Atividade
          </Button>
        </motion.div>

        {/* Boosts Shop */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" /> Loja de Energia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOOSTS.map(boost => (
              <motion.div key={boost.id} whileHover={{ scale: 1.03 }} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-4">
                <span className="text-4xl">{boost.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold">{boost.name}</p>
                  <p className="text-xs text-muted-foreground">{boost.description}</p>
                </div>
                <Button onClick={() => buyBoost(boost)} size="sm" variant="outline" className="flex items-center gap-1">
                  <span className="text-yellow-500">🪙</span> {boost.cost}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Clock, title: "Regeneração", desc: "1 coração a cada 30 minutos", color: "text-blue-500" },
            { icon: Shield, title: "Escudo", desc: "Protege 1 coração de ser gasto", color: "text-green-500" },
            { icon: Star, title: "Streaks", desc: "Mantenha streaks para bônus de energia", color: "text-yellow-500" },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-4 border border-border text-center">
              <Icon size={24} className={`${color} mx-auto mb-2`} />
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnergySystem;
