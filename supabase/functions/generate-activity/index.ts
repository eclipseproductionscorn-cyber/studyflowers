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
      easy: "fácil — conceitos básicos, linguagem simples, exemplos do dia a dia",
      normal: "intermediário — aplicação prática dos conceitos, exige raciocínio",
      hard: "avançado — análise crítica, conexões entre conceitos, pegadinhas inteligentes",
    };

    const systemPrompt = `Você é o Teacher Samuk, um educador gamificado que cria atividades INCRÍVEIS para o StudyFlow.

Sua missão é gerar atividades que sejam:
- 🎮 ENVOLVENTES: Use contextos reais, curiosidades e situações interessantes
- 📖 EDUCATIVAS: O texto de base deve ensinar algo valioso de verdade
- 🧠 DESAFIADORAS: A questão deve testar compreensão, não memorização
- 💡 INSTRUTIVAS: A explicação deve ser uma mini-aula que ensine o porquê

REGRAS DE QUALIDADE:
1. O texto de base (content_text) deve ter 3-5 parágrafos bem escritos, com curiosidades e exemplos práticos
2. Use contextos do mundo real: notícias, jogos, filmes, tecnologia, esportes
3. Para múltipla escolha: as alternativas erradas devem ser plausíveis (não óbvias)
4. A explicação deve ensinar o raciocínio completo, não apenas "a resposta é X porque sim"
5. Adapte a linguagem: para ensino fundamental use exemplos mais concretos, para médio mais abstratos
6. NUNCA faça perguntas genéricas como "qual a alternativa correta" — seja específico

Gere uma atividade seguindo EXATAMENTE este formato JSON:

{
  "title": "Título criativo e chamativo (máx 60 chars)",
  "content_text": "Texto educativo rico com 3-5 parágrafos. Inclua dados reais, curiosidades e exemplos práticos que conectem o tema ao dia a dia do aluno.",
  "question": "Pergunta específica e bem formulada que teste a compreensão do texto",
  "question_type": "${questionType || 'multiple_choice'}",
  "options": ${questionType === 'essay' ? 'null' : '["A) opção clara e completa", "B) opção plausível mas incorreta", "C) opção que parece certa mas tem detalhe errado", "D) opção que testa atenção ao texto"]'},
  "correct_answer": "${questionType === 'essay' ? 'Resposta modelo completa e bem elaborada' : 'A) texto completo da alternativa correta'}",
  "explanation": "Explicação detalhada: por que a correta está certa, por que cada errada está errada, e o conceito por trás da questão"
}

Parâmetros da atividade:
- Matéria: ${subject}
- Tópico: ${topic || "escolha um tema interessante e relevante da matéria"}
- Nível: ${difficultyMap[difficulty] || difficultyMap.normal}
- Ano escolar: ${schoolYear || "ensino médio"}

RETORNE APENAS O JSON, sem texto adicional, sem markdown, sem backticks.`;

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
          { role: "user", content: `Crie uma atividade incrível de ${subject}${topic ? ` sobre "${topic}"` : ""} no nível ${difficulty || "normal"} para um aluno do ${schoolYear || "ensino médio"}.` },
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
    
    // Clean markdown code blocks if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const activity = JSON.parse(content);
      
      // Validate required fields
      if (!activity.title || !activity.content_text || !activity.question || !activity.correct_answer || !activity.explanation) {
        throw new Error("Missing required fields in generated activity");
      }
      
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
