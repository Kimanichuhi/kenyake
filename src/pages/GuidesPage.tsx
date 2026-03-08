import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Star, MapPin, Clock, Languages, Award, Calendar, MessageCircle,
  ChevronDown, ChevronRight, Filter, Shield, Zap, Users, DollarSign,
  CheckCircle2, X, Send, Loader2, BarChart3, BookOpen, AlertTriangle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Guide {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  languages: string[];
  specializations: string[];
  certifications: string[];
  certification_level: string;
  location: string | null;
  county: string | null;
  price_per_day: number | null;
  price_currency: string;
  rating: number;
  review_count: number;
  years_experience: number;
  response_time_minutes: number;
  is_available: boolean;
  is_verified: boolean;
  total_bookings: number;
}

interface Review {
  id: string;
  guide_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

interface Availability {
  date: string;
  is_available: boolean;
}

const specializations = [
  "All", "Wildlife Safari", "Big Five Tracking", "Photography", "Birding",
  "Hiking", "Cultural Heritage", "Coastal Heritage", "Marine Wildlife",
  "Walking Safari", "Food Tours", "History", "Night Drives"
];

const certLevelColors: Record<string, string> = {
  bronze: "bg-amber-700/20 text-amber-800 border-amber-700/30",
  silver: "bg-slate-400/20 text-slate-700 border-slate-400/30",
  gold: "bg-yellow-500/20 text-yellow-800 border-yellow-500/30",
};

const certLevelIcons: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

const formatResponseTime = (minutes: number) => {
  if (minutes < 60) return `< ${minutes} min`;
  if (minutes === 60) return "< 1 hour";
  return `< ${Math.round(minutes / 60)} hours`;
};

const GuidesPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [availability, setAvailability] = useState<Record<string, Availability[]>>({});
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "availability" | "book">("about");
  const [bookingForm, setBookingForm] = useState({ startDate: "", endDate: "", groupSize: 1, message: "" });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "experience" | "response">("rating");
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [groupTripForm, setGroupTripForm] = useState({ title: "", description: "", startDate: "", endDate: "", groupSize: 1 });
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [isGuide, setIsGuide] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGuides();
    if (user) checkIfGuide();
  }, [user]);

  const checkIfGuide = async () => {
    if (!user) return;
    const { data } = await supabase.from("guides").select("id").eq("user_id", user.id).maybeSingle();
    setIsGuide(!!data);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    const { data } = await supabase
      .from("guides")
      .select("*")
      .order("rating", { ascending: false });
    if (data) setGuides(data as unknown as Guide[]);
    setLoading(false);
  };

  const fetchReviews = async (guideId: string) => {
    if (reviews[guideId]) return;
    const { data } = await supabase
      .from("guide_reviews")
      .select("*")
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false });
    if (data) setReviews((prev) => ({ ...prev, [guideId]: data as Review[] }));
  };

  const fetchAvailability = async (guideId: string) => {
    if (availability[guideId]) return;
    const { data } = await supabase
      .from("guide_availability")
      .select("date, is_available")
      .eq("guide_id", guideId)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date");
    if (data) setAvailability((prev) => ({ ...prev, [guideId]: data as Availability[] }));
  };

  const openGuideProfile = (guideId: string) => {
    setSelectedGuide(guideId);
    setActiveTab("about");
    setBookingForm({ startDate: "", endDate: "", groupSize: 1, message: "" });
    fetchReviews(guideId);
    fetchAvailability(guideId);
  };

  const submitBooking = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book a guide." });
      return;
    }
    if (!selectedGuide || !bookingForm.startDate || !bookingForm.endDate) {
      toast({ title: "Missing dates", description: "Please select start and end dates.", variant: "destructive" });
      return;
    }
    const guide = guides.find((g) => g.id === selectedGuide);
    if (!guide) return;

    const days = Math.max(1, Math.ceil(
      (new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 86400000
    ) + 1);
    const totalPrice = (guide.price_per_day || 0) * days;

    setBookingLoading(true);
    const { error } = await supabase.from("guide_bookings").insert({
      guide_id: selectedGuide,
      tourist_id: user.id,
      start_date: bookingForm.startDate,
      end_date: bookingForm.endDate,
      group_size: bookingForm.groupSize,
      total_price: totalPrice,
      message: bookingForm.message || null,
    });
    setBookingLoading(false);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🎉 Booking request sent!", description: `${guide.name} will respond within ${formatResponseTime(guide.response_time_minutes)}.` });
      setActiveTab("about");
    }
  };

  const toggleGroupSelect = (guideId: string) => {
    setSelectedForGroup((prev) =>
      prev.includes(guideId) ? prev.filter((id) => id !== guideId) : [...prev, guideId]
    );
  };

  const createGroupTrip = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    if (selectedForGroup.length < 2) {
      toast({ title: "Select at least 2 guides", description: "Group trips require multiple guides.", variant: "destructive" });
      return;
    }
    if (!groupTripForm.title || !groupTripForm.startDate || !groupTripForm.endDate) {
      toast({ title: "Fill in trip details", variant: "destructive" });
      return;
    }

    setGroupLoading(true);
    const { data: trip, error } = await supabase.from("group_trips").insert({
      tourist_id: user.id,
      title: groupTripForm.title,
      description: groupTripForm.description || null,
      start_date: groupTripForm.startDate,
      end_date: groupTripForm.endDate,
      group_size: groupTripForm.groupSize,
    }).select().single();

    if (error || !trip) {
      setGroupLoading(false);
      toast({ title: "Failed to create trip", description: error?.message, variant: "destructive" });
      return;
    }

    // Add guides to the trip
    const guideInserts = selectedForGroup.map((guideId, i) => ({
      trip_id: trip.id,
      guide_id: guideId,
      role: i === 0 ? "lead" : "guide",
    }));
    await supabase.from("group_trip_guides").insert(guideInserts);

    setGroupLoading(false);
    setShowGroupPanel(false);
    setSelectedForGroup([]);
    toast({ title: "🎉 Group trip created!", description: `${selectedForGroup.length} guides invited. They'll respond soon.` });
  };

  const sorted = [...guides].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return (a.price_per_day || 0) - (b.price_per_day || 0);
    if (sortBy === "experience") return b.years_experience - a.years_experience;
    if (sortBy === "response") return a.response_time_minutes - b.response_time_minutes;
    return 0;
  });

  const filtered = sorted.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.location || "").toLowerCase().includes(search.toLowerCase()) ||
      g.specializations.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSpec = selectedSpec === "All" || g.specializations.includes(selectedSpec);
    return matchSearch && matchSpec;
  });

  const selectedGuideData = guides.find((g) => g.id === selectedGuide);
  const guideReviews = selectedGuide ? reviews[selectedGuide] || [] : [];
  const guideAvailability = selectedGuide ? availability[selectedGuide] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/8 via-background to-secondary/8">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/25 font-body">
              <Shield className="h-3 w-3 mr-1" /> Verified Local Guides
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
              Local Guide Marketplace
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Connect directly with certified Kenyan guides. Fair pricing set by guides, not platforms.
              Book with confidence — every guide is community-verified.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              {user && isGuide ? (
                <Button asChild variant="outline" className="rounded-full text-sm">
                  <Link to="/guide-dashboard">📊 Guide Dashboard</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-full text-sm">
                  <Link to="/guide-register">🎓 Become a Guide</Link>
                </Button>
              )}
              <Button
                variant={selectedForGroup.length > 0 ? "default" : "outline"}
                className="rounded-full text-sm"
                onClick={() => setShowGroupPanel(!showGroupPanel)}
              >
                <Users className="h-4 w-4 mr-1" />
                {selectedForGroup.length > 0 ? `Group Trip (${selectedForGroup.length} guides)` : "Multi-Guide Trip"}
              </Button>
            </div>
          </motion.div>

          {/* Search & filters */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search by name, location, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                    selectedSpec === spec
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              {[
                { key: "rating" as const, label: "Top Rated", icon: Star },
                { key: "price" as const, label: "Lowest Price", icon: DollarSign },
                { key: "experience" as const, label: "Most Experienced", icon: Award },
                { key: "response" as const, label: "Fastest Response", icon: Zap },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(key)}
                  className="text-xs rounded-full"
                >
                  <Icon className="h-3 w-3 mr-1" /> {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Group Trip Panel */}
      <AnimatePresence>
        {showGroupPanel && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-y border-border bg-card/50"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Create Multi-Guide Group Trip
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowGroupPanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {selectedForGroup.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedForGroup.map((gid) => {
                    const g = guides.find((x) => x.id === gid);
                    return g ? (
                      <Badge key={gid} className="bg-primary/15 text-primary border-primary/25 text-xs">
                        {g.name}
                        <button onClick={() => toggleGroupSelect(gid)} className="ml-1"><X className="h-3 w-3" /></button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground font-body mb-3">
                Select guides from the grid below, then fill in trip details. Guides will be able to communicate with each other.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  value={groupTripForm.title}
                  onChange={(e) => setGroupTripForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Trip title (e.g. Mara + Coast Safari)"
                  className="border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                />
                <input
                  type="date"
                  value={groupTripForm.startDate}
                  onChange={(e) => setGroupTripForm((p) => ({ ...p, startDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                />
                <input
                  type="date"
                  value={groupTripForm.endDate}
                  onChange={(e) => setGroupTripForm((p) => ({ ...p, endDate: e.target.value }))}
                  min={groupTripForm.startDate || new Date().toISOString().split("T")[0]}
                  className="border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                />
              </div>
              <Button
                onClick={createGroupTrip}
                disabled={groupLoading || selectedForGroup.length < 2 || !groupTripForm.title}
                className="rounded-full"
              >
                {groupLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Create Group Trip ({selectedForGroup.length} guides)
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} guides found</p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((guide, i) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedForGroup.includes(guide.id) ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                  onClick={() => openGuideProfile(guide.id)}
                >
                  {/* Multi-select checkbox */}
                  {showGroupPanel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleGroupSelect(guide.id); }}
                      className={`absolute top-3 right-3 z-10 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedForGroup.includes(guide.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card/80 border-primary-foreground/50 backdrop-blur"
                      }`}
                    >
                      {selectedForGroup.includes(guide.id) && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  )}
                  <div className="relative">
                    <img
                      src={guide.photo_url || "https://via.placeholder.com/400x300"}
                      alt={guide.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {guide.is_verified && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium border ${certLevelColors[guide.certification_level] || certLevelColors.bronze}`}>
                        {certLevelIcons[guide.certification_level]} {guide.certification_level}
                      </span>
                    </div>
                    {guide.is_available ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-medium">
                        Available Now
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-body font-medium">
                        Fully Booked
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">{guide.name}</h3>
                        <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {guide.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-secondary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-body font-semibold">{Number(guide.rating).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({guide.review_count})</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{guide.bio}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {guide.specializations.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-body text-muted-foreground">
                          {s}
                        </span>
                      ))}
                      {guide.specializations.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-body text-muted-foreground">
                          +{guide.specializations.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-4">
                      <span className="flex items-center gap-1">
                        <Languages className="h-3 w-3" /> {guide.languages.length} languages
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" /> {guide.years_experience} years
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {formatResponseTime(guide.response_time_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-display font-bold text-foreground">
                        ${guide.price_per_day}
                        <span className="text-xs font-body font-normal text-muted-foreground"> / day</span>
                      </span>
                      <Button size="sm" className="rounded-full text-xs">
                        <Calendar className="h-3 w-3 mr-1" /> View Profile
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guide Detail Modal */}
      <AnimatePresence>
        {selectedGuide && selectedGuideData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-4 px-4 bg-foreground/50 overflow-y-auto"
            onClick={() => setSelectedGuide(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="relative">
                <img
                  src={selectedGuideData.photo_url || ""}
                  alt={selectedGuideData.name}
                  className="w-full h-56 object-cover"
                />
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="absolute top-4 right-4 bg-foreground/60 text-primary-foreground rounded-full p-1.5"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-primary-foreground">{selectedGuideData.name}</h2>
                      <p className="text-primary-foreground/80 text-sm font-body flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {selectedGuideData.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-primary-foreground/20 backdrop-blur px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-primary-foreground font-body font-semibold text-sm">
                          {Number(selectedGuideData.rating).toFixed(1)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-body font-medium border ${certLevelColors[selectedGuideData.certification_level]}`}>
                        {certLevelIcons[selectedGuideData.certification_level]} {selectedGuideData.certification_level} guide
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {(["about", "reviews", "availability", "book"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-body font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5 max-h-[50vh] overflow-y-auto">
                {activeTab === "about" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-body text-foreground/90 leading-relaxed">{selectedGuideData.bio}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-display font-bold text-foreground">{selectedGuideData.years_experience}</div>
                        <div className="text-[10px] text-muted-foreground font-body">Years Experience</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-display font-bold text-foreground">{selectedGuideData.review_count}</div>
                        <div className="text-[10px] text-muted-foreground font-body">Reviews</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-display font-bold text-foreground">{selectedGuideData.total_bookings}</div>
                        <div className="text-[10px] text-muted-foreground font-body">Trips Led</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-display font-bold text-foreground flex items-center justify-center gap-1">
                          <Zap className="h-3 w-3 text-secondary" /> {formatResponseTime(selectedGuideData.response_time_minutes)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-body">Response Time</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-sm text-foreground mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedGuideData.specializations.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-body">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-sm text-foreground mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedGuideData.languages.map((l) => (
                          <Badge key={l} className="bg-secondary/15 text-secondary-foreground border-secondary/25 text-xs font-body">{l}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-sm text-foreground mb-2">Certifications</h4>
                      <div className="space-y-1.5">
                        {selectedGuideData.certifications.map((c) => (
                          <div key={c} className="flex items-center gap-2 text-sm font-body text-foreground/80">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="font-display text-2xl font-bold text-foreground">${selectedGuideData.price_per_day}</span>
                        <span className="text-sm text-muted-foreground font-body"> / day</span>
                        <p className="text-[10px] text-muted-foreground font-body">Price set by guide</p>
                      </div>
                      <Button onClick={() => setActiveTab("book")} className="rounded-full">
                        <Calendar className="h-4 w-4 mr-2" /> Book Now
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {guideReviews.length === 0 ? (
                      <p className="text-sm text-muted-foreground font-body text-center py-8">No reviews yet.</p>
                    ) : (
                      guideReviews.map((review) => (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < review.rating ? "text-secondary fill-current" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-body">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-display font-semibold text-sm text-foreground">{review.title}</h4>
                          )}
                          <p className="text-sm text-foreground/80 font-body mt-1">{review.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "availability" && (
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground mb-3">Upcoming Availability</h4>
                    {guideAvailability.length === 0 ? (
                      <p className="text-sm text-muted-foreground font-body text-center py-8">
                        No availability posted yet. Contact the guide directly.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {guideAvailability.map((day) => (
                          <div
                            key={day.date}
                            className={`rounded-lg p-3 text-center border ${
                              day.is_available
                                ? "bg-primary/10 border-primary/25 text-primary"
                                : "bg-muted border-border text-muted-foreground line-through"
                            }`}
                          >
                            <div className="text-xs font-body font-medium">
                              {new Date(day.date + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}
                            </div>
                            <div className="text-sm font-display font-semibold">
                              {new Date(day.date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-[10px] mt-0.5">
                              {day.is_available ? "✓ Open" : "✕ Booked"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "book" && (
                  <div className="space-y-4">
                    {!user ? (
                      <div className="text-center py-8">
                        <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground font-body mb-3">Sign in to book this guide</p>
                        <Button asChild className="rounded-full">
                          <a href="/auth">Sign In</a>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted/50 rounded-lg p-4 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display font-semibold text-foreground">{selectedGuideData.name}</span>
                            <span className="font-display font-bold text-foreground">${selectedGuideData.price_per_day}/day</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-body">Price set by guide · No platform fees</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-body font-medium text-foreground mb-1 block">Start Date</label>
                            <input
                              type="date"
                              value={bookingForm.startDate}
                              onChange={(e) => setBookingForm((p) => ({ ...p, startDate: e.target.value }))}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-body font-medium text-foreground mb-1 block">End Date</label>
                            <input
                              type="date"
                              value={bookingForm.endDate}
                              onChange={(e) => setBookingForm((p) => ({ ...p, endDate: e.target.value }))}
                              min={bookingForm.startDate || new Date().toISOString().split("T")[0]}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-body font-medium text-foreground mb-1 block">Group Size</label>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBookingForm((p) => ({ ...p, groupSize: Math.max(1, p.groupSize - 1) }))}
                            >
                              -
                            </Button>
                            <span className="font-display font-bold text-foreground w-8 text-center">{bookingForm.groupSize}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBookingForm((p) => ({ ...p, groupSize: Math.min(20, p.groupSize + 1) }))}
                            >
                              +
                            </Button>
                            <span className="text-xs text-muted-foreground font-body">people</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-body font-medium text-foreground mb-1 block">Message to Guide (optional)</label>
                          <textarea
                            value={bookingForm.message}
                            onChange={(e) => setBookingForm((p) => ({ ...p, message: e.target.value }))}
                            placeholder="Tell the guide about your interests, experience level, or special requests..."
                            rows={3}
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground resize-none"
                          />
                        </div>

                        {bookingForm.startDate && bookingForm.endDate && (
                          <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/25">
                            <div className="flex justify-between text-sm font-body">
                              <span className="text-foreground">
                                ${selectedGuideData.price_per_day} ×{" "}
                                {Math.max(1, Math.ceil((new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 86400000) + 1)} days
                              </span>
                              <span className="font-display font-bold text-foreground">
                                ${(selectedGuideData.price_per_day || 0) * Math.max(1, Math.ceil((new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 86400000) + 1)}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-body mt-1">Payment handled directly with guide</p>
                          </div>
                        )}

                        <Button
                          className="w-full rounded-full"
                          onClick={submitBooking}
                          disabled={bookingLoading || !bookingForm.startDate || !bookingForm.endDate}
                        >
                          {bookingLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send Booking Request
                        </Button>

                        <p className="text-[10px] text-center text-muted-foreground font-body">
                          Expected response: {formatResponseTime(selectedGuideData.response_time_minutes)}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection />
    </div>
  );
};

export default GuidesPage;
