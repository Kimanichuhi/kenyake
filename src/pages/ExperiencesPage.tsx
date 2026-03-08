import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Star, Heart, Search, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { experiences, destinations } from "@/data/destinations";

const tags = ["All", "Cultural", "Food", "Adventure", "Nature"];

const ExperiencesPage = () => {
  const [selectedTag, setSelectedTag] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = experiences.filter((e) => {
    const matchTag = selectedTag === "All" || e.tag === selectedTag;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.host.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Handpicked Experiences</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
              Immerse in Kenyan Culture
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Authentic, community-hosted experiences across Kenya — from beadwork workshops and cooking classes to walking safaris and dhow sailing. Every booking supports local families directly.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 glass-card px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search experiences..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${selectedTag === tag ? "gradient-sunset text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} experiences found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((exp, i) => {
              const relatedDest = destinations.find((d) => d.id === exp.destinationId);
              return (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 left-3">
                      <span className="gradient-safari text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">{exp.tag}</span>
                    </div>
                    <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
                      <Heart className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground font-body mb-2">Hosted by {exp.host}</p>
                  <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{exp.description}</p>
                  {relatedDest && (
                    <Link to={`/destinations/${relatedDest.id}`} className="text-xs text-sunset-orange font-body hover:underline mb-2 inline-block">
                      📍 Near {relatedDest.name}
                    </Link>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><Clock className="h-3 w-3" />{exp.duration}</span>
                      <span className="flex items-center gap-1 text-savannah-gold text-xs font-body"><Star className="h-3 w-3 fill-current" />{exp.rating}</span>
                    </div>
                    <span className="font-body font-bold text-foreground">{exp.price}<span className="text-xs font-normal text-muted-foreground"> / person</span></span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ExperiencesPage;
