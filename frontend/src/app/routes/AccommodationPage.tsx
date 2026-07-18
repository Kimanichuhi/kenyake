import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Star, MapPin, Users, Wifi, Droplets, Zap, Sun, Leaf, ChevronRight,
  Loader2, Check, Bed, Shield, Filter, ArrowUpDown, Heart, Calendar, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookingFlow } from "@/domains/bookings/components/BookingFlow/BookingFlow";

interface Accommodation {
  id: string;
  name: string;
  slug: string;
  property_type: string;
  tier: string;
  description: string | null;
  short_description: string | null;
  is_community_owned: boolean | null;
  owner_name: string | null;
  location_name: string | null;
  county: string | null;
  price_per_night: number;
  price_display: string | null;
  max_guests: number | null;
  rooms_available: number | null;
  rating: number | null;
  review_count: number | null;
  cover_image: string | null;
  amenities: string[] | null;
  accessibility_features: string[] | null;
  wifi_speed_mbps: number | null;
  has_hot_water: boolean | null;
  has_generator: boolean | null;
  has_solar: boolean | null;
  impact_score: number | null;
  local_employment_count: number | null;
  local_procurement_percent: number | null;
  nearby_activities: string[] | null;
  group_capacity: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy: string | null;
  is_featured: boolean | null;
}

const tiers = [
  { key: "all", label: "All" },
  { key: "budget", label: "Budget" },
  { key: "mid-range", label: "Mid-Range" },
  { key: "luxury", label: "Luxury" },
];

const propertyTypes = [
  { key: "all", label: "All Types" },
  { key: "banda", label: "Bandas" },
  { key: "hostel", label: "Hostels" },
  { key: "guesthouse", label: "Guesthouses" },
  { key: "cottage", label: "Cottages" },
  { key: "lodge", label: "Lodges" },
  { key: "tented-camp", label: "Tented Camps" },
  { key: "luxury-camp", label: "Luxury Camps" },
  { key: "treehouse", label: "Treehouses" },
  { key: "eco-lodge", label: "Eco-Lodges" },
  { key: "resort", label: "Resorts" },
];

type SortKey = "impact" | "price-low" | "price-high" | "rating";

const tierColors: Record<string, string> = {
  budget: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "mid-range": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  luxury: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const AccommodationPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("impact");
  const [groupSize, setGroupSize] = useState<number | null>(null);
  const [selected, setSelected] = useState<Accommodation | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("accommodations").select("*").eq("is_published", true);
      if (data) setAccommodations(data as Accommodation[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = accommodations
    .filter((a) => {
      const matchTier = selectedTier === "all" || a.tier === selectedTier;
      const matchType = selectedType === "all" || a.property_type === selectedType;
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.location_name || "").toLowerCase().includes(search.toLowerCase()) || (a.county || "").toLowerCase().includes(search.toLowerCase());
      const matchGroup = !groupSize || (a.group_capacity || 0) >= groupSize;
      return matchTier && matchType && matchSearch && matchGroup;
    })
    .sort((a, b) => {
      if (sortBy === "impact") {
        // Community-owned first, then by impact score
        if (a.is_community_owned !== b.is_community_owned) return a.is_community_owned ? -1 : 1;
        return (b.impact_score || 0) - (a.impact_score || 0);
      }
      if (sortBy === "price-low") return a.price_per_night - b.price_per_night;
      if (sortBy === "price-high") return b.price_per_night - a.price_per_night;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Stay Local, Stay Authentic</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Accommodation Directory</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Community guesthouses, eco-lodges, luxury camps, and everything in between. Community-owned properties are prioritized — your stay directly supports local livelihoods.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search by name, location, county..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {tiers.map((t) => (
              <button key={t.key} onClick={() => setSelectedTier(t.key)} className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${selectedTier === t.key ? "gradient-sunset text-primary-foreground shadow-md" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {propertyTypes.map((t) => (
              <button key={t.key} onClick={() => setSelectedType(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedType === t.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort + Group filter */}
          <div className="flex flex-wrap justify-center gap-3 items-center">
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
              {(["impact", "rating", "price-low", "price-high"] as SortKey[]).map((s) => (
                <button key={s} onClick={() => setSortBy(s)} className={`px-2 py-1 rounded text-xs transition-colors ${sortBy === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {s === "impact" ? "🌍 Impact" : s === "rating" ? "⭐ Rating" : s === "price-low" ? "💰 Price ↑" : "💰 Price ↓"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Group:
              <input type="number" min={1} max={100} placeholder="Any" value={groupSize || ""} onChange={(e) => setGroupSize(e.target.value ? parseInt(e.target.value) : null)} className="w-16 px-2 py-1 rounded border border-border bg-card text-foreground text-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((acc, i) => (
                  <motion.div key={acc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setSelected(acc)}>
                    {/* Image area */}
                    <div className="relative h-52 bg-muted flex items-center justify-center">
                      {acc.cover_image ? (
                        <img src={acc.cover_image} alt={acc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <Bed className="h-12 w-12 text-muted-foreground/30" />
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`text-xs ${tierColors[acc.tier] || ""}`}>{acc.tier}</Badge>
                        {acc.is_community_owned && <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">🏘️ Community-Owned</Badge>}
                      </div>
                      {acc.is_featured && <span className="absolute top-3 right-3 gradient-sunset text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">⭐ Featured</span>}
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-safari-green transition-colors">{acc.name}</h3>
                      <p className="text-xs text-muted-foreground font-body capitalize mb-1">{acc.property_type.replace("-", " ")} · {acc.owner_name}</p>
                      {acc.location_name && <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" />{acc.location_name}{acc.county ? `, ${acc.county}` : ""}</p>}
                      <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{acc.short_description}</p>

                      {/* Verified amenities icons */}
                      <div className="flex gap-2 mb-3">
                        {acc.wifi_speed_mbps && <span title={`WiFi ${acc.wifi_speed_mbps}Mbps`} className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Wifi className="h-3.5 w-3.5 text-muted-foreground" /></span>}
                        {acc.has_hot_water && <span title="Hot Water" className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Droplets className="h-3.5 w-3.5 text-muted-foreground" /></span>}
                        {acc.has_generator && <span title="Generator" className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-muted-foreground" /></span>}
                        {acc.has_solar && <span title="Solar Power" className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Sun className="h-3.5 w-3.5 text-muted-foreground" /></span>}
                      </div>

                      {/* Impact + rating + price row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {(acc.impact_score || 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs font-body text-safari-green" title="Community Impact Score">
                              <Leaf className="h-3.5 w-3.5" />{acc.impact_score}%
                            </span>
                          )}
                          {(acc.rating ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-savannah-gold text-xs font-body">
                              <Star className="h-3 w-3 fill-current" />{Number(acc.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <span className="font-body font-bold text-foreground">{acc.price_display}<span className="text-xs font-normal text-muted-foreground">/night</span></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && <div className="text-center py-20"><p className="text-muted-foreground font-body">No accommodations match your filters.</p></div>}
            </>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={!!selected && !showBooking} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${tierColors[selected.tier]}`}>{selected.tier}</Badge>
                  <Badge variant="outline" className="capitalize">{selected.property_type.replace("-", " ")}</Badge>
                  {selected.is_community_owned && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">🏘️ Community-Owned</Badge>}
                </div>
                <DialogTitle className="font-display text-2xl">{selected.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">
                  {selected.owner_name}{selected.location_name && <> · <MapPin className="inline h-3 w-3" /> {selected.location_name}</>}
                </p>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm font-body">
                  {(selected.rating ?? 0) > 0 && <span className="flex items-center gap-1 text-savannah-gold"><Star className="h-4 w-4 fill-current" />{Number(selected.rating).toFixed(1)} ({selected.review_count} reviews)</span>}
                  <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" />Up to {selected.max_guests} guests</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Bed className="h-4 w-4" />{selected.rooms_available} rooms</span>
                  <span className="font-bold text-foreground">{selected.price_display}/night</span>
                </div>

                {/* Impact Score */}
                {(selected.impact_score || 0) > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
                    <h4 className="font-body font-semibold text-foreground text-sm mb-2 flex items-center gap-2"><Leaf className="h-4 w-4 text-safari-green" /> Community Impact Score: {selected.impact_score}%</h4>
                    <Progress value={selected.impact_score || 0} className="h-2 mb-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs font-body text-muted-foreground">
                      <span>👷 Local staff: {selected.local_employment_count}</span>
                      <span>🛒 Local procurement: {selected.local_procurement_percent}%</span>
                    </div>
                  </div>
                )}

                <div><h4 className="font-display font-semibold text-foreground mb-1">About</h4><p className="text-sm text-muted-foreground font-body leading-relaxed">{selected.description}</p></div>

                {/* Verified Amenities */}
                {selected.amenities && selected.amenities.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-foreground mb-2">Verified Amenities</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {selected.amenities.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-body text-muted-foreground"><Check className="h-4 w-4 text-safari-green shrink-0" />{a}</div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-3 text-xs font-body text-muted-foreground">
                      {selected.wifi_speed_mbps && <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> {selected.wifi_speed_mbps} Mbps WiFi</span>}
                      {selected.has_hot_water && <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> Hot Water</span>}
                      {selected.has_generator && <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Generator</span>}
                      {selected.has_solar && <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Solar Power</span>}
                    </div>
                  </div>
                )}

                {/* Accessibility */}
                {selected.accessibility_features && selected.accessibility_features.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> Accessibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.accessibility_features.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Nearby Activities */}
                {selected.nearby_activities && selected.nearby_activities.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-foreground mb-2">Nearby Activities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.nearby_activities.map((a, i) => <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Practical */}
                <div className="grid grid-cols-2 gap-4 text-sm font-body">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="font-semibold text-foreground">{selected.check_in_time}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="font-semibold text-foreground">{selected.check_out_time}</p>
                  </div>
                </div>
                {selected.cancellation_policy && <p className="text-xs text-muted-foreground font-body">📋 {selected.cancellation_policy}</p>}
                <p className="text-xs text-muted-foreground font-body">👥 Group capacity: up to {selected.group_capacity} guests</p>

                <Button className="w-full gradient-sunset text-primary-foreground font-body font-semibold text-base py-6" onClick={() => setShowBooking(true)}>
                  Book — {selected.price_display}/night <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={showBooking} onOpenChange={(o) => { if (!o) setShowBooking(false); }}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Book: {selected.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">{selected.price_display}/night · {selected.property_type.replace("-", " ")}</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {!user ? (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground font-body mb-3">Sign in to book this stay</p>
                    <Button asChild className="rounded-full">
                      <a href="/auth">Sign In</a>
                    </Button>
                  </div>
                ) : (
                  <BookingFlow
                    resourceType="accommodation"
                    resource={selected}
                    onComplete={() => { setShowBooking(false); setSelected(null); }}
                  />
                )}
                <p className="text-xs text-muted-foreground font-body text-center">{selected.cancellation_policy}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default AccommodationPage;
