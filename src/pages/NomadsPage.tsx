import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wifi, MapPin, Star, Coffee, DollarSign, Calendar, Globe, FileText, CreditCard, Plane, Home, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { coworkingSpaces } from "@/data/guides-events";

import coworkingImg from "@/assets/coworking.jpg";
import destDiani from "@/assets/dest-diani.jpg";
import destLamu from "@/assets/dest-lamu.jpg";

const costOfLiving = [
  { city: "Nairobi", monthlyRent: "$400-800", coworking: "$200-350", meals: "$5-15", internet: "50-100 Mbps" },
  { city: "Mombasa", monthlyRent: "$300-600", coworking: "$150-250", meals: "$4-12", internet: "30-80 Mbps" },
  { city: "Diani", monthlyRent: "$500-1000", coworking: "$100-200", meals: "$5-15", internet: "20-50 Mbps" },
  { city: "Lamu", monthlyRent: "$250-500", coworking: "Limited", meals: "$3-10", internet: "10-30 Mbps" },
];

const visaSteps = [
  { step: 1, title: "Apply Online", desc: "Submit your digital nomad visa application through eTA portal" },
  { step: 2, title: "Documentation", desc: "Proof of income ($2,000+/month), health insurance, clean record" },
  { step: 3, title: "Processing", desc: "Usually 2-5 business days for approval" },
  { step: 4, title: "Arrival", desc: "Present approval at any Kenyan port of entry" },
];

const NomadsPage = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[40vh] overflow-hidden">
          <img src={coworkingImg} alt="Co-working in Kenya" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(30,10%,10%,0.3) 0%, hsla(30,10%,10%,0.8) 100%)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
              <span className="text-sm font-body font-semibold tracking-widest uppercase text-savannah-gold">Work from Africa</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mt-2 mb-3">
                Digital Nomad Kenya
              </h1>
              <p className="text-primary-foreground/70 font-body max-w-xl mx-auto">
                Fast internet, affordable living, weekend safaris. Everything you need to work remotely from East Africa.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Co-working Spaces */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Wifi className="h-6 w-6 text-safari-green" /> Co-Working Spaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coworkingSpaces.map((space, i) => (
              <motion.div key={space.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <img src={space.image} alt={space.name} className="w-full h-40 object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{space.name}</h3>
                      <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{space.city}</p>
                    </div>
                    <div className="flex items-center gap-1 text-savannah-gold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-body font-semibold">{space.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-safari-green/10 text-safari-green text-xs font-body font-medium flex items-center gap-1">
                      <Wifi className="h-3 w-3" /> {space.internetSpeed}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {space.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="font-body font-bold text-foreground">{space.pricePerDay}</span>
                      <span className="text-xs text-muted-foreground font-body"> / day</span>
                    </div>
                    <div>
                      <span className="font-body font-bold text-foreground">{space.pricePerMonth}</span>
                      <span className="text-xs text-muted-foreground font-body"> / month</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost of Living */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-savannah-gold" /> Cost of Living Guide
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-3 font-display font-semibold text-foreground">City</th>
                  <th className="pb-3 font-body text-sm text-muted-foreground"><Home className="h-4 w-4 inline mr-1" />Monthly Rent</th>
                  <th className="pb-3 font-body text-sm text-muted-foreground"><Building className="h-4 w-4 inline mr-1" />Co-working</th>
                  <th className="pb-3 font-body text-sm text-muted-foreground"><Coffee className="h-4 w-4 inline mr-1" />Meals</th>
                  <th className="pb-3 font-body text-sm text-muted-foreground"><Wifi className="h-4 w-4 inline mr-1" />Internet</th>
                </tr>
              </thead>
              <tbody>
                {costOfLiving.map((city) => (
                  <tr key={city.city} className="border-b border-border/50">
                    <td className="py-4 font-body font-semibold text-foreground">{city.city}</td>
                    <td className="py-4 font-body text-sm text-foreground">{city.monthlyRent}</td>
                    <td className="py-4 font-body text-sm text-foreground">{city.coworking}</td>
                    <td className="py-4 font-body text-sm text-foreground">{city.meals}</td>
                    <td className="py-4 font-body text-sm text-foreground">{city.internet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Visa Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-6 w-6 text-river-blue" /> Digital Nomad Visa
          </h2>
          <p className="text-muted-foreground font-body mb-8 max-w-2xl">
            Kenya offers a digital nomad-friendly visa allowing remote workers to stay for extended periods. Here's how to apply:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {visaSteps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
                <div className="h-10 w-10 rounded-full gradient-sunset text-primary-foreground font-body font-bold flex items-center justify-center mx-auto mb-3">
                  {step.step}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="https://evisa.go.ke" target="_blank" rel="noopener noreferrer" className="gradient-safari text-primary-foreground px-8 py-3 rounded-xl font-body font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Globe className="h-4 w-4" /> Apply on eVisa Portal
            </a>
          </div>
        </div>
      </section>

      {/* Weekend Escapes */}
      <section className="py-16 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2">
            <Plane className="h-6 w-6 text-savannah-gold" /> Weekend Safari Escapes
          </h2>
          <p className="text-primary-foreground/60 font-body mb-8">Work hard, safari harder. Quick getaways from major cities:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Maasai Mara Weekend", duration: "2 days", from: "Nairobi", price: "$350", image: "/src/assets/dest-mara.jpg" },
              { title: "Diani Beach Workation", duration: "3-5 days", from: "Nairobi/Mombasa", price: "$200", image: destDiani },
              { title: "Lamu Island Escape", duration: "4 days", from: "Nairobi", price: "$280", image: destLamu },
            ].map((trip, i) => (
              <motion.div key={trip.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card-dark overflow-hidden group cursor-pointer">
                <div className="h-40 overflow-hidden">
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-primary-foreground mb-1">{trip.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-primary-foreground/60 font-body mb-2">
                    <span><Calendar className="h-3 w-3 inline mr-1" />{trip.duration}</span>
                    <span><MapPin className="h-3 w-3 inline mr-1" />{trip.from}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body font-bold text-savannah-gold">From {trip.price}</span>
                    <Link to="/destinations" className="text-xs text-primary-foreground/60 hover:text-savannah-gold font-body transition-colors">View →</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default NomadsPage;
