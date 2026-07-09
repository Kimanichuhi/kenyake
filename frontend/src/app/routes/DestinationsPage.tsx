import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Users, Camera, Search, SlidersHorizontal, Map, Grid3X3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import FavoriteButton from "@/components/FavoriteButton";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Destination } from "@/data/destinations";

const DestinationMap = lazy(() => import("@/components/DestinationMap"));

const categories = ["All", "Wildlife Safari", "Wildlife & Mountains", "Beach & Marine", "Adventure & Hiking", "Birdwatching", "Culture & Heritage"];

type DestinationRow = Tables<"destinations">;

function mapDestinationRow(row: DestinationRow): Destination {
  return {
    id: row.slug,
    name: row.name,
    county: row.county,
    image: row.cover_image ?? "",
    gallery: row.gallery_images ?? [],
    category: row.category,
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    crowdLevel: row.crowd_level ?? "",
    bestTime: row.best_time ?? "",
    price: row.price_display ?? "",
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    safetyRating: row.safety_rating ?? 0,
    accessibilityRating: row.accessibility_rating ?? 0,
    photographyScore: row.photography_score ?? 0,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
  };
}

const DestinationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "map">("grid");

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["public-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("destinations").select("*");
      if (error) throw error;
      return (data ?? []).map(mapDestinationRow);
    },
  });

  const filtered = destinations.filter((d) => {
    const matchCategory = selectedCategory === "All" || d.category === selectedCategory;
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.county.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Explore All Destinations
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              From the iconic Maasai Mara to hidden coastal gems — discover Kenya's most extraordinary places across all 47 counties.
            </p>
          </motion.div>

          {/* Search + View Toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 glass-card px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search destinations or counties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none"
              />
              <div className="flex items-center gap-1 border-l border-border pl-3">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`p-1.5 rounded-lg transition-colors ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Map view"
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                  selectedCategory === cat
                    ? "gradient-safari text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {view === "map" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Suspense fallback={<div className="h-[500px] rounded-2xl bg-muted animate-pulse" />}>
                <DestinationMap />
              </Suspense>
            </motion.div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)]">
                  <Skeleton className="h-56 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground">
                {destinations.length === 0
                  ? "No destinations are published yet. Check back soon."
                  : "No destinations match your search."}
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} destinations found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/destinations/${dest.id}`} className="group block">
                      <div className="rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
                        <div className="relative h-56 overflow-hidden">
                          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute top-3 left-3">
                            <span className="glass-card-dark text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">{dest.category}</span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <FavoriteButton destinationId={dest.id} />
                            <span className="glass-card text-xs font-body font-semibold px-3 py-1 rounded-full text-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" /> {dest.crowdLevel}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-display text-lg font-semibold text-foreground">{dest.name}</h3>
                              <p className="flex items-center gap-1 text-muted-foreground text-sm font-body">
                                <MapPin className="h-3 w-3" /> {dest.county}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-savannah-gold">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-body font-semibold">{dest.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{dest.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground font-body"><Camera className="h-3 w-3 inline mr-1" />Best: {dest.bestTime}</span>
                            <span className="font-body font-semibold text-sm text-sunset-orange">{dest.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default DestinationsPage;
