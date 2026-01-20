import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Trophy,
  Gift,
  BookOpen,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Tutora Inteligente",
    description:
      "Não entrega respostas prontas. Explica o caminho, mostra o raciocínio e estimula sua autonomia intelectual.",
    color: "text-primary",
    bgColor: "bg-primary-soft",
  },
  {
    icon: Target,
    title: "Atividades Diárias",
    description:
      "Desafios personalizados gerados por IA, adaptados ao seu nível e objetivos acadêmicos.",
    color: "text-accent",
    bgColor: "bg-accent-soft",
  },
  {
    icon: Trophy,
    title: "Sistema de Patentes",
    description:
      "Do Bronze ao Ônix III. Evolua seu ranking baseado em frequência de estudo e conclusão de atividades.",
    color: "text-warning",
    bgColor: "bg-warning-soft",
  },
  {
    icon: Gift,
    title: "Caixas Misteriosas",
    description:
      "Ganhe recompensas únicas: avatares, estilos de nome, emblemas e bônus temporários.",
    color: "text-success",
    bgColor: "bg-success-soft",
  },
  {
    icon: BookOpen,
    title: "Trilhas de Estudo",
    description:
      "Cursos organizados e modulares do Ensino Fundamental à faculdade.",
    color: "text-primary",
    bgColor: "bg-primary-soft",
  },
  {
    icon: Timer,
    title: "Timer Integrado",
    description:
      "Estude com foco usando nosso timer Pomodoro integrado e ganhe recompensas por constância.",
    color: "text-accent",
    bgColor: "bg-accent-soft",
  },
  {
    icon: Sparkles,
    title: "Perfil Personalizável",
    description:
      "Avatares, molduras, emblemas e conquistas para criar sua identidade única na plataforma.",
    color: "text-warning",
    bgColor: "bg-warning-soft",
  },
  {
    icon: TrendingUp,
    title: "Ranking em Tempo Real",
    description:
      "Competição saudável com ranking atualizado constantemente baseado em desempenho.",
    color: "text-success",
    bgColor: "bg-success-soft",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary mb-4">
            Recursos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Tudo que você precisa para{" "}
            <span className="gradient-text">evoluir</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa que une aprendizado, organização e
            gamificação para transformar seus estudos.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-medium transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
