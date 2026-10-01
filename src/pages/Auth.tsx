import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoAsset from "@/assets/studyflow-vintage-logo.png.asset.json";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z.object({
  publicName: z.string().min(2, "Nome público deve ter no mínimo 2 caracteres").max(50, "Nome público muito longo"),
  fullName: z.string().min(2, "Nome completo deve ter no mínimo 2 caracteres").max(100, "Nome completo muito longo"),
  email: z.string().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form fields
  const [publicName, setPublicName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in and handle redirect based on onboarding status
    const checkUserAndRedirect = async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkUserAndRedirect(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse({ email, password });
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("E-mail ou senha incorretos");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = signupSchema.parse({ publicName, fullName, email, password });
      
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            public_name: validatedData.publicName,
            full_name: validatedData.fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Este e-mail já está cadastrado. Faça login.");
        } else {
          toast.error(error.message);
        }
      } else if (error?.message?.includes("Email not confirmed")) {
        toast.info("Verifique seu e-mail para confirmar a conta!");
      } else {
        toast.success("Conta criada com sucesso! Vamos configurar seu perfil! 🎮");
        navigate("/onboarding");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: Trophy, delay: 0, x: -20, y: -30 },
    { Icon: Sparkles, delay: 0.2, x: 30, y: -20 },
    { Icon: BookOpen, delay: 0.4, x: 20, y: 30 },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative inline-block"
          >
            <a href="/" className="inline-block">
              <img src={logoAsset.url} alt="StudyFlow" className="h-40 w-auto max-w-full object-contain mx-auto mb-4" />
            </a>
            
            {/* Floating icons */}
            {floatingIcons.map(({ Icon, delay, x, y }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                  scale: 1,
                  y: [y, y - 10, y],
                }}
                transition={{
                  delay,
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute text-primary/60"
                style={{ left: `calc(50% + ${x}px)`, top: `${y + 20}px` }}
              >
                <Icon size={18} />
              </motion.div>
            ))}
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? "Bem-vindo de volta!" : "Comece sua jornada"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin 
              ? "Entre para continuar estudando" 
              : "Crie sua conta e ganhe 2.000 moedas!"}
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl"
        >
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="publicName">Como deseja ser chamado?</Label>
                  <Input
                    id="publicName"
                    type="text"
                    placeholder="Seu apelido ou nome público"
                    value={publicName}
                    onChange={(e) => setPublicName(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPublicName("");
                  setFullName("");
                  setEmail("");
                  setPassword("");
                }}
                className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Benefits for signup */}
        {!isLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-rank-gold" /> 2.000 moedas
              </span>
              <span className="flex items-center gap-1">
                <Sparkles size={14} className="text-primary" /> Itens exclusivos
              </span>
            </div>
          </motion.div>
        )}

        {/* Back to home */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar para a página inicial
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
