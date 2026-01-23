import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Atom, Sparkles, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingElements } from "@/components/FloatingElements";
import { useNavigate, useLocation } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QuantumX = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get question and subject from navigation state if available
  const initialQuestion = location.state?.question || "";
  const initialSubject = location.state?.subject || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = initialQuestion
        ? `Olá! 🎯 Vi que você está trabalhando em uma questão de ${initialSubject}. Vamos resolver juntos!\n\n**Questão:** ${initialQuestion}\n\nVamos começar: o que você já tentou ou qual parte está te deixando confuso?`
        : "Olá! 🎯 Sou a Quantum X, sua parceira de raciocínio! Meu trabalho é te ajudar a CHEGAR na resposta, não entregar ela de bandeja.\n\nCole uma questão ou me conte qual problema você quer resolver, e vamos descobrir juntos! 🧠✨";
      
      setMessages([{
        id: "initial",
        role: "assistant",
        content: greeting,
      }]);
    }
  }, [initialQuestion, initialSubject]);

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
      const { data, error } = await supabase.functions.invoke("quantum-x", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          question: initialQuestion,
          subject: initialSubject,
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500">
              <Atom className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Quantum X
                <Sparkles className="text-purple-500" size={18} />
              </h1>
              <p className="text-sm text-muted-foreground">
                Guiando você até a resposta 🎯
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
        >
          <div className="flex items-start gap-2">
            <HelpCircle size={16} className="text-purple-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-500 font-medium">Quantum X não dá respostas!</span> Ela te guia através de perguntas e dicas para você descobrir sozinho.
            </p>
          </div>
        </motion.div>

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
                    : "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Atom size={16} className="text-purple-500" />
                    <span className="text-xs font-medium text-purple-500">Quantum X</span>
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
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-purple-500" size={16} />
                  <span className="text-sm text-muted-foreground">Quantum X está analisando...</span>
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
              placeholder="Cole sua questão ou descreva o problema..."
              className="resize-none min-h-[48px] max-h-32"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            🧠 Lembre-se: O objetivo é você DESCOBRIR a resposta, não recebê-la pronta!
          </p>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default QuantumX;
