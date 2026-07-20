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
import AdminInviteSignupPage from "./routes/AdminInviteSignupPage";
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
import RequireRole from "@/components/RequireRole";
import AdminLayout from "@/domains/admin/components/AdminLayout";
import AdminDashboardHome from "@/domains/admin/pages/AdminDashboardHome";
import MediaLibraryPage from "@/domains/admin/pages/media/MediaLibraryPage";
import WildlifeListPage from "@/domains/admin/pages/wildlife/WildlifeListPage";
import WildlifeFormPage from "@/domains/admin/pages/wildlife/WildlifeFormPage";
import CommunitiesListPage from "@/domains/admin/pages/communities/CommunitiesListPage";
import CommunityFormPage from "@/domains/admin/pages/communities/CommunityFormPage";
import GuidesListPage from "@/domains/admin/pages/guides/GuidesListPage";
import GuideFormPage from "@/domains/admin/pages/guides/GuideFormPage";
import ExperiencesListPage from "@/domains/admin/pages/experiences/ExperiencesListPage";
import ExperienceFormPage from "@/domains/admin/pages/experiences/ExperienceFormPage";
import DestinationsListPage from "@/domains/admin/pages/destinations/DestinationsListPage";
import DestinationFormPage from "@/domains/admin/pages/destinations/DestinationFormPage";
import BlogListPage from "@/domains/admin/pages/blog/BlogListPage";
import BlogFormPage from "@/domains/admin/pages/blog/BlogFormPage";
import BlogCategoriesPage from "@/domains/admin/pages/blog/BlogCategoriesPage";
import BlogPage from "./routes/BlogPage";
import BlogDetailPage from "./routes/BlogDetailPage";
import PagesListPage from "@/domains/admin/pages/pages/PagesListPage";
import PageFormPage from "@/domains/admin/pages/pages/PageFormPage";
import AuditLogsPage from "@/domains/admin/pages/audit/AuditLogsPage";
import PartnersPage from "./routes/PartnersPage";
import PartnersDetailPage from "./routes/PartnersDetailPage";
import RequirePartnerBusiness from "@/components/RequirePartnerBusiness";
import BecomeAPartnerPage from "@/domains/partners/pages/BecomeAPartnerPage";
import PartnerRegisterPage from "@/domains/partners/pages/PartnerRegisterPage";
import PartnerDashboardPage from "@/domains/partners/pages/PartnerDashboardPage";
import PartnerDashboardLayout from "@/domains/partners/components/dashboard/PartnerDashboardLayout";
import { BusinessProfileEditForm } from "@/domains/partners/components/dashboard/BusinessProfileEditForm";
import { BusinessDocumentsPanel } from "@/domains/partners/components/dashboard/BusinessDocumentsPanel";
import { BusinessMediaPanel } from "@/domains/partners/components/dashboard/BusinessMediaPanel";
import PartnerApplicationsQueue from "@/domains/admin/pages/partners/PartnerApplicationsQueue";
import ManageAdminsPage from "@/domains/admin/pages/admins/ManageAdminsPage";
import PartnerApplicationDetail from "@/domains/admin/pages/partners/PartnerApplicationDetail";
import TransportDashboardPage from "./routes/TransportDashboardPage";
import BookingsQueue from "@/domains/admin/pages/bookings/BookingsQueue";

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
            <Route path="/admin-signup" element={<AdminInviteSignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/nearby" element={<NearbyPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/wildlife-intel" element={<WildlifeIntelPage />} />
            <Route path="/cultural-prep" element={<CulturalPrepPage />} />
            <Route path="/guide-register" element={<GuideRegisterPage />} />
            <Route path="/guide-dashboard" element={<GuideDashboardPage />} />
            <Route path="/transport-dashboard" element={<TransportDashboardPage />} />
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/partners/:slug" element={<PartnersDetailPage />} />
            <Route path="/become-a-partner" element={<BecomeAPartnerPage />} />
            <Route path="/partner/register" element={<PartnerRegisterPage />} />
            <Route
              path="/partner"
              element={
                <RequirePartnerBusiness>
                  <PartnerDashboardLayout />
                </RequirePartnerBusiness>
              }
            >
              <Route index element={<PartnerDashboardPage />} />
              <Route path="profile" element={<BusinessProfileEditForm />} />
              <Route path="documents" element={<BusinessDocumentsPanel />} />
              <Route path="media" element={<BusinessMediaPanel />} />
            </Route>
            <Route
              path="/admin"
              element={
                <RequireRole anyOf={["admin", "content_manager", "editor"]}>
                  <AdminLayout />
                </RequireRole>
              }
            >
              <Route index element={<AdminDashboardHome />} />
              <Route path="wildlife" element={<WildlifeListPage />} />
              <Route path="wildlife/new" element={<WildlifeFormPage />} />
              <Route path="wildlife/:id" element={<WildlifeFormPage />} />
              <Route path="communities" element={<CommunitiesListPage />} />
              <Route path="communities/new" element={<CommunityFormPage />} />
              <Route path="communities/:id" element={<CommunityFormPage />} />
              <Route path="guides" element={<GuidesListPage />} />
              <Route path="guides/new" element={<GuideFormPage />} />
              <Route path="guides/:id" element={<GuideFormPage />} />
              <Route path="experiences" element={<ExperiencesListPage />} />
              <Route path="experiences/new" element={<ExperienceFormPage />} />
              <Route path="experiences/:id" element={<ExperienceFormPage />} />
              <Route path="destinations" element={<DestinationsListPage />} />
              <Route path="destinations/new" element={<DestinationFormPage />} />
              <Route path="destinations/:id" element={<DestinationFormPage />} />
              <Route path="blog/categories" element={<BlogCategoriesPage />} />
              <Route path="blog" element={<BlogListPage />} />
              <Route path="blog/new" element={<BlogFormPage />} />
              <Route path="blog/:id" element={<BlogFormPage />} />
              <Route path="pages" element={<PagesListPage />} />
              <Route path="pages/new" element={<PageFormPage />} />
              <Route path="pages/:id" element={<PageFormPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="bookings" element={<BookingsQueue />} />
              <Route
                path="audit-logs"
                element={
                  <RequireRole anyOf={["admin"]}>
                    <AuditLogsPage />
                  </RequireRole>
                }
              />
              <Route
                path="partners"
                element={
                  <RequireRole anyOf={["admin"]}>
                    <PartnerApplicationsQueue />
                  </RequireRole>
                }
              />
              <Route
                path="partners/:id"
                element={
                  <RequireRole anyOf={["admin"]}>
                    <PartnerApplicationDetail />
                  </RequireRole>
                }
              />
              <Route
                path="admins"
                element={
                  <RequireRole anyOf={["super_admin"]}>
                    <ManageAdminsPage />
                  </RequireRole>
                }
              />
            </Route>
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
