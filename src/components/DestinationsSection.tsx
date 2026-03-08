import { motion } from "framer-motion";
import { MapPin, Star, Camera, Users } from "lucide-react";

import destMara from "@/assets/dest-mara.jpg";
import destAmboseli from "@/assets/dest-amboseli.jpg";
import destDiani from "@/assets/dest-diani.jpg";
import destMountKenya from "@/assets/dest-mount-kenya.jpg";
import destNakuru from "@/assets/dest-nakuru.jpg";
import destLamu from "@/assets/dest-lamu.jpg";

const destinations = [
  {
    name: "Maasai Mara",
    county: "Narok County",
    image: destMara,
    category: "Wildlife Safari",
    rating: 4.9,
    reviews: 2340,
    crowdLevel: "Medium",
    bestTime: "Jul — Oct",
    price: "From $120/day",
  },
  {
    name: "Amboseli",
    county: "Kajiado County",
    image: destAmboseli,
    category: "Wildlife & Mountains",
    rating: 4.8,
    reviews: 1890,
    crowdLevel: "Low",
    bestTime: "Jun — Sep",
    price: "From $95/day",
  },
  {
    name: "Diani Beach",
    county: "Kwale County",
    image: destDiani,
    category: "Beach & Marine",
    rating: 4.7,
    reviews: 3120,
    crowdLevel: "Medium",
    bestTime: "Dec — Mar",
    price: "From $80/day",
  },
  {
    name: "Mount Kenya",
    county: "Nyeri County",
    image: destMountKenya,
    category: "Adventure & Hiking",
    rating: 4.8,
    reviews: 890,
    crowdLevel: "Low",
    bestTime: "Jan — Feb",
    price: "From $150/day",
  },
  {
    name: "Lake Nakuru",
    county: "Nakuru County",
    image: destNakuru,
    category: "Birdwatching",
    rating: 4.6,
    reviews: 1450,
    crowdLevel: "Medium",
    bestTime: "Year-round",
    price: "From $70/day",
  },
  {
    name: "Lamu Old Town",
    county: "Lamu County",
    image: destLamu,
    category: "Culture & Heritage",
    rating: 4.7,
    reviews: 780,
    crowdLevel: "Low",
    bestTime: "Jun — Sep",
    price: "From $60/day",
  },
];

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
      {/* Header */}
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

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {destinations.map((dest) => (
          <motion.div
            key={dest.name}
            variants={item}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300"
          >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <span className="glass-card-dark text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">
                  {dest.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="glass-card text-xs font-body font-semibold px-3 py-1 rounded-full text-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {dest.crowdLevel}
                </span>
              </div>
            </div>

            {/* Info */}
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
                  <Camera className="h-3 w-3 inline mr-1" />
                  Best: {dest.bestTime}
                </span>
                <span className="font-body font-semibold text-sm text-sunset-orange">{dest.price}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default DestinationsSection;
