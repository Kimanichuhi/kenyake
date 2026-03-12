import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Compass, MapPin, Home, Laptop, MapPinned, Leaf, Star, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import WildlifeSection from "@/components/WildlifeSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";
import FloatingTripPlanner from "@/components/FloatingTripPlanner";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const quickLinks = [
  { icon: Home, label: "Domestic", href: "/domestic", color: "gradient-safari" },
  { icon: Laptop, label: "Nomads", href: "/nomads", color: "gradient-sunset" },
  { icon: MapPinned, label: "Nearby", href: "/nearby", color: "gradient-safari" },
  { icon: Leaf, label: "Sustainability", href: "/cultural-prep", color: "gradient-sunset" },
  { icon: Star, label: "Reviews", href: "/community", color: "gradient-safari" },
  { icon: Compass, label: "Impacts", href: "/impact", color: "gradient-sunset" },
];

const heroStats = [
  { value: "47", label: "Counties" },
  { value: "300+", label: "Destinations" },
  { value: "1,000+", label: "Experiences" },
  { value: "50+", label: "Communities" },
];

const Index = () => {
  const [quickOpen, setQuickOpen] = useState(false);
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const targets = [47, 300, 1000, 50];
    const start = performance.now();
    const durationMs = 900;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setStatCounts(targets.map((t) => Math.round(t * eased)));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />

    {/* Fast Stats */}
    <section className="py-6 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center glass-card rounded-xl p-4">
            <div className="text-2xl font-display font-bold text-sunset-orange">{statCounts[0]}</div>
            <div className="text-xs text-muted-foreground font-body uppercase tracking-wide">Counties</div>
          </div>
          <div className="text-center glass-card rounded-xl p-4">
            <div className="text-2xl font-display font-bold text-sunset-orange">{statCounts[1]}+</div>
            <div className="text-xs text-muted-foreground font-body uppercase tracking-wide">Destinations</div>
          </div>
          <div className="text-center glass-card rounded-xl p-4">
            <div className="text-2xl font-display font-bold text-sunset-orange">{statCounts[2].toLocaleString()}+</div>
            <div className="text-xs text-muted-foreground font-body uppercase tracking-wide">Experiences</div>
          </div>
          <div className="text-center glass-card rounded-xl p-4">
            <div className="text-2xl font-display font-bold text-sunset-orange">{statCounts[3]}+</div>
            <div className="text-xs text-muted-foreground font-body uppercase tracking-wide">Communities</div>
          </div>
        </div>
      </div>
    </section>

    {/* Quick Access */}
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setQuickOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-3 text-sm font-medium text-foreground"
          >
            <Plus className={`h-4 w-4 transition-transform ${quickOpen ? "rotate-45" : ""}`} />
            Quick Action
          </button>
          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href + link.label}
                      to={link.href}
                      onClick={() => setQuickOpen(false)}
                      className="flex items-center gap-2 rounded-xl bg-background/60 border border-border px-3 py-2"
                    >
                      <span className={`h-8 w-8 rounded-lg ${link.color} flex items-center justify-center`}>
                        <link.icon className="h-4 w-4 text-primary-foreground" />
                      </span>
                      <span className="text-xs font-medium text-foreground">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href + link.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={link.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background transition-colors group">
                <div className={`h-12 w-12 rounded-xl ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <DestinationsSection />
    <ExperiencesSection />
    <WildlifeSection />
    <CommunitySection />

    {/* CTA Section */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Compass className="h-12 w-12 text-sunset-orange mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Explore Kenya?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Create your profile to get personalized recommendations, save destinations, and track your travel impact.
          </p>
          <Link to="/onboard" className="gradient-sunset text-primary-foreground px-10 py-4 rounded-full font-semibold inline-block hover:opacity-90 transition-opacity">
            Start Your Journey â†’
          </Link>
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-display font-bold text-sunset-orange">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-body uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    <FooterSection />
    <FloatingTripPlanner />
    <PWAInstallBanner />
  </div>
  );
};

export default Index;

