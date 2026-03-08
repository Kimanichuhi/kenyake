import { motion } from "framer-motion";
import { TrendingUp, TreePine, Users, Heart, Award, Share2, Download, Leaf, DollarSign, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const impactStats = [
  { icon: DollarSign, value: "$2,450", label: "Spent with Local Communities", desc: "Direct payments to hosts and guides" },
  { icon: Users, value: "18", label: "Local Businesses Supported", desc: "Lodges, guides, artisans, restaurants" },
  { icon: TreePine, value: "12.5", label: "Hectares Conserved", desc: "Through conservation fund contributions" },
  { icon: Leaf, value: "0.8 tons", label: "Carbon Footprint", desc: "Your trip emissions (offset available)" },
];

const breakdownItems = [
  { category: "Accommodation", amount: "$850", percent: 35, recipients: "3 community-owned lodges" },
  { category: "Guided Experiences", amount: "$620", percent: 25, recipients: "5 local guides" },
  { category: "Food & Dining", amount: "$380", percent: 16, recipients: "8 restaurants and kitchens" },
  { category: "Community Marketplace", amount: "$290", percent: 12, recipients: "12 artisans and cooperatives" },
  { category: "Conservation Fund", amount: "$180", percent: 7, recipients: "2 conservancies" },
  { category: "Transport", amount: "$130", percent: 5, recipients: "2 local drivers" },
];

const ImpactPage = () => {
  const handleShare = () => {
    alert("Impact certificate sharing would open here. This feature generates a shareable image/PDF of your travel impact.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-safari-green/5">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Your Journey Matters</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Your Travel Impact</h1>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              See exactly how your trip supports local communities, funds conservation, and preserves cultural heritage.
            </p>
          </motion.div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {impactStats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl gradient-safari mb-3">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm font-body font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{stat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button onClick={handleShare} className="gradient-sunset text-primary-foreground px-6 py-3 rounded-xl font-body font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Share2 className="h-4 w-4" /> Share Impact Certificate
            </button>
            <button className="border border-border text-foreground px-6 py-3 rounded-xl font-body font-medium text-sm flex items-center gap-2 hover:bg-muted transition-colors">
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
        </div>
      </section>

      {/* Spending Breakdown */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-savannah-gold" /> Where Your Money Went
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {breakdownItems.map((item, i) => (
              <motion.div key={item.category} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-body font-semibold text-foreground">{item.category}</h3>
                    <p className="text-xs text-muted-foreground font-body">{item.recipients}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-foreground">{item.amount}</span>
                    <span className="text-xs text-muted-foreground font-body ml-2">({item.percent}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.percent}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full gradient-safari rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Badge */}
      <section className="py-16 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full gradient-sunset mb-6">
                <Award className="h-12 w-12 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">Responsible Traveler</h2>
              <p className="text-primary-foreground/60 font-body mb-6">
                You've earned the Responsible Traveler badge by booking community-hosted experiences, staying at locally-owned accommodations, and contributing to conservation.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Community Supporter", "Conservation Contributor", "Cultural Ambassador"].map((badge) => (
                  <span key={badge} className="px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-body font-medium">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Carbon Offset */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto glass-card p-8 text-center">
            <Leaf className="h-10 w-10 text-safari-green mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Offset Your Carbon Footprint</h2>
            <p className="text-muted-foreground font-body mb-6">
              Your trip generated approximately 0.8 tons of CO2. Offset it by supporting tree planting in Kenya's forests.
            </p>
            <div className="flex justify-center gap-4">
              <button className="gradient-safari text-primary-foreground px-6 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity">
                Offset for $12
              </button>
              <button className="border border-border text-foreground px-6 py-3 rounded-xl font-body font-medium text-sm hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ImpactPage;
