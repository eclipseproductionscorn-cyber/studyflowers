import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: { public_name: string; current_rank: string } | null;
}

const Chat = () => {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { public_name: string; current_rank: string }>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchProfiles();
    }
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, msg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, public_name, current_rank");
    if (data) {
      const map: Record<string, { public_name: string; current_rank: string }> = {};
      data.forEach((p) => { map[p.user_id] = { public_name: p.public_name, current_rank: p.current_rank }; });
      setProfiles(map);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data as ChatMessage[]) || []);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({ user_id: user.id, message: newMessage.trim() });
    if (error) toast.error("Erro ao enviar");
    setNewMessage("");
    setSending(false);
  };

  const getProfile = (userId: string) => profiles[userId] || { public_name: "Anônimo", current_rank: "bronze_1" };

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-8rem)] relative z-10">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="text-primary" /> Chat da Comunidade
          </h1>
          <p className="text-muted-foreground mt-1">Converse com outros estudantes em tempo real</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 bg-card/30 rounded-xl border border-border/50 p-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma mensagem ainda. Seja o primeiro!</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              const p = getProfile(msg.user_id);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                    {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{p.public_name}</p>}
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon">
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Chat;
