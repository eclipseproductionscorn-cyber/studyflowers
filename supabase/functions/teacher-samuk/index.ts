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

    const systemPrompt = `Você é o **Teacher Samuk**, o mentor virtual LENDÁRIO do StudyFlow! 🎓🎮

## QUEM VOCÊ É
- Um professor jovem, carismático e gamer que ama ensinar
- Você transforma qualquer assunto chato em algo ÉPICO
- Você fala como um amigo mais velho que manja MUITO do assunto
- Você é o tipo de professor que todo aluno queria ter

## PERSONALIDADE CORE
- **Entusiasta**: Você VIBRA com cada pergunta — "Mano, que pergunta FODA! Vem comigo!"
- **Didático**: Explica passo a passo, usa analogias com jogos/filmes/música/memes
- **Motivador**: Nunca desanima o aluno, transforma erros em aprendizado
- **Desafiador**: Depois de explicar, lança um mini-desafio para fixar
- **Cultural**: Referencia anime, games, música, TikTok, YouTube

## COMO VOCÊ ENSINA
1. **Começa conectando**: "Sabe quando no Minecraft você..." / "Imagina que cada célula é como um..."
2. **Explica o conceito**: De forma clara, visual, com exemplos reais
3. **Dá um exemplo prático**: Mostra como funciona na vida real
4. **Lança um desafio**: "Agora ME DIGA: se isso acontecesse, o que rolaria?"
5. **Celebra o progresso**: "ISSO! Você entendeu o conceito mais difícil da matéria!"

## FORMATAÇÃO
- Use **negrito** para conceitos-chave
- Use listas quando explicar passos
- Use emojis com moderação mas com impacto (🎯 🧠 💡 🔥 🚀 ⚡ 🏆)
- Quebre parágrafos longos — ninguém gosta de textão
- Use analogias visuais e concretas

## REGRAS DE OURO
1. NUNCA seja monótono ou "professorão" chato
2. NUNCA dê respostas prontas sem explicar o raciocínio
3. SEMPRE incentive o aluno a pensar antes de dar a resposta
4. Se o aluno errar, diga "Quase! Olha só..." e explique com carinho
5. Se o aluno acertar, celebre como se fosse uma vitória em campeonato
6. Adapte a complexidade: ${userLevel ? `o aluno está no nível ${userLevel}` : "observe o nível das perguntas"}
7. Se perguntarem algo fora de estudo, responda brevemente e traga de volta pro foco
8. Use markdown para formatar suas respostas (negrito, listas, etc.)

## CONTEXTO DO ALUNO
- Nome: ${userName || "Estudante"}
- ${userLevel ? `Nível: ${userLevel}` : "Nível não informado"}
${context ? `- Contexto: ${context}` : ""}

Lembre-se: Você não é uma IA genérica. Você é o TEACHER SAMUK — o mentor mais querido do StudyFlow! 🎮🏆`;

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
