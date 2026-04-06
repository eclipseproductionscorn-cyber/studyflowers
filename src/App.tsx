import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
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
import Onboarding from "./pages/Onboarding";
import Inventory from "./pages/Inventory";
import TeacherNick from "./pages/TeacherNick";
import QuantumX from "./pages/QuantumX";
import AiTutora from "./pages/AiTutora";
import Flashcards from "./pages/Flashcards";
import TeacherSamuk from "./pages/TeacherSamuk";
import Achievements from "./pages/Achievements";
import GlobalRanking from "./pages/GlobalRanking";
import LevelingQuiz from "./pages/LevelingQuiz";
import AdminPanel from "./pages/AdminPanel";
import Notes from "./pages/Notes";
import Chat from "./pages/Chat";
import StudyCalendar from "./pages/StudyCalendar";
import Events from "./pages/Events";
import Trails from "./pages/Trails";
import JourneyMap from "./pages/JourneyMap";
import WorldMap from "./pages/WorldMap";
import SkillTree from "./pages/SkillTree";
import BossBattle from "./pages/BossBattle";
import VirtualPet from "./pages/VirtualPet";
import EnergySystem from "./pages/EnergySystem";
import Statistics from "./pages/Statistics";
import StudyPlan from "./pages/StudyPlan";
import Guilds from "./pages/Guilds";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/leveling-quiz" element={<LevelingQuiz />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/streak" element={<Streak />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/rewards" element={<Shop />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/global-ranking" element={<GlobalRanking />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/weekly-goals" element={<WeeklyGoals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/teacher-nick" element={<TeacherNick />} />
            <Route path="/teacher-samuk" element={<TeacherSamuk />} />
            <Route path="/quantum-x" element={<QuantumX />} />
            <Route path="/ai-tutora" element={<AiTutora />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/calendar" element={<StudyCalendar />} />
            <Route path="/events" element={<Events />} />
            <Route path="/trails" element={<Trails />} />
            <Route path="/journey-map" element={<JourneyMap />} />
            <Route path="/skill-tree" element={<SkillTree />} />
            <Route path="/boss-battle" element={<BossBattle />} />
            <Route path="/virtual-pet" element={<VirtualPet />} />
            <Route path="/energy" element={<EnergySystem />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/guilds" element={<Guilds />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
