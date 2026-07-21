import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Binoculars, TrendingUp, MapPin } from "lucide-react";
import { useWildlifeSpecies } from "@/hooks/useWildlifeContent";
import { Skeleton } from "@/components/ui/skeleton";

interface WildlifeSectionProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

const WildlifeSection = ({
  eyebrow = "Wildlife Intelligence",
  heading = "Track the Big Five",
  subheading = "Real-time sighting data from our network of guides across Kenya's national parks.",
}: WildlifeSectionProps) => {
  const { data: bigFive = [], isLoading } = useWildlifeSpecies();

  return (
  <section id="wildlife" className="py-20 lg:py-28 bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-sm font-body font-semibold tracking-widest uppercase text-savannah-gold">{eyebrow}</span>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4">{heading}</h2>
        <p className="text-primary-foreground/60 font-body max-w-xl mx-auto">
          {subheading}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-primary-foreground/10" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {bigFive.map((animal, i) => (
          <motion.div key={animal.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }} className="glass-card-dark p-6 text-center hover:border-savannah-gold/30 transition-colors cursor-pointer">
            <div className="text-4xl mb-3">{animal.emoji}</div>
            <h3 className="font-display font-semibold text-lg mb-1">{animal.name}</h3>
            {animal.sightings_note && (
              <div className="flex items-center justify-center gap-1 text-savannah-gold text-sm font-body font-semibold mb-2">
                <TrendingUp className="h-3 w-3" /> {animal.sightings_note}
              </div>
            )}
            {animal.location_name && (
              <p className="flex items-center justify-center gap-1 text-primary-foreground/50 text-xs font-body">
                <MapPin className="h-3 w-3" /> {animal.location_name}
              </p>
            )}
          </motion.div>
        ))}
      </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-14 glass-card-dark p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl gradient-sunset shrink-0">
          <Binoculars className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h3 className="font-display text-xl font-bold mb-1">Great Wildebeest Migration — Active Now</h3>
          <p className="text-primary-foreground/60 font-body text-sm">Over 1.5 million wildebeest are crossing the Mara River. Our AI predicts the next major crossing within 48 hours.</p>
        </div>
        <Link to="/wildlife" className="gradient-sunset text-primary-foreground rounded-full px-8 py-3 font-body font-semibold text-sm whitespace-nowrap hover:opacity-90 transition-opacity">
          Track Migration →
        </Link>
      </motion.div>
    </div>
  </section>
  );
};

export default WildlifeSection;
