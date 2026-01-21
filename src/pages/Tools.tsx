import { motion } from "framer-motion";
import {
  Bot,
  Clock,
  FileText,
  Target,
  BookMarked,
  BrainCircuit,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const tools = [
  {
    id: "tutor",
    title: "IA Tutora",
    description: "Tire dúvidas e receba explicações personalizadas",
    icon: Bot,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    path: "/tutor",
    available: true,
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
    id: "notes",
    title: "Anotações",
    description: "Organize suas anotações e resumos de estudo",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    path: "/notes",
    available: false,
  },
  {
    id: "goals",
    title: "Metas de Estudo",
    description: "Defina e acompanhe suas metas semanais",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    path: "/goals",
    available: false,
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
    available: false,
  },
  {
    id: "quiz",
    title: "Quizzes",
    description: "Teste seus conhecimentos com quizzes personalizados",
    icon: BrainCircuit,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-500",
    path: "/quizzes",
    available: false,
  },
];

const Tools = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Ferramentas de Estudo
          </h1>
          <p className="text-muted-foreground mt-1">
            Recursos para potencializar seu aprendizado
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              {tool.available ? (
                <Link
                  to={tool.path}
                  className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group"
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

        {/* AI Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
              <Sparkles className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                IA Tutora Inteligente
              </h3>
              <p className="text-muted-foreground">
                Nossa IA explica conceitos de forma personalizada, focando no
                "porquê" para desenvolver sua autonomia intelectual.
              </p>
            </div>
            <Link
              to="/tutor"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Experimentar
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Tools;
