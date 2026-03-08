import { motion } from "framer-motion";
import { Clock, Star, Heart } from "lucide-react";

import expBeadwork from "@/assets/exp-beadwork.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import expWalking from "@/assets/exp-walking-safari.jpg";

const experiences = [
  {
    title: "Maasai Beadwork Workshop",
    host: "Narok Women's Collective",
    image: expBeadwork,
    duration: "3 hours",
    price: "$35",
    rating: 4.9,
    reviews: 128,
    tag: "Cultural",
  },
  {
    title: "Traditional Kenyan Cooking",
    host: "Chef Wanjiku",
    image: expCooking,
    duration: "4 hours",
    price: "$45",
    rating: 4.8,
    reviews: 256,
    tag: "Food",
  },
  {
    title: "Walking Safari Adventure",
    host: "Mara Guides Association",
    image: expWalking,
    duration: "5 hours",
    price: "$85",
    rating: 4.9,
    reviews: 342,
    tag: "Adventure",
  },
];

const ExperiencesSection = () => (
  <section id="experiences" className="py-20 lg:py-28 bg-muted/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">
          Local Experiences
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
          Immerse in Kenyan Culture
        </h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto">
          Hands-on experiences hosted by local communities. Every booking directly
          supports the artisans, guides, and families who make Kenya unforgettable.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden h-72 mb-4">
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <span className="gradient-safari text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-full">
                  {exp.tag}
                </span>
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
    </div>
  </section>
);

export default ExperiencesSection;
