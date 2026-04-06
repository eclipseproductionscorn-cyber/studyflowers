import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if there's already an active tournament this week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { data: existing } = await supabase
      .from("guild_tournaments")
      .select("id")
      .gte("starts_at", weekStart.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: "Tournament already exists this week", id: existing[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create weekly tournament
    const weekNum = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 86400000));
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 7);

    const titles = [
      "Copa dos Campeões", "Torneio da Sabedoria", "Desafio Supremo",
      "Arena dos Mestres", "Batalha dos Clãs", "Campeonato Semanal",
      "Liga das Guildas", "Grande Torneio",
    ];
    const title = `${titles[weekNum % titles.length]} — Semana ${weekNum}`;

    const { data: tournament, error } = await supabase
      .from("guild_tournaments")
      .insert({
        title,
        description: `Torneio semanal automático. Compita com sua guilda e conquiste o topo do ranking!`,
        status: "active",
        starts_at: weekStart.toISOString(),
        ends_at: endDate.toISOString(),
        xp_reward_first: 5000,
        xp_reward_second: 3000,
        xp_reward_third: 1500,
        coin_reward_first: 2000,
        coin_reward_second: 1000,
        coin_reward_third: 500,
        max_participants: 32,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Tournament created", tournament }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
