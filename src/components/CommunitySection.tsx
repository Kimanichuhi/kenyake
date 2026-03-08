import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, TrendingUp, Users, Heart } from "lucide-react";

const stats = [
  { icon: Users, value: "50+", label: "Partner Communities" },
  { icon: TrendingUp, value: "$2.4M", label: "Revenue to Communities" },
  { icon: Shield, value: "12,000", label: "Hectares Conserved" },
  { icon: Heart, value: "98%", label: "Traveler Satisfaction" },
];

const CommunitySection = () => (
  <section id="community" className="py-20 lg:py-28 bg-muted/30">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Community Impact</span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">Tourism That Gives Back</h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto">Every booking directly supports local communities, funds conservation, and preserves cultural heritage.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl gradient-safari mb-4">
              <stat.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/community" className="gradient-safari text-primary-foreground rounded-full px-8 py-3 font-body font-semibold text-sm inline-block hover:opacity-90 transition-opacity">
          Explore Community Impact →
        </Link>
      </div>
    </div>
  </section>
);

export default CommunitySection;
