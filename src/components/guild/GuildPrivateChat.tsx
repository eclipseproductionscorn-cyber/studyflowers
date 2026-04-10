import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SmilePlus, AtSign, ArrowLeft, User, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉", "💯", "👀", "🙌"];

interface DM {
  id: string;
  sender_id: string;
  receiver_id: string;
  guild_id: string;
  message: string;
  reactions: Record<string, string[]>;
  mentions: string[];
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface GuildMember {
  user_id: string;
  profile?: { public_name: string; avatar_url: string | null };
}

interface Props {
  guildId: string;
  members: GuildMember[];
}

const GuildPrivateChat = ({ guildId, members }: Props) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<GuildMember | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [msgText, setMsgText] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadUnreadCounts();
    const channel = supabase
      .channel(`dms-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guild_direct_messages", filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as DM;
          if (selectedUser && msg.sender_id === selectedUser.user_id) {
            setMessages(prev => [...prev, msg]);
            supabase.from("guild_direct_messages").update({ is_read: true }).eq("id", msg.id);
          } else {
            setUnreadCounts(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser.user_id);
  }, [selectedUser]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const loadUnreadCounts = async () => {
    if (!user) return;
    const { data } = await supabase.from("guild_direct_messages")
      .select("sender_id")
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .eq("guild_id", guildId);
    if (data) {
      const counts: Record<string, number> = {};
      (data as any[]).forEach(d => { counts[d.sender_id] = (counts[d.sender_id] || 0) + 1; });
      setUnreadCounts(counts);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;
    const { data } = await supabase.from("guild_direct_messages")
      .select("*")
      .eq("guild_id", guildId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      const withNames = (data as DM[]).map(m => ({
        ...m,
        sender_name: members.find(mb => mb.user_id === m.sender_id)?.profile?.public_name || "?"
      }));
      setMessages(withNames);
      // Mark as read
      const unread = (data as DM[]).filter(m => m.receiver_id === user.id && !m.is_read);
      for (const m of unread) {
        await supabase.from("guild_direct_messages").update({ is_read: true }).eq("id", m.id);
      }
      setUnreadCounts(prev => ({ ...prev, [otherUserId]: 0 }));
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedUser || !user) return;
    // Parse mentions from @username patterns
    const mentionedIds = members
      .filter(m => msgText.includes(`@${m.profile?.public_name}`))
      .map(m => m.user_id);

    await supabase.from("guild_direct_messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser.user_id,
      guild_id: guildId,
      message: msgText,
      mentions: mentionedIds,
    });

    // Create notification for receiver
    await supabase.from("notifications").insert({
      user_id: selectedUser.user_id,
      title: "💬 Nova mensagem",
      message: `${members.find(m => m.user_id === user.id)?.profile?.public_name || "Alguém"} enviou uma mensagem para você`,
      type: "system",
      link: "/guilds",
    });

    setMsgText("");
  };

  const addReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    const reactions = { ...(msg.reactions || {}) };
    if (!reactions[emoji]) reactions[emoji] = [];
    if (reactions[emoji].includes(user.id)) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== user.id);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(user.id);
    }
    await supabase.from("guild_direct_messages").update({ reactions }).eq("id", msgId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions } : m));
    setShowReactions(null);
  };

  const insertMention = (member: GuildMember) => {
    setMsgText(prev => prev + `@${member.profile?.public_name} `);
    setShowMentions(false);
  };

  const otherMembers = members.filter(m => m.user_id !== user?.id);

  const renderMessage = (text: string) => {
    const parts = text.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} className="text-primary font-semibold bg-primary/10 rounded px-1">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!selectedUser) {
    return (
      <div className="space-y-2">
        <h4 className="font-bold text-sm text-foreground mb-3">Mensagens Privadas</h4>
        {otherMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum membro para conversar</p>
        ) : (
          otherMembers.map(m => (
            <motion.button
              key={m.user_id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedUser(m)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-bold text-primary-foreground">
                {(m.profile?.public_name || "?")[0]}
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm text-foreground">{m.profile?.public_name}</span>
              </div>
              {(unreadCounts[m.user_id] || 0) > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5">{unreadCounts[m.user_id]}</Badge>
              )}
            </motion.button>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(null)}>
          <ArrowLeft size={16} />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xs font-bold text-primary-foreground">
          {(selectedUser.profile?.public_name || "?")[0]}
        </div>
        <span className="font-semibold text-sm text-foreground">{selectedUser.profile?.public_name}</span>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda. Diga olá! 👋</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id;
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] group">
                <div className={`p-3 rounded-xl relative ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{renderMessage(msg.message)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-[10px] opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {isMine && (msg.is_read ? <CheckCheck size={10} className="opacity-50" /> : <Check size={10} className="opacity-50" />)}
                  </div>
                </div>

                {/* Reactions display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                        className={`text-xs px-1.5 py-0.5 rounded-full border transition-all ${
                          (users as string[]).includes(user?.id || "") ? "border-primary bg-primary/10" : "border-border/50 bg-card/50"
                        }`}>
                        {emoji} {(users as string[]).length}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reaction button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}>
                    <SmilePlus size={12} />
                  </Button>
                  <AnimatePresence>
                    {showReactions === msg.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-1 bg-card border border-border rounded-xl p-1.5 shadow-lg">
                        {REACTION_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                            className="text-lg hover:scale-125 transition-transform">{emoji}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3">
        {showMentions && (
          <div className="mb-2 bg-card border border-border rounded-lg p-2 max-h-32 overflow-y-auto">
            {otherMembers.map(m => (
              <button key={m.user_id} onClick={() => insertMention(m)}
                className="w-full text-left flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 text-sm">
                <User size={12} /> {m.profile?.public_name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setShowMentions(!showMentions)}>
            <AtSign size={16} />
          </Button>
          <Input
            placeholder="Digite uma mensagem..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 h-9"
          />
          <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={sendMessage}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuildPrivateChat;
