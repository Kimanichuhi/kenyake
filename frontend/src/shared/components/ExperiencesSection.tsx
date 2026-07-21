import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Star, Heart } from "lucide-react";
import { useExperiences } from "@/hooks/useExperiences";
import { Skeleton } from "@/components/ui/skeleton";

interface ExperiencesSectionProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

const ExperiencesSection = ({
  eyebrow = "Local Experiences",
  heading = "Immerse in Kenyan Culture",
  subheading = "Hands-on experiences hosted by local communities. Every booking directly supports the artisans, guides, and families who make Kenya unforgettable.",
}: ExperiencesSectionProps) => {
  const { data: experiences = [], isLoading } = useExperiences();

  return (
  <section id="experiences" className="py-20 lg:py-28 bg-muted/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">
          {eyebrow}
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
          {heading}
        </h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto">
          {subheading}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.slice(0, 3).map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden h-72 mb-4">
              <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute top-3 left-3">
                <span className="gradient-safari text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">{exp.tag}</span>
              </div>
              <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
                <Heart className="h-4 w-4 text-foreground" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold text-foreground">{exp.title}</h3>
              <div className="flex items-center gap-1 text-savannah-gold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-sm font-body font-semibold">{exp.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-body mb-2">Hosted by {exp.host}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <Clock className="h-3 w-3" /> {exp.duration}
              </span>
              <span className="font-body font-bold text-foreground">
                {exp.price} <span className="text-xs font-normal text-muted-foreground">/ person</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <div className="text-center mt-10">
        <Link to="/experiences" className="gradient-sunset text-primary-foreground rounded-full px-8 py-3 font-body font-semibold text-sm inline-block hover:opacity-90 transition-opacity">
          View All Experiences →
        </Link>
      </div>
    </div>
  </section>
  );
};

export default ExperiencesSection;
