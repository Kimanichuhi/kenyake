import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, TrendingUp, Users, Heart, MapPin, ShoppingBag, HandHeart, TreePine, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";

import communityMarket from "@/assets/community-market.jpg";
import expBeadwork from "@/assets/exp-beadwork.jpg";
import expCooking from "@/assets/exp-cooking.jpg";

const imageMap: Record<string, string> = {
  "/exp-beadwork.jpg": expBeadwork,
  "/community-market.jpg": communityMarket,
  "/exp-cooking.jpg": expCooking,
};

const stats = [
  { icon: Users, value: "50+", label: "Partner Communities", desc: "Across all 47 counties" },
  { icon: TrendingUp, value: "$2.4M", label: "Revenue Generated", desc: "Directly to local families" },
  { icon: Shield, value: "12,000", label: "Hectares Conserved", desc: "Through community conservancies" },
  { icon: Heart, value: "98%", label: "Satisfaction Rate", desc: "From travelers worldwide" },
];

const products = [
  { name: "Maasai Beaded Necklace", price: "$28", artisan: "Narok Women's Collective", image: expBeadwork },
  { name: "Hand-Carved Wooden Bowl", price: "$45", artisan: "Lamu Artisans Guild", image: communityMarket },
  { name: "Organic Kenyan Coffee (250g)", price: "$18", artisan: "Nyeri Coffee Cooperative", image: expCooking },
];

const CommunityPage = () => {
  const { data: communities = [] } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[40vh] overflow-hidden">
          <img src={communityMarket} alt="Kenyan community marketplace" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(30,10%,10%,0.3) 0%, hsla(30,10%,10%,0.8) 100%)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
              <span className="text-sm font-body font-semibold tracking-widest uppercase text-savannah-gold">Community Impact</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mt-2 mb-3">Tourism That Gives Back</h1>
              <p className="text-primary-foreground/70 font-body max-w-xl mx-auto">
                Every booking supports local communities, preserves cultural heritage, and funds conservation across Kenya.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl gradient-safari mb-4">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm font-body font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Communities from DB */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Partner Communities</h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">Meet the communities that make Kenya's tourism authentic, sustainable, and transformative. Click to explore their full cultural profile.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communities.map((c: any, i: number) => {
              const img = c.hero_image ? imageMap[c.hero_image] || communityMarket : communityMarket;
              const capacityPct = c.max_daily_visitors ? Math.round(((c.current_visitor_count || 0) / c.max_daily_visitors) * 100) : 0;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/community/${c.slug}`} className="glass-card overflow-hidden block group hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                    <div className="h-48 overflow-hidden relative">
                      <img src={img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <Badge className="absolute top-3 right-3 gradient-safari text-primary-foreground border-0 text-xs">
                        {capacityPct >= 100 ? "Full Today" : "Accepting Visitors"}
                      </Badge>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center justify-between">
                        {c.name}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </h3>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" />{c.county}</p>
                      <p className="text-sm text-muted-foreground font-body mb-3 line-clamp-2">{c.description}</p>
                      {/* Capacity bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-1">
                          <span>Visitor Capacity</span>
                          <span>{c.current_visitor_count || 0}/{c.max_daily_visitors}</span>
                        </div>
                        <Progress value={capacityPct} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Users className="h-3 w-3" />{c.population?.toLocaleString() || "—"} members</span>
                        <span className="text-xs font-body font-medium text-safari-green">{c.specialty}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Marketplace */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3"><ShoppingBag className="h-5 w-5 text-sunset-orange" /><span className="text-sm font-body font-semibold tracking-widest uppercase text-sunset-orange">Community Marketplace</span></div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Shop Authentic Kenyan Crafts</h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">Handmade products directly from local artisans. Every purchase supports families and preserves traditional craftsmanship.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden group cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="h-52 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-body mb-2">By {p.artisan}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-body font-bold text-foreground">{p.price}</span>
                    <button className="gradient-sunset text-primary-foreground rounded-full px-4 py-1.5 text-xs font-body font-medium hover:opacity-90 transition-opacity">Add to Cart</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">How Your Trip Creates Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: HandHeart, title: "Direct Income", desc: "80% of your booking goes directly to community hosts and local guides — no middlemen." },
              { icon: TreePine, title: "Conservation", desc: "5% of every booking funds habitat restoration and anti-poaching patrols in partner conservancies." },
              { icon: Shield, title: "Heritage Preservation", desc: "Revenue supports cultural programs, language preservation, and intergenerational knowledge transfer." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card-dark p-6 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-sunset mb-4">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/60 font-body text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default CommunityPage;
