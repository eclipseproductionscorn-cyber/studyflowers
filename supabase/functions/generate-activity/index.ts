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
    const { subject, topic, difficulty, schoolYear, questionType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const difficultyMap: Record<string, string> = {
      easy: "fácil, conceitos básicos",
      normal: "intermediário, aplicação de conceitos",
      hard: "avançado, requer raciocínio profundo",
    };

    const systemPrompt = `Você é um gerador de atividades educacionais para o Studio Flow.

Gere uma atividade completa seguindo EXATAMENTE este formato JSON:

{
  "title": "Título breve da atividade",
  "content_text": "Texto de base explicativo sobre o tema (3-5 parágrafos com informações importantes)",
  "question": "A pergunta da atividade",
  "question_type": "${questionType || 'multiple_choice'}",
  "options": ${questionType === 'essay' ? 'null' : '["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"]'},
  "correct_answer": "${questionType === 'essay' ? 'Resposta modelo esperada' : 'A'}",
  "explanation": "Explicação detalhada de por que essa é a resposta correta e o raciocínio por trás"
}

Parâmetros:
- Matéria: ${subject}
- Tópico: ${topic || "qualquer tema da matéria"}
- Nível: ${difficultyMap[difficulty] || difficultyMap.normal}
- Ano escolar: ${schoolYear || "ensino médio"}

Regras:
1. O texto de base deve ser educativo e interessante
2. A questão deve testar a compreensão do texto
3. A explicação deve ensinar, não apenas dizer a resposta
4. Adapte a linguagem ao nível escolar
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
          { role: "user", content: `Gere uma atividade de ${subject}${topic ? ` sobre ${topic}` : ""} no nível ${difficulty || "normal"}.` },
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
    let content = data.choices?.[0]?.message?.content || "";
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const activity = JSON.parse(content);
      return new Response(JSON.stringify({ activity }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse activity JSON:", content);
      throw new Error("Failed to generate valid activity");
    }
  } catch (error) {
    console.error("Activity Generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
