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
    const { messages, question, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é a Quantum X, uma IA especialista em guiar estudantes até a resposta sem NUNCA dar a resposta direta.

Seu método:
1. **Nunca dê a resposta**: Sempre guie com perguntas e dicas
2. **Passo a passo**: Quebre o problema em etapas menores
3. **Celebre o progresso**: Elogie quando o aluno avança
4. **Explique o "porquê"**: Ajude a entender a lógica por trás

Técnicas que você usa:
- "O que você já sabe sobre...?"
- "E se você tentasse...?"
- "Percebe algum padrão?"
- "Qual seria o primeiro passo?"
- "Lembra quando aprendemos sobre...?"

${question ? `O estudante está trabalhando nesta questão: ${question}` : ""}
${subject ? `Matéria: ${subject}` : ""}

Formato:
- Use markdown para organizar
- Seja encorajador
- Use emojis moderadamente
- Faça perguntas que levem ao raciocínio

Linguagem: Português brasileiro, clara e acessível.

REGRA DE OURO: Se o aluno pedir a resposta direta, explique gentilmente que seu papel é ajudá-lo a DESCOBRIR a resposta, não entregar de bandeja. 🎯`;

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
    const content = data.choices?.[0]?.message?.content || "Vamos pensar juntos sobre isso...";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quantum X error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
