// Modo História - 5 capítulos lineares com escolhas
export interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
  rewards: { xp: number; coins: number };
  effect?: "wisdom" | "courage" | "intellect" | "kindness";
}

export interface StoryScene {
  id: number;
  narration: string;
  speaker?: string;
  background: string; // gradient classes
  emoji: string;
  choices?: StoryChoice[];
  isEnding?: boolean;
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
          },
          {
            id: "philosopher",
            text: "📜 Tomar o Livro da Filosofia",
            consequence: "Pensamentos profundos começam a tomar forma em sua mente.",
            rewards: { xp: 50, coins: 25 },
            effect: "wisdom",
          },
          {
            id: "inventor",
            text: "⚙️ Tomar o Livro da Invenção",
            consequence: "Engrenagens giram em sua imaginação. Você quer CRIAR.",
            rewards: { xp: 50, coins: 25 },
            effect: "courage",
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
          },
          {
            id: "help",
            text: "Para ajudar os outros",
            consequence: "O mestre assente. 'O coração nobre encontra grande conhecimento.'",
            rewards: { xp: 80, coins: 40 },
            effect: "kindness",
          },
          {
            id: "power",
            text: "Para vencer desafios",
            consequence: "O mestre ergue uma sobrancelha. 'A coragem te levará longe — se for sábia.'",
            rewards: { xp: 80, coins: 40 },
            effect: "courage",
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
          },
          {
            id: "help_some",
            text: "Vou te dar dicas rápidas",
            consequence: "Equilíbrio é sabedoria — você ajuda, mas se prepara.",
            rewards: { xp: 80, coins: 60 },
            effect: "wisdom",
          },
          {
            id: "refuse",
            text: "Desculpe, preciso focar em mim",
            consequence: "Lyra desaparece. Você se concentra, mas algo pesa em seu peito.",
            rewards: { xp: 60, coins: 80 },
            effect: "intellect",
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
          },
          {
            id: "peek",
            text: "Olhar rapidamente",
            consequence: "Você acerta — mas a culpa virá te assombrar.",
            rewards: { xp: 50, coins: 100 },
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
          },
          {
            id: "investigate",
            text: "Pesquisar primeiro",
            consequence: "Conhecimento antes de ação — você descobre que a guilda é real e antiga.",
            rewards: { xp: 100, coins: 80 },
            effect: "intellect",
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
          },
          {
            id: "shield",
            text: "🛡️ O Escudo da Paciência",
            consequence: "Você aprende que esperar é uma forma de poder.",
            rewards: { xp: 180, coins: 90 },
            effect: "wisdom",
          },
          {
            id: "staff",
            text: "🪄 O Cajado do Ensino",
            consequence: "Ensinar é a maior forma de aprender.",
            rewards: { xp: 180, coins: 90 },
            effect: "kindness",
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
          },
          {
            id: "ignore",
            text: "Ignorar e focar no duelo",
            consequence: "O silêncio gela o ar. A intensidade aumenta.",
            rewards: { xp: 120, coins: 100 },
            effect: "courage",
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
          },
          {
            id: "safe",
            text: "Jogar com segurança",
            consequence: "Você mantém o ritmo. A vitória chega aos poucos.",
            rewards: { xp: 200, coins: 200 },
            effect: "wisdom",
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
    title: "O Legado Eterno",
    subtitle: "Capítulo Final",
    description: "Anos se passaram. É hora de escolher seu legado.",
    emoji: "🌟",
    color: "from-yellow-400 via-amber-500 to-orange-600",
    completionReward: { xp: 1500, coins: 1000 },
    scenes: [
      {
        id: 0,
        narration:
          "Você é agora um mestre reconhecido. Um jovem aprendiz, com olhos brilhantes, te procura. 'Mestre, qual é o segredo do conhecimento?'",
        speaker: "Aprendiz",
        background: "from-amber-400 via-orange-500 to-rose-600",
        emoji: "🧒",
        choices: [
          {
            id: "curiosity",
            text: "'Nunca pare de perguntar.'",
            consequence: "Os olhos do jovem brilham ainda mais.",
            rewards: { xp: 300, coins: 150 },
            effect: "intellect",
          },
          {
            id: "humility",
            text: "'Saber que nada se sabe.'",
            consequence: "Uma sabedoria antiga ressoa em suas palavras.",
            rewards: { xp: 300, coins: 150 },
            effect: "wisdom",
          },
          {
            id: "love",
            text: "'Amar o que se aprende.'",
            consequence: "O jovem chora de emoção. Você plantou uma semente.",
            rewards: { xp: 300, coins: 150 },
            effect: "kindness",
          },
        ],
      },
      {
        id: 1,
        narration:
          "Você caminha até o topo da Montanha do Saber. Diante de você, três caminhos: voltar a ensinar, partir para descobrir o desconhecido, ou descansar e contemplar.",
        background: "from-cyan-400 via-blue-500 to-indigo-700",
        emoji: "🏔️",
        choices: [
          {
            id: "teach",
            text: "👨‍🏫 Voltar e ensinar gerações",
            consequence: "Seu nome será lembrado em milhares de salas.",
            rewards: { xp: 500, coins: 300 },
            effect: "kindness",
          },
          {
            id: "explore",
            text: "🚀 Partir para o desconhecido",
            consequence: "Aventura é o que move os grandes mestres.",
            rewards: { xp: 500, coins: 300 },
            effect: "courage",
          },
          {
            id: "contemplate",
            text: "🧘 Contemplar e escrever",
            consequence: "Suas palavras viverão para sempre nos livros.",
            rewards: { xp: 500, coins: 300 },
            effect: "wisdom",
          },
        ],
      },
      {
        id: 2,
        narration:
          "🌟 PARABÉNS! Você completou sua jornada. Seu legado está escrito nas estrelas. Mas lembre-se: cada fim é apenas um novo começo. O verdadeiro estudante nunca para de aprender.",
        background: "from-yellow-300 via-amber-400 to-orange-500",
        emoji: "🏆",
        isEnding: true,
      },
    ],
  },
];

export const getChapterById = (id: number) => storyChapters.find((c) => c.id === id);
