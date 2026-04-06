import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Shield, Crown, Trophy, Zap, Lock, MapPin, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fireConfetti, fireConfettiBurst, fireStars } from "@/lib/confetti";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Territory {
  id: string; name: string; description: string | null; region: string;
  x_position: number; y_position: number; size: string; icon: string; color: string;
  bonus_type: string; bonus_value: number; owner_guild_id: string | null;
  conquest_points: number; required_wins: number; is_capital: boolean;
  owner_guild?: { name: string; emblem: string; color: string } | null;
}

const SIZE_SCALE = { small: 48, medium: 64, large: 80 };
const REGION_COLORS: Record<string, string> = {
  norte: "from-cyan-500/10 to-blue-500/10",
  sul: "from-red-500/10 to-orange-500/10",
  leste: "from-amber-500/10 to-yellow-500/10",
  oeste: "from-violet-500/10 to-purple-500/10",
  central: "from-primary/10 to-accent/10",
};

const WorldMap = () => {
  const { profile, user } = useAuth();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selected, setSelected] = useState<Territory | null>(null);
  const [myGuildId, setMyGuildId] = useState<string | null>(null);

  useEffect(() => {
    loadTerritories();
    if (user) loadMyGuild();
  }, [user]);

  const loadTerritories = async () => {
    const { data } = await supabase.from("world_territories").select("*").order("created_at");
    if (!data) return;
    const withOwners = await Promise.all(
      (data as any[]).map(async (t) => {
        let owner_guild = null;
        if (t.owner_guild_id) {
          const { data: g } = await supabase.from("guilds").select("name, emblem, color").eq("id", t.owner_guild_id).single();
          owner_guild = g;
        }
        return { ...t, owner_guild } as Territory;
      })
    );
    setTerritories(withOwners);
  };

  const loadMyGuild = async () => {
    if (!user) return;
    const { data } = await supabase.from("guild_members").select("guild_id").eq("user_id", user.id).maybeSingle();
    if (data) setMyGuildId(data.guild_id);
  };

  const conquerTerritory = async (territory: Territory) => {
    if (!myGuildId) { toast.error("Você precisa estar em uma guilda!"); return; }
    const newPts = territory.conquest_points + 1;
    const conquered = newPts >= territory.required_wins;
    await supabase.from("world_territories").update({
      conquest_points: conquered ? 0 : newPts,
      owner_guild_id: conquered ? myGuildId : territory.owner_guild_id,
    }).eq("id", territory.id);
    if (conquered) toast.success(`🏴 Território "${territory.name}" conquistado!`);
    else toast.success(`⚔️ +1 ponto de conquista! (${newPts}/${territory.required_wins})`);
    loadTerritories();
    setSelected(null);
  };

  const ownedByMyGuild = (t: Territory) => t.owner_guild_id === myGuildId;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Globe className="text-primary" /> Mapa do Mundo
          </h1>
          <p className="text-muted-foreground mt-1">Conquiste territórios com sua guilda e domine o mapa!</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries({ norte: "❄️ Norte", sul: "🔥 Sul", leste: "🌅 Leste", oeste: "🌙 Oeste", central: "⭐ Central" }).map(([k, v]) => (
            <Badge key={k} variant="outline" className="text-xs gap-1">{v}</Badge>
          ))}
          <Badge variant="secondary" className="text-xs gap-1"><Lock size={10} /> Livre</Badge>
          <Badge className="text-xs gap-1 bg-primary"><Shield size={10} /> Conquistado</Badge>
        </div>

        {/* 3D Map Container */}
        <div className="relative w-full rounded-2xl border border-border/30 overflow-hidden"
          style={{ perspective: "1200px", minHeight: "600px" }}>
          
          {/* Background layers for 3D depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 60%, hsl(var(--accent) / 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.03) 0%, transparent 70%)
            `,
          }} />
          
          {/* Grid lines for depth */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 5}%`} x2="100%" y2={`${(i + 1) * 5}%`} stroke="currentColor" strokeWidth="1" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 5}%`} y1="0" x2={`${(i + 1) * 5}%`} y2="100%" stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>

          {/* Connection paths between territories */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
            {territories.map((t, i) => {
              const next = territories[(i + 1) % territories.length];
              if (!next) return null;
              return (
                <line key={`path-${i}`} x1={`${t.x_position}%`} y1={`${t.y_position}%`}
                  x2={`${next.x_position}%`} y2={`${next.y_position}%`}
                  stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="6 4" opacity="0.3" />
              );
            })}
          </svg>

          {/* Territory nodes */}
          <div className="relative w-full h-full" style={{ minHeight: "600px" }}>
            {territories.map((territory, i) => {
              const nodeSize = SIZE_SCALE[territory.size as keyof typeof SIZE_SCALE] || 56;
              const isOwned = !!territory.owner_guild_id;
              const isMine = ownedByMyGuild(territory);

              return (
                <motion.div
                  key={territory.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                  className="absolute z-[2] cursor-pointer group"
                  style={{
                    left: `${territory.x_position}%`,
                    top: `${territory.y_position}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => setSelected(territory)}
                >
                  {/* Glow effect */}
                  {territory.is_capital && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        width: nodeSize * 2, height: nodeSize * 2,
                        left: -nodeSize / 2, top: -nodeSize / 2,
                        background: `radial-gradient(circle, ${territory.color}30, transparent)`,
                      }}
                    />
                  )}

                  {/* 3D Node */}
                  <motion.div
                    whileHover={{ scale: 1.15, y: -8, rotateY: 10 }}
                    className="relative flex flex-col items-center"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Shadow */}
                    <div className="absolute rounded-full opacity-20 blur-md"
                      style={{
                        width: nodeSize * 0.8, height: nodeSize * 0.3,
                        bottom: -8, background: territory.color,
                      }}
                    />
                    
                    {/* Main node */}
                    <div
                      className={`rounded-2xl flex items-center justify-center border-2 transition-all relative overflow-hidden ${
                        isMine ? "shadow-lg ring-2 ring-primary/30" : isOwned ? "shadow-md" : "shadow-sm"
                      }`}
                      style={{
                        width: nodeSize, height: nodeSize,
                        borderColor: isOwned ? (territory.owner_guild?.color || territory.color) : territory.color + "60",
                        background: `linear-gradient(135deg, ${territory.color}15, ${territory.color}05)`,
                        backdropFilter: "blur(8px)",
                        transform: "translateZ(20px)",
                      }}
                    >
                      {/* Inner shine */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                      
                      <span style={{ fontSize: nodeSize * 0.45 }}>{territory.icon}</span>

                      {/* Owner badge */}
                      {isOwned && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-background"
                          style={{ background: territory.owner_guild?.color || "#666" }}>
                          {territory.owner_guild?.emblem || "?"}
                        </div>
                      )}

                      {/* Capital crown */}
                      {territory.is_capital && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Crown size={14} className="text-amber-400 drop-shadow" />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <span className="text-[10px] font-bold text-foreground">{territory.name}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                y: [0, -30, 0], x: [0, Math.sin(i) * 20, 0], opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
              style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 25}%` }}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total de Territórios", value: territories.length, icon: <MapPin size={16} /> },
            { label: "Conquistados", value: territories.filter(t => t.owner_guild_id).length, icon: <Shield size={16} /> },
            { label: "Seus Territórios", value: territories.filter(t => ownedByMyGuild(t)).length, icon: <Crown size={16} /> },
            { label: "Livres", value: territories.filter(t => !t.owner_guild_id).length, icon: <Sparkles size={16} /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
              <div className="text-primary mb-1 flex justify-center">{s.icon}</div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Territory Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selected?.icon}</span>
              {selected?.name}
              {selected?.is_capital && <Crown size={16} className="text-amber-400" />}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1"><MapPin size={12} /> {selected.region}</Badge>
                <Badge variant="outline" className="gap-1"><Star size={12} /> {selected.size}</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Zap size={12} /> +{selected.bonus_value} {selected.bonus_type === "xp" ? "XP" : "🪙"}
                </Badge>
              </div>

              {selected.owner_guild_id ? (
                <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: (selected.owner_guild?.color || "#666") + "20" }}>
                    {selected.owner_guild?.emblem || "?"}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Controlado por</p>
                    <p className="font-bold text-sm">{selected.owner_guild?.name || "Desconhecida"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <Lock size={20} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">Território Livre</p>
                  <p className="text-xs text-muted-foreground">Conquiste com sua guilda!</p>
                </div>
              )}

              {/* Conquest progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progresso de conquista</span>
                  <span className="font-bold">{selected.conquest_points}/{selected.required_wins}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    animate={{ width: `${(selected.conquest_points / selected.required_wins) * 100}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>

              {myGuildId && !ownedByMyGuild(selected) && (
                <Button onClick={() => conquerTerritory(selected)} className="w-full gap-2">
                  <Shield size={16} /> Atacar Território
                </Button>
              )}
              {ownedByMyGuild(selected) && (
                <div className="text-center text-sm text-primary font-medium flex items-center justify-center gap-2">
                  <Trophy size={16} /> Território da sua guilda!
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorldMap;
