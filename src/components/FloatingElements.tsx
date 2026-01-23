import { motion } from "framer-motion";
import { BookOpen, Star, Sparkles, Zap, Trophy, Target, Brain, Flame, Gem, Crown, Rocket, Heart } from "lucide-react";

const icons = [BookOpen, Star, Sparkles, Zap, Trophy, Target, Brain, Flame, Gem, Crown, Rocket, Heart];

const colors = [
  "text-primary/20",
  "text-accent/20",
  "text-rank-gold/20",
  "text-pink-500/20",
  "text-purple-500/20",
  "text-cyan-500/20",
  "text-orange-500/20",
  "text-emerald-500/20",
];

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

export const FloatingElements = ({ count = 15, className = "" }: FloatingElementsProps) => {
  const elements = Array.from({ length: count }, (_, i) => ({
    Icon: icons[i % icons.length],
    color: colors[i % colors.length],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 16 + Math.random() * 24,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {elements.map((el, index) => (
        <motion.div
          key={index}
          className={`absolute ${el.color}`}
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 15, 0, -15, 0],
            rotate: [0, 10, 0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <el.Icon size={el.size} />
        </motion.div>
      ))}
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl"
        style={{ top: "10%", left: "5%" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/5 to-purple-500/5 blur-3xl"
        style={{ bottom: "20%", right: "10%" }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 blur-3xl"
        style={{ top: "50%", left: "50%" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
