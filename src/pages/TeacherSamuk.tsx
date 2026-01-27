import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Loader2,
  Gamepad2,
  Trophy,
  Flame,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  { icon: Gamepad2, text: "Me ajuda a entender melhor uma matéria", color: "from-purple-500 to-pink-500" },
  { icon: Trophy, text: "Como subir de nível mais rápido?", color: "from-amber-500 to-orange-500" },
  { icon: Flame, text: "Dicas para manter minha ofensiva", color: "from-red-500 to-orange-500" },
  { icon: GraduationCap, text: "Explica um conceito de forma simples", color: "from-blue-500 to-cyan-500" },
];

const TeacherSamuk = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `E aí, ${profile?.public_name || "Estudante"}! 🎮 Sou o **Teacher Samuk**, seu mentor no StudyFlow!\n\nAqui a gente transforma estudo em um jogo épico. Pode me perguntar sobre qualquer matéria, pedir dicas de como subir de level mais rápido, ou só trocar uma ideia sobre como turbinar seus estudos!\n\nBora dominar o conhecimento juntos? 🚀`,
        },
      ]);
    }
  }, [profile?.public_name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("teacher-samuk", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userName: profile?.public_name,
          userLevel: profile?.level,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      if (error.message?.includes("429")) {
        toast.error("Muitas mensagens! Aguarde um momento.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos da IA esgotados.");
      } else {
        toast.error("Erro ao enviar mensagem.");
      }
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

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Conversa reiniciada! 🔄\n\nE aí, ${profile?.public_name || "Estudante"}! Sobre o que vamos falar agora? 🎮`,
      },
    ]);
  };

  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[calc(100vh-8rem)] flex flex-col relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
            >
              <Gamepad2 className="text-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Teacher Samuk
                <Sparkles className="text-emerald-500" size={18} />
              </h1>
              <p className="text-sm text-muted-foreground">
                Seu mentor no mundo do conhecimento 🎮
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <RefreshCw size={16} className="mr-2" />
            Limpar
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        : "bg-muted/50 text-foreground border border-border/50"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                          <Gamepad2 className="text-white" size={14} />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Teacher Samuk
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return (
                            <strong key={i}>
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <Gamepad2 className="text-white" size={14} />
                      </div>
                      <Loader2 className="animate-spin text-emerald-500" size={18} />
                      <span className="text-sm text-muted-foreground">
                        Pensando...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => sendMessage(prompt.text)}
                    className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r ${prompt.color} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
                  >
                    <prompt.icon size={16} />
                    <span className="text-left line-clamp-1">{prompt.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Manda tua dúvida aí..."
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherSamuk;
