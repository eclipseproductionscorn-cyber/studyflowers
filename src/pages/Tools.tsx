import { motion } from "framer-motion";
import {
  Bot,
  Clock,
  Target,
  BookMarked,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Atom,
  GraduationCap,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";

const tools = [
  {
    id: "teacher-nick",
    title: "Teacher Nick",
    description: "Aprenda de forma divertida com explicações e curiosidades",
    icon: GraduationCap,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    path: "/teacher-nick",
    available: true,
    badge: "IA",
  },
  {
    id: "ai-tutor",
    title: "IA Tutora",
    description: "Gere atividades personalizadas e tire suas dúvidas",
    icon: Bot,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    path: "/ai-tutora",
    available: true,
    badge: "IA",
  },
  {
    id: "quantum-x",
    title: "Quantum X",
    description: "Explica a lógica e guia você até a resposta",
    icon: Atom,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-500",
    path: "/quantum-x",
    available: true,
    badge: "IA",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    description: "Gerencie seu tempo de estudos com técnica pomodoro",
    icon: Clock,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    path: "/pomodoro",
    available: true,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Crie e estude com cartões de memorização",
    icon: BookMarked,
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    path: "/flashcards",
    available: true,
  },
  {
    id: "goals",
    title: "Metas Semanais",
    description: "Defina e acompanhe suas metas da semana",
    icon: Target,
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-500",
    path: "/weekly-goals",
    available: true,
  },
  {
    id: "inventory",
    title: "Inventário",
    description: "Veja seus itens e poderes coletados",
    icon: Package,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-500",
    path: "/inventory",
    available: true,
  },
  {
    id: "quiz",
    title: "Quizzes Rápidos",
    description: "Teste seus conhecimentos com quizzes personalizados",
    icon: BrainCircuit,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-500",
    path: "/activities",
    available: true,
  },
];

const Tools = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ferramentas de Estudo
          </h1>
          <p className="text-muted-foreground mt-1">
            Recursos para potencializar seu aprendizado
          </p>
        </div>

        {/* AI Tools Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Assistentes de IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tools.filter(t => t.badge === "IA").map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link
                  to={tool.path}
                  className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group h-full"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <tool.icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <ArrowRight
                          size={18}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Study Tools Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Ferramentas de Estudo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.filter(t => !t.badge).map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {tool.available ? (
                  <Link
                    to={tool.path}
                    className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-transform`}
                      >
                        <tool.icon className={tool.textColor} size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {tool.title}
                          </h3>
                          <ArrowRight
                            size={18}
                            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-5 opacity-60">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${tool.bgColor}`}>
                        <tool.icon className={tool.textColor} size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            {tool.title}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            Em breve
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
              <Sparkles className="text-white" size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground">
                Ecossistema de IA Educacional
              </h3>
              <p className="text-muted-foreground">
                Três IAs especializadas para diferentes momentos do seu aprendizado: 
                Teacher Nick ensina, IA Tutora gera atividades, e Quantum X guia seu raciocínio.
              </p>
            </div>
            <Link
              to="/teacher-nick"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg"
            >
              Começar
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Tools;
