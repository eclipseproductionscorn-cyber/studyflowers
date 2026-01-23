import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Zap, Shield, Sparkles, Crown, Box, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingElements } from "@/components/FloatingElements";

interface InventoryItem {
  id: string;
  item_id: string;
  item_type: string;
  quantity: number;
  is_active: boolean;
  acquired_at: string;
  expires_at: string | null;
}

// Mock data for demo - would come from database
const mockInventory: InventoryItem[] = [
  { id: "1", item_id: "xp_boost_1h", item_type: "boost", quantity: 2, is_active: false, acquired_at: new Date().toISOString(), expires_at: null },
  { id: "2", item_id: "streak_shield", item_type: "boost", quantity: 1, is_active: true, acquired_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000).toISOString() },
  { id: "3", item_id: "avatar_flame", item_type: "cosmetic", quantity: 1, is_active: true, acquired_at: new Date().toISOString(), expires_at: null },
  { id: "4", item_id: "hint_master", item_type: "power", quantity: 3, is_active: false, acquired_at: new Date().toISOString(), expires_at: null },
  { id: "5", item_id: "second_chance", item_type: "power", quantity: 1, is_active: false, acquired_at: new Date().toISOString(), expires_at: null },
];

const itemDetails: Record<string, { name: string; description: string; icon: typeof Box; color: string }> = {
  xp_boost_1h: { name: "Boost XP (1h)", description: "+50% XP por 1 hora", icon: Zap, color: "from-yellow-500 to-amber-500" },
  streak_shield: { name: "Escudo de Ofensiva", description: "Protege sua ofensiva", icon: Shield, color: "from-blue-500 to-indigo-500" },
  avatar_flame: { name: "Avatar Chama", description: "Moldura de fogo", icon: Sparkles, color: "from-orange-500 to-red-500" },
  hint_master: { name: "Mestre das Dicas", description: "Revela dica extra", icon: Sparkles, color: "from-yellow-400 to-orange-500" },
  second_chance: { name: "Segunda Chance", description: "Tente novamente", icon: Crown, color: "from-pink-500 to-rose-500" },
  time_freeze: { name: "Congelar Tempo", description: "Para o cronômetro", icon: Shield, color: "from-cyan-400 to-blue-500" },
};

const Inventory = () => {
  const { profile } = useAuth();
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredInventory = inventory.filter(item => {
    const details = itemDetails[item.item_id];
    const matchesSearch = details?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || item.item_type === activeTab;
    return matchesSearch && matchesTab;
  });

  const activateItem = async (item: InventoryItem) => {
    if (item.is_active) {
      toast.info("Este item já está ativo!");
      return;
    }

    // Here would be the logic to activate the item
    toast.success(`${itemDetails[item.item_id]?.name} ativado!`);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expirado";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d restantes`;
    }
    return `${hours}h ${minutes}m restantes`;
  };

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements count={10} className="opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Package className="text-primary" />
              Inventário
            </h1>
            <p className="text-muted-foreground mt-1">
              Seus itens, poderes e cosméticos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <p className="text-3xl font-bold text-foreground">{inventory.length}</p>
            <p className="text-sm text-muted-foreground">Total de Itens</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <p className="text-3xl font-bold text-primary">{inventory.filter(i => i.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <p className="text-3xl font-bold text-accent">{inventory.filter(i => i.item_type === "power").length}</p>
            <p className="text-sm text-muted-foreground">Poderes</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <p className="text-3xl font-bold text-rank-gold">{inventory.filter(i => i.item_type === "cosmetic").length}</p>
            <p className="text-sm text-muted-foreground">Cosméticos</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="power">Poderes</TabsTrigger>
            <TabsTrigger value="boost">Boosts</TabsTrigger>
            <TabsTrigger value="cosmetic">Cosméticos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredInventory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Package className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-medium text-foreground">Inventário vazio</h3>
                <p className="text-muted-foreground">
                  Visite a loja para comprar itens!
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.href = "/shop"}
                >
                  Ir para Loja
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item, index) => {
                  const details = itemDetails[item.item_id];
                  if (!details) return null;
                  
                  const Icon = details.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-card/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
                        item.is_active 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${details.color} shrink-0`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{details.name}</h3>
                              <p className="text-sm text-muted-foreground">{details.description}</p>
                            </div>
                            {item.quantity > 1 && (
                              <Badge variant="secondary" className="shrink-0">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {item.is_active ? (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-xs text-primary font-medium">
                                  {item.expires_at ? getTimeRemaining(item.expires_at) : "Ativo"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Disponível</span>
                            )}

                            <Button
                              size="sm"
                              variant={item.is_active ? "secondary" : "default"}
                              onClick={() => activateItem(item)}
                              disabled={item.is_active}
                            >
                              {item.is_active ? "Ativo" : "Usar"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Inventory;
