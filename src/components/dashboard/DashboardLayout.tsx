import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Flame,
  Gift,
  Trophy,
  Bot,
  Settings,
  LogOut,
  Coins,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/studyflow-logo.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: {
    public_name: string;
    coins: number;
    current_rank: string;
  } | null;
}

const menuItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: BookOpen, label: "Atividades", path: "/activities" },
  { icon: Flame, label: "Ofensiva", path: "/streak" },
  { icon: Gift, label: "Recompensas", path: "/rewards" },
  { icon: Trophy, label: "Rankings", path: "/rankings" },
  { icon: Bot, label: "IA Tutora", path: "/tutor" },
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

  return (
    <div className="min-h-screen bg-background flex">
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border z-50 lg:relative lg:translate-x-0 lg:z-auto"
        style={{ transform: "none" }}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Studio Flow" className="h-10 w-auto rounded-lg" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
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
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border z-30 flex-col">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Studio Flow" className="h-10 w-auto rounded-lg" />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
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

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rank-gold/10 rounded-full">
                <Coins size={18} className="text-rank-gold" />
                <span className="font-semibold text-sm">
                  {profile?.coins?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
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

export default DashboardLayout;
