import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, GraduationCap, BookOpen, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { schoolYears, getSubjectsByYear, allSubjects } from "@/lib/subjects";
import { FloatingElements } from "@/components/FloatingElements";

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [schoolYear, setSchoolYear] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableSubjects = schoolYear ? getSubjectsByYear(schoolYear) : allSubjects;

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleComplete = async () => {
    if (!schoolYear || selectedSubjects.length === 0) {
      toast.error("Por favor, complete todas as informações");
      return;
    }

    setLoading(true);
    const success = await updateProfile({
      school_year: schoolYear,
      subjects: selectedSubjects,
      onboarding_completed: true,
    } as any);

    if (success) {
      toast.success("Perfil configurado! Agora vamos medir seu nível! 🧠");
      navigate("/leveling-quiz");
    } else {
      toast.error("Erro ao salvar. Tente novamente.");
    }
    setLoading(false);
  };

  const steps = [
    {
      title: "Qual é o seu ano escolar?",
      subtitle: "Isso nos ajuda a preparar conteúdo adequado para você",
      icon: GraduationCap,
    },
    {
      title: "Quais matérias você estuda?",
      subtitle: "Selecione todas as suas disciplinas",
      icon: BookOpen,
    },
    {
      title: "Tudo pronto!",
      subtitle: "Vamos criar seu cronograma personalizado",
      icon: Rocket,
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements count={20} />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-primary w-12" : "bg-muted w-8"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: s === step ? 1.1 : 1 }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Passo {step} de 3
          </p>
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-lg bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl p-8 shadow-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4"
            >
              <currentStep.icon className="text-white" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">{currentStep.title}</h1>
            <p className="text-muted-foreground mt-2">{currentStep.subtitle}</p>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {schoolYears.map((year, index) => (
                  <motion.button
                    key={year.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSchoolYear(year.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      schoolYear === year.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-background/50"
                    }`}
                  >
                    <span className={`font-medium ${schoolYear === year.value ? "text-primary" : "text-foreground"}`}>
                      {year.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {selectedSubjects.length} matéria{selectedSubjects.length !== 1 ? "s" : ""} selecionada{selectedSubjects.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {availableSubjects.map((subject, index) => (
                    <motion.button
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleSubject(subject.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        selectedSubjects.includes(subject.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-background/50"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{subject.icon}</span>
                      <span className={`text-sm font-medium ${
                        selectedSubjects.includes(subject.id) ? "text-primary" : "text-foreground"
                      }`}>
                        {subject.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Ano Escolar</p>
                    <p className="font-semibold text-foreground">
                      {schoolYears.find(y => y.value === schoolYear)?.label}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Matérias</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedSubjects.map(subjectId => {
                        const subject = allSubjects.find(s => s.id === subjectId);
                        return (
                          <span
                            key={subjectId}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                          >
                            {subject?.icon} {subject?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 text-primary"
                  >
                    <Sparkles size={20} />
                    <span className="font-medium">A IA vai criar atividades personalizadas!</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft size={18} className="mr-1" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !schoolYear) ||
                  (step === 2 && selectedSubjects.length === 0)
                }
              >
                Continuar
                <ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Começar!
                    <Rocket size={18} className="ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
