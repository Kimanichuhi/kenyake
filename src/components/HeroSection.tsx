import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import heroImage from "@/assets/hero-safari.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Maasai Mara savannah at golden hour with acacia trees and wildebeest"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero-overlay)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block text-savannah-gold font-body text-sm font-semibold tracking-widest uppercase mb-4">
            Discover the Heart of Africa
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Explore Kenya's
            <br />
            <span className="text-gradient-sunset">Hidden Wonders</span>
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg md:text-xl max-w-2xl mx-auto mb-10">
            From the great migration to ancient Swahili towns — plan your journey
            across all 47 counties with AI-powered travel intelligence.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card max-w-4xl mx-auto p-2"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-background/60">
              <MapPin className="h-5 w-5 text-sunset-orange shrink-0" />
              <input
                type="text"
                placeholder="Where do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none font-body"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60">
              <Calendar className="h-5 w-5 text-sunset-orange shrink-0" />
              <span className="text-sm text-muted-foreground font-body whitespace-nowrap">Any dates</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60">
              <Users className="h-5 w-5 text-sunset-orange shrink-0" />
              <span className="text-sm text-muted-foreground font-body whitespace-nowrap">Travelers</span>
            </div>
            <button className="gradient-sunset text-primary-foreground rounded-xl px-8 py-3 font-body font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 mt-10"
        >
          {[
            { value: "47", label: "Counties" },
            { value: "300+", label: "Destinations" },
            { value: "1,000+", label: "Experiences" },
            { value: "50+", label: "Communities" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-display font-bold text-savannah-gold">{stat.value}</div>
              <div className="text-xs text-primary-foreground/60 font-body uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
