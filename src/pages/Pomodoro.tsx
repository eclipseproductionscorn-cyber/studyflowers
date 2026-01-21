import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, BookOpen, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const timerModes = {
  focus: { label: "Foco", duration: 25 * 60, color: "from-primary to-accent" },
  shortBreak: { label: "Pausa Curta", duration: 5 * 60, color: "from-green-500 to-emerald-500" },
  longBreak: { label: "Pausa Longa", duration: 15 * 60, color: "from-blue-500 to-cyan-500" },
};

const Pomodoro = () => {
  const { profile, user, addCoins, addXP } = useAuth();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(timerModes.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [sessionStarted, setSessionStarted] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (mode === "focus") {
      setCompletedPomodoros((prev) => prev + 1);

      // Save session
      if (user && sessionStarted) {
        await supabase.from("study_sessions").insert({
          user_id: user.id,
          duration_minutes: 25,
          subject: "Pomodoro",
          xp_earned: 25,
          coins_earned: 15,
          started_at: sessionStarted.toISOString(),
          ended_at: new Date().toISOString(),
        });
      }

      await addXP(25);
      await addCoins(15);
      toast.success("🍅 Pomodoro completo! +25 XP e +15 moedas");

      // Switch to break
      const nextMode = completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(timerModes[nextMode].duration);
    } else {
      // Switch back to focus
      setMode("focus");
      setTimeLeft(timerModes.focus.duration);
      toast.info("☕ Pausa terminada! Hora de focar novamente.");
    }

    // Play notification sound (if available)
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch {}
  };

  const toggleTimer = () => {
    if (!isRunning && mode === "focus" && !sessionStarted) {
      setSessionStarted(new Date());
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerModes[mode].duration);
    setSessionStarted(null);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(timerModes[newMode].duration);
    setSessionStarted(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((timerModes[mode].duration - timeLeft) / timerModes[mode].duration) * 100;

  return (
    <DashboardLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Pomodoro Timer
          </h1>
          <p className="text-muted-foreground mt-1">
            25 min de foco, 5 min de pausa
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2">
          {(Object.keys(timerModes) as TimerMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode(m)}
              className={mode === m ? `bg-gradient-to-r ${timerModes[m].color}` : ""}
            >
              {m === "focus" ? (
                <BookOpen size={16} className="mr-1" />
              ) : (
                <Coffee size={16} className="mr-1" />
              )}
              {timerModes[m].label}
            </Button>
          ))}
        </div>

        {/* Timer Circle */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex justify-center"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}%`}
                strokeDashoffset={`${(1 - progress / 100) * 2 * Math.PI * 45}%`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 45}%` }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl md:text-6xl font-bold text-foreground tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-muted-foreground mt-2">
                {timerModes[mode].label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={resetTimer}
          >
            <RotateCcw size={20} />
          </Button>

          <Button
            size="lg"
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${timerModes[mode].color} hover:opacity-90`}
            onClick={toggleTimer}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-foreground">
              {completedPomodoros}
            </div>
            <p className="text-sm text-muted-foreground">Pomodoros Hoje</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-foreground">
              {completedPomodoros * 25}
            </div>
            <p className="text-sm text-muted-foreground">Minutos de Foco</p>
          </motion.div>
        </div>

        {/* Rewards Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 rounded-xl p-4"
        >
          <h3 className="font-semibold text-foreground mb-3">Recompensas por Pomodoro</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="text-muted-foreground">+25 XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-rank-gold" />
              <span className="text-muted-foreground">+15 moedas</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Pomodoro;
