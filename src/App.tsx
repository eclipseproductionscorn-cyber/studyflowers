import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Streak from "./pages/Streak";
import Tools from "./pages/Tools";
import Pomodoro from "./pages/Pomodoro";
import Tutor from "./pages/Tutor";
import Shop from "./pages/Shop";
import RankingsPage from "./pages/RankingsPage";
import WeeklyGoals from "./pages/WeeklyGoals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/rewards" element={<Shop />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/weekly-goals" element={<WeeklyGoals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
