import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pin, Trash2, Edit3, BookOpen, X, Save, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportNoteToPDF, exportAllNotesToPDF } from "@/lib/pdfExport";
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

const NOTE_COLORS = [
  { value: "#FFD700", label: "Dourado" },
  { value: "#FF6B6B", label: "Vermelho" },
  { value: "#4ECDC4", label: "Verde-água" },
  { value: "#45B7D1", label: "Azul" },
  { value: "#96CEB4", label: "Verde" },
  { value: "#DDA0DD", label: "Lilás" },
  { value: "#FF8C42", label: "Laranja" },
];

const SUBJECTS = [
  "Matemática", "Português", "História", "Geografia", "Ciências",
  "Física", "Química", "Biologia", "Inglês", "Redação", "Outro",
];

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string | null;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const { profile, user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", subject: "", color: "#FFD700" });

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    setNotes((data as Note[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Título obrigatório");
    if (!user) return;

    if (editNote) {
      const { error } = await supabase
        .from("notes")
        .update({ title: form.title, content: form.content, subject: form.subject || null, color: form.color, updated_at: new Date().toISOString() })
        .eq("id", editNote.id);
      if (error) return toast.error("Erro ao salvar");
      toast.success("Nota atualizada!");
    } else {
      const { error } = await supabase
        .from("notes")
        .insert({ title: form.title, content: form.content, subject: form.subject || null, color: form.color, user_id: user.id });
      if (error) return toast.error("Erro ao criar nota");
      toast.success("Nota criada!");
    }
    closeDialog();
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    toast.success("Nota excluída");
    fetchNotes();
  };

  const togglePin = async (note: Note) => {
    await supabase.from("notes").update({ is_pinned: !note.is_pinned }).eq("id", note.id);
    fetchNotes();
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, subject: note.subject || "", color: note.color });
    setIsCreating(true);
  };

  const closeDialog = () => {
    setIsCreating(false);
    setEditNote(null);
    setForm({ title: "", content: "", subject: "", color: "#FFD700" });
  };

  const filtered = notes.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || n.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  return (
    <DashboardLayout profile={profile}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="text-primary" /> Caderno Digital
            </h1>
            <p className="text-muted-foreground mt-1">Suas anotações organizadas por matéria</p>
          </div>
          <div className="flex gap-2">
            {notes.length > 0 && (
              <Button variant="outline" onClick={() => exportAllNotesToPDF(notes)} className="gap-2">
                <FileDown size={18} /> Exportar PDF
              </Button>
            )}
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus size={18} /> Nova Nota
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Buscar notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {notes.length === 0 ? "Nenhuma nota ainda. Crie sua primeira!" : "Nenhuma nota encontrada"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all cursor-pointer"
                  style={{ borderLeftWidth: 4, borderLeftColor: note.color }}
                  onClick={() => openEdit(note)}
                >
                  {note.is_pinned && (
                    <Pin size={14} className="absolute top-3 right-3 text-primary fill-primary" />
                  )}
                  <h3 className="font-semibold text-foreground truncate pr-6">{note.title}</h3>
                  {note.subject && <Badge variant="secondary" className="mt-1 text-xs">{note.subject}</Badge>}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{note.content || "Sem conteúdo"}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin(note)}>
                      <Pin size={12} className={note.is_pinned ? "fill-primary text-primary" : ""} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(note.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <Dialog open={isCreating} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editNote ? "Editar Nota" : "Nova Nota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Título da nota" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Select value={form.subject} onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione a matéria" /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Conteúdo..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} />
            <div className="flex gap-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c.value ? "scale-125 border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} className="gap-2"><Save size={16} /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Notes;
