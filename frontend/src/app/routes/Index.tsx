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
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import Seo from "@/components/Seo";

const quickLinks = [
  { icon: Home, label: "Domestic", href: "/domestic", color: "gradient-safari" },
  { icon: Laptop, label: "Nomads", href: "/nomads", color: "gradient-sunset" },
  { icon: MapPinned, label: "Nearby", href: "/nearby", color: "gradient-safari" },
  { icon: Leaf, label: "Sustainability", href: "/cultural-prep", color: "gradient-sunset" },
  { icon: Star, label: "Reviews", href: "/community", color: "gradient-safari" },
  { icon: Compass, label: "Impacts", href: "/impact", color: "gradient-sunset" },
];

const Index = () => {
  const [quickOpen, setQuickOpen] = useState(false);
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);
  const { data: platformStats } = usePlatformStats();
  const { data: homepageSections = [], isLoading: sectionsLoading } = useHomepageSections();

  const sectionsByKey = new Map(homepageSections.map((s) => [s.section_key, s]));
  // While the config is still loading, default every section to visible so
  // nothing flickers/disappears on first paint before the query resolves.
  const heroSection = sectionsLoading ? undefined : sectionsByKey.get("hero");
  const showHero = sectionsLoading || !!heroSection;
  const ctaSection = sectionsByKey.get("cta");
  const showCta = sectionsLoading || !!ctaSection;
  const bodySectionComponents: Record<string, typeof DestinationsSection | typeof ExperiencesSection | typeof WildlifeSection | typeof CommunitySection> = {
    destinations: DestinationsSection,
    experiences: ExperiencesSection,
    wildlife: WildlifeSection,
    community: CommunitySection,
  };
  const orderedBodySections = sectionsLoading
    ? Object.keys(bodySectionComponents).map((key) => ({ section_key: key, eyebrow_text: null, heading_line1: null, subheading: null }))
    : ["destinations", "experiences", "wildlife", "community"]
        .map((key) => sectionsByKey.get(key))
        .filter((s): s is NonNullable<typeof s> => !!s)
        .sort((a, b) => a.display_order - b.display_order);

  const heroStats = [
    { value: `${platformStats?.counties ?? 0}`, label: "Counties" },
    { value: `${platformStats?.destinations ?? 0}+`, label: "Destinations" },
    { value: `${platformStats?.experiences ?? 0}+`, label: "Experiences" },
    { value: `${platformStats?.communities ?? 0}+`, label: "Communities" },
  ];

  useEffect(() => {
    if (!platformStats) return;
    const targets = [platformStats.counties, platformStats.destinations, platformStats.experiences, platformStats.communities];
    const start = performance.now();
    const durationMs = 900;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setStatCounts(targets.map((t) => Math.round(t * eased)));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [platformStats]);

  return (
    <div className="min-h-screen bg-background">
    <Seo />
    <Navbar />
    {showHero && (
      <HeroSection
        eyebrow={heroSection?.eyebrow_text ?? undefined}
        headingLine1={heroSection?.heading_line1 ?? undefined}
        headingLine2={heroSection?.heading_line2 ?? undefined}
        subheading={heroSection?.subheading ?? undefined}
        ctaLabel={heroSection?.cta_label ?? undefined}
        ctaHref={heroSection?.cta_href ?? undefined}
        image={heroSection?.image_url ?? undefined}
      />
    )}

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

    {orderedBodySections.map((section) => {
      const Component = bodySectionComponents[section.section_key];
      return (
        <Component
          key={section.section_key}
          eyebrow={section.eyebrow_text ?? undefined}
          heading={section.heading_line1 ?? undefined}
          subheading={section.subheading ?? undefined}
        />
      );
    })}

    {/* CTA Section */}
    {showCta && (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Compass className="h-12 w-12 text-sunset-orange mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{ctaSection?.heading_line1 ?? "Ready to Explore Kenya?"}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              {ctaSection?.subheading ?? "Create your profile to get personalized recommendations, save destinations, and track your travel impact."}
            </p>
            <Link to={ctaSection?.cta_href ?? "/onboard"} className="gradient-sunset text-primary-foreground px-10 py-4 rounded-full font-semibold inline-block hover:opacity-90 transition-opacity">
              {ctaSection?.cta_label ?? "Start Your Journey"} →
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
    )}

    <FooterSection />
    <FloatingTripPlanner />
    <PWAInstallBanner />
  </div>
  );
};

export default Index;

