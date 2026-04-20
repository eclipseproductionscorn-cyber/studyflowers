// Modo História - Capítulos lineares + finais ramificados (Cientista, Filósofo, Inventor)
export interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
  rewards: { xp: number; coins: number };
  effect?: "wisdom" | "courage" | "intellect" | "kindness";
  pathAffinity?: "scientist" | "philosopher" | "inventor"; // Define afinidade com caminho
}

export interface StoryScene {
  id: number;
  narration: string;
  speaker?: string;
  background: string;
  emoji: string;
  choices?: StoryChoice[];
  isEnding?: boolean;
  pathRequired?: "scientist" | "philosopher" | "inventor"; // cena específica de caminho
}

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  unlockRequirement?: { type: "level" | "previous"; value: number };
  scenes: StoryScene[];
  completionReward: { xp: number; coins: number };
  isPathChapter?: boolean; // Capítulo específico por caminho
  pathType?: "scientist" | "philosopher" | "inventor";
}

export const storyChapters: StoryChapter[] = [
  {
    id: 1,
    title: "O Despertar do Estudante",
    subtitle: "Capítulo 1",
    description: "Tudo começa com uma escolha. Qual será o seu caminho?",
    emoji: "🌅",
    color: "from-amber-400 via-orange-500 to-rose-500",
    completionReward: { xp: 200, coins: 100 },
    scenes: [
      {
        id: 0,
        narration:
          "Você acorda em uma manhã clara. Diante de você, três livros antigos brilham sobre a mesa. Cada um pulsa com uma energia diferente. Sua jornada como estudante está prestes a começar...",
        background: "from-amber-300 via-orange-400 to-rose-500",
        emoji: "📚",
        choices: [
          {
            id: "scientist",
            text: "🔬 Tomar o Livro da Ciência",
            consequence: "Você sente a sede pela descoberta queimar dentro de si.",
            rewards: { xp: 50, coins: 25 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
          {
            id: "philosopher",
            text: "📜 Tomar o Livro da Filosofia",
            consequence: "Pensamentos profundos começam a tomar forma em sua mente.",
            rewards: { xp: 50, coins: 25 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
          {
            id: "inventor",
            text: "⚙️ Tomar o Livro da Invenção",
            consequence: "Engrenagens giram em sua imaginação. Você quer CRIAR.",
            rewards: { xp: 50, coins: 25 },
            effect: "courage",
            pathAffinity: "inventor",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Com seu livro escolhido, você sai para o pátio da Academia. Um mestre encapuzado se aproxima e pergunta: 'Por que estudar, jovem aprendiz?'",
        speaker: "Mestre Aurelius",
        background: "from-violet-500 via-purple-600 to-indigo-700",
        emoji: "🧙",
        choices: [
          {
            id: "knowledge",
            text: "Para conhecer o mundo",
            consequence: "O mestre sorri. 'A curiosidade é a primeira virtude.'",
            rewards: { xp: 80, coins: 40 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
          {
            id: "help",
            text: "Para ajudar os outros",
            consequence: "O mestre assente. 'O coração nobre encontra grande conhecimento.'",
            rewards: { xp: 80, coins: 40 },
            effect: "kindness",
            pathAffinity: "philosopher",
          },
          {
            id: "power",
            text: "Para vencer desafios",
            consequence: "O mestre ergue uma sobrancelha. 'A coragem te levará longe — se for sábia.'",
            rewards: { xp: 80, coins: 40 },
            effect: "courage",
            pathAffinity: "inventor",
          },
        ],
      },
      {
        id: 2,
        narration:
          "Você completou seu primeiro dia. As estrelas começam a aparecer. Sua jornada apenas começou, mas você sente que algo dentro de você mudou para sempre.",
        background: "from-indigo-700 via-purple-800 to-slate-900",
        emoji: "✨",
        isEnding: true,
      },
    ],
  },
  {
    id: 2,
    title: "A Trilha do Conhecimento",
    subtitle: "Capítulo 2",
    description: "Os primeiros desafios surgem. Como você reagirá à pressão?",
    emoji: "🏔️",
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    completionReward: { xp: 350, coins: 150 },
    scenes: [
      {
        id: 0,
        narration:
          "Semanas se passaram. Hoje, sua primeira prova importante. Um colega chamado Lyra se aproxima nervoso: 'Você... pode me ajudar? Não entendi a matéria.'",
        speaker: "Lyra",
        background: "from-emerald-400 via-teal-500 to-cyan-600",
        emoji: "👤",
        choices: [
          {
            id: "help_full",
            text: "Sim, vou ensinar tudo a você",
            consequence: "Você gasta tempo, mas Lyra agradece com lágrimas nos olhos.",
            rewards: { xp: 100, coins: 50 },
            effect: "kindness",
            pathAffinity: "philosopher",
          },
          {
            id: "help_some",
            text: "Vou te dar dicas rápidas",
            consequence: "Equilíbrio é sabedoria — você ajuda, mas se prepara.",
            rewards: { xp: 80, coins: 60 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
          {
            id: "refuse",
            text: "Desculpe, preciso focar em mim",
            consequence: "Lyra desaparece. Você se concentra, mas algo pesa em seu peito.",
            rewards: { xp: 60, coins: 80 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Durante a prova, você se depara com uma questão impossível. O tempo se esvai. À sua frente, um colega deixa cair sua resposta — e você consegue ver.",
        background: "from-rose-500 via-red-600 to-rose-700",
        emoji: "📝",
        choices: [
          {
            id: "honest",
            text: "Manter os olhos no próprio papel",
            consequence: "Você erra a questão, mas mantém sua honra intacta.",
            rewards: { xp: 150, coins: 75 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
          {
            id: "creative",
            text: "Inventar uma resposta criativa",
            consequence: "Sua mente fervilha de ideias improváveis. Você cria do nada.",
            rewards: { xp: 130, coins: 90 },
            effect: "courage",
            pathAffinity: "inventor",
          },
        ],
      },
      {
        id: 2,
        narration:
          "Resultado divulgado. Independente da nota, você aprendeu algo mais valioso: quem você é quando ninguém está olhando.",
        background: "from-amber-500 via-yellow-500 to-amber-600",
        emoji: "🏆",
        isEnding: true,
      },
    ],
  },
  {
    id: 3,
    title: "A Guilda Perdida",
    subtitle: "Capítulo 3",
    description: "Uma antiga guilda de estudantes precisa de você. Você aceitará o chamado?",
    emoji: "⚔️",
    color: "from-purple-500 via-violet-600 to-fuchsia-700",
    completionReward: { xp: 500, coins: 250 },
    scenes: [
      {
        id: 0,
        narration:
          "Uma carta misteriosa chega: 'A Guilda dos Sábios Perdidos precisa de você. Venha à Torre Antiga ao anoitecer.' Você vai?",
        background: "from-slate-800 via-purple-900 to-violet-900",
        emoji: "✉️",
        choices: [
          {
            id: "go",
            text: "Aceitar o chamado",
            consequence: "Coragem move montanhas. Você vai.",
            rewards: { xp: 120, coins: 60 },
            effect: "courage",
            pathAffinity: "inventor",
          },
          {
            id: "investigate",
            text: "Pesquisar primeiro",
            consequence: "Conhecimento antes de ação — você descobre que a guilda é real e antiga.",
            rewards: { xp: 100, coins: 80 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
          {
            id: "meditate",
            text: "Meditar sobre o convite",
            consequence: "A clareza vem com a calma. Sua intuição confirma: vá.",
            rewards: { xp: 110, coins: 70 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Na torre, três anciãos te recebem. 'Para entrar, escolha um caminho: a Espada do Debate, o Escudo da Paciência, ou o Cajado do Ensino.'",
        speaker: "Os Anciãos",
        background: "from-violet-700 via-purple-800 to-fuchsia-900",
        emoji: "🏛️",
        choices: [
          {
            id: "sword",
            text: "⚔️ A Espada do Debate",
            consequence: "Sua voz se torna afiada como uma lâmina.",
            rewards: { xp: 180, coins: 90 },
            effect: "courage",
            pathAffinity: "inventor",
          },
          {
            id: "shield",
            text: "🛡️ O Escudo da Paciência",
            consequence: "Você aprende que esperar é uma forma de poder.",
            rewards: { xp: 180, coins: 90 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
          {
            id: "staff",
            text: "🪄 O Cajado do Ensino",
            consequence: "Ensinar é a maior forma de aprender.",
            rewards: { xp: 180, coins: 90 },
            effect: "kindness",
            pathAffinity: "scientist",
          },
        ],
      },
      {
        id: 2,
        narration:
          "Você é nomeado membro oficial da Guilda dos Sábios. Um broche brilhante é colocado em seu peito. Sua jornada agora tem aliados.",
        background: "from-fuchsia-600 via-purple-700 to-violet-800",
        emoji: "🎖️",
        isEnding: true,
      },
    ],
  },
  {
    id: 4,
    title: "O Duelo dos Mestres",
    subtitle: "Capítulo 4",
    description: "Um torneio entre as melhores mentes. Você está pronto?",
    emoji: "🔥",
    color: "from-rose-500 via-pink-600 to-red-700",
    completionReward: { xp: 700, coins: 350 },
    scenes: [
      {
        id: 0,
        narration:
          "O Grande Torneio dos Mestres começou. Você enfrenta Kaizen, um rival arrogante. Antes da batalha, ele te oferece a mão.",
        speaker: "Kaizen",
        background: "from-red-600 via-rose-700 to-pink-800",
        emoji: "🤝",
        choices: [
          {
            id: "shake",
            text: "Apertar a mão com respeito",
            consequence: "Kaizen sorri. 'Que vença o melhor.'",
            rewards: { xp: 150, coins: 75 },
            effect: "kindness",
            pathAffinity: "philosopher",
          },
          {
            id: "ignore",
            text: "Ignorar e focar no duelo",
            consequence: "O silêncio gela o ar. A intensidade aumenta.",
            rewards: { xp: 120, coins: 100 },
            effect: "courage",
            pathAffinity: "inventor",
          },
          {
            id: "analyze",
            text: "Analisá-lo silenciosamente",
            consequence: "Você percebe seus padrões. Conhecimento é poder.",
            rewards: { xp: 140, coins: 90 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Durante o duelo final, você percebe que pode aplicar uma jogada arriscada. Pode te dar a vitória — ou destruir tudo.",
        background: "from-orange-600 via-red-700 to-rose-800",
        emoji: "⚡",
        choices: [
          {
            id: "risk",
            text: "Tentar a jogada arriscada",
            consequence: "A multidão prende a respiração. Você arrisca tudo.",
            rewards: { xp: 250, coins: 150 },
            effect: "courage",
            pathAffinity: "inventor",
          },
          {
            id: "safe",
            text: "Jogar com segurança",
            consequence: "Você mantém o ritmo. A vitória chega aos poucos.",
            rewards: { xp: 200, coins: 200 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
        ],
      },
      {
        id: 2,
        narration:
          "Independente do resultado, o público te aplaude de pé. Você provou seu valor não apenas pelas vitórias, mas pelo caminho percorrido.",
        background: "from-yellow-500 via-amber-600 to-orange-700",
        emoji: "👑",
        isEnding: true,
      },
    ],
  },
  {
    id: 5,
    title: "A Encruzilhada do Destino",
    subtitle: "Capítulo 5",
    description: "Três caminhos se abrem. Sua afinidade definirá seu destino.",
    emoji: "🌟",
    color: "from-yellow-400 via-amber-500 to-orange-600",
    completionReward: { xp: 1000, coins: 500 },
    scenes: [
      {
        id: 0,
        narration:
          "Você caminha até o cume da Montanha do Saber. Diante de você, três portais brilham com luzes distintas: azul (ciência), violeta (filosofia) e dourado (invenção). Suas escolhas até aqui ressoam dentro de seu peito...",
        background: "from-amber-400 via-orange-500 to-rose-600",
        emoji: "🌌",
        choices: [
          {
            id: "portal_scientist",
            text: "🔬 Atravessar o Portal Azul",
            consequence: "A ciência te chama. Suas perguntas são infinitas.",
            rewards: { xp: 300, coins: 150 },
            effect: "intellect",
            pathAffinity: "scientist",
          },
          {
            id: "portal_philosopher",
            text: "📜 Atravessar o Portal Violeta",
            consequence: "A filosofia te abraça. As respostas estão dentro de você.",
            rewards: { xp: 300, coins: 150 },
            effect: "wisdom",
            pathAffinity: "philosopher",
          },
          {
            id: "portal_inventor",
            text: "⚙️ Atravessar o Portal Dourado",
            consequence: "A invenção te exalta. Você criará o impossível.",
            rewards: { xp: 300, coins: 150 },
            effect: "courage",
            pathAffinity: "inventor",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Dentro do portal, uma voz ressoa: 'Você foi escolhido. Mas antes do destino, prove sua dedicação. O que move você?'",
        speaker: "A Voz Cósmica",
        background: "from-indigo-700 via-violet-800 to-purple-900",
        emoji: "🌠",
        choices: [
          {
            id: "passion",
            text: "Paixão pelo que faço",
            consequence: "A voz aprova. 'Paixão é o combustível dos grandes.'",
            rewards: { xp: 250, coins: 125 },
            effect: "courage",
          },
          {
            id: "purpose",
            text: "Propósito maior que eu",
            consequence: "A voz se acalma. 'Propósito é o que faz a paixão durar.'",
            rewards: { xp: 250, coins: 125 },
            effect: "wisdom",
          },
          {
            id: "legacy",
            text: "Deixar uma marca no mundo",
            consequence: "A voz vibra. 'Quem deixa marca, transforma o universo.'",
            rewards: { xp: 250, coins: 125 },
            effect: "kindness",
          },
        ],
      },
      {
        id: 2,
        narration:
          "Seu caminho está revelado. Os portais se fundem em um único brilho. Sua identidade verdadeira finalmente emerge, pronta para ser explorada.",
        background: "from-cyan-400 via-purple-500 to-amber-500",
        emoji: "💫",
        isEnding: true,
      },
    ],
  },
  // ===== FINAIS RAMIFICADOS =====
  {
    id: 6,
    title: "O Caminho do Cientista",
    subtitle: "Final Alternativo • Cientista",
    description: "Seu legado se forja na descoberta. Os mistérios do universo te chamam.",
    emoji: "🔬",
    color: "from-blue-500 via-cyan-500 to-teal-600",
    completionReward: { xp: 2000, coins: 1500 },
    isPathChapter: true,
    pathType: "scientist",
    scenes: [
      {
        id: 0,
        narration:
          "Anos após o portal, você fundou o Observatório Cósmico. Telescópios apontam para galáxias distantes. Esta noite, você detecta um sinal estranho — pode ser a maior descoberta da humanidade.",
        background: "from-slate-900 via-blue-900 to-indigo-900",
        emoji: "🔭",
        choices: [
          {
            id: "publish",
            text: "Publicar imediatamente para o mundo",
            consequence: "A fama te encontra. Mas a verdade ainda precisa ser confirmada.",
            rewards: { xp: 400, coins: 200 },
            effect: "courage",
          },
          {
            id: "verify",
            text: "Verificar três vezes antes de revelar",
            consequence: "O método científico vence. Sua reputação se solidifica.",
            rewards: { xp: 500, coins: 250 },
            effect: "intellect",
          },
          {
            id: "share_team",
            text: "Compartilhar com sua equipe primeiro",
            consequence: "Ciência é coletiva. A descoberta cresce com colaboração.",
            rewards: { xp: 450, coins: 300 },
            effect: "kindness",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Você descobre vida em outro planeta. O mundo inteiro te ouve. Um jovem aprendiz pergunta: 'Mestre, qual é o segredo da ciência?'",
        speaker: "Jovem Cientista",
        background: "from-teal-500 via-cyan-600 to-blue-700",
        emoji: "🧬",
        choices: [
          {
            id: "doubt",
            text: "'Duvide de tudo, até de si mesmo.'",
            consequence: "O jovem reflete. A ciência sobreviverá em suas mãos.",
            rewards: { xp: 600, coins: 300 },
            effect: "wisdom",
          },
          {
            id: "experiment",
            text: "'Experimente. Falhe. Repita.'",
            consequence: "O jovem ri. 'Falhar é o caminho?' Sim — sempre foi.",
            rewards: { xp: 600, coins: 300 },
            effect: "courage",
          },
        ],
      },
      {
        id: 2,
        narration:
          "🔬 FINAL DO CIENTISTA 🔬\n\nVocê se torna o maior cientista de sua geração. Universidades carregam seu nome. Suas descobertas mudaram a história. Você provou que a verdade é a mais poderosa força do universo. Sua mente eterna brilha entre as estrelas que você ajudou a desvendar.",
        background: "from-cyan-400 via-blue-500 to-indigo-700",
        emoji: "🌌",
        isEnding: true,
      },
    ],
  },
  {
    id: 7,
    title: "O Caminho do Filósofo",
    subtitle: "Final Alternativo • Filósofo",
    description: "Seu legado se constrói na sabedoria. Você guiará gerações com palavras.",
    emoji: "📜",
    color: "from-purple-500 via-violet-600 to-fuchsia-700",
    completionReward: { xp: 2000, coins: 1500 },
    isPathChapter: true,
    pathType: "philosopher",
    scenes: [
      {
        id: 0,
        narration:
          "Você se tornou o Filósofo Errante. Viaja por reinos respondendo perguntas profundas. Em uma vila pobre, uma mãe chora: 'Por que perdemos pessoas que amamos? Onde está o sentido?'",
        speaker: "Mãe Aflita",
        background: "from-violet-700 via-purple-800 to-fuchsia-900",
        emoji: "🕯️",
        choices: [
          {
            id: "comfort",
            text: "'O amor que sentimos é a prova de que o sentido existe.'",
            consequence: "A mãe chora menos. Suas palavras a tocam profundamente.",
            rewards: { xp: 500, coins: 250 },
            effect: "kindness",
          },
          {
            id: "honest_truth",
            text: "'Não há resposta. Mas há jornada.'",
            consequence: "A mãe entende. Verdades duras são luzes verdadeiras.",
            rewards: { xp: 550, coins: 230 },
            effect: "wisdom",
          },
          {
            id: "memory",
            text: "'Quem amamos vive enquanto lembramos.'",
            consequence: "A mãe sorri pela primeira vez em meses.",
            rewards: { xp: 480, coins: 280 },
            effect: "intellect",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Você funda a Academia da Sabedoria. Escreve livros que serão lidos por séculos. Em seu último dia ensinando, um discípulo pergunta: 'Mestre, o que é a verdade?'",
        speaker: "Discípulo",
        background: "from-fuchsia-600 via-purple-700 to-violet-900",
        emoji: "📖",
        choices: [
          {
            id: "perspective",
            text: "'A verdade é como o sol — vista de muitos ângulos.'",
            consequence: "O discípulo escreve isso. Será uma das frases mais citadas.",
            rewards: { xp: 700, coins: 350 },
            effect: "wisdom",
          },
          {
            id: "inner",
            text: "'A verdade está em você. Sempre esteve.'",
            consequence: "O discípulo chora. Encontrou-se em suas palavras.",
            rewards: { xp: 700, coins: 350 },
            effect: "kindness",
          },
        ],
      },
      {
        id: 2,
        narration:
          "📜 FINAL DO FILÓSOFO 📜\n\nVocê se torna o Sábio Eterno. Suas palavras curaram corações, fundaram reinos e guiaram civilizações. Estátuas suas existem em cada praça. Mas o maior monumento é invisível: as mentes que você ajudou a despertar. Você não morre — você se torna sabedoria coletiva. Para sempre.",
        background: "from-amber-300 via-orange-400 to-purple-600",
        emoji: "🏛️",
        isEnding: true,
      },
    ],
  },
  {
    id: 8,
    title: "O Caminho do Inventor",
    subtitle: "Final Alternativo • Inventor",
    description: "Seu legado é construído com suas mãos. Você criará o futuro.",
    emoji: "⚙️",
    color: "from-orange-500 via-amber-600 to-yellow-700",
    completionReward: { xp: 2000, coins: 1500 },
    isPathChapter: true,
    pathType: "inventor",
    scenes: [
      {
        id: 0,
        narration:
          "Sua oficina vibra com engrenagens, vapor e eletricidade. Você está prestes a ativar sua maior invenção: uma máquina que pode mudar o mundo. Mas ela é instável. Pode dar muito certo — ou explodir tudo.",
        background: "from-orange-600 via-red-700 to-amber-800",
        emoji: "🔧",
        choices: [
          {
            id: "activate",
            text: "Ativar agora — sem medo",
            consequence: "A máquina ruge. Luzes piscam. E então... funciona!",
            rewards: { xp: 600, coins: 300 },
            effect: "courage",
          },
          {
            id: "improve",
            text: "Aperfeiçoar mais um mês",
            consequence: "Paciência traz perfeição. A máquina supera todas expectativas.",
            rewards: { xp: 550, coins: 350 },
            effect: "wisdom",
          },
          {
            id: "team",
            text: "Chamar engenheiros para revisar",
            consequence: "Mentes brilhantes encontram falhas. Juntos, vocês a aperfeiçoam.",
            rewards: { xp: 500, coins: 400 },
            effect: "intellect",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Sua invenção transforma o mundo. Cidades inteiras se modernizam. Mas algumas pessoas perdem empregos antigos. Como você reage?",
        background: "from-yellow-600 via-orange-700 to-red-800",
        emoji: "🏙️",
        choices: [
          {
            id: "retrain",
            text: "Criar escolas para retreinar todos",
            consequence: "Você se torna herói do povo. Inovação com alma.",
            rewards: { xp: 700, coins: 400 },
            effect: "kindness",
          },
          {
            id: "ignore",
            text: "Focar apenas no progresso",
            consequence: "O progresso continua, mas algumas vozes te criticam.",
            rewards: { xp: 600, coins: 500 },
            effect: "courage",
          },
        ],
      },
      {
        id: 2,
        narration:
          "⚙️ FINAL DO INVENTOR ⚙️\n\nVocê é o Mestre Inventor que reescreveu a história. Suas máquinas voam, curam, pensam. Crianças nascem em um mundo que você ajudou a criar. Cada engenheiro do futuro estuda seus desenhos. Sua oficina virou museu sagrado. Você provou que sonhar é o primeiro passo para construir. E você construiu o impossível.",
        background: "from-yellow-400 via-orange-500 to-red-600",
        emoji: "🏆",
        isEnding: true,
      },
    ],
  },
];

export const getChapterById = (id: number) => storyChapters.find((c) => c.id === id);

// Calcula o caminho dominante baseado nas escolhas do usuário
export const calculateDominantPath = (
  choices: Record<string, string>
): "scientist" | "philosopher" | "inventor" | null => {
  const counts = { scientist: 0, philosopher: 0, inventor: 0 };
  
  Object.entries(choices).forEach(([key, choiceId]) => {
    const [chapterId, sceneId] = key.split("-").map(Number);
    const chapter = getChapterById(chapterId);
    if (!chapter) return;
    const scene = chapter.scenes[sceneId];
    if (!scene?.choices) return;
    const choice = scene.choices.find(c => c.id === choiceId);
    if (choice?.pathAffinity) {
      counts[choice.pathAffinity]++;
    }
  });

  const max = Math.max(counts.scientist, counts.philosopher, counts.inventor);
  if (max === 0) return null;
  if (counts.scientist === max) return "scientist";
  if (counts.philosopher === max) return "philosopher";
  return "inventor";
};

export const PATH_INFO = {
  scientist: { label: "Cientista", emoji: "🔬", color: "from-blue-500 to-cyan-600", finalChapterId: 6 },
  philosopher: { label: "Filósofo", emoji: "📜", color: "from-purple-500 to-fuchsia-700", finalChapterId: 7 },
  inventor: { label: "Inventor", emoji: "⚙️", color: "from-orange-500 to-amber-600", finalChapterId: 8 },
};
