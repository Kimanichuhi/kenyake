import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Info, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { culturalEvents } from "@/data/guides-events";

const months = ["All", "March", "April", "November", "Year-round"];
const types = ["All", "ceremony", "festival", "market", "celebration"];

const EventsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const filtered = culturalEvents.filter((e) => {
    const matchMonth = selectedMonth === "All" || e.month === selectedMonth;
    const matchType = selectedType === "All" || e.type === selectedType;
    return matchMonth && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Cultural Calendar</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Authentic Events & Ceremonies</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Witness sacred ceremonies, vibrant festivals, and community gatherings across Kenya. These events are hosted by communities themselves — not performances for tourists.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {months.map((m) => (
                <button key={m} onClick={() => setSelectedMonth(m)} className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${selectedMonth === m ? "gradient-sunset text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {types.map((t) => (
              <button key={t} onClick={() => setSelectedType(t)} className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all capitalize ${selectedType === t ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {t === "All" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="md:flex">
                  <div className="md:w-2/5 h-48 md:h-auto">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5 md:w-3/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body font-medium capitalize ${event.type === "ceremony" ? "bg-sunset-orange/10 text-sunset-orange" : event.type === "festival" ? "bg-savannah-gold/10 text-savannah-gold" : event.type === "market" ? "bg-safari-green/10 text-safari-green" : "bg-river-blue/10 text-river-blue"}`}>
                        {event.type}
                      </span>
                      {event.spotsLeft < 20 && event.spotsLeft > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-body font-medium">
                          Only {event.spotsLeft} spots left
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mb-1">{event.community}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.county}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{event.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-4">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.capacity} capacity</span>
                      <span className="font-semibold text-foreground">{event.price}</span>
                    </div>
                    {event.etiquette.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-body font-medium text-foreground flex items-center gap-1 mb-1"><Info className="h-3 w-3 text-sunset-orange" /> Etiquette</p>
                        <div className="flex flex-wrap gap-1">
                          {event.etiquette.slice(0, 2).map((e) => (
                            <span key={e} className="text-xs text-muted-foreground font-body">• {e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button className="w-full gradient-sunset text-primary-foreground py-2 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity">
                      Request to Attend
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No events found for this filter combination.</p>
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default EventsPage;
