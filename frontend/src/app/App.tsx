import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./routes/Index";
import DestinationsPage from "./routes/DestinationsPage";
import DestinationDetail from "./routes/DestinationDetail";
import ExperiencesPage from "./routes/ExperiencesPage";
import WildlifePage from "./routes/WildlifePage";
import CommunityPage from "./routes/CommunityPage";
import GuidesPage from "./routes/GuidesPage";
import EventsPage from "./routes/EventsPage";
import FoodPage from "./routes/FoodPage";
import SafetyPage from "./routes/SafetyPage";
import ImpactPage from "./routes/ImpactPage";
import NomadsPage from "./routes/NomadsPage";
import OnboardingPage from "./routes/OnboardingPage";
import AuthPage from "./routes/AuthPage";
import ProfilePage from "./routes/ProfilePage";
import NearbyPage from "./routes/NearbyPage";
import TripPlannerPage from "./routes/TripPlannerPage";
import WildlifeIntelPage from "./routes/WildlifeIntelPage";
import CommunityProfilePage from "./routes/CommunityProfilePage";
import CulturalPrepPage from "./routes/CulturalPrepPage";
import GuideRegisterPage from "./routes/GuideRegisterPage";
import GuideDashboardPage from "./routes/GuideDashboardPage";
import AccommodationPage from "./routes/AccommodationPage";
import MarketplacePage from "./routes/MarketplacePage";
import PackagesPage from "./routes/PackagesPage";
import PaymentsPage from "./routes/PaymentsPage";
import TransportPage from "./routes/TransportPage";
import DomesticPage from "./routes/DomesticPage";
import HeritagePage from "./routes/HeritagePage";
import OfflineSettingsPage from "./routes/OfflineSettingsPage";
import OfflineStatusBar from "@/components/OfflineStatusBar";
import CommunityDashboardPage from "./routes/CommunityDashboardPage";
import OperatorDashboardPage from "./routes/OperatorDashboardPage";
import CountyAnalyticsDashboardPage from "./routes/CountyAnalyticsDashboardPage";
import PlatformAdminDashboardPage from "./routes/PlatformAdminDashboardPage";
import PWAInstallPage from "./routes/PWAInstallPage";
import CommunityRegisterPage from "./routes/CommunityRegisterPage";
import GroupChatPage from "./routes/GroupChatPage";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import NotFound from "./routes/NotFound";
import { AdminLayout } from "@/admin/layouts/AdminLayout";
import {
  AdminDashboard,
  CommunitiesPage,
  CommunityDetailPage,
  ExperiencesPage as AdminExperiencesPage,
  BookingsPage,
} from "@/admin/pages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
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
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/domestic" element={<DomesticPage />} />
            <Route path="/heritage" element={<HeritagePage />} />
            <Route path="/offline-settings" element={<OfflineSettingsPage />} />
            <Route path="/community-dashboard" element={<CommunityDashboardPage />} />
            <Route path="/community-register" element={<CommunityRegisterPage />} />
            <Route path="/operator-dashboard" element={<OperatorDashboardPage />} />
            <Route path="/county-analytics" element={<CountyAnalyticsDashboardPage />} />
            <Route path="/platform-admin" element={<PlatformAdminDashboardPage />} />
            <Route path="/install" element={<PWAInstallPage />} />
            <Route path="/group-chat" element={<GroupChatPage />} />
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/communities" element={<AdminLayout><CommunitiesPage /></AdminLayout>} />
            <Route path="/admin/communities/:id" element={<AdminLayout><CommunityDetailPage /></AdminLayout>} />
            <Route path="/admin/experiences" element={<AdminLayout><AdminExperiencesPage /></AdminLayout>} />
            <Route path="/admin/bookings" element={<AdminLayout><BookingsPage /></AdminLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <OfflineStatusBar />
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
