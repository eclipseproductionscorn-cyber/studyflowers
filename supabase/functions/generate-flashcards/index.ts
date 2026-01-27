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
    const { subject, topic, difficulty, count = 5, userErrors } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um gerador de flashcards inteligentes para o StudyFlow.

Gere exatamente ${count} flashcards em formato JSON seguindo EXATAMENTE este esquema:

{
  "flashcards": [
    {
      "type": "qa" | "true_false" | "complete" | "practical",
      "front": "Pergunta ou enunciado",
      "back": "Resposta ou explicação",
      "hint": "Dica opcional para ajudar o aluno"
    }
  ]
}

TIPOS DE FLASHCARDS:
- "qa": Pergunta e resposta tradicional
- "true_false": Afirmação para julgar verdadeiro/falso (back deve ser "Verdadeiro" ou "Falso" + explicação)
- "complete": Complete a frase (front tem lacuna _____, back tem a resposta)
- "practical": Situação prática do cotidiano

PARÂMETROS:
- Matéria: ${subject}
- Tópico: ${topic || "Geral da matéria"}
- Dificuldade: ${difficulty || "normal"}
${userErrors ? `- Focar em conceitos relacionados a estes erros anteriores: ${userErrors}` : ""}

REGRAS:
1. Varie os tipos de flashcards
2. Use linguagem clara e didática
3. Inclua dicas úteis quando apropriado
4. Adapte ao nível de dificuldade solicitado
5. RETORNE APENAS O JSON, sem texto adicional`;

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
          { role: "user", content: `Gere ${count} flashcards de ${subject}${topic ? ` sobre ${topic}` : ""}.` },
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
    let content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const flashcards = JSON.parse(content);
      return new Response(JSON.stringify(flashcards), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse flashcards JSON:", content);
      throw new Error("Failed to generate valid flashcards");
    }
  } catch (error) {
    console.error("Flashcard Generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
