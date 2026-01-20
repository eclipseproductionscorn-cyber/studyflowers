import { motion } from "framer-motion";
import { UserPlus, Target, TrendingUp, Award } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua Conta",
    description:
      "Cadastro simples e rápido. Informe seu nome, e-mail e pronto! Você já começa com 2.000 moedas.",
  },
  {
    step: "02",
    icon: Target,
    title: "Personalize seu Perfil",
    description:
      "Responda algumas perguntas sobre sua série, área de estudo e objetivos para receber atividades personalizadas.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Complete Atividades",
    description:
      "Resolva desafios diários, estude com timer, leia livros e ganhe moedas, XP e caixas misteriosas.",
  },
  {
    step: "04",
    icon: Award,
    title: "Evolua e Conquiste",
    description:
      "Suba de patente, desbloqueie itens exclusivos e torne-se um estudante disciplinado e organizado.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
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
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Comece sua jornada em{" "}
            <span className="gradient-text">4 passos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Um processo simples e sem fricção para você começar a evoluir hoje
            mesmo.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 border border-border/50 h-full relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-lg">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary-soft flex items-center justify-center mt-4 mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
