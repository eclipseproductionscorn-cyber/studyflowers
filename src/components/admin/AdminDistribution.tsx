import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Zap, Coins, Package, Users, Crown, Sparkles, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shopItems } from "@/lib/shopItems";

interface AdminUser {
  user_id: string;
  public_name: string;
  email: string;
  xp: number;
  coins: number;
}

interface Props {
  users: AdminUser[];
  currentAdminId: string;
  onRefresh: () => void;
}

const AdminDistribution = ({ users, currentAdminId, onRefresh }: Props) => {
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [xpAmount, setXpAmount] = useState("100");
  const [coinAmount, setCoinAmount] = useState("100");
  const [itemId, setItemId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [broadcastXp, setBroadcastXp] = useState("50");
  const [broadcastCoins, setBroadcastCoins] = useState("50");

  const logAction = async (action: string, target?: string, details?: string) => {
    await supabase.from("admin_logs").insert({
      admin_id: currentAdminId, action, target_user_id: target, details,
    });
  };

  const giveResources = async () => {
    if (!targetUserId) return toast.error("Selecione um usuário");
    setLoading(true);
    const xp = parseInt(xpAmount) || 0;
    const coins = parseInt(coinAmount) || 0;
    const target = users.find(u => u.user_id === targetUserId);
    if (!target) return setLoading(false);

    const { error } = await supabase.from("profiles").update({
      xp: target.xp + xp,
      coins: target.coins + coins,
    }).eq("user_id", targetUserId);

    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        title: "🎁 Presente do Admin!",
        message: `Você recebeu +${xp} XP e +${coins} 🪙`,
        type: "reward",
      });
      await logAction("give_resources", targetUserId, `+${xp} XP, +${coins} coins`);
      toast.success(`✨ ${target.public_name} recebeu +${xp} XP e +${coins} 🪙`);
      onRefresh();
    }
    setLoading(false);
  };

  const giveItem = async () => {
    if (!targetUserId || !itemId) return toast.error("Selecione usuário e item");
    setLoading(true);
    const item = shopItems.find(i => i.id === itemId);
    
    const { error } = await supabase.from("user_inventory").insert({
      user_id: targetUserId,
      item_id: itemId,
      item_type: item?.category || "special",
      quantity: 1,
    });

    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        title: "🎁 Item Recebido!",
        message: `Você recebeu: ${item?.name || itemId}`,
        type: "reward",
        link: "/inventory",
      });
      await logAction("give_item", targetUserId, `Item: ${itemId}`);
      toast.success(`📦 Item entregue!`);
      onRefresh();
    }
    setLoading(false);
  };

  const godMode = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      xp: 999999,
      coins: 999999,
    }).eq("user_id", currentAdminId);

    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      await logAction("god_mode_self", currentAdminId, "Set 999999 XP and coins");
      toast.success("🔥 MODO DEUS ATIVADO! 999.999 XP e 🪙");
      onRefresh();
    }
    setLoading(false);
  };

  const broadcastReward = async () => {
    setLoading(true);
    const xp = parseInt(broadcastXp) || 0;
    const coins = parseInt(broadcastCoins) || 0;
    
    if (xp === 0 && coins === 0) {
      toast.error("Defina algum valor");
      setLoading(false);
      return;
    }

    let success = 0;
    let failed = 0;
    
    for (const u of users) {
      const { error } = await supabase.from("profiles").update({
        xp: u.xp + xp,
        coins: u.coins + coins,
      }).eq("user_id", u.user_id);
      
      if (error) {
        failed++;
      } else {
        success++;
        await supabase.from("notifications").insert({
          user_id: u.user_id,
          title: "🎉 Evento Especial!",
          message: `Recompensa global: +${xp} XP, +${coins} 🪙`,
          type: "reward",
        });
      }
    }

    await logAction("broadcast_reward", undefined, `${success} users +${xp}XP +${coins}coins`);
    toast.success(`📢 Distribuído para ${success} usuários${failed > 0 ? ` (${failed} falhas)` : ""}`);
    onRefresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Crown size={32} />
          <div>
            <h2 className="text-2xl font-bold">Central de Distribuição</h2>
            <p className="text-white/90 text-sm">Conceda recursos, itens e recompensas globais</p>
          </div>
        </div>
      </div>

      {/* Modo Deus */}
      <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-xl font-bold">Modo Deus (Auto)</h3>
              <p className="text-white/90 text-sm">999.999 XP e moedas para sua conta admin instantâneo</p>
            </div>
          </div>
          <Button
            onClick={godMode}
            disabled={loading}
            size="lg"
            className="bg-white text-orange-600 hover:bg-white/90 font-bold"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> Ativar</>}
          </Button>
        </div>
      </motion.div>

      {/* Dar XP/Moedas */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="text-amber-500" />
          <h3 className="text-lg font-bold text-foreground">Dar XP e Moedas</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Usuário Alvo</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.public_name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>XP</Label>
              <Input type="number" value={xpAmount} onChange={e => setXpAmount(e.target.value)} />
            </div>
            <div>
              <Label>Moedas</Label>
              <Input type="number" value={coinAmount} onChange={e => setCoinAmount(e.target.value)} />
            </div>
          </div>
        </div>

        <Button onClick={giveResources} disabled={loading || !targetUserId} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" size={16} /> Conceder Recursos</>}
        </Button>
      </div>

      {/* Dar Item */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Package className="text-purple-500" />
          <h3 className="text-lg font-bold text-foreground">Dar Item da Loja</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Usuário Alvo</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>{u.public_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Item</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Selecione um item..." /></SelectTrigger>
              <SelectContent className="max-h-72">
                {shopItems.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    <span className="capitalize">[{i.rarity}]</span> {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={giveItem} disabled={loading || !targetUserId || !itemId} className="w-full" variant="secondary">
          {loading ? <Loader2 className="animate-spin" /> : <><Gift className="mr-2" size={16} /> Entregar Item</>}
        </Button>
      </div>

      {/* Broadcast Global */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-500" />
          <h3 className="text-lg font-bold text-foreground">Broadcast Global</h3>
          <Badge variant="destructive">Atinge {users.length} usuários</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>XP para todos</Label>
            <Input type="number" value={broadcastXp} onChange={e => setBroadcastXp(e.target.value)} />
          </div>
          <div>
            <Label>Moedas para todos</Label>
            <Input type="number" value={broadcastCoins} onChange={e => setBroadcastCoins(e.target.value)} />
          </div>
        </div>

        <Button onClick={broadcastReward} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" size={16} /> Distribuir para Todos</>}
        </Button>
      </div>
    </div>
  );
};

export default AdminDistribution;
