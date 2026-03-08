import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Shield, Siren, Heart, Activity, Globe, ChevronRight, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { emergencyContacts, safetyAdvisories } from "@/data/guides-events";

const SafetyPage = () => {
  const [shareLocation, setShareLocation] = useState(false);

  const handleSOS = () => {
    alert("SOS Alert would be sent with your GPS location to emergency services. This feature requires backend integration.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-8 bg-destructive/5">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Safety & Emergency</h1>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Your safety is our priority. Quick access to emergency contacts, real-time advisories, and SOS features.
            </p>
          </motion.div>

          {/* SOS Button */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="max-w-md mx-auto mb-8">
            <button onClick={handleSOS} className="w-full bg-destructive hover:bg-destructive/90 text-primary-foreground py-6 rounded-2xl font-body font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg">
              <Siren className="h-6 w-6 animate-pulse" />
              Emergency SOS
            </button>
            <p className="text-xs text-muted-foreground font-body text-center mt-2">Tap to send your GPS location to emergency services</p>
          </motion.div>

          {/* Location Sharing */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-md mx-auto glass-card p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-safari-green" />
                <div>
                  <p className="font-body font-medium text-foreground text-sm">Share Live Location</p>
                  <p className="text-xs text-muted-foreground font-body">Share with trusted contacts back home</p>
                </div>
              </div>
              <button onClick={() => setShareLocation(!shareLocation)} className={`w-12 h-6 rounded-full relative transition-colors ${shareLocation ? "bg-safari-green" : "bg-border"}`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-primary-foreground transition-all ${shareLocation ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety Advisories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-savannah-gold" /> Current Safety Advisories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {safetyAdvisories.map((advisory, i) => (
              <motion.div key={advisory.region} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 flex items-start gap-4">
                <div className={`h-3 w-3 rounded-full mt-1 shrink-0 ${advisory.level === "Low Risk" ? "bg-safari-green" : advisory.level === "Normal" ? "bg-savannah-gold" : "bg-sunset-orange"}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body font-semibold text-foreground">{advisory.region}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-body ${advisory.level === "Low Risk" ? "bg-safari-green/10 text-safari-green" : advisory.level === "Normal" ? "bg-savannah-gold/10 text-savannah-gold" : "bg-sunset-orange/10 text-sunset-orange"}`}>
                      {advisory.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-body">{advisory.message}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Emergency Contacts */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="h-5 w-5 text-destructive" /> Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, i) => (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number.replace(/\s/g, "")}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {contact.type === "Police" && <Shield className="h-4 w-4 text-river-blue" />}
                  {contact.type === "Medical" && <Heart className="h-4 w-4 text-destructive" />}
                  {contact.type === "Wildlife" && <Activity className="h-4 w-4 text-safari-green" />}
                  {contact.type === "Fire" && <Siren className="h-4 w-4 text-sunset-orange" />}
                  {contact.type === "Embassy" && <Globe className="h-4 w-4 text-river-blue" />}
                  {contact.type === "Tourism" && <MapPin className="h-4 w-4 text-savannah-gold" />}
                  <span className="text-xs text-muted-foreground font-body uppercase">{contact.type}</span>
                </div>
                <h3 className="font-body font-semibold text-foreground text-sm mb-1">{contact.name}</h3>
                <p className="font-body text-lg font-bold text-foreground group-hover:text-sunset-orange transition-colors">{contact.number}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{contact.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Safety Tips for Travelers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Wildlife Safety", tips: ["Keep distance from animals", "Stay in vehicle during game drives", "Follow guide instructions", "No flash photography near animals"] },
              { title: "Urban Safety", tips: ["Use registered taxis or ride apps", "Avoid displaying expensive items", "Keep copies of documents", "Use hotel safes for valuables"] },
              { title: "Health Tips", tips: ["Drink bottled water", "Use insect repellent", "Carry basic medications", "Check vaccination requirements"] },
            ].map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                <h3 className="font-display font-semibold text-foreground mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground font-body">
                      <ChevronRight className="h-4 w-4 text-safari-green shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default SafetyPage;
