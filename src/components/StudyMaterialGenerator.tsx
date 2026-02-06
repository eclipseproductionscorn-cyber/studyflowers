import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Brain, Map, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const materialTypes = [
  { id: "summary", label: "📝 Resumo", icon: FileText, description: "Resumo completo e organizado" },
  { id: "explanation", label: "💡 Explicação", icon: Brain, description: "Explicação detalhada e fácil" },
  { id: "mindmap", label: "🗺️ Mapa Mental", icon: Map, description: "Mapa mental organizado" },
];

const StudyMaterialGenerator = () => {
  const { profile } = useAuth();
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState("summary");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMaterial = async () => {
    if (!topic.trim()) {
      toast.error("Digite o tema que deseja estudar!");
      return;
    }

    setLoading(true);
    setContent("");

    try {
      const response = await supabase.functions.invoke("generate-study-material", {
        body: {
          subject: profile?.subjects?.[0] || "Geral",
          topic,
          schoolYear: profile?.school_year || "ensino médio",
          type: selectedType,
        },
      });

      if (response.error) throw new Error(response.error.message);

      setContent(response.data.content || "");
      toast.success("Material gerado com sucesso! 📚");
    } catch (error) {
      console.error("Error generating material:", error);
      toast.error("Erro ao gerar material. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {materialTypes.map((type) => (
          <motion.button
            key={type.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(type.id)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              selectedType === type.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/30"
            }`}
          >
            <span className="text-lg block">{type.label.split(" ")[0]}</span>
            <span className="text-xs text-muted-foreground">{type.description}</span>
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Digite o tema... Ex: Teorema de Pitágoras"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && !loading && generateMaterial()}
        />
        <Button onClick={generateMaterial} disabled={loading} className="bg-gradient-to-r from-primary to-accent">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={18} />}
          <span className="ml-2 hidden sm:inline">Gerar</span>
        </Button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {["Regra de três", "Guerra Fria", "Eletricidade", "Funções do 1º grau"].map((s) => (
          <Badge
            key={s}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setTopic(s)}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-8 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-3 flex items-center justify-center"
              >
                <Brain className="text-white" size={24} />
              </motion.div>
              <p className="font-medium text-foreground">Teacher Samuk está preparando...</p>
              <p className="text-sm text-muted-foreground">Criando {materialTypes.find(t => t.id === selectedType)?.description.toLowerCase()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {content && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="text-primary" size={18} />
                  {materialTypes.find(t => t.id === selectedType)?.label}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-xl border border-border/30 whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialGenerator;
