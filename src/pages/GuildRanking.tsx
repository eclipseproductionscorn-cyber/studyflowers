import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Shield, Star, Medal, Map, Swords, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Guild {
  id: string; name: string; emblem: string; color: string; level: number;
  total_xp: number; total_wins: number;
}

interface Season {
  id: string; season_number: number; title: string; starts_at: string; ends_at: string; status: string;
}

interface SeasonResult {
  id: string; season_id: string; guild_id: string; final_rank: number;
  total_score: number; territories_held: number; wars_won: number; trophies_earned: number;
  guild?: Guild;
}

const RANK_STYLES = [
  { bg: "from-amber-400/20 to-amber-500/10", border: "border-amber-400/40", icon: Crown, color: "text-amber-400", label: "🥇" },
  { bg: "from-gray-300/20 to-gray-400/10", border: "border-gray-400/40", icon: Medal, color: "text-gray-400", label: "🥈" },
  { bg: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/40", icon: Medal, color: "text-orange-500", label: "🥉" },
];

const TROPHY_TIERS = [
  { min: 1, max: 1, icon: "🏆", name: "Campeã", color: "text-amber-400" },
  { min: 2, max: 3, icon: "🥈", name: "Elite", color: "text-gray-400" },
  { min: 4, max: 10, icon: "🎖️", name: "Destaque", color: "text-orange-500" },
];

const GuildRanking = () => {
  const { profile } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [seasonResults, setSeasonResults] = useState<SeasonResult[]>([]);
  const [territories, setTerritories] = useState<Record<string, number>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [{ data: g }, { data: s }, { data: t }] = await Promise.all([
      supabase.from("guilds").select("*").order("total_xp", { ascending: false }),
      supabase.from("guild_seasons").select("*").order("season_number", { ascending: false }),
      supabase.from("world_territories").select("owner_guild_id"),
    ]);
    if (g) setGuilds(g as Guild[]);
    if (s) {
      setSeasons(s as Season[]);
      if (s.length > 0) {
        setSelectedSeason(s[0].id);
        loadSeasonResults(s[0].id);
      }
    }
    if (t) {
      const counts: Record<string, number> = {};
      (t as any[]).forEach(ter => { if (ter.owner_guild_id) counts[ter.owner_guild_id] = (counts[ter.owner_guild_id] || 0) + 1; });
      setTerritories(counts);
    }
  };

  const loadSeasonResults = async (seasonId: string) => {
    const { data } = await supabase.from("guild_season_results").select("*").eq("season_id", seasonId).order("final_rank");
    if (data) {
      const withGuilds = await Promise.all(
        (data as any[]).map(async (r) => {
          const { data: g } = await supabase.from("guilds").select("*").eq("id", r.guild_id).single();
          return { ...r, guild: g } as SeasonResult;
        })
      );
      setSeasonResults(withGuilds);
    } else {
      setSeasonResults([]);
    }
  };

  const activeSeason = seasons.find(s => s.status === "active");
  const daysLeft = activeSeason ? Math.max(0, Math.ceil((new Date(activeSeason.ends_at).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-amber-500" /> Ranking Global de Guildas
          </h1>
          <p className="text-muted-foreground mt-1">Veja as guildas mais poderosas e o histórico de temporadas</p>
        </div>

        {/* Active season banner */}
        {activeSeason && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">Temporada Ativa</Badge>
                <h2 className="text-xl font-bold text-foreground">{activeSeason.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{daysLeft} dias restantes</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-card/50 border border-border/50">
            <TabsTrigger value="live" className="gap-1"><TrendingUp size={14} /> Ranking Atual</TabsTrigger>
            <TabsTrigger value="history" className="gap-1"><Star size={14} /> Histórico</TabsTrigger>
          </TabsList>

          {/* Live Ranking */}
          <TabsContent value="live">
            <div className="space-y-3 mt-4">
              {/* Top 3 podium */}
              {guilds.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 0, 2].map((idx) => {
                    const g = guilds[idx];
                    if (!g) return null;
                    const style = RANK_STYLES[idx];
                    const RankIcon = style.icon;
                    return (
                      <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                        className={`bg-gradient-to-b ${style.bg} border ${style.border} rounded-2xl p-4 text-center ${idx === 0 ? "md:-mt-4" : ""}`}>
                        <RankIcon size={24} className={`${style.color} mx-auto mb-2`} />
                        <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-2xl mb-2"
                          style={{ backgroundColor: g.color + "20", borderColor: g.color, borderWidth: 2 }}>
                          {g.emblem}
                        </div>
                        <p className="font-bold text-sm text-foreground truncate">{g.name}</p>
                        <p className="text-xs text-muted-foreground">Nv.{g.level}</p>
                        <p className="text-lg font-black text-primary mt-1">{g.total_xp.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">XP Total</p>
                        <div className="flex justify-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] gap-0.5"><Swords size={8} />{g.total_wins}</Badge>
                          <Badge variant="outline" className="text-[10px] gap-0.5"><Map size={8} />{territories[g.id] || 0}</Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              {guilds.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    i < 3 ? `bg-gradient-to-r ${RANK_STYLES[i]?.bg || ""} ${RANK_STYLES[i]?.border || "border-border/50"}` : "bg-card/50 border-border/50"
                  }`}>
                  <span className="w-8 text-center font-black text-sm">
                    {i < 3 ? RANK_STYLES[i].label : `${i + 1}º`}
                  </span>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: g.color + "20", borderColor: g.color, borderWidth: 1 }}>
                    {g.emblem}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">Nv.{g.level} • {g.total_wins} vitórias • {territories[g.id] || 0} territórios</p>
                  </div>
                  <span className="font-black text-sm text-primary">{g.total_xp.toLocaleString()} XP</span>
                </motion.div>
              ))}

              {guilds.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Shield size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhuma guilda criada ainda</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="space-y-4 mt-4">
              <Select value={selectedSeason} onValueChange={(v) => { setSelectedSeason(v); loadSeasonResults(v); }}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Selecionar temporada" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} {s.status === "active" && "⚡"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {seasonResults.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum resultado registrado nesta temporada</p>
                  <p className="text-sm mt-1">Os resultados aparecem ao final de cada temporada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {seasonResults.map((r, i) => {
                    const trophy = TROPHY_TIERS.find(t => r.final_rank >= t.min && r.final_rank <= t.max);
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-4 rounded-xl border ${
                          i < 3 ? `bg-gradient-to-r ${RANK_STYLES[i]?.bg || ""} ${RANK_STYLES[i]?.border || "border-border/50"}` : "bg-card/50 border-border/50"
                        }`}>
                        <span className="text-2xl">{trophy?.icon || "🎖️"}</span>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: (r.guild?.color || "#666") + "20" }}>
                          {r.guild?.emblem || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{r.guild?.name || "?"}</p>
                          <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{r.total_score.toLocaleString()} pts</span>
                            <span>• {r.territories_held} territórios</span>
                            <span>• {r.wars_won} guerras</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-lg ${trophy?.color || "text-foreground"}`}>{r.final_rank}º</p>
                          {r.trophies_earned > 0 && (
                            <p className="text-[10px] text-amber-500">🏆 ×{r.trophies_earned}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default GuildRanking;
