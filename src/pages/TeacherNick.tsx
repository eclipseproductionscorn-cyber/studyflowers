import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, GraduationCap, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAgeFromYear } from "@/lib/subjects";
import { FloatingElements } from "@/components/FloatingElements";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TeacherNick = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userAge = profile?.school_year ? getAgeFromYear(profile.school_year) : 15;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      const greeting = userAge <= 10
        ? "Olááá! 🎉 Eu sou o Teacher Nick! Tô super animado pra te ensinar coisas legais! O que você quer aprender hoje? 🚀"
        : userAge <= 13
        ? "E aí! 😄 Sou o Teacher Nick, seu professor mais animado! Qual curiosidade ou matéria você quer explorar hoje? 🌟"
        : "Fala! 👋 Sou o Teacher Nick! Tô aqui pra te ajudar a entender qualquer assunto de um jeito que faz sentido. O que vamos descobrir hoje? 🎯";
      
      setMessages([{
        id: "initial",
        role: "assistant",
        content: greeting,
      }]);
    }
  }, [userAge]);

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
      const { data, error } = await supabase.functions.invoke("teacher-nick", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userAge,
          schoolYear: profile?.school_year,
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
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Teacher Nick
                <Sparkles className="text-amber-500" size={18} />
              </h1>
              <p className="text-sm text-muted-foreground">
                Seu professor mais animado! 🎉
              </p>
            </div>
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
                    : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={16} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-500">Teacher Nick</span>
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
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-amber-500" size={16} />
                  <span className="text-sm text-muted-foreground">Teacher Nick está pensando...</span>
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
              placeholder="Me pergunte qualquer coisa! Ex: 'Como funciona a fotossíntese?' 🌱"
              className="resize-none min-h-[48px] max-h-32"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Dica: Pergunte sobre curiosidades, conceitos ou peça explicações de qualquer tema!
          </p>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherNick;
