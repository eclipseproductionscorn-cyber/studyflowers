import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const REWARDS = [
  { rank: 1, trophies: 3, coins: 5000, xp: 10000 },
  { rank: 2, trophies: 2, coins: 3000, xp: 6000 },
  { rank: 3, trophies: 1, coins: 1500, xp: 3000 },
  { rank: 4, trophies: 0, coins: 800, xp: 1500 },
  { rank: 5, trophies: 0, coins: 500, xp: 1000 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find active seasons that have ended
    const { data: endedSeasons } = await supabase
      .from("guild_seasons")
      .select("*")
      .eq("status", "active")
      .lte("ends_at", new Date().toISOString());

    if (!endedSeasons || endedSeasons.length === 0) {
      return new Response(JSON.stringify({ message: "No seasons to finalize" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const season of endedSeasons) {
      // Get guilds ranked by XP
      const { data: guilds } = await supabase
        .from("guilds")
        .select("id, total_xp, total_wins")
        .order("total_xp", { ascending: false })
        .limit(10);

      if (!guilds) continue;

      // Get territory counts
      const { data: territories } = await supabase
        .from("world_territories")
        .select("owner_guild_id");

      const terrCounts: Record<string, number> = {};
      (territories || []).forEach((t: any) => {
        if (t.owner_guild_id) terrCounts[t.owner_guild_id] = (terrCounts[t.owner_guild_id] || 0) + 1;
      });

      // Create results and distribute rewards
      for (let i = 0; i < guilds.length; i++) {
        const g = guilds[i];
        const reward = REWARDS[i] || { rank: i + 1, trophies: 0, coins: 200, xp: 500 };

        await supabase.from("guild_season_results").insert({
          season_id: season.id,
          guild_id: g.id,
          final_rank: i + 1,
          total_score: g.total_xp,
          territories_held: terrCounts[g.id] || 0,
          wars_won: g.total_wins,
          trophies_earned: reward.trophies,
        });

        // Distribute coins to all guild members
        const { data: members } = await supabase
          .from("guild_members")
          .select("user_id")
          .eq("guild_id", g.id);

        if (members) {
          for (const m of members) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("coins, xp")
              .eq("user_id", m.user_id)
              .single();

            if (profile) {
              await supabase.from("profiles").update({
                coins: profile.coins + reward.coins,
                xp: profile.xp + reward.xp,
              }).eq("user_id", m.user_id);
            }
          }
        }
      }

      // Close season
      await supabase.from("guild_seasons").update({ status: "ended" }).eq("id", season.id);

      // Create next season
      const nextNumber = season.season_number + 1;
      await supabase.from("guild_seasons").insert({
        season_number: nextNumber,
        title: `Temporada ${nextNumber}`,
        status: "active",
      });
    }

    return new Response(JSON.stringify({ success: true, seasons_finalized: endedSeasons.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
