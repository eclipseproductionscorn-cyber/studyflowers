import { motion } from "framer-motion";
import { 
  Calculator, 
  BookText, 
  Globe, 
  Microscope, 
  Palette, 
  Music,
  FlaskConical,
  Atom,
  Brain,
  Lightbulb,
  PenTool,
  Languages
} from "lucide-react";

const subjectIllustrations: Record<string, { icon: React.ElementType; colors: string[] }> = {
  matematica: { icon: Calculator, colors: ["#4F46E5", "#818CF8", "#C7D2FE"] },
  portugues: { icon: BookText, colors: ["#059669", "#34D399", "#A7F3D0"] },
  historia: { icon: Globe, colors: ["#B45309", "#F59E0B", "#FDE68A"] },
  geografia: { icon: Globe, colors: ["#0891B2", "#22D3EE", "#CFFAFE"] },
  ciencias: { icon: Microscope, colors: ["#7C3AED", "#A78BFA", "#DDD6FE"] },
  biologia: { icon: Microscope, colors: ["#16A34A", "#4ADE80", "#BBF7D0"] },
  quimica: { icon: FlaskConical, colors: ["#DC2626", "#F87171", "#FECACA"] },
  fisica: { icon: Atom, colors: ["#2563EB", "#60A5FA", "#BFDBFE"] },
  artes: { icon: Palette, colors: ["#DB2777", "#F472B6", "#FBCFE8"] },
  ingles: { icon: Languages, colors: ["#0D9488", "#2DD4BF", "#99F6E4"] },
  filosofia: { icon: Brain, colors: ["#7C3AED", "#A78BFA", "#DDD6FE"] },
  sociologia: { icon: Lightbulb, colors: ["#EA580C", "#FB923C", "#FED7AA"] },
  ed_fisica: { icon: Music, colors: ["#16A34A", "#4ADE80", "#BBF7D0"] },
  default: { icon: PenTool, colors: ["#6366F1", "#818CF8", "#C7D2FE"] },
};

interface ActivityIllustrationProps {
  subject: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export const ActivityIllustration = ({ 
  subject, 
  size = "md",
  animate = true 
}: ActivityIllustrationProps) => {
  const illustration = subjectIllustrations[subject] || subjectIllustrations.default;
  const Icon = illustration.icon;
  const [primary, secondary, tertiary] = illustration.colors;

  const sizeClasses = {
    sm: { container: "w-16 h-16", icon: 24 },
    md: { container: "w-24 h-24", icon: 40 },
    lg: { container: "w-32 h-32", icon: 56 },
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size].container}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      {/* Background circles */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20"
        style={{ backgroundColor: tertiary }}
        animate={animate ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full opacity-40"
        style={{ backgroundColor: secondary }}
        animate={animate ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      
      {/* Main icon container */}
      <motion.div
        className="absolute inset-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: primary }}
        animate={animate ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon size={sizeClasses[size].icon} className="text-white" />
      </motion.div>

      {/* Sparkles */}
      {animate && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: secondary }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: primary }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </>
      )}
    </motion.div>
  );
};

// Teacher Samuk character component
export const TeacherSamukAvatar = ({ 
  size = "md", 
  mood = "happy" 
}: { 
  size?: "sm" | "md" | "lg"; 
  mood?: "happy" | "thinking" | "celebrating";
}) => {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  const moodEmojis = {
    happy: "🎮",
    thinking: "🤔",
    celebrating: "🎉",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg`}
      animate={{ 
        y: [0, -3, 0],
        rotate: mood === "celebrating" ? [0, -5, 5, 0] : 0
      }}
      transition={{ 
        duration: mood === "celebrating" ? 0.5 : 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <span className="filter drop-shadow-md">{moodEmojis[mood]}</span>
    </motion.div>
  );
};

// Speech bubble for Teacher Samuk
export const SamukSpeechBubble = ({ 
  message, 
  type = "info" 
}: { 
  message: string; 
  type?: "info" | "success" | "hint" | "celebrate";
}) => {
  const typeStyles = {
    info: "bg-primary/10 border-primary/30 text-primary",
    success: "bg-success/10 border-success/30 text-success",
    hint: "bg-warning/10 border-warning/30 text-warning",
    celebrate: "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`relative p-4 rounded-2xl border ${typeStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <TeacherSamukAvatar 
          size="sm" 
          mood={type === "celebrate" ? "celebrating" : type === "hint" ? "thinking" : "happy"} 
        />
        <div className="flex-1">
          <p className="font-medium text-sm text-foreground">Teacher Samuk</p>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        </div>
      </div>
      
      {/* Speech bubble pointer */}
      <div 
        className={`absolute left-6 -bottom-2 w-4 h-4 rotate-45 border-r border-b ${typeStyles[type].split(" ").slice(0, 2).join(" ")}`}
        style={{ backgroundColor: "inherit" }}
      />
    </motion.div>
  );
};

// Fun decorative elements for activities
export const ActivityDecorations = ({ difficulty }: { difficulty: string }) => {
  const colors = {
    easy: ["#22C55E", "#4ADE80"],
    normal: ["#F59E0B", "#FBBF24"],
    hard: ["#EF4444", "#F87171"],
  };

  const diffColors = colors[difficulty as keyof typeof colors] || colors.normal;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Corner decorations */}
      <motion.div
        className="absolute -top-2 -right-2 w-12 h-12 rounded-full opacity-20"
        style={{ backgroundColor: diffColors[0] }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: diffColors[1] }}
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Stars for hard difficulty */}
      {difficulty === "hard" && (
        <>
          <motion.div
            className="absolute top-4 right-4 text-rank-gold"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4 text-rank-gold text-sm"
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            ✨
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ActivityIllustration;
