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
    const { subject, schoolYear, questionsPerLevel = 5 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const totalQuestions = questionsPerLevel * 3; // 3 níveis: fácil, normal, difícil

    const systemPrompt = `Você é um gerador de quiz de nivelamento educacional para o StudyFlow.

Gere exatamente ${totalQuestions} perguntas de nivelamento em formato JSON seguindo EXATAMENTE este esquema:

{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy" | "normal" | "hard",
      "type": "multiple_choice" | "true_false",
      "question": "Texto da pergunta",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
      "correct_answer": "A",
      "explanation": "Explicação da resposta correta"
    }
  ]
}

REGRAS OBRIGATÓRIAS:
1. Divida IGUALMENTE: ${questionsPerLevel} perguntas fáceis, ${questionsPerLevel} normais, ${questionsPerLevel} difíceis
2. Ordene por dificuldade: primeiro as fáceis, depois normais, depois difíceis
3. Use linguagem adequada para: ${schoolYear}
4. Matéria: ${subject}
5. Para "true_false", options deve ser ["Verdadeiro", "Falso"] e correct_answer "Verdadeiro" ou "Falso"
6. Para "multiple_choice", sempre 4 opções (A, B, C, D)
7. RETORNE APENAS O JSON, sem texto adicional

NÍVEIS DE DIFICULDADE:
- easy: Conceitos básicos, definições simples
- normal: Aplicação de conceitos, problemas moderados
- hard: Raciocínio avançado, problemas complexos`;

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
          { role: "user", content: `Gere o quiz de nivelamento para ${subject} (${schoolYear}).` },
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
      const quiz = JSON.parse(content);
      return new Response(JSON.stringify(quiz), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", content);
      throw new Error("Failed to generate valid quiz");
    }
  } catch (error) {
    console.error("Quiz Generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
