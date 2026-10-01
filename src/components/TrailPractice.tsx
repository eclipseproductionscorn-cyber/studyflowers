import { useState } from "react";
import { BookOpen, Brain, Check, ChevronRight, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { deckStorageKey, readDecks, saveDecks, type ReviewCard } from "@/lib/spacedReview";
import { toast } from "sonner";

type Phase = { id: string; phase_number: number; title: string; description: string | null; phase_type: string };
type Trail = { id: string; title: string; objective: string; subjects: string[]; total_phases: number };
type Question = { question: string; options: string[]; correct_answer: string; explanation: string };

export function TrailPractice({ phase, trail, userId, completedPhases, onClose, onComplete }: {
  phase: Phase; trail: Trail; userId: string; completedPhases: number[]; onClose: () => void; onComplete: () => void;
}) {
  const isQuiz = ["quiz", "challenge", "boss"].includes(phase.phase_type);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(completedPhases.includes(phase.phase_number));
  const topic = `${trail.title}: ${phase.title}${phase.description ? ` — ${phase.description}` : ""}. Objetivo: ${trail.objective}. Matérias: ${trail.subjects.join(", ")}`;

  const generate = async () => {
    setLoading(true);
    try {
      if (isQuiz) {
        const { data, error } = await supabase.functions.invoke("generate-quiz", { body: { subject: topic, schoolYear: "nível escolar do estudante" } });
        if (error) throw error;
        const valid = (data?.questions || []).filter((q: Question) => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correct_answer);
        if (!valid.length) throw new Error("Quiz vazio");
        setQuestions(valid);
      } else {
        const { data, error } = await supabase.functions.invoke("generate-flashcards", { body: { subject: trail.subjects.join(", ") || trail.title, topic, difficulty: "normal", count: 5 } });
        if (error) throw error;
        const valid: ReviewCard[] = (data?.flashcards || []).filter((c: ReviewCard) => c.front && c.back).map((c: ReviewCard) => ({ ...c, id: crypto.randomUUID(), type: c.type || "qa", timesReviewed: 0, lastReviewed: null }));
        if (!valid.length) throw new Error("Cartões vazios");
        setCards(valid);
        const decks = readDecks(userId);
        const deckId = `trail-${trail.id}-${phase.id}`;
        const existing = decks.find(d => d.id === deckId);
        saveDecks(userId, existing ? decks.map(d => d.id === deckId ? { ...d, cards: [...d.cards, ...valid] } : d) : [...decks, { id: deckId, name: `${trail.title} · ${phase.title}`, trailId: trail.id, subject: trail.subjects[0] || trail.title, color: "from-primary to-accent", cards: valid }]);
        window.dispatchEvent(new StorageEvent("storage", { key: deckStorageKey(userId) }));
      }
    } catch (error) { console.error(error); toast.error("Não foi possível preparar a atividade. Tente novamente."); }
    finally { setLoading(false); }
  };

  const finish = async () => {
    if (saved || saving) return;
    setSaving(true);
    const next = [...new Set([...completedPhases, phase.phase_number])].sort((a, b) => a - b);
    const { error } = await supabase.from("user_trail_progress").update({ completed_phases: next, current_phase: Math.min(phase.phase_number + 1, trail.total_phases + 1), is_completed: next.length >= trail.total_phases, completed_at: next.length >= trail.total_phases ? new Date().toISOString() : null }).eq("user_id", userId).eq("trail_id", trail.id);
    setSaving(false);
    if (error) { toast.error("Não foi possível salvar o progresso."); return; }
    setSaved(true);
    onComplete();
    toast.success("Fase concluída! Próxima etapa desbloqueada.");
  };

  const gradeCard = (passed: boolean) => {
    if (passed) setCorrect(n => n + 1);
    if (index + 1 === cards.length) setDone(true);
    else { setIndex(n => n + 1); setRevealed(false); }
  };
  const gradeQuestion = () => {
    if (!answer) return;
    if (answer === questions[index].correct_answer.charAt(0).toUpperCase()) setCorrect(n => n + 1);
    setRevealed(true);
  };
  const nextQuestion = () => {
    if (index + 1 === questions.length) setDone(true);
    else { setIndex(n => n + 1); setAnswer(""); setRevealed(false); }
  };
  const count = isQuiz ? questions.length : cards.length;
  const quizPassed = !isQuiz || correct >= Math.ceil(count * .6);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border">
      <DialogHeader><DialogTitle className="font-display text-2xl">{phase.title}</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">{trail.title} · Fase {phase.phase_number}</p>
      {!count && <div className="space-y-5 py-6 text-center">
        <BookOpen className="mx-auto text-primary" size={38} />
        <p className="text-muted-foreground">{phase.description || trail.objective}</p>
        <Button onClick={generate} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin" /> : isQuiz ? <Brain /> : <Sparkles />}{loading ? "Preparando..." : isQuiz ? "Iniciar quiz da fase" : "Criar fichas da fase"}</Button>
      </div>}
      {!!count && !done && <div className="space-y-4 py-3">
        <div className="flex justify-between text-xs text-muted-foreground"><span>{isQuiz ? "Quiz" : "Fichas de estudo"}</span><span>{index + 1} / {count}</span></div>
        <Progress value={((index + 1) / count) * 100} />
        <div className="border border-border bg-background p-5 min-h-40 flex flex-col justify-center text-center">
          <p className="font-display text-xl text-foreground">{isQuiz ? questions[index].question : revealed ? cards[index].back : cards[index].front}</p>
          {!isQuiz && !revealed && cards[index].hint && <p className="text-xs text-muted-foreground mt-4">Dica: {cards[index].hint}</p>}
        </div>
        {isQuiz ? <>
          <div className="grid gap-2">{questions[index].options.map((option, i) => <Button key={i} variant={answer === String.fromCharCode(65 + i) ? "secondary" : "outline"} className="h-auto min-h-11 whitespace-normal text-left justify-start py-2" disabled={revealed} onClick={() => setAnswer(String.fromCharCode(65 + i))}>{option}</Button>)}</div>
          {revealed && <div className="border-l-2 border-primary pl-4 text-sm"><p className="font-semibold">Resposta: {questions[index].correct_answer}</p><p className="text-muted-foreground">{questions[index].explanation}</p></div>}
          <Button className="w-full" onClick={revealed ? nextQuestion : gradeQuestion} disabled={!revealed && !answer}>{revealed ? "Próxima" : "Confirmar"}<ChevronRight /></Button>
        </> : revealed ? <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => gradeCard(false)}><X /> Ainda não</Button><Button className="flex-1" onClick={() => gradeCard(true)}><Check /> Lembrei</Button></div> : <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}><RotateCcw /> Revelar resposta</Button>}
      </div>}
      {done && <div className="space-y-4 py-5 text-center"><p className="font-display text-2xl">{correct} de {count} {isQuiz ? "respostas corretas" : "cartões lembrados"}</p><p className="text-sm text-muted-foreground">{isQuiz && !quizPassed ? "Acerte pelo menos 60% para avançar. Revise o conteúdo e tente novamente." : saved ? "Fase já concluída. Você pode continuar revisando no menu Flashcards." : "Seus cartões ficam disponíveis para revisão espaçada no menu Flashcards."}</p>{quizPassed && !saved && <Button onClick={finish} disabled={saving} className="w-full">{saving ? <Loader2 className="animate-spin" /> : <Check />} Concluir fase</Button>}{isQuiz && !quizPassed && <Button variant="outline" onClick={() => { setIndex(0); setCorrect(0); setAnswer(""); setRevealed(false); setDone(false); }} className="w-full"><RotateCcw /> Tentar novamente</Button>}</div>}
    </DialogContent>
  </Dialog>;
}
