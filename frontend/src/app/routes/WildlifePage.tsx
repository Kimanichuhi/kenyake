import { motion } from "framer-motion";
import { Binoculars, TrendingUp, MapPin, Calendar, Eye, AlertTriangle, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

import destMara from "@/assets/dest-mara.jpg";
import destAmboseli from "@/assets/dest-amboseli.jpg";
import wildlifeBirds from "@/assets/wildlife-birds.jpg";
import maraCrossing from "@/assets/mara-crossing.jpg";
import maraCheetah from "@/assets/mara-cheetah.jpg";

const bigFive = [
  { name: "Lion", emoji: "🦁", sightings: "92%", location: "Maasai Mara", status: "Vulnerable", population: "~2,000 in Kenya", bestMonth: "Jul—Oct" },
  { name: "Elephant", emoji: "🐘", sightings: "98%", location: "Amboseli", status: "Endangered", population: "~35,000 in Kenya", bestMonth: "Jun—Sep" },
  { name: "Buffalo", emoji: "🐃", sightings: "95%", location: "Lake Nakuru", status: "Near Threatened", population: "~40,000 in Kenya", bestMonth: "Year-round" },
  { name: "Leopard", emoji: "🐆", sightings: "45%", location: "Samburu", status: "Vulnerable", population: "~4,000 in Kenya", bestMonth: "Jun—Aug" },
  { name: "Rhino", emoji: "🦏", sightings: "78%", location: "Ol Pejeta", status: "Critically Endangered", population: "~1,800 in Kenya", bestMonth: "Year-round" },
];

const migrationMonths = [
  { month: "Jan—Mar", event: "Calving season in Serengeti", intensity: 2 },
  { month: "Apr—May", event: "Herds move northwest", intensity: 3 },
  { month: "Jun", event: "Western Serengeti — Grumeti crossings", intensity: 4 },
  { month: "Jul—Aug", event: "Mara River crossings begin", intensity: 5 },
  { month: "Sep—Oct", event: "Peak Mara crossings & dispersal", intensity: 5 },
  { month: "Nov—Dec", event: "Return south to Serengeti", intensity: 3 },
];

const recentSightings = [
  { species: "Cheetah with 3 cubs", location: "Maasai Mara — Topi Plains", time: "2 hours ago", image: maraCheetah },
  { species: "Elephant herd (25+)", location: "Amboseli — Observation Hill", time: "4 hours ago", image: destAmboseli },
  { species: "River crossing (500+)", location: "Maasai Mara — Mara River", time: "Today, 7:00 AM", image: maraCrossing },
  { species: "Flamingo flock", location: "Lake Nakuru — South shore", time: "Yesterday", image: wildlifeBirds },
];

const WildlifePage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-20">
      <div className="relative h-[40vh] overflow-hidden">
        <img src={destMara} alt="Wildlife in Kenya" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(30,10%,10%,0.3) 0%, hsla(30,10%,10%,0.8) 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-savannah-gold">Wildlife Intelligence</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mt-2 mb-3">
              Kenya's Wildlife Tracker
            </h1>
            <p className="text-primary-foreground/70 font-body max-w-xl mx-auto">
              Real-time sighting reports from our network of 500+ guides across Kenya's national parks and conservancies.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Big Five */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">The Big Five — Sighting Probability</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {bigFive.map((animal, i) => (
            <motion.div key={animal.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-5 text-center hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="text-5xl mb-3">{animal.emoji}</div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">{animal.name}</h3>
              <div className="flex items-center justify-center gap-1 text-savannah-gold text-lg font-body font-bold mb-2">
                <TrendingUp className="h-4 w-4" /> {animal.sightings}
              </div>
              <p className="text-xs text-muted-foreground font-body flex items-center justify-center gap-1 mb-1"><MapPin className="h-3 w-3" />{animal.location}</p>
              <p className="text-xs text-muted-foreground font-body mb-1">Pop: {animal.population}</p>
              <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${animal.status === "Critically Endangered" ? "bg-destructive/10 text-destructive" : animal.status === "Endangered" ? "bg-sunset-orange/10 text-sunset-orange" : "bg-savannah-gold/10 text-savannah-gold"}`}>
                {animal.status}
              </span>
              <p className="text-xs text-muted-foreground font-body mt-2"><Calendar className="h-3 w-3 inline mr-1" />{animal.bestMonth}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Recent Sightings */}
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-3 w-3 rounded-full bg-safari-green animate-pulse" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Live Sightings Feed</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentSightings.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card flex overflow-hidden">
              <img src={s.image} alt={s.species} className="w-28 h-28 object-cover shrink-0" loading="lazy" />
              <div className="p-4 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{s.species}</h3>
                <p className="text-xs text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</p>
                <p className="text-xs text-savannah-gold font-body mt-1 flex items-center gap-1"><Eye className="h-3 w-3" />{s.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Migration Calendar */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">Great Migration Calendar</h2>
        <p className="text-muted-foreground font-body text-center max-w-xl mx-auto mb-10">Track the annual wildebeest migration — one of nature's greatest spectacles.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {migrationMonths.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass-card p-4 text-center">
              <p className="font-body font-bold text-foreground text-sm mb-2">{m.month}</p>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className={`h-2 w-2 rounded-full ${j < m.intensity ? "bg-sunset-orange" : "bg-border"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-body">{m.event}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Conservation Info */}
    <section className="py-16 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card-dark p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl gradient-safari shrink-0">
            <AlertTriangle className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl font-bold mb-2">Conservation Matters</h3>
            <p className="text-primary-foreground/60 font-body text-sm">
              Kenya is home to some of the world's most endangered species. Every safari booking through SafariSync contributes 5% to local conservation funds. Together we've helped protect over 12,000 hectares of critical wildlife habitat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-savannah-gold" />
            <span className="font-body text-sm text-savannah-gold font-semibold">KWS Partner</span>
          </div>
        </motion.div>
      </div>
    </section>

    <FooterSection />
  </div>
);

export default WildlifePage;
