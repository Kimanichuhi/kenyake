import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { User, MapPin, Heart, Wallet, Globe, LogOut, Settings, Bookmark, History, Trash2, Calendar, Clock, Users, Loader2, XCircle, Bed, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { destinations } from "@/data/destinations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const SavedDestinations = () => {
  const { favorites, toggleFavorite, loading } = useFavorites();
  const navigate = useNavigate();
  const savedDestinations = destinations.filter((d) => favorites.includes(d.id));

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
        <Link key={dest.id} to={`/destination/${dest.id}`} className="group">
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

interface BookingWithExperience {
  id: string;
  booking_date: string;
  start_time: string | null;
  guest_count: number | null;
  total_price: number | null;
  status: string | null;
  special_requests: string | null;
  created_at: string;
  experiences: { title: string; host_name: string; location_name: string | null; price_display: string | null; duration_minutes: number | null } | null;
}

interface AccBookingWithAccommodation {
  id: string;
  check_in: string;
  check_out: string;
  guest_count: number | null;
  rooms: number | null;
  total_price: number | null;
  status: string | null;
  created_at: string;
  accommodations: { name: string; location_name: string | null; price_display: string | null; property_type: string } | null;
}

interface TransportBooking {
  id: string;
  booking_type: string;
  pickup_date: string;
  pickup_time: string | null;
  pickup_location: string;
  dropoff_location: string | null;
  return_date: string | null;
  passenger_count: number | null;
  total_price: number | null;
  status: string | null;
  created_at: string;
  transport_vehicles: { name: string; vehicle_type: string; make: string | null; model: string | null } | null;
  transport_drivers: { name: string } | null;
}

const MyBookings = () => {
  const [expBookings, setExpBookings] = useState<BookingWithExperience[]>([]);
  const [accBookings, setAccBookings] = useState<AccBookingWithAccommodation[]>([]);
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"experiences" | "accommodation" | "transport">("experiences");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    const [expRes, accRes, transRes] = await Promise.all([
      supabase.from("experience_bookings").select("id, booking_date, start_time, guest_count, total_price, status, special_requests, created_at, experiences(title, host_name, location_name, price_display, duration_minutes)").order("booking_date", { ascending: false }),
      supabase.from("accommodation_bookings").select("id, check_in, check_out, guest_count, rooms, total_price, status, created_at, accommodations(name, location_name, price_display, property_type)").order("check_in", { ascending: false }),
      supabase.from("transport_bookings").select("id, booking_type, pickup_date, pickup_time, pickup_location, dropoff_location, return_date, passenger_count, total_price, status, created_at, transport_vehicles(name, vehicle_type, make, model), transport_drivers(name)").order("pickup_date", { ascending: false }),
    ]);
    if (expRes.data) setExpBookings(expRes.data as unknown as BookingWithExperience[]);
    if (accRes.data) setAccBookings(accRes.data as unknown as AccBookingWithAccommodation[]);
    if (transRes.data) setTransportBookings(transRes.data as unknown as TransportBooking[]);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (id: string, table: "experience_bookings" | "accommodation_bookings" | "transport_bookings") => {
    setCancelling(id);
    const { error } = await supabase.from(table).update({ status: "cancelled" }).eq("id", id);
    setCancelling(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking cancelled" });
      fetchBookings();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const noBookings = expBookings.length === 0 && accBookings.length === 0 && transportBookings.length === 0;

  if (noBookings) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
        <p className="text-muted-foreground font-body mb-4">Book experiences, accommodation, or transport to see them here</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate("/experiences")} className="gradient-sunset text-primary-foreground border-0">Browse Experiences</Button>
          <Button onClick={() => navigate("/accommodation")} variant="outline">Find Accommodation</Button>
          <Button onClick={() => navigate("/transport")} variant="outline">Hire Transport</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setSubTab("experiences")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${subTab === "experiences" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          <Calendar className="h-3 w-3" /> Experiences ({expBookings.length})
        </button>
        <button onClick={() => setSubTab("accommodation")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${subTab === "accommodation" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          <Bed className="h-3 w-3" /> Accommodation ({accBookings.length})
        </button>
        <button onClick={() => setSubTab("transport")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${subTab === "transport" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          <Car className="h-3 w-3" /> Transport ({transportBookings.length})
        </button>
      </div>

      {subTab === "experiences" && expBookings.map((b) => (
        <div key={b.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-display font-semibold text-foreground truncate">{b.experiences?.title || "Experience"}</h4>
                <Badge className={`text-xs ${statusColors[b.status || "pending"]}`}>{b.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-body">Hosted by {b.experiences?.host_name}</p>
              {b.experiences?.location_name && <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{b.experiences.location_name}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                {b.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.start_time}</span>}
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.guest_count} guest{(b.guest_count || 1) > 1 ? "s" : ""}</span>
                {b.total_price && <span className="font-semibold text-foreground">${b.total_price}</span>}
              </div>
            </div>
            {b.status === "pending" && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0" disabled={cancelling === b.id} onClick={() => cancelBooking(b.id, "experience_bookings")}>
                {cancelling === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1" />Cancel</>}
              </Button>
            )}
          </div>
        </div>
      ))}

      {subTab === "accommodation" && accBookings.map((b) => (
        <div key={b.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-display font-semibold text-foreground truncate">{b.accommodations?.name || "Accommodation"}</h4>
                <Badge className={`text-xs ${statusColors[b.status || "pending"]}`}>{b.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body capitalize">{b.accommodations?.property_type}</p>
              {b.accommodations?.location_name && <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{b.accommodations.location_name}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(b.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.guest_count} guest{(b.guest_count || 1) > 1 ? "s" : ""}</span>
                <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{b.rooms} room{(b.rooms || 1) > 1 ? "s" : ""}</span>
                {b.total_price && <span className="font-semibold text-foreground">${b.total_price}</span>}
              </div>
            </div>
            {b.status === "pending" && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0" disabled={cancelling === b.id} onClick={() => cancelBooking(b.id, "accommodation_bookings")}>
                {cancelling === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1" />Cancel</>}
              </Button>
            )}
          </div>
        </div>
      ))}

      {subTab === "transport" && transportBookings.map((b) => (
        <div key={b.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-primary" />
                <h4 className="font-display font-semibold text-foreground truncate">
                  {b.transport_vehicles ? `${b.transport_vehicles.name}` : "Vehicle"}
                  {b.transport_vehicles?.make && ` (${b.transport_vehicles.make} ${b.transport_vehicles.model || ""})`}
                </h4>
                <Badge className={`text-xs ${statusColors[b.status || "pending"]}`}>{b.status}</Badge>
              </div>
              {b.transport_drivers && <p className="text-sm text-muted-foreground font-body">Driver: {b.transport_drivers.name}</p>}
              <div className="text-xs text-muted-foreground font-body mt-1 space-y-0.5">
                <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.pickup_location}{b.dropoff_location ? ` → ${b.dropoff_location}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.pickup_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                {b.pickup_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.pickup_time}</span>}
                {b.return_date && <span className="flex items-center gap-1">Return: {new Date(b.return_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.passenger_count} passenger{(b.passenger_count || 1) > 1 ? "s" : ""}</span>
                {b.total_price && <span className="font-semibold text-foreground">KES {b.total_price.toLocaleString()}</span>}
                <Badge variant="outline" className="text-xs capitalize">{b.booking_type.replace("_", " ")}</Badge>
              </div>
            </div>
            {b.status === "pending" && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0" disabled={cancelling === b.id} onClick={() => cancelBooking(b.id, "transport_bookings")}>
                {cancelling === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1" />Cancel</>}
              </Button>
            )}
          </div>
        </div>
      ))}

      {subTab === "transport" && transportBookings.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No transport bookings</h3>
          <p className="text-muted-foreground font-body mb-4">Hire a vehicle or book a transfer</p>
          <Button onClick={() => navigate("/transport")} variant="outline">Browse Transport</Button>
        </div>
      )}
    </motion.div>
  );
};

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "saved" | "bookings" | "trips">("profile");

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

          {activeTab === "bookings" && <MyBookings />}
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
