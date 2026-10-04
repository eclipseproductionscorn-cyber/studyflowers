import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookOpen,
  Brain,
  Sparkles,
  Loader2,
  Edit3,
  Check,
  X,
  Wand2,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FloatingElements } from "@/components/FloatingElements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { saveCardsToAccount, loadAccountCards, updateCardStats, deleteAccountDeck, type CloudCard } from "@/lib/studyCloud";
import { getSubjectsByYear, allSubjects } from "@/lib/subjects";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: "qa" | "true_false" | "complete" | "practical";
  hint?: string;
  timesReviewed: number;
  lastReviewed: Date | null;
  isCorrect?: boolean;
}

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  color: string;
  subject: string;
}

const typeLabels: Record<string, string> = {
  qa: "Pergunta/Resposta",
  true_false: "Verdadeiro/Falso",
  complete: "Complete",
  practical: "Prática",
};

const typeColors: Record<string, string> = {
  qa: "bg-blue-500/10 text-blue-500",
  true_false: "bg-purple-500/10 text-purple-500",
  complete: "bg-green-500/10 text-green-500",
  practical: "bg-orange-500/10 text-orange-500",
};

const categoryColors: Record<string, string> = {
  matematica: "from-blue-500 to-cyan-500",
  portugues: "from-purple-500 to-pink-500",
  historia: "from-amber-500 to-orange-500",
  geografia: "from-green-500 to-emerald-500",
  ciencias: "from-teal-500 to-cyan-500",
  ingles: "from-red-500 to-rose-500",
  fisica: "from-indigo-500 to-purple-500",
  quimica: "from-yellow-500 to-lime-500",
  biologia: "from-emerald-500 to-green-500",
  default: "from-primary to-accent",
};

const Flashcards = () => {
  const { profile, user, addXP } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // New deck form
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckSubject, setNewDeckSubject] = useState("");

  // New card form
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  // AI Generate form
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("normal");

  const availableSubjects = profile?.school_year 
    ? getSubjectsByYear(profile.school_year) 
    : allSubjects;

  // Decks live in the student's account so they sync across devices.
  // Empty decks (no cards yet) are kept locally until their first card is saved.
  const toCard = (c: CloudCard): Flashcard => ({ id: c.id, front: c.front, back: c.back, type: (c.card_type as Flashcard["type"]) || "qa", hint: c.hint || undefined, timesReviewed: c.times_reviewed, lastReviewed: c.last_reviewed ? new Date(c.last_reviewed) : null, isCorrect: c.is_correct ?? undefined });
  useEffect(() => {
    if (!user) return;
    (async () => {
      // One-time migration of legacy device-only decks into the account.
      const legacy = localStorage.getItem("flashcard-decks-v2");
      if (legacy) {
        try {
          const old: Deck[] = JSON.parse(legacy);
          for (const d of old) if (d.cards.length) await saveCardsToAccount(user.id, { id: d.id, name: d.name, subject: d.subject }, d.cards);
          localStorage.setItem(`flashcard-empty-decks-${user.id}`, JSON.stringify(old.filter(d => !d.cards.length)));
        } catch (e) { console.error(e); }
        localStorage.removeItem("flashcard-decks-v2");
      }
      const cloud = await loadAccountCards(user.id);
      const map = new Map<string, Deck>();
      for (const c of cloud) {
        if (!map.has(c.deck_id)) map.set(c.deck_id, { id: c.deck_id, name: c.deck_name, subject: c.subject || "default", color: categoryColors[c.subject || ""] || categoryColors.default, cards: [] });
        map.get(c.deck_id)!.cards.push(toCard(c));
      }
      let empty: Deck[] = [];
      try { empty = JSON.parse(localStorage.getItem(`flashcard-empty-decks-${user.id}`) || "[]"); } catch { /* ignore */ }
      setDecks([...map.values(), ...empty.filter(d => !map.has(d.id))]);
    })();
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem(`flashcard-empty-decks-${user.id}`, JSON.stringify(decks.filter(d => !d.cards.length)));
  }, [decks, user]);

  const persistCards = async (deck: Deck, cards: Flashcard[]) => {
    if (!user) return cards;
    const { data, error } = await saveCardsToAccount(user.id, { id: deck.id, name: deck.name, subject: deck.subject }, cards);
    if (error) { toast.error("Não foi possível salvar na sua conta."); return cards; }
    return (data as CloudCard[]).map(toCard);
  };

  const createDeck = () => {
    if (!newDeckName.trim() || !newDeckSubject) {
      toast.error("Preencha nome e matéria do deck");
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      subject: newDeckSubject,
      color: categoryColors[newDeckSubject] || categoryColors.default,
      cards: [],
    };

    setDecks([...decks, newDeck]);
    setNewDeckName("");
    setNewDeckSubject("");
    setDialogOpen(false);
    toast.success("Deck criado com sucesso!");
  };

  const deleteDeck = (deckId: string) => {
    if (user) deleteAccountDeck(user.id, deckId);
    setDecks(decks.filter((d) => d.id !== deckId));
    toast.success("Deck removido");
  };

  const addCardToDeck = async () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !selectedDeck) {
      toast.error("Preencha a frente e o verso do cartão");
      return;
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      type: "qa",
      timesReviewed: 0,
      lastReviewed: null,
    };
    const [saved] = await persistCards(selectedDeck, [newCard]);
    Object.assign(newCard, saved);

    setDecks(
      decks.map((d) =>
        d.id === selectedDeck.id ? { ...d, cards: [...d.cards, newCard] } : d
      )
    );
    setSelectedDeck({ ...selectedDeck, cards: [...selectedDeck.cards, newCard] });
    setNewCardFront("");
    setNewCardBack("");
    setNewCardDialogOpen(false);
    toast.success("Cartão adicionado!");
  };

  const generateAIFlashcards = async () => {
    if (!selectedDeck) return;

    setIsGenerating(true);

    try {
      const subject = allSubjects.find((s) => s.id === selectedDeck.subject);
      
      const response = await supabase.functions.invoke("generate-flashcards", {
        body: {
          subject: subject?.label || selectedDeck.name,
          topic: aiTopic || undefined,
          difficulty: aiDifficulty,
          count: aiCount,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      const generatedCards: Flashcard[] = (data.flashcards || []).map(
        (fc: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          front: fc.front,
          back: fc.back,
          type: fc.type || "qa",
          hint: fc.hint,
          timesReviewed: 0,
          lastReviewed: null,
        })
      );

      if (generatedCards.length === 0) {
        throw new Error("Nenhum flashcard gerado");
      }
      generatedCards.splice(0, generatedCards.length, ...(await persistCards(selectedDeck, generatedCards)));

      setDecks(
        decks.map((d) =>
          d.id === selectedDeck.id
            ? { ...d, cards: [...d.cards, ...generatedCards] }
            : d
        )
      );
      setSelectedDeck({
        ...selectedDeck,
        cards: [...selectedDeck.cards, ...generatedCards],
      });

      toast.success(`${generatedCards.length} flashcards gerados com IA! 🧠`);
      setAiGenerateOpen(false);
      setAiTopic("");
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Erro ao gerar flashcards. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startStudying = (deck: Deck) => {
    if (deck.cards.length === 0) {
      toast.error("Adicione cartões ao deck primeiro!");
      return;
    }
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudying(true);
    setCorrectCount(0);
    setShowHint(false);
  };

  const markAnswer = async (correct: boolean) => {
    if (!selectedDeck) return;

    // Update card
    const updatedCards = [...selectedDeck.cards];
    updatedCards[currentCardIndex] = {
      ...updatedCards[currentCardIndex],
      timesReviewed: updatedCards[currentCardIndex].timesReviewed + 1,
      lastReviewed: new Date(),
      isCorrect: correct,
    };
    updateCardStats(updatedCards[currentCardIndex].id, { times_reviewed: updatedCards[currentCardIndex].timesReviewed, last_reviewed: new Date().toISOString(), is_correct: correct });

    setDecks(
      decks.map((d) =>
        d.id === selectedDeck.id ? { ...d, cards: updatedCards } : d
      )
    );
    setSelectedDeck({ ...selectedDeck, cards: updatedCards });

    if (correct) {
      setCorrectCount((c) => c + 1);
    }

    // Move to next card
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Deck completed
      const xpEarned = correctCount * 5 + 10;
      await addXP(xpEarned);
      toast.success(
        `Deck completo! ${correctCount}/${selectedDeck.cards.length} corretos. +${xpEarned} XP! 🎉`
      );
      setIsStudying(false);
      setSelectedDeck(null);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Study Mode UI
  if (isStudying && selectedDeck && selectedDeck.cards.length > 0) {
    const currentCard = selectedDeck.cards[currentCardIndex];

    return (
      <DashboardLayout profile={profile}>
        <FloatingElements />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setIsStudying(false);
                setSelectedDeck(null);
              }}
            >
              <ChevronLeft className="mr-2" size={20} />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <Badge className={typeColors[currentCard.type]}>
                {typeLabels[currentCard.type]}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {currentCardIndex + 1} / {selectedDeck.cards.length}
              </Badge>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
              <Check size={16} />
              <span className="font-medium">{correctCount} acertos</span>
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="relative h-80 cursor-pointer perspective-1000"
            onClick={flipCard}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div
                className={`absolute w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center backface-hidden bg-gradient-to-br ${selectedDeck.color} text-white`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <Brain className="mb-4 opacity-50" size={32} />
                <p className="text-xl font-medium">{currentCard.front}</p>
                <p className="text-sm opacity-70 mt-4">Clique para virar</p>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-card border border-border"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Sparkles className="mb-4 text-primary" size={32} />
                <p className="text-xl font-medium text-foreground">
                  {currentCard.back}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hint */}
          {currentCard.hint && (
            <div className="mt-4 text-center">
              {showHint ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg inline-block"
                >
                  💡 {currentCard.hint}
                </motion.p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                >
                  Ver dica
                </Button>
              )}
            </div>
          )}

          {/* Answer Controls */}
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 mt-6"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => markAnswer(false)}
                className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="mr-2" size={20} />
                Errei
              </Button>
              <Button
                size="lg"
                onClick={() => markAnswer(true)}
                className="bg-gradient-to-r from-success to-emerald-500"
              >
                <Check className="mr-2" size={20} />
                Acertei
              </Button>
            </motion.div>
          )}

          {!isFlipped && (
            <div className="flex items-center justify-center mt-6">
              <Button variant="outline" onClick={flipCard}>
                <RotateCcw className="mr-2" size={18} />
                Virar Cartão
              </Button>
            </div>
          )}

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso</span>
              <span>
                {Math.round(((currentCardIndex + 1) / selectedDeck.cards.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${selectedDeck.color}`}
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentCardIndex + 1) / selectedDeck.cards.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // Deck List UI
  return (
    <DashboardLayout profile={profile}>
      <FloatingElements />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Flashcards Inteligentes
            </h1>
            <p className="text-muted-foreground mt-1">
              Memorize com IA adaptativa e repetição espaçada
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="mr-2" size={18} />
                Novo Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Deck</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nome do Deck</Label>
                  <Input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Ex: Fórmulas de Física"
                  />
                </div>
                <div>
                  <Label>Matéria</Label>
                  <Select value={newDeckSubject} onValueChange={setNewDeckSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.icon} {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createDeck} className="w-full">
                  <Plus className="mr-2" size={18} />
                  Criar Deck
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center">
            <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum deck ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro deck e deixe a IA gerar flashcards inteligentes!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2" size={18} />
              Criar Primeiro Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck, index) => {
              const subject = allSubjects.find((s) => s.id === deck.subject);

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className={`h-2 bg-gradient-to-r ${deck.color}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{deck.name}</CardTitle>
                          {subject && (
                            <Badge variant="outline" className="mt-1">
                              {subject.icon} {subject.label}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDeck(deck.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {deck.cards.length} cartões
                      </p>
                      <div className="flex flex-col gap-2">
                        {/* AI Generate Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedDeck(deck);
                            setAiGenerateOpen(true);
                          }}
                        >
                          <Wand2 className="mr-1" size={14} />
                          Gerar com IA
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedDeck(deck);
                              setNewCardDialogOpen(true);
                            }}
                          >
                            <Edit3 className="mr-1" size={14} />
                            Manual
                          </Button>
                          <Button
                            size="sm"
                            className={`flex-1 bg-gradient-to-r ${deck.color} hover:opacity-90`}
                            onClick={() => startStudying(deck)}
                          >
                            <Zap className="mr-1" size={14} />
                            Estudar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add Card Dialog */}
        <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cartão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Frente (Pergunta)</Label>
                <Input
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Ex: Qual é a fórmula da água?"
                />
              </div>
              <div>
                <Label>Verso (Resposta)</Label>
                <Input
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Ex: H₂O"
                />
              </div>
              <Button onClick={addCardToDeck} className="w-full">
                <Plus className="mr-2" size={18} />
                Adicionar Cartão
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Generate Dialog */}
        <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="text-primary" size={20} />
                Gerar Flashcards com IA
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Tópico Específico (opcional)</Label>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Teorema de Pitágoras"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Select
                    value={String(aiCount)}
                    onValueChange={(v) => setAiCount(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 cartões</SelectItem>
                      <SelectItem value="5">5 cartões</SelectItem>
                      <SelectItem value="10">10 cartões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <Star className="inline mr-1 text-primary" size={14} />
                  A IA gera diferentes tipos: perguntas, verdadeiro/falso,
                  complete a frase e situações práticas!
                </p>
              </div>

              <Button
                onClick={generateAIFlashcards}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2" size={18} />
                )}
                {isGenerating ? "Gerando..." : "Gerar Flashcards"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default Flashcards;
