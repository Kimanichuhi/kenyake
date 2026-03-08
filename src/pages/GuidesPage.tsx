import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Star, MapPin, Clock, Languages, Award, Calendar, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { guides } from "@/data/guides-events";

const specializations = ["All", "Wildlife Safari", "Big Five Tracking", "Photography", "Birding", "Hiking", "Cultural Heritage", "Coastal Heritage", "Marine Wildlife"];

const GuidesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");

  const filtered = guides.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.location.toLowerCase().includes(search.toLowerCase());
    const matchSpec = selectedSpec === "All" || g.specializations.some((s) => s.includes(selectedSpec.replace("All", "")));
    return matchSearch && matchSpec;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-sunset-orange">Local Experts</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Find Your Perfect Guide</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Connect directly with certified local guides. No middlemen, fair prices, and authentic experiences led by passionate Kenyans who know their land best.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 glass-card px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search guides by name or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${selectedSpec === spec ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} guides found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide, i) => (
              <motion.div key={guide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="relative">
                  <img src={guide.photo} alt={guide.name} className="w-full h-48 object-cover" loading="lazy" />
                  {guide.available ? (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-safari-green text-primary-foreground text-xs font-body font-medium">Available</span>
                  ) : (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-body font-medium">Booked</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{guide.name}</h3>
                      <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{guide.location}</p>
                    </div>
                    <div className="flex items-center gap-1 text-savannah-gold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-body font-semibold">{guide.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{guide.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {guide.specializations.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body mb-4">
                    <span className="flex items-center gap-1"><Languages className="h-3 w-3" />{guide.languages.length} languages</span>
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" />{guide.yearsExperience} years</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{guide.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-body font-bold text-foreground">{guide.pricePerDay}<span className="text-xs font-normal text-muted-foreground"> / day</span></span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-full border border-border text-xs font-body font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Message
                      </button>
                      <button className="gradient-sunset text-primary-foreground px-3 py-1.5 rounded-full text-xs font-body font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Book
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default GuidesPage;
