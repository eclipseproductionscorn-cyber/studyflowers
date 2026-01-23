import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Brain, Sparkles, ArrowLeft, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { allSubjects, getSubjectLabel } from "@/lib/subjects";
import { FloatingElements } from "@/components/FloatingElements";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AiTutora = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [generatingActivity, setGeneratingActivity] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userSubjects = (profile as any)?.subjects || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "initial",
        role: "assistant",
        content: "Olá! 📚 Sou a IA Tutora do Studio Flow!\n\nEu posso te ajudar de duas formas:\n1. **Criar atividades** sobre qualquer tema que você quiser\n2. **Tirar dúvidas** guiando você a entender o conceito\n\nDigite o tema que você quer estudar e eu vou criar uma atividade personalizada! Exemplo: *\"teorema de Pitágoras\"* ou *\"segunda guerra mundial\"*",
      }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateActivity = async () => {
    if (!selectedSubject) {
      toast.error("Selecione uma matéria primeiro");
      return;
    }

    setGeneratingActivity(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-activity", {
        body: {
          subject: getSubjectLabel(selectedSubject),
          difficulty: "normal",
          schoolYear: (profile as any)?.school_year,
          questionType: "multiple_choice",
        },
      });

      if (error) throw error;

      if (data.activity) {
        toast.success("Atividade criada! Veja na página de Atividades IA");
        // Navigate to the new AI activities page
        navigate("/ai-activities", { state: { newActivity: data.activity } });
      }
    } catch (error) {
      console.error("Error generating activity:", error);
      toast.error("Erro ao gerar atividade. Tente novamente.");
    } finally {
      setGeneratingActivity(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements count={12} className="opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-[calc(100vh-120px)] relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Brain className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  IA Tutora
                  <Sparkles className="text-primary" size={18} />
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cria atividades e tira dúvidas
                </p>
              </div>
            </div>
          </div>

          {/* Quick Generate */}
          <div className="flex items-center gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                {(userSubjects.length > 0 ? userSubjects : allSubjects.map(s => s.id)).map((subjectId: string) => {
                  const subject = allSubjects.find(s => s.id === subjectId);
                  return (
                    <SelectItem key={subjectId} value={subjectId}>
                      {subject?.icon} {subject?.label || subjectId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              onClick={generateActivity}
              disabled={generatingActivity || !selectedSubject}
              size="sm"
              className="gap-1"
            >
              {generatingActivity ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Criar Atividade
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={16} className="text-primary" />
                    <span className="text-xs font-medium text-primary">IA Tutora</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={16} />
                  <span className="text-sm text-muted-foreground">IA Tutora está pensando...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-border/50 pt-4"
        >
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um tema para criar atividade ou faça uma pergunta..."
              className="resize-none min-h-[48px] max-h-32"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Ex: "teorema de Pitágoras", "revolução francesa", "células vegetais"
          </p>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AiTutora;
