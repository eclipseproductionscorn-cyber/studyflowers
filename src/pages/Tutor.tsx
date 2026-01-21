import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Tutor = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! 👋 Sou sua IA Tutora. Posso ajudar você a entender conceitos, resolver dúvidas e explicar o raciocínio por trás das respostas. O que você gostaria de aprender hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.content || "Desculpe, não consegui processar sua pergunta.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI tutor:", error);
      toast.error("Erro ao processar sua pergunta. Tente novamente.");

      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Desculpe, estou tendo dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
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
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 pb-4 border-b border-border/50"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">IA Tutora</h1>
            <p className="text-sm text-muted-foreground">
              Aprenda com explicações personalizadas
            </p>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
                }`}
              >
                {message.role === "user" ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card/50 border border-border/50 rounded-tl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-card/50 border border-border/50 rounded-2xl rounded-tl-sm p-4">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Pensando...
                  </span>
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
          className="border-t border-border/50 pt-4"
        >
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Faça uma pergunta..."
              className="min-h-[52px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[52px] w-[52px] bg-gradient-to-br from-purple-500 to-indigo-500 hover:opacity-90"
            >
              <Send size={20} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <Sparkles size={12} className="inline mr-1" />
            A IA Tutora foca em desenvolver sua autonomia intelectual
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Tutor;
