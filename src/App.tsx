import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetail from "./pages/DestinationDetail";
import ExperiencesPage from "./pages/ExperiencesPage";
import WildlifePage from "./pages/WildlifePage";
import CommunityPage from "./pages/CommunityPage";
import GuidesPage from "./pages/GuidesPage";
import EventsPage from "./pages/EventsPage";
import FoodPage from "./pages/FoodPage";
import SafetyPage from "./pages/SafetyPage";
import ImpactPage from "./pages/ImpactPage";
import NomadsPage from "./pages/NomadsPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NearbyPage from "./pages/NearbyPage";
import TripPlannerPage from "./pages/TripPlannerPage";
import WildlifeIntelPage from "./pages/WildlifeIntelPage";
import CommunityProfilePage from "./pages/CommunityProfilePage";
import CulturalPrepPage from "./pages/CulturalPrepPage";
import GuideRegisterPage from "./pages/GuideRegisterPage";
import GuideDashboardPage from "./pages/GuideDashboardPage";
import AccommodationPage from "./pages/AccommodationPage";
import MarketplacePage from "./pages/MarketplacePage";
import TransportPage from "./pages/TransportPage";
import DomesticPage from "./pages/DomesticPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/wildlife" element={<WildlifePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:slug" element={<CommunityProfilePage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/nomads" element={<NomadsPage />} />
            <Route path="/onboard" element={<OnboardingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/nearby" element={<NearbyPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/wildlife-intel" element={<WildlifeIntelPage />} />
            <Route path="/cultural-prep" element={<CulturalPrepPage />} />
            <Route path="/guide-register" element={<GuideRegisterPage />} />
            <Route path="/guide-dashboard" element={<GuideDashboardPage />} />
            <Route path="/accommodation" element={<AccommodationPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
