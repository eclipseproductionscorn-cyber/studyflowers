import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Trash2, Check, ChevronLeft, ChevronRight, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const SUBJECTS = [
  "Matemática", "Português", "História", "Geografia", "Ciências",
  "Física", "Química", "Biologia", "Inglês", "Redação",
];

const EVENT_COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"];

interface StudyEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  subject: string | null;
  color: string;
  is_completed: boolean;
  reminder_minutes: number | null;
  reminder_sent: boolean;
}

const StudyCalendar = () => {
  const { profile, user } = useAuth();
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", color: "#6366f1", event_time: "", reminder: "none" });

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentMonth]);

  // Check for upcoming reminders every minute
  useEffect(() => {
    if (!("Notification" in window)) return;
    const interval = setInterval(() => {
      const now = new Date();
      events.forEach((event) => {
        if (event.reminder_minutes && !event.reminder_sent && !event.is_completed && event.event_time) {
          const eventDate = new Date(`${event.event_date}T${event.event_time}`);
          const reminderTime = new Date(eventDate.getTime() - event.reminder_minutes * 60000);
          if (now >= reminderTime && now < eventDate) {
            if (Notification.permission === "granted") {
              new Notification(`📚 Lembrete: ${event.title}`, {
                body: `${event.subject ? event.subject + " — " : ""}Começa em ${event.reminder_minutes} min`,
                icon: "/favicon.ico",
              });
              supabase.from("study_events").update({ reminder_sent: true }).eq("id", event.id).then();
            }
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [events]);

  const fetchEvents = async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const { data } = await supabase
      .from("study_events")
      .select("*")
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date");
    setEvents((data as StudyEvent[]) || []);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !selectedDate || !user) return;
    const reminderMin = form.reminder !== "none" ? parseInt(form.reminder) : null;
    const { error } = await supabase.from("study_events").insert({
      user_id: user.id, title: form.title,
      description: form.description || null,
      event_date: format(selectedDate, "yyyy-MM-dd"),
      event_time: form.event_time || null,
      subject: form.subject || null, color: form.color,
      reminder_minutes: reminderMin,
    } as any);
    if (error) return toast.error("Erro ao criar evento");
    // Request notification permission on first reminder
    if (reminderMin && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    toast.success("Evento adicionado!");
    setIsCreating(false);
    setForm({ title: "", description: "", subject: "", color: "#6366f1", event_time: "", reminder: "none" });
    fetchEvents();
  };

  const toggleComplete = async (event: StudyEvent) => {
    await supabase.from("study_events").update({ is_completed: !event.is_completed }).eq("id", event.id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("study_events").delete().eq("id", id);
    toast.success("Evento removido");
    fetchEvents();
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();
  const dayEvents = (date: Date) => events.filter((e) => isSameDay(new Date(e.event_date + "T00:00:00"), date));
  const selectedEvents = selectedDate ? dayEvents(selectedDate) : [];

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="text-primary" /> Calendário de Estudos
            </h1>
            <p className="text-muted-foreground mt-1">Planeje e organize seus estudos</p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between bg-card/50 border border-border/50 rounded-xl p-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const de = dayEvents(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-2 rounded-lg text-sm transition-all min-h-[3rem] ${
                    isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {de.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-1">
                      {de.slice(0, 3).map((e) => (
                        <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events */}
        {selectedDate && (
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1">
                <Plus size={14} /> Adicionar
              </Button>
            </div>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento neste dia</p>
            ) : (
              selectedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${event.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {event.title}
                    </p>
                    <div className="flex gap-2 items-center mt-0.5">
                      {event.subject && <Badge variant="secondary" className="text-xs">{event.subject}</Badge>}
                      {event.event_time && <span className="text-xs text-muted-foreground">{event.event_time.slice(0, 5)}</span>}
                      {event.reminder_minutes && (
                        <Badge variant="outline" className="text-xs"><Bell size={10} className="mr-1" />{event.reminder_minutes}min antes</Badge>
                      )}
                    </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleComplete(event)}>
                    <Check size={14} className={event.is_completed ? "text-green-500" : "text-muted-foreground"} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteEvent(event.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Evento - {selectedDate && format(selectedDate, "dd/MM/yyyy")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Título do evento" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <div className="flex gap-3">
              <Select value={form.subject} onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}>
                <SelectTrigger><SelectValue placeholder="Matéria" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="time" value={form.event_time} onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))} className="w-32" />
            </div>
            <Textarea placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            {/* Reminder selector */}
            <Select value={form.reminder} onValueChange={(v) => setForm((f) => ({ ...f, reminder: v }))}>
              <SelectTrigger><SelectValue placeholder="Lembrete" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem lembrete</SelectItem>
                <SelectItem value="5">5 minutos antes</SelectItem>
                <SelectItem value="15">15 minutos antes</SelectItem>
                <SelectItem value="30">30 minutos antes</SelectItem>
                <SelectItem value="60">1 hora antes</SelectItem>
                <SelectItem value="1440">1 dia antes</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? "scale-125 border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setForm((f) => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudyCalendar;
