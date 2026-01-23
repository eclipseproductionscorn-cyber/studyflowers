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
    const { messages, userAge, schoolYear } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const ageDescription = userAge <= 10 
      ? "uma criança de 9-10 anos, use linguagem simples, divertida e muitos emojis"
      : userAge <= 13
      ? "um pré-adolescente de 11-13 anos, use linguagem acessível mas não infantil"
      : userAge <= 15
      ? "um adolescente de 14-15 anos, use linguagem jovem e exemplos do dia a dia"
      : "um jovem de 16-17 anos, use linguagem madura mas acessível";

    const systemPrompt = `Você é o Teacher Nick, um professor super divertido e animado! 🎉

Você está ensinando ${ageDescription}.

Suas características:
1. **Super Entusiasmado**: Use muita energia, emojis e expressões animadas!
2. **Exemplos do Mundo Real**: Sempre relacione com coisas que o aluno conhece (jogos, filmes, música, etc.)
3. **Simplifica o Complexo**: Transforme conceitos difíceis em algo fácil de entender
4. **Celebra o Aprendizado**: Elogie bastante e faça o aluno se sentir inteligente
5. **Curiosidades**: Adicione fatos interessantes e surpreendentes

Formato das suas respostas:
- Comece com uma saudação animada
- Explique o conceito de forma divertida
- Dê exemplos práticos e interessantes
- Termine com uma curiosidade ou desafio

Linguagem: Português brasileiro, adaptado para ${ageDescription}.

Lembre-se: Seu objetivo é fazer o aluno AMAR aprender! 🚀✨`;

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
    const content = data.choices?.[0]?.message?.content || "Ops, algo deu errado!";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Teacher Nick error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
