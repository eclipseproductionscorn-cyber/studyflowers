import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Send,
  Loader2,
  X,
  Sparkles,
  BookOpen,
  Brain,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedActivity {
  title: string;
  content_text: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
}

interface CustomActivityCreatorProps {
  onActivityCreated?: () => void;
}

const promptSuggestions = [
  "Quiz sobre o sistema solar",
  "Questões de matemática com frações",
  "Exercícios de interpretação de texto",
  "Perguntas sobre a história do Brasil",
  "Desafio de química sobre tabela periódica",
  "Gramática: uso de vírgulas",
];

const CustomActivityCreator = ({ onActivityCreated }: CustomActivityCreatorProps) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<GeneratedActivity | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Digite o que você quer estudar!");
      return;
    }

    setIsGenerating(true);
    setGeneratedActivity(null);

    try {
      const response = await supabase.functions.invoke("generate-activity", {
        body: {
          subject: "Personalizado",
          topic: prompt,
          difficulty: "normal",
          schoolYear: profile?.school_year || "ensino médio",
          questionType: "multiple_choice",
        },
      });

      if (response.error) throw new Error(response.error.message);

      const activity = response.data.activity;
      setGeneratedActivity(activity);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating custom activity:", error);
      toast.error("Erro ao gerar atividade. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!generatedActivity || !user) return;

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

      const { error } = await supabase.from("ai_activities").insert({
        user_id: user.id,
        title: generatedActivity.title,
        subject: "Personalizado",
        difficulty: "normal",
        content_text: generatedActivity.content_text,
        question: generatedActivity.question,
        question_type: generatedActivity.question_type || "multiple_choice",
        options: generatedActivity.options,
        correct_answer: generatedActivity.correct_answer,
        explanation: generatedActivity.explanation,
        day_of_week: dayOfWeek,
        week_number: weekNumber,
        xp_reward: 35,
        coin_reward: 20,
      });

      if (error) throw error;

      toast.success("Atividade personalizada criada! 🎨");
      setIsOpen(false);
      setPrompt("");
      setGeneratedActivity(null);
      setShowPreview(false);
      onActivityCreated?.();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Erro ao salvar atividade");
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center justify-center gap-3 group"
      >
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
          <Wand2 className="text-white" size={20} />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Criar Atividade com IA</p>
          <p className="text-xs text-muted-foreground">
            Peça qualquer tema e a IA cria para você
          </p>
        </div>
      </motion.button>

      {/* Creator Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" size={20} />
              Criar Atividade Personalizada
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Input Area */}
            <div className="relative">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Digite o que você quer estudar... Ex: Quiz sobre frações"
                className="pr-24"
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
              />
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Gerar
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Sugestões:</span>
              {promptSuggestions.slice(0, 4).map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-3 flex items-center justify-center"
                  >
                    <Brain className="text-white" size={24} />
                  </motion.div>
                  <p className="font-medium text-foreground">
                    Teacher Samuk está criando sua atividade...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preparando conteúdo, questões e explicações
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview */}
            <AnimatePresence>
              {showPreview && generatedActivity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-success/5 border border-success/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="text-success" size={18} />
                      <span className="font-medium text-foreground">
                        Atividade Gerada!
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Título</p>
                        <p className="font-medium text-foreground">
                          {generatedActivity.title}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Conteúdo</p>
                        <p className="text-sm text-foreground line-clamp-3">
                          {generatedActivity.content_text}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Questão</p>
                        <p className="text-sm text-foreground">
                          {generatedActivity.question}
                        </p>
                      </div>

                      {generatedActivity.options && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Opções
                          </p>
                          <div className="space-y-1">
                            {generatedActivity.options.map((opt, i) => (
                              <p
                                key={i}
                                className={`text-sm px-2 py-1 rounded ${
                                  opt.charAt(0) === generatedActivity.correct_answer.charAt(0)
                                    ? "bg-success/10 text-success"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {opt}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratedActivity(null);
                        setShowPreview(false);
                      }}
                    >
                      <X size={16} className="mr-1" />
                      Descartar
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-accent"
                      onClick={handleSaveActivity}
                    >
                      <BookOpen size={16} className="mr-1" />
                      Salvar e Estudar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomActivityCreator;
