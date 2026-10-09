import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Swords, Target, Trophy, Info, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  war: { icon: <Swords size={14} />, color: "text-red-500" },
  mission: { icon: <Target size={14} />, color: "text-primary" },
  season: { icon: <Trophy size={14} />, color: "text-amber-500" },
  system: { icon: <Info size={14} />, color: "text-muted-foreground" },
  study_review: { icon: <RotateCcw size={14} />, color: "text-primary" },
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const channel = supabase
      .channel("my-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new as Notification, ...prev]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setNotifications(data as Notification[]);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unread.length === 0) return;
    for (const id of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const clearAll = async () => {
    if (!user) return;
    for (const n of notifications) {
      await supabase.from("notifications").delete().eq("id", n.id);
    }
    setNotifications([]);
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Notificações" className="relative" onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-border/50">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Bell size={14} /> Notificações
                  {unreadCount > 0 && <Badge variant="destructive" className="text-[10px] h-5">{unreadCount}</Badge>}
                </h3>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 gap-1">
                      <CheckCheck size={12} /> Ler tudo
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 gap-1 text-destructive">
                      <X size={12} /> Limpar
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Sem notificações</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleClick(n)}
                        className={`flex items-start gap-3 p-3 border-b border-border/20 cursor-pointer hover:bg-muted/30 transition-colors ${
                          !n.is_read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">{n.title}</span>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {n.link && <ExternalLink size={12} className="text-muted-foreground mt-1 flex-shrink-0" />}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
