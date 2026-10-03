import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Brain, Check, Layers, Map, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { reviewCloudCard, type CloudCard } from "@/lib/studyCloud";

type Attempt = { id: string; topic: string; correct: number; total: number; created_at: string };
type TrailRow = { trail_id: string; completed_phases: number[] | null; is_completed: boolean; study_trails: { title: string; total_phases: number } | null };

const StudyDashboard = () => {
  const { profile, user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [due, setDue] = useState<CloudCard[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [trails, setTrails] = useState<TrailRow[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, d, c, t] = await Promise.all([
        supabase.from("quiz_attempts").select("id, topic, correct, total, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("study_cards").select("*").eq("user_id", user.id).lte("next_review", new Date().toISOString()).order("next_review").limit(50),
        supabase.from("study_cards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_trail_progress").select("trail_id, completed_phases, is_completed, study_trails(title, total_phases)").eq("user_id", user.id),
      ]);
      setAttempts((a.data as Attempt[]) || []);
      setDue((d.data as CloudCard[]) || []);
      setTotalCards(c.count || 0);
      setTrails((t.data as unknown as TrailRow[]) || []);
    })();
  }, [user]);

  const totals = attempts.reduce((s, a) => ({ c: s.c + a.correct, t: s.t + a.total }), { c: 0, t: 0 });
  const accuracy = totals.t ? Math.round((totals.c / totals.t) * 100) : 0;
  const card = due[current];

  const grade = async (ok: boolean) => {
    if (!card) return;
    await reviewCloudCard(card, ok);
    setRevealed(false);
    setCurrent(n => n + 1);
  };

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="font-display text-3xl text-foreground flex items-center gap-2"><BarChart3 className="text-primary" /> Painel de Estudos</h1>
          <p className="text-muted-foreground">Seu desempenho, revisões do dia e evolução nas trilhas.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Brain, label: "Acerto nos quizzes", value: `${accuracy}%`, sub: `${attempts.length} quizzes feitos` },
            { icon: RotateCcw, label: "Cartões para revisar", value: String(Math.max(due.length - current, 0)), sub: `${totalCards} cartões salvos` },
            { icon: Map, label: "Trilhas concluídas", value: String(trails.filter(t => t.is_completed).length), sub: `${trails.length} iniciadas` },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="paper-surface border border-border bg-card p-5">
              <Icon className="text-primary mb-2" size={22} />
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-display text-3xl text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <section className="border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2"><Layers size={18} /> Revisão espaçada de hoje</h2>
          {!card ? (
            <p className="text-sm text-muted-foreground">Nada para revisar agora. Faça fases de aula no <Link className="underline text-primary" to="/journey-map">Mapa de Jornada</Link> para criar cartões.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{card.deck_name} · {current + 1}/{due.length}</p>
              <div className="border border-border bg-background p-6 min-h-32 flex items-center justify-center text-center">
                <p className="font-display text-xl">{revealed ? card.back : card.front}</p>
              </div>
              {revealed ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => grade(false)}><X /> Ainda não</Button>
                  <Button className="flex-1" onClick={() => grade(true)}><Check /> Lembrei</Button>
                </div>
              ) : <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>Revelar resposta</Button>}
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-xl">Evolução por trilha</h2>
            {trails.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma trilha iniciada ainda.</p>}
            {trails.map(t => {
              const total = t.study_trails?.total_phases || 1;
              const done = t.completed_phases?.length || 0;
              return (
                <div key={t.trail_id}>
                  <div className="flex justify-between text-sm"><span>{t.study_trails?.title}</span><span className="text-muted-foreground">{done}/{total}</span></div>
                  <Progress value={(done / total) * 100} />
                </div>
              );
            })}
          </section>
          <section className="border border-border bg-card p-5 space-y-2">
            <h2 className="font-display text-xl">Últimos quizzes</h2>
            {attempts.length === 0 && <p className="text-sm text-muted-foreground">Seus resultados aparecem aqui.</p>}
            {attempts.slice(0, 8).map(a => (
              <div key={a.id} className="flex justify-between text-sm border-b border-border/60 py-1.5">
                <span className="truncate pr-2">{a.topic}</span>
                <span className="text-muted-foreground shrink-0">{a.correct}/{a.total}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyDashboard;
