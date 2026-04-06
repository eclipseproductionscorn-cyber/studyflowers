import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Zap, Timer, Users, Star, Flame, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tournament {
  id: string; title: string; description: string | null; status: string;
  starts_at: string; ends_at: string; min_guild_level: number;
  xp_reward_first: number; xp_reward_second: number; xp_reward_third: number;
  coin_reward_first: number; coin_reward_second: number; coin_reward_third: number;
  max_participants: number;
}

interface TournamentEntry {
  id: string; tournament_id: string; guild_id: string; score: number;
  rank: number | null; rewards_claimed: boolean;
  guild?: { name: string; emblem: string; color: string; level: number };
}

interface Props {
  guildId: string;
  isLeader: boolean;
}

const MEDAL_COLORS = ["text-amber-400", "text-gray-400", "text-orange-600"];
const MEDAL_ICONS = [Crown, Medal, Medal];

const TournamentTab = ({ guildId, isLeader }: Props) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [entries, setEntries] = useState<Record<string, TournamentEntry[]>>({});

  useEffect(() => { loadTournaments(); }, []);

  const loadTournaments = async () => {
    const { data } = await supabase.from("guild_tournaments").select("*").order("starts_at", { ascending: false });
    if (!data) return;
    setTournaments(data as Tournament[]);
    for (const t of data as Tournament[]) {
      const { data: ents } = await supabase.from("guild_tournament_entries").select("*").eq("tournament_id", t.id).order("score", { ascending: false });
      if (ents) {
        const withGuilds = await Promise.all(
          (ents as any[]).map(async (e) => {
            const { data: g } = await supabase.from("guilds").select("name, emblem, color, level").eq("id", e.guild_id).single();
            return { ...e, guild: g } as TournamentEntry;
          })
        );
        setEntries(prev => ({ ...prev, [t.id]: withGuilds }));
      }
    }
  };

  const joinTournament = async (tournamentId: string) => {
    const { error } = await supabase.from("guild_tournament_entries").insert({ tournament_id: tournamentId, guild_id: guildId });
    if (error) { toast.error(error.message.includes("unique") ? "Já inscrita!" : "Erro ao inscrever"); return; }
    toast.success("🏆 Guilda inscrita no torneio!");
    loadTournaments();
  };

  const contributeScore = async (entry: TournamentEntry) => {
    await supabase.from("guild_tournament_entries").update({ score: entry.score + 25 }).eq("id", entry.id);
    toast.success("⚡ +25 pontos no torneio!");
    loadTournaments();
  };

  const isJoined = (tournamentId: string) => entries[tournamentId]?.some(e => e.guild_id === guildId);
  const myEntry = (tournamentId: string) => entries[tournamentId]?.find(e => e.guild_id === guildId);

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
        <h3 className="text-lg font-semibold mb-2">Nenhum torneio disponível</h3>
        <p className="text-muted-foreground">Torneios semanais serão criados automaticamente!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {tournaments.map((t) => {
        const daysLeft = Math.max(0, Math.ceil((new Date(t.ends_at).getTime() - Date.now()) / 86400000));
        const isActive = t.status === "active" || t.status === "upcoming";
        const tEntries = entries[t.id] || [];
        const joined = isJoined(t.id);
        const me = myEntry(t.id);

        return (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-card/50 border rounded-2xl overflow-hidden ${isActive ? "border-amber-500/30" : "border-border/50"}`}>
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500/10 to-primary/10 border-b border-border/30">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" /> {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isActive ? "default" : "secondary"} className="gap-1">
                    {isActive ? <><Flame size={12} /> Ativo — {daysLeft}d</> : "Encerrado"}
                  </Badge>
                  <Badge variant="outline" className="gap-1"><Users size={12} /> {tEntries.length}/{t.max_participants}</Badge>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/20">
              {[
                { place: "1º", xp: t.xp_reward_first, coins: t.coin_reward_first, color: "text-amber-400" },
                { place: "2º", xp: t.xp_reward_second, coins: t.coin_reward_second, color: "text-gray-400" },
                { place: "3º", xp: t.xp_reward_third, coins: t.coin_reward_third, color: "text-orange-600" },
              ].map((r) => (
                <div key={r.place} className="text-center bg-card/50 rounded-xl p-3 border border-border/30">
                  <span className={`font-black text-lg ${r.color}`}>{r.place}</span>
                  <div className="text-xs text-muted-foreground mt-1">{r.xp} XP • {r.coins} 🪙</div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="p-4 space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2"><Star size={14} className="text-primary" /> Ranking</h4>
              {tEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma guilda inscrita ainda</p>
              ) : (
                tEntries.slice(0, 10).map((entry, i) => {
                  const MedalIcon = i < 3 ? MEDAL_ICONS[i] : Star;
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl ${entry.guild_id === guildId ? "bg-primary/10 border border-primary/20" : "bg-muted/20"}`}>
                      <span className="w-6 text-center">
                        {i < 3 ? <MedalIcon size={16} className={MEDAL_COLORS[i]} /> : <span className="text-xs font-bold text-muted-foreground">{i + 1}º</span>}
                      </span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: (entry.guild?.color || "#666") + "20" }}>{entry.guild?.emblem || "?"}</div>
                      <span className="flex-1 font-medium text-sm">{entry.guild?.name || "?"}</span>
                      <span className="font-bold text-sm text-primary">{entry.score.toLocaleString()}</span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border/30 flex gap-3">
              {isActive && !joined && isLeader && (
                <Button onClick={() => joinTournament(t.id)} className="gap-2 flex-1">
                  <Trophy size={16} /> Inscrever Guilda
                </Button>
              )}
              {isActive && joined && me && (
                <Button onClick={() => contributeScore(me)} className="gap-2 flex-1">
                  <Zap size={16} /> Contribuir (+25 pts)
                </Button>
              )}
              {joined && (
                <Badge variant="secondary" className="gap-1 self-center"><Star size={12} /> Inscrita</Badge>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TournamentTab;
