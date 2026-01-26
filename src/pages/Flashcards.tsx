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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  timesReviewed: number;
  lastReviewed: Date | null;
}

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  color: string;
}

const categoryColors: Record<string, string> = {
  "Matemática": "from-blue-500 to-cyan-500",
  "Português": "from-purple-500 to-pink-500",
  "História": "from-amber-500 to-orange-500",
  "Geografia": "from-green-500 to-emerald-500",
  "Ciências": "from-teal-500 to-cyan-500",
  "Inglês": "from-red-500 to-rose-500",
  "Geral": "from-primary to-accent",
};

const Flashcards = () => {
  const { profile, addXP } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);

  // New deck form
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckCategory, setNewDeckCategory] = useState("Geral");

  // New card form
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  // Load from localStorage
  useEffect(() => {
    const savedDecks = localStorage.getItem("flashcard-decks");
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    } else {
      // Initialize with sample decks
      const sampleDecks: Deck[] = [
        {
          id: "1",
          name: "Matemática Básica",
          color: categoryColors["Matemática"],
          cards: [
            {
              id: "1-1",
              front: "Qual é a fórmula do teorema de Pitágoras?",
              back: "a² + b² = c², onde a e b são catetos e c é a hipotenusa",
              category: "Matemática",
              timesReviewed: 0,
              lastReviewed: null,
            },
            {
              id: "1-2",
              front: "O que é um número primo?",
              back: "Um número natural maior que 1 que só é divisível por 1 e por ele mesmo",
              category: "Matemática",
              timesReviewed: 0,
              lastReviewed: null,
            },
          ],
        },
        {
          id: "2",
          name: "Português - Figuras de Linguagem",
          color: categoryColors["Português"],
          cards: [
            {
              id: "2-1",
              front: "O que é uma metáfora?",
              back: "Comparação implícita entre dois elementos sem usar conectivos (como, tal qual)",
              category: "Português",
              timesReviewed: 0,
              lastReviewed: null,
            },
            {
              id: "2-2",
              front: "O que é uma hipérbole?",
              back: "Exagero intencional para dar ênfase a uma ideia",
              category: "Português",
              timesReviewed: 0,
              lastReviewed: null,
            },
          ],
        },
      ];
      setDecks(sampleDecks);
      localStorage.setItem("flashcard-decks", JSON.stringify(sampleDecks));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem("flashcard-decks", JSON.stringify(decks));
    }
  }, [decks]);

  const createDeck = () => {
    if (!newDeckName.trim()) {
      toast.error("Digite um nome para o deck");
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      color: categoryColors[newDeckCategory] || categoryColors["Geral"],
      cards: [],
    };

    setDecks([...decks, newDeck]);
    setNewDeckName("");
    setNewDeckCategory("Geral");
    setDialogOpen(false);
    toast.success("Deck criado com sucesso!");
  };

  const deleteDeck = (deckId: string) => {
    setDecks(decks.filter((d) => d.id !== deckId));
    toast.success("Deck removido");
  };

  const addCardToDeck = () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !selectedDeck) {
      toast.error("Preencha a frente e o verso do cartão");
      return;
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      category: selectedDeck.name,
      timesReviewed: 0,
      lastReviewed: null,
    };

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

  const startStudying = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudying(true);
  };

  const nextCard = async () => {
    if (!selectedDeck) return;

    // Update review count
    const updatedCards = [...selectedDeck.cards];
    updatedCards[currentCardIndex] = {
      ...updatedCards[currentCardIndex],
      timesReviewed: updatedCards[currentCardIndex].timesReviewed + 1,
      lastReviewed: new Date(),
    };

    setDecks(
      decks.map((d) =>
        d.id === selectedDeck.id ? { ...d, cards: updatedCards } : d
      )
    );
    setSelectedDeck({ ...selectedDeck, cards: updatedCards });

    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Deck completed
      await addXP(selectedDeck.cards.length * 5);
      toast.success(`Deck completo! +${selectedDeck.cards.length * 5} XP 🎉`);
      setIsStudying(false);
      setSelectedDeck(null);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

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
            <Badge variant="outline" className="text-sm">
              {currentCardIndex + 1} / {selectedDeck.cards.length}
            </Badge>
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
                className={`absolute w-full h-full rounded-2xl p-6 flex items-center justify-center text-center backface-hidden bg-gradient-to-br ${selectedDeck.color} text-white`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <div>
                  <Brain className="mx-auto mb-4 opacity-50" size={32} />
                  <p className="text-xl font-medium">{currentCard.front}</p>
                  <p className="text-sm opacity-70 mt-4">Clique para virar</p>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full rounded-2xl p-6 flex items-center justify-center text-center bg-card border border-border"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div>
                  <Sparkles className="mx-auto mb-4 text-primary" size={32} />
                  <p className="text-xl font-medium text-foreground">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCard}
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft size={20} />
            </Button>

            <Button variant="outline" onClick={flipCard}>
              <RotateCcw className="mr-2" size={18} />
              Virar
            </Button>

            <Button
              onClick={nextCard}
              className={`bg-gradient-to-r ${selectedDeck.color}`}
            >
              {currentCardIndex === selectedDeck.cards.length - 1 ? (
                <>
                  <Check className="mr-2" size={18} />
                  Finalizar
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </div>

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
              Flashcards
            </h1>
            <p className="text-muted-foreground mt-1">
              Memorize conceitos de forma rápida e eficiente
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
                  <Label>Categoria</Label>
                  <Select value={newDeckCategory} onValueChange={setNewDeckCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categoryColors).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
            <p className="text-muted-foreground">
              Crie seu primeiro deck de flashcards para começar a estudar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck, index) => (
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
                      <CardTitle className="text-lg">{deck.name}</CardTitle>
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
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 bg-gradient-to-r ${deck.color} hover:opacity-90`}
                        onClick={() => startStudying(deck)}
                        disabled={deck.cards.length === 0}
                      >
                        <Brain className="mr-1" size={14} />
                        Estudar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Card Dialog */}
      <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cartão - {selectedDeck?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Frente (Pergunta)</Label>
              <Textarea
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                placeholder="O que você quer memorizar?"
                className="min-h-20"
              />
            </div>
            <div>
              <Label>Verso (Resposta)</Label>
              <Textarea
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                placeholder="A resposta ou explicação"
                className="min-h-20"
              />
            </div>
            <Button onClick={addCardToDeck} className="w-full">
              <Plus className="mr-2" size={18} />
              Adicionar Cartão
            </Button>

            {/* Existing cards */}
            {selectedDeck && selectedDeck.cards.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Cartões no deck:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDeck.cards.map((card) => (
                    <div
                      key={card.id}
                      className="text-sm p-2 bg-muted/50 rounded-lg"
                    >
                      <p className="font-medium truncate">{card.front}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Flashcards;
