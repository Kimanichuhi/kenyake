import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, MapPin, Heart, Wallet, Globe, LogOut, Settings, Bookmark, History, Trash2, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useFavorites } from "@/hooks/useFavorites";
import { useDestinations } from "@/hooks/useDestinations";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { MyBookingsPanel } from "@/domains/bookings/components/MyBookingsPanel";

const travelStyleLabels: Record<string, string> = {
  wildlife: "🦁 Wildlife Safari",
  cultural: "🎭 Cultural Immersion",
  adventure: "🏔️ Adventure",
  beach: "🏖️ Beach & Marine",
  luxury: "✨ Luxury",
  budget: "💰 Budget Travel",
  family: "👨‍👩‍👧‍👦 Family",
  photography: "📷 Photography",
};

const budgetLabels: Record<string, string> = {
  budget: "Under $50/day",
  mid: "$50 — $150/day",
  comfort: "$150 — $300/day",
  luxury: "$300+/day",
};

const SavedDestinations = () => {
  const { favorites, toggleFavorite, loading } = useFavorites();
  const { data: destinations = [], isLoading: destinationsLoading } = useDestinations();
  const navigate = useNavigate();
  const savedDestinations = destinations.filter((d) => favorites.includes(d.id));

  if (destinationsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl h-52 animate-pulse" />
        ))}
      </div>
    );
  }

  if (savedDestinations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">No saved destinations yet</h3>
        <p className="text-muted-foreground font-body mb-4">Explore destinations and save your favorites</p>
        <Button onClick={() => navigate("/destinations")} className="gradient-safari text-primary-foreground border-0">Explore Destinations</Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {savedDestinations.map((dest) => (
        <Link key={dest.id} to={`/destinations/${dest.id}`} className="group">
          <div className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-40">
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!loading) toggleFavorite(dest.id); }} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-destructive/90 text-primary-foreground flex items-center justify-center hover:bg-destructive transition-colors" aria-label="Remove from favorites">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <h4 className="font-display font-semibold text-foreground">{dest.name}</h4>
              <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" /> {dest.county} • ⭐ {dest.rating}</p>
            </div>
          </div>
        </Link>
      ))}
    </motion.div>
  );
};

const ProfilePage = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { hasAnyRole } = useUserRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "saved" | "bookings" | "trips">("profile");
  const canAccessAdmin = hasAnyRole(["admin", "content_manager", "editor"]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab === "saved" || tab === "bookings" || tab === "trips" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full gradient-safari flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{profile?.full_name || "Explorer"}</h1>
                <p className="text-muted-foreground font-body">{user.email}</p>
                {profile?.nationality && (
                  <p className="text-sm text-muted-foreground font-body mt-1"><MapPin className="inline h-3 w-3 mr-1" />{profile.nationality}{profile.first_visit ? " • First time in Kenya" : " • Returning visitor"}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canAccessAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="text-sm">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Admin Panel
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate("/onboard")} className="text-sm"><Settings className="h-4 w-4 mr-1" /> Edit Preferences</Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive hover:text-destructive"><LogOut className="h-4 w-4 mr-1" /> Sign Out</Button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: "profile" as const, label: "Profile", icon: User },
              { id: "bookings" as const, label: "My Bookings", icon: Calendar },
              { id: "saved" as const, label: "Saved", icon: Bookmark },
              { id: "trips" as const, label: "Trip History", icon: History },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${activeTab === tab.id ? "gradient-safari text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {profile?.travel_styles && profile.travel_styles.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="h-5 w-5 text-accent" /> Travel Styles</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.travel_styles.map((s) => (<span key={s} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-body">{travelStyleLabels[s] || s}</span>))}
                  </div>
                </div>
              )}
              {profile?.budget_range && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Wallet className="h-5 w-5 text-secondary" /> Budget Range</h3>
                  <p className="text-foreground font-body">{budgetLabels[profile.budget_range] || profile.budget_range}</p>
                </div>
              )}
              {profile?.languages && profile.languages.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="h-5 w-5 text-river-blue" /> Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((l) => (<span key={l} className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-body">{l}</span>))}
                  </div>
                </div>
              )}
              {!profile?.onboarding_completed && (
                <div className="glass-card rounded-2xl p-6 border border-secondary/30">
                  <p className="text-foreground font-body mb-3">Complete your profile to get personalized recommendations!</p>
                  <Button onClick={() => navigate("/onboard")} className="gradient-sunset text-primary-foreground border-0">Complete Onboarding</Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "bookings" && <MyBookingsPanel />}
          {activeTab === "saved" && <SavedDestinations />}

          {activeTab === "trips" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No trips recorded yet</h3>
              <p className="text-muted-foreground font-body mb-4">Your travel history will appear here after your adventures</p>
              <Button onClick={() => navigate("/destinations")} className="gradient-sunset text-primary-foreground border-0">Plan Your First Trip</Button>
            </motion.div>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
};

export default ProfilePage;
