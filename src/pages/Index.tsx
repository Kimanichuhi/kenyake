import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Utensils, Compass, Shield, Wifi, BookOpen, Award, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import WildlifeSection from "@/components/WildlifeSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";

const quickLinks = [
  { icon: Users, label: "Local Guides", href: "/guides", color: "gradient-safari" },
  { icon: BookOpen, label: "Cultural Events", href: "/events", color: "gradient-sunset" },
  { icon: Utensils, label: "Food & Dining", href: "/food", color: "gradient-safari" },
  { icon: Wifi, label: "Digital Nomads", href: "/nomads", color: "gradient-sunset" },
  { icon: Shield, label: "Safety", href: "/safety", color: "gradient-safari" },
  { icon: Award, label: "Your Impact", href: "/impact", color: "gradient-sunset" },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />

    {/* Quick Access */}
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={link.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background transition-colors group">
                <div className={`h-12 w-12 rounded-xl ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-body font-medium text-foreground text-center">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <DestinationsSection />
    <ExperiencesSection />
    <WildlifeSection />
    <CommunitySection />

    {/* CTA Section */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Compass className="h-12 w-12 text-sunset-orange mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Explore Kenya?</h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-8">
            Create your profile to get personalized recommendations, save destinations, and track your travel impact.
          </p>
          <Link to="/onboard" className="gradient-sunset text-primary-foreground px-10 py-4 rounded-full font-body font-semibold inline-block hover:opacity-90 transition-opacity">
            Start Your Journey →
          </Link>
        </motion.div>
      </div>
    </section>

    <FooterSection />
  </div>
);

export default Index;
