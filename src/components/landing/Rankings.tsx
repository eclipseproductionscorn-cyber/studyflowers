import { motion } from "framer-motion";
import { Crown, Medal, Star, Shield, Gem, Hexagon } from "lucide-react";

const ranks = [
  {
    name: "Bronze",
    icon: Medal,
    levels: ["I", "II", "III"],
    color: "from-amber-600 to-amber-700",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
  },
  {
    name: "Prata",
    icon: Shield,
    levels: ["I", "II", "III"],
    color: "from-slate-400 to-slate-500",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
  },
  {
    name: "Ouro",
    icon: Crown,
    levels: ["I", "II", "III"],
    color: "from-yellow-400 to-yellow-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
  },
  {
    name: "Platina",
    icon: Star,
    levels: ["I", "II", "III"],
    color: "from-cyan-400 to-cyan-500",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-300",
  },
  {
    name: "Diamante",
    icon: Gem,
    levels: ["I", "II", "III"],
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
  },
  {
    name: "Ônix",
    icon: Hexagon,
    levels: ["I", "II", "III"],
    color: "from-violet-600 to-purple-800",
    bgColor: "bg-violet-100",
    textColor: "text-violet-800",
    borderColor: "border-violet-300",
  },
];

const Rankings = () => {
  return (
    <section id="rankings" className="py-24 lg:py-32 bg-muted/30">
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
            Sistema de Patentes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Suba de ranking e mostre sua{" "}
            <span className="gradient-text">evolução</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Do Bronze ao Ônix III. Cada patente representa sua dedicação,
            constância e evolução nos estudos.
          </p>
        </motion.div>

        {/* Ranks Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {ranks.map((rank, index) => (
            <motion.div
              key={rank.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <div
                className={`relative bg-card rounded-2xl p-6 border ${rank.borderColor} hover:shadow-large transition-all duration-300 text-center`}
              >
                {/* Glow Effect on Hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rank.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative w-16 h-16 mx-auto rounded-xl ${rank.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <rank.icon className={`w-8 h-8 ${rank.textColor}`} />
                </div>

                {/* Name */}
                <h3 className={`font-bold text-lg ${rank.textColor} mb-2`}>
                  {rank.name}
                </h3>

                {/* Levels */}
                <div className="flex justify-center gap-1">
                  {rank.levels.map((level) => (
                    <span
                      key={level}
                      className={`text-xs font-medium px-2 py-0.5 rounded ${rank.bgColor} ${rank.textColor}`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {[
            {
              title: "Frequência de Estudo",
              description:
                "Sua constância diária é um dos principais fatores para subir de patente.",
            },
            {
              title: "Conclusão de Atividades",
              description:
                "Complete desafios e atividades diárias para acumular pontos de ranking.",
            },
            {
              title: "Evolução Contínua",
              description:
                "Quanto mais você aprende e pratica, mais rápido você sobe de patente.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border/50"
            >
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Rankings;
