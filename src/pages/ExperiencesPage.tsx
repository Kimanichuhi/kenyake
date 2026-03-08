import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Star, Search, Users, MapPin, Calendar, ChevronRight, X,
  Utensils, Trees, Mountain, Camera, Heart, Tent, HandHelping,
  Music, Telescope, Briefcase, Check, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Experience {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  short_description: string | null;
  host_name: string;
  host_bio: string | null;
  location_name: string | null;
  county: string | null;
  duration_minutes: number | null;
  price_amount: number;
  price_display: string | null;
  max_guests: number | null;
  min_guests: number | null;
  rating: number | null;
  review_count: number | null;
  cover_image: string | null;
  what_to_bring: string | null;
  what_to_wear: string | null;
  skill_level: string | null;
  languages: string[] | null;
  includes: string[] | null;
  is_featured: boolean | null;
  available_days: string[] | null;
  start_times: string[] | null;
}

const categories = [
  { key: "all", label: "All Experiences", icon: Briefcase },
  { key: "cultural", label: "Cultural", icon: Music },
  { key: "food", label: "Food & Farm", icon: Utensils },
  { key: "nature", label: "Nature & Wildlife", icon: Trees },
  { key: "adventure", label: "Adventure", icon: Mountain },
  { key: "homestay", label: "Homestays", icon: Tent },
  { key: "community", label: "Community", icon: Heart },
  { key: "photography", label: "Photography", icon: Camera },
  { key: "volunteer", label: "Volunteer", icon: HandHelping },
];

const formatDuration = (mins: number | null) => {
  if (!mins) return "";
  if (mins >= 1440) return `${Math.round(mins / 1440)} day${mins >= 2880 ? "s" : ""}`;
  if (mins >= 60) return `${Math.round(mins / 60)}h`;
  return `${mins}min`;
};

const skillColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  challenging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExperiences = async () => {
      const { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });
      if (data) setExperiences(data as Experience[]);
      setLoading(false);
    };
    fetchExperiences();
  }, []);

  const filtered = experiences.filter((e) => {
    const matchCat = selectedCategory === "all" || e.category === selectedCategory;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.host_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.location_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.county || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleBook = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book an experience.", variant: "destructive" });
      return;
    }
    if (!selectedExp || !bookingDate) return;
    setSubmitting(true);
    const { error } = await supabase.from("experience_bookings").insert({
      experience_id: selectedExp.id,
      user_id: user.id,
      booking_date: bookingDate,
      start_time: bookingTime || (selectedExp.start_times?.[0] ?? "09:00"),
      guest_count: guestCount,
      total_price: selectedExp.price_amount * guestCount,
      special_requests: specialRequests || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking submitted! ✨", description: `Your ${selectedExp.title} booking is pending confirmation.` });
      setShowBooking(false);
      setSelectedExp(null);
      setBookingDate("");
      setBookingTime("");
      setGuestCount(1);
      setSpecialRequests("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Book Authentic Experiences</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
              Immerse in Kenyan Culture
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Community-hosted experiences across Kenya — beadwork workshops, forest walks, cooking classes, homestays, and more. Every booking supports local families directly.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search by name, host, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                    selectedCategory === cat.key
                      ? "gradient-sunset text-primary-foreground shadow-md"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} experience{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedExp(exp)}
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-muted">
                      {exp.cover_image ? (
                        <img src={exp.cover_image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {categories.find(c => c.key === exp.category)?.icon &&
                            (() => { const Icon = categories.find(c => c.key === exp.category)!.icon; return <Icon className="h-12 w-12 text-muted-foreground/30" />; })()
                          }
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="gradient-safari text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full capitalize">{exp.category}</span>
                        {exp.is_featured && <span className="gradient-sunset text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">⭐ Featured</span>}
                      </div>
                      {exp.skill_level && (
                        <div className="absolute bottom-3 right-3">
                          <span className={`text-xs font-body font-medium px-2 py-1 rounded-full ${skillColors[exp.skill_level] || ""}`}>
                            {exp.skill_level}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-safari-green transition-colors">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground font-body mb-1">Hosted by {exp.host_name}</p>
                      {exp.location_name && (
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3" /> {exp.location_name}{exp.county ? `, ${exp.county}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{exp.short_description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {exp.duration_minutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                              <Clock className="h-3 w-3" />{formatDuration(exp.duration_minutes)}
                            </span>
                          )}
                          {(exp.rating ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-savannah-gold text-xs font-body">
                              <Star className="h-3 w-3 fill-current" />{Number(exp.rating).toFixed(1)}
                              <span className="text-muted-foreground">({exp.review_count})</span>
                            </span>
                          )}
                          {exp.max_guests && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                              <Users className="h-3 w-3" />Max {exp.max_guests}
                            </span>
                          )}
                        </div>
                        <span className="font-body font-bold text-foreground">{exp.price_display}<span className="text-xs font-normal text-muted-foreground">/person</span></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground font-body">No experiences found. Try a different search or category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={!!selectedExp && !showBooking} onOpenChange={(o) => !o && setSelectedExp(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedExp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="capitalize">{selectedExp.category}</Badge>
                  {selectedExp.skill_level && <Badge variant="outline">{selectedExp.skill_level}</Badge>}
                </div>
                <DialogTitle className="font-display text-2xl">{selectedExp.title}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">
                  Hosted by <strong>{selectedExp.host_name}</strong>
                  {selectedExp.location_name && <> · <MapPin className="inline h-3 w-3" /> {selectedExp.location_name}</>}
                </p>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm font-body">
                  {selectedExp.duration_minutes && (
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" />{formatDuration(selectedExp.duration_minutes)}</div>
                  )}
                  {(selectedExp.rating ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-savannah-gold"><Star className="h-4 w-4 fill-current" />{Number(selectedExp.rating).toFixed(1)} ({selectedExp.review_count} reviews)</div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-4 w-4" />{selectedExp.min_guests}–{selectedExp.max_guests} guests</div>
                  <div className="font-bold text-foreground">{selectedExp.price_display}/person</div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">About This Experience</h4>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{selectedExp.description}</p>
                </div>

                {/* Host */}
                {selectedExp.host_bio && (
                  <div>
                    <h4 className="font-display font-semibold text-foreground mb-1">About Your Host</h4>
                    <p className="text-sm text-muted-foreground font-body">{selectedExp.host_bio}</p>
                  </div>
                )}

                {/* What's included */}
                {selectedExp.includes && selectedExp.includes.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-foreground mb-2">What's Included</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedExp.includes.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                          <Check className="h-4 w-4 text-safari-green shrink-0" /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedExp.what_to_bring && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h5 className="font-body font-semibold text-foreground text-sm mb-1">🎒 What to Bring</h5>
                      <p className="text-xs text-muted-foreground font-body">{selectedExp.what_to_bring}</p>
                    </div>
                  )}
                  {selectedExp.what_to_wear && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h5 className="font-body font-semibold text-foreground text-sm mb-1">👕 What to Wear</h5>
                      <p className="text-xs text-muted-foreground font-body">{selectedExp.what_to_wear}</p>
                    </div>
                  )}
                </div>

                {/* Available days */}
                {selectedExp.available_days && selectedExp.available_days.length > 0 && (
                  <div>
                    <h5 className="font-body font-semibold text-foreground text-sm mb-2">📅 Available Days</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedExp.available_days.map((day) => (
                        <Badge key={day} variant="outline" className="text-xs">{day}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedExp.languages && selectedExp.languages.length > 0 && (
                  <p className="text-xs text-muted-foreground font-body">🗣️ Languages: {selectedExp.languages.join(", ")}</p>
                )}

                {/* CTA */}
                <Button
                  className="w-full gradient-sunset text-primary-foreground font-body font-semibold text-base py-6"
                  onClick={() => setShowBooking(true)}
                >
                  Book This Experience — {selectedExp.price_display}/person
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={showBooking} onOpenChange={(o) => { if (!o) setShowBooking(false); }}>
        <DialogContent className="max-w-md">
          {selectedExp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Book: {selectedExp.title}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">{selectedExp.price_display}/person · {formatDuration(selectedExp.duration_minutes)}</p>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label className="font-body">Date *</Label>
                  <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                </div>

                {selectedExp.start_times && selectedExp.start_times.length > 0 && (
                  <div>
                    <Label className="font-body">Start Time</Label>
                    <div className="flex gap-2 mt-1">
                      {selectedExp.start_times.map((t) => (
                        <button
                          key={t}
                          onClick={() => setBookingTime(t)}
                          className={`px-4 py-2 rounded-lg text-sm font-body border transition-colors ${
                            bookingTime === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="font-body">Number of Guests</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Button variant="outline" size="sm" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>−</Button>
                    <span className="font-body font-semibold text-foreground w-8 text-center">{guestCount}</span>
                    <Button variant="outline" size="sm" onClick={() => setGuestCount(Math.min(selectedExp.max_guests || 10, guestCount + 1))}>+</Button>
                    <span className="text-xs text-muted-foreground font-body">max {selectedExp.max_guests}</span>
                  </div>
                </div>

                <div>
                  <Label className="font-body">Special Requests (optional)</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Dietary needs, accessibility requirements, questions..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Price summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">{selectedExp.price_display} × {guestCount} guest{guestCount > 1 ? "s" : ""}</span>
                    <span className="text-foreground">${selectedExp.price_amount * guestCount}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-body font-bold">
                    <span>Total</span>
                    <span className="text-foreground">${selectedExp.price_amount * guestCount}</span>
                  </div>
                </div>

                <Button
                  className="w-full gradient-sunset text-primary-foreground font-body font-semibold py-5"
                  disabled={!bookingDate || submitting}
                  onClick={handleBook}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </Button>

                <p className="text-xs text-muted-foreground font-body text-center">
                  You won't be charged yet. The host will confirm your booking.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default ExperiencesPage;
