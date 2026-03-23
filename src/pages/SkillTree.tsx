import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TreePine, Lock, CheckCircle, Zap, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SkillNode {
  id: string;
  name: string;
  subject: string;
  level: number;
  maxLevel: number;
  status: "locked" | "available" | "in_progress" | "mastered";
  xp: number;
  xpRequired: number;
  children: string[];
  icon: string;
}

const SUBJECT_SKILLS: Record<string, { icon: string; color: string; skills: { name: string; icon: string }[] }> = {
  "Matemática": {
    icon: "🔢", color: "hsl(var(--primary))",
    skills: [
      { name: "Álgebra Básica", icon: "➕" },
      { name: "Geometria", icon: "📐" },
      { name: "Funções", icon: "📈" },
      { name: "Trigonometria", icon: "📏" },
      { name: "Probabilidade", icon: "🎲" },
      { name: "Estatística", icon: "📊" },
    ],
  },
  "Português": {
    icon: "📝", color: "hsl(var(--accent))",
    skills: [
      { name: "Gramática", icon: "📖" },
      { name: "Interpretação", icon: "🔍" },
      { name: "Redação", icon: "✍️" },
      { name: "Literatura", icon: "📚" },
      { name: "Semântica", icon: "💡" },
      { name: "Sintaxe", icon: "🔗" },
    ],
  },
  "História": {
    icon: "🏛️", color: "#ef4444",
    skills: [
      { name: "Antiguidade", icon: "🏺" },
      { name: "Idade Média", icon: "⚔️" },
      { name: "Era Moderna", icon: "🌍" },
      { name: "Brasil Colônia", icon: "🚢" },
      { name: "Revoluções", icon: "🔥" },
      { name: "Contemporânea", icon: "🌐" },
    ],
  },
  "Ciências": {
    icon: "🔬", color: "#22c55e",
    skills: [
      { name: "Célula e Vida", icon: "🧬" },
      { name: "Ecossistemas", icon: "🌱" },
      { name: "Corpo Humano", icon: "🫀" },
      { name: "Química Básica", icon: "⚗️" },
      { name: "Física Básica", icon: "⚡" },
      { name: "Astronomia", icon: "🌌" },
    ],
  },
  "Geografia": {
    icon: "🌎", color: "#06b6d4",
    skills: [
      { name: "Cartografia", icon: "🗺️" },
      { name: "Clima", icon: "🌦️" },
      { name: "Geopolítica", icon: "🏴" },
      { name: "Urbanização", icon: "🏙️" },
      { name: "Meio Ambiente", icon: "♻️" },
      { name: "Demografia", icon: "👥" },
    ],
  },
};

const SkillTree = () => {
  const { profile, user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("Matemática");
  const [completedActivities, setCompletedActivities] = useState(0);

  useEffect(() => {
    if (user) fetchActivityCount();
  }, [user, selectedSubject]);

  const fetchActivityCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("ai_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("subject", selectedSubject)
      .eq("is_completed", true);
    setCompletedActivities(count || 0);
  };

  const subjects = Object.keys(SUBJECT_SKILLS);
  const subjectData = SUBJECT_SKILLS[selectedSubject];
  const skills = subjectData.skills;

  // Derive skill status from completed activities
  const getSkillStatus = (index: number): { status: string; level: number; xp: number } => {
    const activitiesPerSkill = 5;
    const skillActivities = Math.max(0, completedActivities - index * activitiesPerSkill);
    const level = Math.min(3, Math.floor(skillActivities / activitiesPerSkill));
    const xp = Math.min(activitiesPerSkill, skillActivities % activitiesPerSkill || (level > 0 ? activitiesPerSkill : 0));

    if (level >= 3) return { status: "mastered", level, xp };
    if (skillActivities > 0) return { status: "in_progress", level, xp };
    if (index === 0 || completedActivities >= (index - 1) * activitiesPerSkill) return { status: "available", level: 0, xp: 0 };
    return { status: "locked", level: 0, xp: 0 };
  };

  const totalMastered = skills.filter((_, i) => getSkillStatus(i).status === "mastered").length;

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <TreePine className="text-primary" /> Árvore de Habilidades
          </h1>
          <p className="text-muted-foreground mt-1">Desbloqueie e evolua suas habilidades em cada matéria</p>
        </div>

        {/* Subject tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                selectedSubject === subject
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{SUBJECT_SKILLS[subject].icon}</span>
              <span className="font-medium text-sm">{subject}</span>
            </button>
          ))}
        </div>

        {/* Subject mastery header */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: subjectData.color + "20" }}>
                {subjectData.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedSubject}</h2>
                <p className="text-sm text-muted-foreground">{totalMastered}/{skills.length} habilidades dominadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1"><Zap size={12} /> {completedActivities} atividades</Badge>
            </div>
          </div>
          <Progress value={(totalMastered / skills.length) * 100} className="mt-4 h-2" />
        </div>

        {/* Skill tree visual */}
        <div className="relative">
          {/* Central trunk line */}
          <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-primary/40 via-accent/30 to-transparent -translate-x-1/2 rounded-full hidden md:block" />

          <div className="space-y-6">
            {skills.map((skill, i) => {
              const { status, level, xp } = getSkillStatus(i);
              const isEven = i % 2 === 0;

              const statusConfig = {
                locked: { border: "border-border/30", bg: "bg-muted/20", opacity: "opacity-40", badge: "🔒 Bloqueada", badgeVariant: "outline" as const },
                available: { border: "border-primary/30", bg: "bg-card/50", opacity: "", badge: "🟢 Disponível", badgeVariant: "secondary" as const },
                in_progress: { border: "border-accent/50", bg: "bg-accent/5", opacity: "", badge: "⚡ Em progresso", badgeVariant: "secondary" as const },
                mastered: { border: "border-amber-400/50", bg: "bg-amber-500/5", opacity: "", badge: "⭐ Dominada", badgeVariant: "default" as const },
              }[status];

              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:flex-row`}
                >
                  <div className={`flex-1 ${isEven ? "md:text-right" : ""}`}>
                    <div className={`inline-block w-full max-w-xs p-4 rounded-2xl border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.opacity} transition-all`}>
                      <div className={`flex items-center gap-2 ${isEven ? "md:flex-row-reverse" : ""}`}>
                        <span className="text-2xl">{skill.icon}</span>
                        <div className={isEven ? "md:text-right" : ""}>
                          <p className="font-bold text-sm text-foreground">{skill.name}</p>
                          <Badge variant={statusConfig.badgeVariant} className="text-[10px] mt-1">{statusConfig.badge}</Badge>
                        </div>
                      </div>
                      {status !== "locked" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Nível {level}/3</span>
                            <span>{xp}/5</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(xp / 5) * 100}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: status === "mastered" ? "#f59e0b" : subjectData.color }}
                            />
                          </div>
                          <div className="flex gap-1 mt-2 justify-center">
                            {[1, 2, 3].map((l) => (
                              <Star
                                key={l}
                                size={14}
                                className={l <= level ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      animate={status === "in_progress" ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] ${
                        status === "mastered"
                          ? "bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 text-white shadow-lg shadow-amber-500/20"
                          : status === "in_progress"
                          ? "bg-gradient-to-br from-primary to-accent border-primary text-white shadow-md shadow-primary/20"
                          : status === "available"
                          ? "bg-card border-primary/50 text-primary"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {status === "mastered" ? <CheckCircle size={20} /> : status === "locked" ? <Lock size={16} /> : <Sparkles size={18} />}
                    </motion.div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SkillTree;
