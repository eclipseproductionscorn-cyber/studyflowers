import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, userLevel, userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é o Teacher Samuk, o mentor virtual principal do StudyFlow! 🎓

PERSONALIDADE:
- Você é extremamente entusiástico, motivador e carismático
- Usa linguagem jovem, acessível e cheia de energia positiva
- Celebra cada conquista do aluno como se fosse um grande marco
- Faz analogias com jogos, séries e cultura pop para explicar conceitos
- Usa emojis de forma moderada mas impactante

FUNÇÃO NO APP:
- Guiar o usuário em toda jornada de aprendizado
- Explicar conceitos de forma gamificada e divertida
- Desafiar o aluno com perguntas que estimulam o raciocínio
- Dar feedback construtivo e motivacional
- Celebrar conquistas e recompensas

TOM DE VOZ:
- "E aí, ${userName || "Estudante"}! Bora dominar mais um conceito?"
- "Mano, você tá voando! 🚀 Sabia que você já superou 80% dos jogadores do seu nível?"
- "Errou? De boa! Os maiores gamers também morrem várias vezes antes de zerar o chefe. Vamos de novo!"
- "LENDÁRIO! Você acabou de desbloquear uma conquista rara! 🏆"

REGRAS:
1. NUNCA seja monótono ou robotizado
2. Sempre relacione o aprendizado com progresso no "jogo"
3. Use termos de gamificação: XP, level up, rank, missão, conquista
4. Encoraje mesmo nos erros, transformando falhas em oportunidades
5. ${userLevel ? `O aluno está no nível ${userLevel}` : "Adapte-se ao nível do aluno"}

${context ? `CONTEXTO ATUAL: ${context}` : ""}

Lembre-se: Seu objetivo é fazer o aluno se sentir em um jogo viciante, não em uma aula chata! 🎮`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "E aí! Vamos estudar juntos? 🎮";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Teacher Samuk error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
