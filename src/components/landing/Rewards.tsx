import { motion } from "framer-motion";
import { Coins, Gift, Flame, BookCheck, Timer, Zap } from "lucide-react";

const rewardSources = [
  {
    icon: BookCheck,
    title: "Atividades Diárias",
    coins: "+50-200",
    description: "Complete desafios gerados por IA",
  },
  {
    icon: Timer,
    title: "Sessões de Estudo",
    coins: "+30-100",
    description: "Estude 50 minutos com timer",
  },
  {
    icon: Flame,
    title: "Ofensivas",
    coins: "+25 bônus",
    description: "Mantenha sua sequência de dias",
  },
  {
    icon: Zap,
    title: "Leitura",
    coins: "+20-80",
    description: "Leia 50 minutos de um livro",
  },
];

const Rewards = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-sm font-medium text-primary mb-4">
              Sistema de Recompensas
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ganhe moedas e{" "}
              <span className="gradient-text">desbloqueie recompensas</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Cada atividade concluída te aproxima de novas conquistas. Ganhe
              moedas, abra caixas misteriosas e personalize seu perfil.
            </p>

            {/* Reward Sources */}
            <div className="grid grid-cols-2 gap-4">
              {rewardSources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-card rounded-xl p-4 border border-border/50"
                >
                  <source.icon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold text-sm mb-1">{source.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {source.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-warning">
                    <Coins className="w-4 h-4" />
                    {source.coins}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Mystery Box Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-large">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-warning to-warning/80 shadow-glow mb-4"
                >
                  <Gift className="w-10 h-10 text-warning-foreground" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Caixa Misteriosa</h3>
                <p className="text-muted-foreground">
                  Abra e descubra recompensas exclusivas!
                </p>
              </div>

              {/* Possible Rewards */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
                  Possíveis recompensas:
                </p>
                {[
                  { label: "Avatares Exclusivos", rarity: "Comum" },
                  { label: "Estilos de Nome", rarity: "Incomum" },
                  { label: "Emblemas Especiais", rarity: "Raro" },
                  { label: "Bônus de XP (2x)", rarity: "Épico" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.rarity === "Comum"
                          ? "bg-secondary text-secondary-foreground"
                          : item.rarity === "Incomum"
                          ? "bg-accent-soft text-accent"
                          : item.rarity === "Raro"
                          ? "bg-primary-soft text-primary"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {item.rarity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bonus Info */}
              <div className="mt-6 p-4 rounded-xl bg-success-soft border border-success/20">
                <p className="text-sm text-success font-medium text-center">
                  🎁 Novos usuários recebem 2.000 moedas + 1 caixa grátis!
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-warning/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Rewards;
