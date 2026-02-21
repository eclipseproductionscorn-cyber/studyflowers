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
    const { subject, schoolYear, questionsPerLevel = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um professor especialista em criar questões de alta qualidade para o StudyFlow, um app gamificado de estudos.

Gere exatamente 10 perguntas sobre "${subject}" para um aluno do ${schoolYear || "ensino médio"}.

DISTRIBUIÇÃO DE DIFICULDADE:
- 3 perguntas "easy" (conceitos fundamentais, definições)
- 4 perguntas "normal" (aplicação prática, raciocínio moderado)
- 3 perguntas "hard" (análise crítica, problemas complexos, pegadinhas inteligentes)

REGRAS DE QUALIDADE:
1. Cada pergunta DEVE ter uma explicação DETALHADA de 3-5 frases explicando o raciocínio completo
2. A explicação deve ensinar o PORQUÊ da resposta correta e por que as outras estão erradas
3. Use contextos do mundo real: notícias, jogos, filmes, tecnologia, esportes
4. Alternativas erradas devem ser PLAUSÍVEIS (não óbvias)
5. NUNCA faça perguntas genéricas — seja específico e criativo
6. Varie os tipos: conceituais, cálculos, interpretação, análise

FORMATO JSON OBRIGATÓRIO:
{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy",
      "type": "multiple_choice",
      "question": "Pergunta clara e específica?",
      "options": ["A) opção completa", "B) opção plausível", "C) opção que parece certa", "D) opção que testa atenção"],
      "correct_answer": "A",
      "explanation": "Explicação detalhada de 3-5 frases. A alternativa A está correta porque... As outras estão erradas porque B faz X, C confunde Y com Z, e D ignora o conceito de W."
    }
  ]
}

IMPORTANTE:
- correct_answer deve ser APENAS a letra (A, B, C ou D)
- Ordene: easy primeiro, depois normal, depois hard
- Cada explicação deve ser uma mini-aula
- RETORNE APENAS O JSON, sem texto adicional, sem markdown, sem backticks`;

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
          { role: "user", content: `Gere 10 perguntas incríveis sobre ${subject} para ${schoolYear || "ensino médio"}.` },
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

    // Clean markdown
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const quiz = JSON.parse(content);
      
      // Validate and ensure 10 questions
      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error("No questions generated");
      }

      // Ensure correct_answer is just the letter
      quiz.questions = quiz.questions.map((q: any, i: number) => ({
        ...q,
        id: i + 1,
        correct_answer: q.correct_answer?.charAt(0)?.toUpperCase() || "A",
      }));

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
