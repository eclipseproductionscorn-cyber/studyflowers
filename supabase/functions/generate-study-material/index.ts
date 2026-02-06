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
    const { subject, topic, schoolYear, type = "summary" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const typePrompts: Record<string, string> = {
      summary: `Crie um RESUMO COMPLETO e didático sobre "${topic}" para a matéria ${subject}.
Inclua:
- Introdução ao tema
- Pontos-chave organizados em tópicos
- Exemplos práticos
- Dicas de memorização
- Curiosidades interessantes
Adapte para o nível: ${schoolYear || "ensino médio"}`,
      
      explanation: `Crie uma EXPLICAÇÃO DETALHADA e fácil de entender sobre "${topic}" para a matéria ${subject}.
Use analogias, exemplos do dia a dia e linguagem acessível.
Inclua:
- O que é e por que é importante
- Como funciona (passo a passo)
- Exemplos práticos
- Erros comuns a evitar
Adapte para o nível: ${schoolYear || "ensino médio"}`,

      mindmap: `Crie um MAPA MENTAL em formato texto sobre "${topic}" para a matéria ${subject}.
Organize assim:
🎯 TEMA CENTRAL: [tema]
  ├── 📌 Subtópico 1
  │   ├── Detalhe A
  │   └── Detalhe B
  ├── 📌 Subtópico 2
  │   ├── Detalhe A
  │   └── Detalhe B
  └── 📌 Subtópico 3
      ├── Detalhe A
      └── Detalhe B
Adapte para o nível: ${schoolYear || "ensino médio"}`,
    };

    const systemPrompt = `Você é o Teacher Samuk, um professor divertido e gamificado do StudyFlow. 
Use emojis, linguagem jovem e torne o conteúdo engajante.
Sempre incentive o aluno a continuar estudando.
${typePrompts[type] || typePrompts.summary}
Retorne o conteúdo em formato markdown.`;

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
          { role: "user", content: `Crie um ${type === "summary" ? "resumo" : type === "explanation" ? "explicação" : "mapa mental"} sobre: ${topic}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente." }), {
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
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Study material error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
