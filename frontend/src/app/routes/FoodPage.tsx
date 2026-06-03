import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, MapPin, Utensils, Leaf, Shield, ChefHat, Home, Store,
  Flame, Heart, Clock, Users, Phone, X, MessageSquare, ThumbsUp, Send,
  Filter, Vegan, Wheat
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const listingTypes = [
  { key: "all", label: "All", icon: Utensils },
  { key: "restaurant", label: "Restaurants", icon: Utensils },
  { key: "home-dining", label: "Home Dining", icon: Home },
  { key: "community-kitchen", label: "Community Kitchen", icon: ChefHat },
  { key: "market", label: "Markets", icon: Store },
  { key: "farm-to-table", label: "Farm-to-Table", icon: Leaf },
];

const dietaryFilters = ["All", "Vegetarian", "Vegan", "Halal", "Kosher Options", "Gluten-Free", "Seafood", "Pescatarian"];
const regionFilters = ["All", "Central", "Coast", "Central Highlands", "Mara", "Northern"];
const priceFilters = ["All", "$", "$$", "$$$"];

const safetyColor = (rating: number) => {
  if (rating >= 5) return "text-safari-green";
  if (rating >= 4) return "text-savannah-gold";
  if (rating >= 3) return "text-sunset-orange";
  return "text-destructive";
};

const typeColor = (type: string) => {
  switch (type) {
    case "restaurant": return "bg-primary text-primary-foreground";
    case "home-dining": return "bg-safari-green text-primary-foreground";
    case "community-kitchen": return "bg-sunset-orange text-primary-foreground";
    case "market": return "bg-savannah-gold text-primary-foreground";
    case "farm-to-table": return "bg-earth-brown text-primary-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const FoodPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDietary, setSelectedDietary] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [recForm, setRecForm] = useState({ title: "", body: "", rating: 5, dish_recommended: "" });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["food-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_listings")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recommendations = [], refetch: refetchRecs } = useQuery({
    queryKey: ["food-recommendations", selectedListing?.id],
    queryFn: async () => {
      if (!selectedListing) return [];
      const { data, error } = await supabase
        .from("food_recommendations")
        .select("*")
        .eq("listing_id", selectedListing.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedListing,
  });

  const filtered = listings.filter((l: any) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.county || "").toLowerCase().includes(search.toLowerCase()) || (l.specialties || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    const matchType = selectedType === "all" || l.listing_type === selectedType;
    const matchDietary = selectedDietary === "All" || (l.dietary_options || []).some((d: string) => d.toLowerCase().includes(selectedDietary.toLowerCase()));
    const matchRegion = selectedRegion === "All" || l.region === selectedRegion;
    const matchPrice = selectedPrice === "All" || l.price_range === selectedPrice;
    return matchSearch && matchType && matchDietary && matchRegion && matchPrice;
  });

  const handleSubmitRecommendation = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to share recommendations.", variant: "destructive" });
      return;
    }
    if (!recForm.body.trim()) return;
    const { error } = await supabase.from("food_recommendations").insert({
      listing_id: selectedListing.id,
      user_id: user.id,
      title: recForm.title,
      body: recForm.body,
      rating: recForm.rating,
      dish_recommended: recForm.dish_recommended,
    });
    if (error) {
      toast({ title: "Error", description: "Could not submit recommendation.", variant: "destructive" });
    } else {
      toast({ title: "Asante! 🙏", description: "Your recommendation has been shared." });
      setRecForm({ title: "", body: "", rating: 5, dish_recommended: "" });
      setShowRecommendForm(false);
      refetchRecs();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-sunset-orange">Taste Kenya</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Food & Dining Guide</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              From legendary nyama choma joints to Swahili home kitchens — discover authentic Kenyan food. Filter by dietary needs, explore community kitchens, and share your own recommendations.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-3 glass-card px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search restaurants, dishes, or locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {listingTypes.map((t) => (
              <button key={t.key} onClick={() => setSelectedType(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all flex items-center gap-1.5 ${selectedType === t.key ? "gradient-sunset text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                <t.icon className="h-3 w-3" />{t.label}
              </button>
            ))}
          </div>

          {/* Dietary + Region + Price */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {dietaryFilters.map((d) => (
                <button key={d} onClick={() => setSelectedDietary(d)} className={`px-2.5 py-1 rounded-full text-xs font-body font-medium transition-all ${selectedDietary === d ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  <Leaf className="h-3 w-3 inline mr-0.5" />{d}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {regionFilters.map((r) => (
                <button key={r} onClick={() => setSelectedRegion(r)} className={`px-2.5 py-1 rounded-full text-xs font-body font-medium transition-all ${selectedRegion === r ? "bg-earth-brown text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  <MapPin className="h-3 w-3 inline mr-0.5" />{r === "All" ? "Any Region" : r}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {priceFilters.map((p) => (
                <button key={p} onClick={() => setSelectedPrice(p)} className={`px-2.5 py-1 rounded-full text-xs font-body font-medium transition-all ${selectedPrice === p ? "bg-savannah-gold text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  {p === "All" ? "Any Price" : p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground font-body mb-6">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-80 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing: any, i: number) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => setSelectedListing(listing)} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow group cursor-pointer">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {listing.cover_image ? (
                      <img src={listing.cover_image} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-body font-medium capitalize ${typeColor(listing.listing_type)}`}>
                        {listing.listing_type.replace("-", " ")}
                      </span>
                      {listing.is_farm_to_table && (
                        <span className="px-2 py-1 rounded-full text-xs font-body font-medium bg-safari-green text-primary-foreground">🌱 Farm-to-Table</span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="glass-card px-2 py-1 rounded-full text-foreground font-body font-bold text-sm">{listing.price_range}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.county}{listing.region ? ` · ${listing.region}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 text-savannah-gold">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-body font-semibold">{Number(listing.rating).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">{listing.short_description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {(listing.cuisine || []).slice(0, 3).map((c: string) => (
                        <span key={c} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{c}</span>
                      ))}
                    </div>

                    {listing.host_name && (
                      <p className="text-xs font-body text-foreground mb-2 flex items-center gap-1">
                        <ChefHat className="h-3 w-3 text-sunset-orange" /> Hosted by {listing.host_name}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        {(listing.dietary_options || []).slice(0, 2).map((d: string) => (
                          <span key={d} className="text-xs text-muted-foreground font-body"><Leaf className="h-3 w-3 inline text-safari-green" /> {d}</span>
                        ))}
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-body ${safetyColor(listing.safety_rating)}`}>
                        <Shield className="h-3 w-3" />
                        <span>{listing.safety_rating}/5</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Traditional Dish Guide */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">Traditional Dish Guide</h2>
          <p className="text-muted-foreground font-body text-center mb-8 max-w-xl mx-auto">Must-try dishes by region — explore Kenya's culinary heritage.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { region: "Central Highlands", dishes: ["Irio (mashed peas & potatoes)", "Mukimo (greens mash)", "Githeri (beans & maize)", "Njahi (black beans)"], community: "Kikuyu" },
              { region: "Coast", dishes: ["Pilau (spiced rice)", "Biryani", "Wali wa Nazi (coconut rice)", "Mahamri (sweet bread)", "Pweza wa Nazi (octopus in coconut)"], community: "Swahili / Mijikenda" },
              { region: "Western", dishes: ["Ugali na Samaki (fish & ugali)", "Omena (silver fish)", "Ingokho (chicken stew)", "Obusuma (millet ugali)"], community: "Luo / Luhya" },
              { region: "Rift Valley", dishes: ["Nyama Choma (roast meat)", "Mursik (fermented milk)", "Olpurda (meat soup)", "Roast Goat"], community: "Maasai / Kalenjin" },
              { region: "Northern", dishes: ["Nyirinyiri (dried meat)", "Camel Milk", "Bush Herbs Tea", "Goat Soup"], community: "Samburu / Turkana" },
              { region: "Nairobi", dishes: ["Mutura (Kenyan sausage)", "Smokie Pasua", "Chapati", "Samosa", "Mandazi"], community: "Multi-ethnic Street Food" },
            ].map((r) => (
              <div key={r.region} className="glass-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{r.region}</h3>
                <p className="text-xs text-muted-foreground font-body mb-3">{r.community}</p>
                <ul className="space-y-1.5">
                  {r.dishes.map((d) => (
                    <li key={d} className="text-sm font-body text-foreground flex items-center gap-2">
                      <Flame className="h-3 w-3 text-sunset-orange shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setSelectedListing(null); setShowRecommendForm(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-body font-medium capitalize ${typeColor(selectedListing.listing_type)}`}>
                      {selectedListing.listing_type.replace("-", " ")}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-foreground mt-2">{selectedListing.name}</h2>
                    <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />{selectedListing.location_name || selectedListing.county}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedListing(null); setShowRecommendForm(false); }} className="p-2 hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1 text-savannah-gold"><Star className="h-4 w-4 fill-current" /><span className="text-sm font-body font-semibold">{Number(selectedListing.rating).toFixed(1)}</span><span className="text-xs text-muted-foreground">({selectedListing.review_count})</span></div>
                  <div className={`flex items-center gap-1 text-sm font-body ${safetyColor(selectedListing.safety_rating)}`}><Shield className="h-4 w-4" />Safety: {selectedListing.safety_rating}/5</div>
                  <span className="text-sm font-body font-bold text-foreground">{selectedListing.price_range}</span>
                  {selectedListing.price_per_person && <span className="text-sm font-body text-muted-foreground">~KES {selectedListing.price_per_person}/person</span>}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedListing.is_farm_to_table && <span className="px-2 py-1 rounded-full text-xs font-body bg-safari-green/20 text-safari-green font-medium">🌱 Farm-to-Table</span>}
                  {selectedListing.is_home_dining && <span className="px-2 py-1 rounded-full text-xs font-body bg-sunset-orange/20 text-sunset-orange font-medium">🏠 Home Dining</span>}
                  {selectedListing.is_community_kitchen && <span className="px-2 py-1 rounded-full text-xs font-body bg-primary/20 text-primary font-medium">👥 Community Kitchen</span>}
                </div>

                <p className="text-sm font-body text-muted-foreground mb-4">{selectedListing.description}</p>

                {/* Host */}
                {selectedListing.host_name && (
                  <div className="glass-card p-4 mb-4">
                    <h4 className="font-display text-sm font-semibold text-foreground mb-1 flex items-center gap-2"><ChefHat className="h-4 w-4 text-sunset-orange" />Your Host: {selectedListing.host_name}</h4>
                    <p className="text-xs font-body text-muted-foreground">{selectedListing.host_bio}</p>
                  </div>
                )}

                {/* Specialties & Traditional Dishes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {(selectedListing.specialties || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-body font-semibold text-foreground mb-2 flex items-center gap-1"><Utensils className="h-3 w-3 text-sunset-orange" />Specialties</h4>
                      <div className="flex flex-wrap gap-1">{selectedListing.specialties.map((s: string) => <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body">{s}</span>)}</div>
                    </div>
                  )}
                  {(selectedListing.traditional_dishes || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-body font-semibold text-foreground mb-2 flex items-center gap-1"><Flame className="h-3 w-3 text-sunset-orange" />Traditional Dishes</h4>
                      <div className="flex flex-wrap gap-1">{selectedListing.traditional_dishes.map((d: string) => <span key={d} className="px-2 py-0.5 rounded-full bg-sunset-orange/10 text-xs font-body text-sunset-orange">{d}</span>)}</div>
                    </div>
                  )}
                </div>

                {/* Dietary & Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-body">
                  <div>
                    <span className="font-semibold text-foreground">Dietary Options</span>
                    <div className="flex flex-wrap gap-1 mt-1">{(selectedListing.dietary_options || []).map((d: string) => <span key={d} className="px-2 py-0.5 rounded-full bg-safari-green/10 text-safari-green">{d}</span>)}</div>
                  </div>
                  <div className="space-y-1.5 text-muted-foreground">
                    {selectedListing.opening_hours && <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedListing.opening_hours}</p>}
                    {selectedListing.max_guests && <p className="flex items-center gap-1"><Users className="h-3 w-3" />Max {selectedListing.max_guests} guests</p>}
                    {selectedListing.contact_phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedListing.contact_phone}</p>}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4" />Traveler Recommendations</h4>
                    <button onClick={() => setShowRecommendForm(!showRecommendForm)} className="text-xs font-body font-medium text-primary hover:underline">
                      {showRecommendForm ? "Cancel" : "+ Share Yours"}
                    </button>
                  </div>

                  {showRecommendForm && (
                    <div className="glass-card p-4 mb-4 space-y-3">
                      <input type="text" placeholder="Headline (optional)" value={recForm.title} onChange={(e) => setRecForm({ ...recForm, title: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                      <input type="text" placeholder="Dish you recommend..." value={recForm.dish_recommended} onChange={(e) => setRecForm({ ...recForm, dish_recommended: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                      <textarea placeholder="Share your food experience..." value={recForm.body} onChange={(e) => setRecForm({ ...recForm, body: e.target.value })} rows={3} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-body text-muted-foreground">Rating:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setRecForm({ ...recForm, rating: s })}><Star className={`h-5 w-5 ${s <= recForm.rating ? "text-savannah-gold fill-current" : "text-muted-foreground"}`} /></button>
                        ))}
                      </div>
                      <button onClick={handleSubmitRecommendation} className="gradient-sunset text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2"><Send className="h-4 w-4" />Share Recommendation</button>
                    </div>
                  )}

                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec: any) => (
                        <div key={rec.id} className="glass-card p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-body font-semibold text-foreground">{rec.title || "Recommendation"}</span>
                            <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < rec.rating ? "text-savannah-gold fill-current" : "text-muted-foreground"}`} />)}</div>
                          </div>
                          {rec.dish_recommended && <p className="text-xs font-body text-sunset-orange mb-1">🍽 Recommended: {rec.dish_recommended}</p>}
                          <p className="text-xs font-body text-muted-foreground">{rec.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground font-body text-center py-4">No recommendations yet. Be the first to share!</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection />
    </div>
  );
};

export default FoodPage;
