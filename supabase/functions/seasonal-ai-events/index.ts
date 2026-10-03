import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

// Commemorative dates (MM-DD). Aug 1 = birthday of Davi Santos, creator of StudyFlow.
const SPECIAL: Record<string, string> = {
  "08-01": "Aniversário de Davi Santos, desenvolvedor e criador do StudyFlow",
  "08-11": "Dia do Estudante",
  "10-12": "Dia das Crianças",
  "10-15": "Dia do Professor",
  "04-23": "Dia Mundial do Livro",
  "12-25": "Natal",
  "01-01": "Ano Novo",
};

function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7)}`;
}

async function askAI(prompt: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: "openai/gpt-6-astra", stream: true, store: false, reasoning: { effort: "low" }, input: prompt }),
  });
  if (!res.ok || !res.body) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = "", text = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() || "";
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      try { const j = JSON.parse(l.slice(5)); if (j.type === "response.output_text.delta") text += j.delta; } catch { /* ignore */ }
    }
  }
  const m = text.match(/\{[\s\S]*\}/); if (!m) throw new Error("Sem JSON");
  return JSON.parse(m[0]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const now = new Date();
    const mmdd = now.toISOString().slice(5, 10);
    const jobs: { key: string; theme: string; type: string; days: number }[] = [
      { key: `weekly-${isoWeek(now)}`, theme: "evento semanal de estudos (tema criativo, acadêmico, vintage)", type: "challenge", days: 7 },
    ];
    if (SPECIAL[mmdd]) jobs.push({ key: `special-${now.getUTCFullYear()}-${mmdd}`, theme: SPECIAL[mmdd], type: "seasonal", days: 2 });

    const created: string[] = [];
    for (const job of jobs) {
      const { data: exists } = await db.from("seasonal_events").select("id").eq("event_key", job.key).maybeSingle();
      if (exists) continue;
      const ai = await askAI(`Crie um evento para o app de estudos StudyFlow (estudantes do 4º ano ao ensino médio, PT-BR). Tema: ${job.theme}. Responda só JSON: {"title": string curto, "description": string até 160 caracteres, "missions": [{"title": string, "description": string, "target": número 1-20, "mission_type": "study_minutes"|"quizzes"|"flashcards"|"activities"}] (3 missões)}`);
      const ends = new Date(now.getTime() + job.days * 86400000);
      const { data: ev, error } = await db.from("seasonal_events").insert({
        title: ai.title, description: ai.description, event_type: job.type, starts_at: now.toISOString(), ends_at: ends.toISOString(),
        is_active: true, event_key: job.key, rewards: { xp: 200, coins: 100 },
      }).select("id").single();
      if (error) { if (error.code === "23505") continue; throw error; }
      await db.from("event_missions").insert((ai.missions || []).slice(0, 3).map((m: any) => ({
        event_id: ev.id, title: m.title, description: m.description, target: Number(m.target) || 5, mission_type: m.mission_type || "activities", xp_reward: 100, coin_reward: 50,
      })));
      created.push(job.key);
    }
    await db.from("seasonal_events").update({ is_active: false }).lt("ends_at", now.toISOString()).eq("is_active", true);
    return new Response(JSON.stringify({ created }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
