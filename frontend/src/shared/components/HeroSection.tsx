import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-safari.jpg";

const HeroSection = () => {
  const ctaText = "Start Tourism Chat About Kenya";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let idx = 0;
    let direction: "forward" | "back" = "forward";
    let timeout: number | undefined;

    const tick = () => {
      if (direction === "forward") {
        idx += 1;
        setTypedText(ctaText.slice(0, idx));
        if (idx >= ctaText.length) {
          direction = "back";
          timeout = window.setTimeout(tick, 900);
          return;
        }
        timeout = window.setTimeout(tick, 45);
        return;
      }

      idx -= 1;
      setTypedText(ctaText.slice(0, Math.max(0, idx)));
      if (idx <= 0) {
        direction = "forward";
        timeout = window.setTimeout(tick, 350);
        return;
      }
      timeout = window.setTimeout(tick, 25);
    };

    timeout = window.setTimeout(tick, 200);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [ctaText]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24">
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
            From the great migration to ancient Swahili towns â€” plan your journey
            across all 47 counties with AI-powered travel intelligence.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex justify-center mb-10"
          >
            <Link
              to="/trip-planner"
              aria-label="Open SafariSync Assistant"
              className="group relative inline-flex items-center gap-3 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 font-body text-sm md:text-base font-semibold text-primary-foreground shadow-[0_0_30px_rgba(245,166,35,0.35)] transition-all hover:shadow-[0_0_55px_rgba(245,166,35,0.65)] hover:border-primary-foreground/60 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-sunset-orange/40 via-savannah-gold/40 to-sunset-orange/40 blur-md opacity-60 group-hover:opacity-95 transition-opacity animate-[pulse_2.4s_ease-in-out_infinite]" />
              <span className="relative inline-flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-savannah-gold/20 px-2 py-0.5 text-xs uppercase tracking-widest text-savannah-gold animate-pulse">
                  AI
                </span>
                <span className="tracking-wide">
                  {typedText}
                  <span className="inline-block w-[10px] ml-1 border-r-2 border-primary-foreground/80 animate-pulse" />
                </span>
                <span className="text-savannah-gold animate-bounce">→</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;


