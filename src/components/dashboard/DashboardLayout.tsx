import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Flame, ShoppingBag, Trophy, Bot, Settings, LogOut, Coins, Menu, X,
  Target, Wrench, Award, Sparkles, StickyNote, MessageCircle, CalendarDays, Calendar, Map, TreePine, Swords,
  Heart, BarChart3, PawPrint, ClipboardList, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/studyflow-logo.png";
import { getRankData } from "@/lib/ranks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLevelFromXP, getLevelProgress } from "@/lib/levelSystem";
import { Progress } from "@/components/ui/progress";
import { FloatingElements } from "@/components/FloatingElements";

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: {
    public_name: string;
    coins: number;
    current_rank: string;
    xp?: number;
    level?: number;
  } | null;
}

const menuItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: BookOpen, label: "Atividades", path: "/activities" },
  { icon: ClipboardList, label: "Plano de Estudos", path: "/study-plan" },
  { icon: Map, label: "Mapa de Jornada", path: "/journey-map" },
  { icon: TreePine, label: "Habilidades", path: "/skill-tree" },
  { icon: Swords, label: "Chefões", path: "/boss-battle" },
  { icon: Sparkles, label: "Flashcards", path: "/flashcards" },
  { icon: StickyNote, label: "Caderno", path: "/notes" },
  { icon: CalendarDays, label: "Calendário", path: "/calendar" },
  { icon: Calendar, label: "Eventos", path: "/events" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: Target, label: "Metas Semanais", path: "/weekly-goals" },
  { icon: Flame, label: "Ofensiva", path: "/streak" },
  { icon: Award, label: "Conquistas", path: "/achievements" },
  { icon: Trophy, label: "Ranking", path: "/global-ranking" },
  { icon: ShoppingBag, label: "Loja", path: "/shop" },
  { icon: PawPrint, label: "Pet Virtual", path: "/virtual-pet" },
  { icon: Heart, label: "Energia", path: "/energy" },
  { icon: Shield, label: "Guildas", path: "/guilds" },
  { icon: Trophy, label: "Ranking de Guildas", path: "/guild-ranking" },
  { icon: BarChart3, label: "Estatísticas", path: "/statistics" },
  { icon: Wrench, label: "Ferramentas", path: "/tools" },
  { icon: Bot, label: "Teacher Samuk", path: "/teacher-samuk" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const DashboardLayout = ({ children, profile }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Até logo!");
      navigate("/");
    }
  };

  const rankData = getRankData(profile?.current_rank || "bronze_1");

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Floating Elements for dark mode gamification */}
      <div className="hidden dark:block">
        <FloatingElements count={25} />
      </div>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar-background border-r border-sidebar-border z-50 lg:hidden"
          >
            <SidebarContent
              menuItems={menuItems}
              location={location}
              onItemClick={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              profile={profile}
              rankData={rankData}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-sidebar-background border-r border-sidebar-border z-30 flex-col">
        <SidebarContent
          menuItems={menuItems}
          location={location}
          onLogout={handleLogout}
          profile={profile}
          rankData={rankData}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>

            <div className="flex items-center gap-3 ml-auto">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Coins */}
              <Link 
                to="/shop"
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-rank-gold/20 to-amber-500/20 border border-rank-gold/30 rounded-full hover:scale-105 transition-transform"
              >
                <Coins size={18} className="text-rank-gold" />
                <span className="font-bold text-sm">
                  {profile?.coins?.toLocaleString() || 0}
                </span>
              </Link>

              {/* Level Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-full">
                <Sparkles size={16} className="text-primary" />
                <span className="font-medium text-sm text-primary">
                  Nv. {profile?.level || 1}
                </span>
              </div>

              {/* Rank Badge */}
              {rankData && (
                <Link 
                  to="/rankings"
                  className={`hidden lg:flex items-center gap-2 px-3 py-1.5 ${rankData.rank.bgColor}/20 border ${rankData.rank.borderColor}/30 rounded-full hover:scale-105 transition-transform`}
                >
                  <Trophy size={16} className={rankData.rank.color} />
                  <span className={`font-medium text-sm ${rankData.rank.color}`}>
                    {rankData.rank.name} {["I", "II", "III"][rankData.level - 1]}
                  </span>
                </Link>
              )}

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {profile?.public_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  menuItems: typeof menuItems;
  location: ReturnType<typeof useLocation>;
  onItemClick?: () => void;
  onLogout: () => void;
  profile: DashboardLayoutProps["profile"];
  rankData: ReturnType<typeof getRankData>;
}

const SidebarContent = ({
  menuItems,
  location,
  onItemClick,
  onLogout,
  profile,
  rankData,
}: SidebarContentProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Studio Flow" className="h-10 w-auto rounded-lg" />
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {profile?.public_name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sidebar-foreground truncate">
              {profile?.public_name || "Estudante"}
            </p>
            {rankData && (
              <p className={`text-sm ${rankData.rank.color} font-medium`}>
                {rankData.rank.name} {["I", "II", "III"][rankData.level - 1]}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-2 p-2 bg-sidebar-accent rounded-lg">
            <Coins size={14} className="text-rank-gold" />
            <span className="text-xs font-medium text-sidebar-foreground">
              {profile?.coins?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-sidebar-accent rounded-lg">
            <Target size={14} className="text-primary" />
            <span className="text-xs font-medium text-sidebar-foreground">
              Nv. {profile?.level || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardLayout;
