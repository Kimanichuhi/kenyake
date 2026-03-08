import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Camera, Users } from "lucide-react";
import { destinations } from "@/data/destinations";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DestinationsSection = () => (
  <section id="destinations" className="py-20 lg:py-28 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-sm font-body font-semibold tracking-widest uppercase text-sunset-orange">
          Top Destinations
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
          Iconic Places to Explore
        </h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto">
          From legendary safari parks to pristine beaches and ancient towns —
          discover Kenya's most breathtaking destinations.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {destinations.map((dest) => (
          <motion.div key={dest.id} variants={item}>
            <Link to={`/destinations/${dest.id}`} className="group block">
              <div className="rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
                <div className="relative h-56 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 left-3">
                    <span className="glass-card-dark text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">{dest.category}</span>
                  </div>
                  <div className="absolute top-3 right-3">
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
                      <span className="text-xs text-muted-foreground">({dest.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground font-body">
                      <Camera className="h-3 w-3 inline mr-1" />Best: {dest.bestTime}
                    </span>
                    <span className="font-body font-semibold text-sm text-sunset-orange">{dest.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-10">
        <Link to="/destinations" className="gradient-safari text-primary-foreground rounded-full px-8 py-3 font-body font-semibold text-sm inline-block hover:opacity-90 transition-opacity">
          View All Destinations →
        </Link>
      </div>
    </div>
  </section>
);

export default DestinationsSection;
