import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, Camera, Shield, Accessibility, Users, Clock, Heart, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Destination, experiences, reviews } from "@/data/destinations";

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

const RatingDots = ({ value, max = 5 }: { value: number; max?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-2 w-2 rounded-full",
          i < value ? "bg-savannah-gold" : "bg-border"
        )}
      />
    ))}
  </div>
);

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState(2);

  const { data: dest, isLoading } = useQuery({
    queryKey: ["public-destination", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("destinations").select("*").eq("slug", id).maybeSingle();
      if (error) throw error;
      return data ? mapDestinationRow(data) : null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Destination not found</h1>
          <Link to="/destinations" className="text-sunset-orange hover:underline font-body">
            ← Browse all destinations
          </Link>
        </div>
      </div>
    );
  }

  const destReviews = reviews.filter((r) => r.destinationId === dest.id);
  const nearbyExperiences = experiences.filter((e) => e.destinationId === dest.id);

  const prevImage = () => setGalleryIndex((i) => (i === 0 ? dest.gallery.length - 1 : i - 1));
  const nextImage = () => setGalleryIndex((i) => (i === dest.gallery.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Photo Gallery */}
      <section className="pt-20">
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <motion.img
            key={galleryIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            src={dest.gallery[galleryIndex]}
            alt={dest.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, hsla(30,10%,10%,0.5) 100%)" }} />

          {/* Gallery Nav */}
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {dest.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={cn(
                  "h-14 w-20 rounded-lg overflow-hidden border-2 transition-all",
                  i === galleryIndex ? "border-savannah-gold scale-105" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-24 right-4 glass-card-dark px-3 py-1 rounded-full text-primary-foreground text-xs font-body">
            {galleryIndex + 1} / {dest.gallery.length}
          </div>

          {/* Back */}
          <Link to="/destinations" className="absolute top-24 left-4 glass-card-dark px-3 py-2 rounded-full text-primary-foreground text-xs font-body flex items-center gap-1 hover:bg-foreground/80 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="gradient-safari text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">{dest.category}</span>
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Users className="h-3 w-3" /> {dest.crowdLevel} crowd</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{dest.name}</h1>
              <div className="flex items-center gap-4 text-sm font-body text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-sunset-orange" /> {dest.county}</span>
                <span className="flex items-center gap-1 text-savannah-gold"><Star className="h-4 w-4 fill-current" /> {dest.rating} ({dest.reviews} reviews)</span>
                <span>Best: {dest.bestTime}</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">About This Destination</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{dest.description}</p>
            </motion.div>

            {/* Highlights */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dest.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 glass-card px-4 py-3">
                    <div className="h-6 w-6 rounded-full gradient-safari flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="font-body text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ratings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Ratings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-safari-green" />
                    <span className="font-body text-sm font-medium text-foreground">Safety</span>
                  </div>
                  <RatingDots value={dest.safetyRating} />
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4 text-sunset-orange" />
                    <span className="font-body text-sm font-medium text-foreground">Photography</span>
                  </div>
                  <RatingDots value={dest.photographyScore} />
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Accessibility className="h-4 w-4 text-river-blue" />
                    <span className="font-body text-sm font-medium text-foreground">Accessibility</span>
                  </div>
                  <RatingDots value={dest.accessibilityRating} />
                </div>
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Traveler Reviews ({destReviews.length})
              </h2>
              {destReviews.length > 0 ? (
                <div className="space-y-4">
                  {destReviews.map((review) => (
                    <div key={review.id} className="glass-card p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full gradient-safari flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-body font-semibold text-foreground text-sm">{review.author}</span>
                              <span className="text-xs text-muted-foreground ml-2">{review.country}</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-body">{review.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-savannah-gold text-savannah-gold" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground font-body leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground font-body text-sm">No reviews yet for this destination.</p>
              )}
            </motion.div>

            {/* Nearby Experiences */}
            {nearbyExperiences.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Nearby Experiences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {nearbyExperiences.map((exp) => (
                    <Link key={exp.id} to={`/experiences`} className="group">
                      <div className="rounded-xl overflow-hidden h-40 mb-3">
                        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-foreground">{exp.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Clock className="h-3 w-3" /> {exp.duration}</span>
                        <span className="font-body font-bold text-sm text-foreground">{exp.price}<span className="text-xs font-normal text-muted-foreground"> / person</span></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar — Booking Card */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-24">
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-end gap-2">
                  <span className="font-display text-2xl font-bold text-foreground">{dest.price.replace("From ", "")}</span>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-2">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-body", !date && "text-muted-foreground")}>
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-2">Travelers</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-body"
                    >
                      −
                    </button>
                    <span className="font-body font-semibold text-foreground w-8 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(20, guests + 1))}
                      className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-body"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button className="w-full gradient-sunset text-primary-foreground rounded-xl py-3 font-body font-semibold text-sm hover:opacity-90 transition-opacity">
                  Book Now
                </button>

                <button className="w-full border border-border rounded-xl py-3 font-body font-medium text-sm text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" /> Save to Wishlist
                </button>

                <p className="text-xs text-muted-foreground font-body text-center">You won't be charged yet</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default DestinationDetail;
