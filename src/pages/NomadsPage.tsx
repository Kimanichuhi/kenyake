import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wifi, MapPin, Star, Coffee, DollarSign, Calendar, Globe, FileText,
  CreditCard, Plane, Home, Building, Users, MessageSquare, Search,
  CheckCircle, Shield, Smartphone, Landmark, Signal, ThumbsUp,
  Clock, Bed, Bath, Monitor, ChevronRight, ExternalLink, Map
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

import coworkingImg from "@/assets/coworking.jpg";
import destDiani from "@/assets/dest-diani.jpg";
import destLamu from "@/assets/dest-lamu.jpg";
import destMara from "@/assets/dest-mara.jpg";

const visaSteps = [
  { step: 1, title: "Apply Online", desc: "Submit your digital nomad visa application through eTA portal", icon: Globe },
  { step: 2, title: "Documentation", desc: "Proof of income ($2,000+/month), health insurance, clean record", icon: FileText },
  { step: 3, title: "Processing", desc: "Usually 2-5 business days for approval", icon: Clock },
  { step: 4, title: "Arrival", desc: "Present approval at any Kenyan port of entry", icon: Plane },
];

const simGuide = [
  { provider: "Safaricom", type: "Best Coverage", data: "40GB / KES 2,000", speed: "4G/5G in cities", notes: "Most widely accepted for M-Pesa. Get at airport." },
  { provider: "Airtel", type: "Best Value", data: "50GB / KES 1,500", speed: "4G in major towns", notes: "Good data bundles. Limited M-Pesa acceptance." },
  { provider: "Telkom", type: "Budget Option", data: "30GB / KES 1,000", speed: "4G in Nairobi/Mombasa", notes: "Cheapest but limited coverage outside cities." },
];

const bankingGuide = [
  { name: "M-Pesa (Safaricom)", type: "Mobile Money", setup: "Passport + Safaricom SIM at any Safaricom shop", features: ["Pay everywhere", "Send/receive money", "Pay bills", "ATM withdrawal"], time: "30 minutes" },
  { name: "Equity Bank", type: "Bank Account", setup: "Passport + proof of address (hotel booking works)", features: ["USD/KES accounts", "Visa debit card", "Online banking", "International transfers"], time: "1-2 days" },
  { name: "Wise (TransferWise)", type: "International", setup: "Online account + local M-Pesa integration", features: ["Low forex fees", "Multi-currency", "M-Pesa top-up", "Virtual card"], time: "Online, instant" },
];

const costOfLiving = [
  { city: "Nairobi", rent: "KES 40-80K", cowork: "KES 15-25K", meal: "KES 500-1,500", transport: "KES 5-15K", total: "$800-1,500" },
  { city: "Mombasa", rent: "KES 30-60K", cowork: "KES 8-15K", meal: "KES 400-1,200", transport: "KES 4-10K", total: "$600-1,100" },
  { city: "Diani", rent: "KES 50-100K", cowork: "KES 8-18K", meal: "KES 500-1,500", transport: "KES 3-8K", total: "$700-1,400" },
  { city: "Lamu", rent: "KES 25-50K", cowork: "KES 6-8K", meal: "KES 300-1,000", transport: "KES 2-5K", total: "$400-800" },
  { city: "Nanyuki", rent: "KES 20-40K", cowork: "Limited", meal: "KES 300-800", transport: "KES 3-8K", total: "$350-700" },
  { city: "Naivasha", rent: "KES 20-35K", cowork: "Limited", meal: "KES 300-800", transport: "KES 3-6K", total: "$350-650" },
];

const NomadsPage = () => {
  const [coworkingSpaces, setCoworkingSpaces] = useState<any[]>([]);
  const [longStayListings, setLongStayListings] = useState<any[]>([]);
  const [nomadEvents, setNomadEvents] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [internetZones, setInternetZones] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const [spacesRes, listingsRes, eventsRes, forumRes, zonesRes] = await Promise.all([
        supabase.from("coworking_spaces").select("*").order("rating", { ascending: false }),
        supabase.from("long_stay_listings").select("*").order("rating", { ascending: false }),
        supabase.from("nomad_events").select("*").order("event_date", { ascending: true }),
        supabase.from("nomad_forum_posts").select("*").order("upvotes", { ascending: false }),
        supabase.from("internet_zones").select("*").order("speed_mbps", { ascending: false }),
      ]);
      if (spacesRes.data) setCoworkingSpaces(spacesRes.data);
      if (listingsRes.data) setLongStayListings(listingsRes.data);
      if (eventsRes.data) setNomadEvents(eventsRes.data);
      if (forumRes.data) setForumPosts(forumRes.data);
      if (zonesRes.data) setInternetZones(zonesRes.data);
    };
    fetchData();
  }, []);

  const filteredSpaces = coworkingSpaces.filter(s =>
    (cityFilter === "all" || s.city === cityFilter) &&
    (!searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredListings = longStayListings.filter(l =>
    (cityFilter === "all" || l.city === cityFilter) &&
    (!searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cities = [...new Set(coworkingSpaces.map(s => s.city))];

  const reliabilityStars = (score: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Signal key={i} className={`h-3 w-3 ${i < score ? "text-safari-green" : "text-muted-foreground/30"}`} />
    ));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[45vh] overflow-hidden">
          <img src={coworkingImg} alt="Digital nomad working in Kenya" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(30,10%,10%,0.2) 0%, hsla(30,10%,10%,0.85) 100%)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
              <span className="text-sm font-body font-semibold tracking-widest uppercase text-savannah-gold">Work From Africa</span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mt-2 mb-3">
                Digital Nomad Kenya
              </h1>
              <p className="text-primary-foreground/70 font-body max-w-2xl mx-auto text-lg">
                Fast internet, affordable living, weekend safaris, and a thriving nomad community.
                Everything you need to work remotely from East Africa.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {[
                  { icon: Wifi, label: "100+ Mbps" },
                  { icon: DollarSign, label: "$600-1,500/mo" },
                  { icon: Globe, label: "Nomad Visa" },
                  { icon: Users, label: "Active Community" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground text-sm font-body">
                    <Icon className="h-4 w-4 text-savannah-gold" /> {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="coworking" className="space-y-8">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl">
              {[
                { value: "coworking", icon: Wifi, label: "Co-Working" },
                { value: "longstay", icon: Home, label: "Long-Stay" },
                { value: "internet", icon: Signal, label: "Internet Map" },
                { value: "visa", icon: FileText, label: "Visa Guide" },
                { value: "sim", icon: Smartphone, label: "SIM & Banking" },
                { value: "cost", icon: DollarSign, label: "Cost of Living" },
                { value: "events", icon: Calendar, label: "Events" },
                { value: "weekends", icon: Plane, label: "Weekends" },
                { value: "forum", icon: MessageSquare, label: "Forum" },
                { value: "networking", icon: Users, label: "Networking" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="text-xs font-body flex items-center gap-1.5 px-3 py-2">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setCityFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${cityFilter === "all" ? "bg-safari-green text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  All Cities
                </button>
                {cities.map(city => (
                  <button key={city} onClick={() => setCityFilter(city)} className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${cityFilter === city ? "bg-safari-green text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* CO-WORKING TAB */}
            <TabsContent value="coworking">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space, i) => (
                  <motion.div key={space.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                    <div className="h-44 bg-muted relative">
                      {space.cover_image ? <img src={space.cover_image} alt={space.name} className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center"><Wifi className="h-12 w-12 text-muted-foreground/30" /></div>}
                      {space.is_verified && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-safari-green text-primary-foreground text-xs font-body flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {space.has_24hr_access && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-river-blue text-primary-foreground text-xs font-body">24/7</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">{space.name}</h3>
                        <div className="flex items-center gap-1 text-savannah-gold">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-body font-semibold">{space.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />{space.city}{space.county ? `, ${space.county}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground font-body mb-3 line-clamp-2">{space.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full bg-safari-green/10 text-safari-green text-xs font-body font-medium flex items-center gap-1">
                          <Wifi className="h-3 w-3" /> {space.internet_speed_mbps} Mbps
                        </span>
                        {space.internet_backup && (
                          <span className="px-2 py-1 rounded-full bg-river-blue/10 text-river-blue text-xs font-body">Backup</span>
                        )}
                        {space.has_generator && (
                          <span className="px-2 py-1 rounded-full bg-savannah-gold/10 text-savannah-gold text-xs font-body">Generator</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(space.amenities || []).slice(0, 4).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{a}</span>
                        ))}
                        {(space.amenities || []).length > 4 && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">+{space.amenities.length - 4}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <span className="font-body font-bold text-foreground">KES {space.price_per_day?.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground font-body"> / day</span>
                        </div>
                        <div>
                          <span className="font-body font-bold text-foreground">KES {space.price_per_month?.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground font-body"> / month</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredSpaces.length === 0 && (
                <div className="text-center py-16 text-muted-foreground font-body">No coworking spaces found matching your criteria.</div>
              )}
            </TabsContent>

            {/* LONG-STAY TAB */}
            <TabsContent value="longstay">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, i) => (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                    <div className="h-44 bg-muted relative">
                      {listing.cover_image ? <img src={listing.cover_image} alt={listing.name} className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center"><Home className="h-12 w-12 text-muted-foreground/30" /></div>}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-foreground/70 text-primary-foreground text-xs font-body capitalize">{listing.property_type}</span>
                      {listing.has_workspace && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-safari-green text-primary-foreground text-xs font-body flex items-center gap-1">
                          <Monitor className="h-3 w-3" /> Workspace
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">{listing.name}</h3>
                        <div className="flex items-center gap-1 text-savannah-gold">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-body font-semibold">{listing.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />{listing.city}
                      </p>
                      <p className="text-sm text-muted-foreground font-body mb-3 line-clamp-2">{listing.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-body mb-3">
                        {listing.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.bedrooms} bed</span>}
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms} bath</span>
                        {listing.internet_speed_mbps && (
                          <span className="flex items-center gap-1"><Wifi className="h-3 w-3" />{listing.internet_speed_mbps} Mbps</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(listing.amenities || []).slice(0, 4).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{a}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <span className="font-body font-bold text-foreground text-lg">KES {listing.price_per_month?.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground font-body"> / month</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-body">Min {listing.min_stay_months}mo</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredListings.length === 0 && (
                <div className="text-center py-16 text-muted-foreground font-body">No long-stay listings found.</div>
              )}
            </TabsContent>

            {/* INTERNET MAP TAB */}
            <TabsContent value="internet">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Signal className="h-6 w-6 text-safari-green" /> Reliable Internet Zones
                </h2>
                <p className="text-muted-foreground font-body">Community-verified spots with reliable internet across Kenya.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {internetZones.map((zone, i) => (
                  <motion.div key={zone.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{zone.name}</h3>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{zone.city} · {zone.address}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">{zone.zone_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3 mb-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-safari-green/10 text-safari-green text-sm font-body font-bold">
                        <Wifi className="h-3.5 w-3.5" /> {zone.speed_mbps} Mbps
                      </div>
                      <div className="flex items-center gap-0.5">{reliabilityStars(zone.reliability_score)}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                      {zone.provider && <span>📡 {zone.provider}</span>}
                      {zone.is_free && <span className="text-safari-green font-medium">Free WiFi</span>}
                      {zone.has_power && <span>🔌 Power outlets</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* VISA GUIDE TAB */}
            <TabsContent value="visa">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-river-blue" /> Kenya Digital Nomad Visa
                </h2>
                <p className="text-muted-foreground font-body max-w-2xl">
                  Kenya offers a digital nomad-friendly visa for remote workers. Stay for up to 12 months.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {visaSteps.map((step, i) => (
                  <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 text-center">
                    <div className="h-12 w-12 rounded-full gradient-sunset text-primary-foreground font-body font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                      {step.step}
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Requirements Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Valid passport (6+ months validity)",
                    "Proof of remote employment or freelance income",
                    "Minimum income of $2,000/month",
                    "Health insurance covering Kenya",
                    "Clean criminal background",
                    "Return ticket or proof of onward travel",
                    "Accommodation booking in Kenya",
                    "Passport photos (2x)",
                  ].map(req => (
                    <div key={req} className="flex items-center gap-2 text-sm font-body text-foreground">
                      <CheckCircle className="h-4 w-4 text-safari-green shrink-0" /> {req}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <a href="https://evisa.go.ke" target="_blank" rel="noopener noreferrer"
                    className="gradient-safari text-primary-foreground px-8 py-3 rounded-xl font-body font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <ExternalLink className="h-4 w-4" /> Apply on eVisa Portal
                  </a>
                </div>
              </div>
            </TabsContent>

            {/* SIM & BANKING TAB */}
            <TabsContent value="sim">
              <div className="space-y-10">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-safari-green" /> Local SIM Cards
                  </h2>
                  <p className="text-muted-foreground font-body mb-6">Get connected on arrival. All major providers available at JKIA airport.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {simGuide.map((sim, i) => (
                      <motion.div key={sim.provider} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-lg font-semibold text-foreground">{sim.provider}</h3>
                          <Badge variant="secondary" className="text-xs">{sim.type}</Badge>
                        </div>
                        <div className="space-y-2 text-sm font-body">
                          <div className="flex justify-between"><span className="text-muted-foreground">Data bundle</span><span className="text-foreground font-medium">{sim.data}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span className="text-foreground font-medium">{sim.speed}</span></div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground font-body border-t border-border pt-3">{sim.notes}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <Landmark className="h-6 w-6 text-savannah-gold" /> Banking & Payments
                  </h2>
                  <p className="text-muted-foreground font-body mb-6">M-Pesa is king in Kenya. Set it up on day one.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bankingGuide.map((bank, i) => (
                      <motion.div key={bank.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display font-semibold text-foreground">{bank.name}</h3>
                          <Badge variant="outline" className="text-xs">{bank.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-body mb-3">
                          <span className="font-medium text-foreground">Setup:</span> {bank.setup}
                        </p>
                        <div className="space-y-1 mb-3">
                          {bank.features.map(f => (
                            <div key={f} className="flex items-center gap-2 text-xs font-body text-foreground">
                              <CheckCircle className="h-3 w-3 text-safari-green" /> {f}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground font-body pt-3 border-t border-border flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Setup time: {bank.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* COST OF LIVING TAB */}
            <TabsContent value="cost">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-savannah-gold" /> Cost of Living Guide
              </h2>
              <p className="text-muted-foreground font-body mb-6">Monthly costs in USD. 1 USD ≈ KES 130.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="pb-3 font-display font-semibold text-foreground">City</th>
                      <th className="pb-3 font-body text-sm text-muted-foreground"><Home className="h-4 w-4 inline mr-1" />Rent</th>
                      <th className="pb-3 font-body text-sm text-muted-foreground"><Building className="h-4 w-4 inline mr-1" />Co-working</th>
                      <th className="pb-3 font-body text-sm text-muted-foreground"><Coffee className="h-4 w-4 inline mr-1" />Meals/day</th>
                      <th className="pb-3 font-body text-sm text-muted-foreground"><MapPin className="h-4 w-4 inline mr-1" />Transport</th>
                      <th className="pb-3 font-body text-sm font-semibold text-foreground">Total USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costOfLiving.map(c => (
                      <tr key={c.city} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 font-body font-semibold text-foreground">{c.city}</td>
                        <td className="py-4 font-body text-sm text-foreground">{c.rent}</td>
                        <td className="py-4 font-body text-sm text-foreground">{c.cowork}</td>
                        <td className="py-4 font-body text-sm text-foreground">{c.meal}</td>
                        <td className="py-4 font-body text-sm text-foreground">{c.transport}</td>
                        <td className="py-4 font-body text-sm font-bold text-safari-green">{c.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* EVENTS TAB */}
            <TabsContent value="events">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-river-blue" /> Nomad Community Events
              </h2>
              <p className="text-muted-foreground font-body mb-6">Meetups, retreats, and workshops for digital nomads in Kenya.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nomadEvents.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 flex gap-4">
                    <div className="shrink-0 text-center bg-muted rounded-xl px-3 py-2 min-w-[60px]">
                      <span className="text-xs text-muted-foreground font-body uppercase">
                        {new Date(event.event_date).toLocaleDateString("en", { month: "short" })}
                      </span>
                      <div className="font-display text-2xl font-bold text-foreground">
                        {new Date(event.event_date).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-semibold text-foreground">{event.title}</h3>
                        <Badge variant="outline" className="capitalize text-xs shrink-0">{event.event_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-body mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.start_time} - {event.end_time}</span>
                        <span className="font-medium text-savannah-gold">{event.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(event.tags || []).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {nomadEvents.length === 0 && (
                <div className="text-center py-16 text-muted-foreground font-body">No upcoming events. Check back soon!</div>
              )}
            </TabsContent>

            {/* WEEKEND ESCAPES TAB */}
            <TabsContent value="weekends">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Plane className="h-6 w-6 text-savannah-gold" /> Weekend Safari Escapes
              </h2>
              <p className="text-muted-foreground font-body mb-6">Work hard, safari harder. Quick getaways from major cities.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Maasai Mara Weekend", duration: "2 days", from: "Nairobi", price: "$350", image: destMara, highlights: ["Big Five game drives", "Hot air balloon option", "Maasai village visit"] },
                  { title: "Diani Beach Workation", duration: "3-5 days", from: "Nairobi/Mombasa", price: "$200", image: destDiani, highlights: ["Beach + coworking", "Snorkeling & diving", "Seafood dinners"] },
                  { title: "Lamu Island Escape", duration: "4 days", from: "Nairobi (flight)", price: "$280", image: destLamu, highlights: ["UNESCO Old Town", "Dhow sailing", "Swahili cuisine"] },
                ].map((trip, i) => (
                  <motion.div key={trip.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="glass-card overflow-hidden group">
                    <div className="h-48 overflow-hidden">
                      <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{trip.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{trip.duration}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />From {trip.from}</span>
                      </div>
                      <ul className="space-y-1 mb-4">
                        {trip.highlights.map(h => (
                          <li key={h} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                            <ChevronRight className="h-3 w-3 text-safari-green" /> {h}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-body font-bold text-lg text-foreground">From {trip.price}</span>
                        <Link to="/destinations" className="text-sm text-safari-green hover:underline font-body">View →</Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* FORUM TAB */}
            <TabsContent value="forum">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-river-blue" /> Nomad Community Forum
              </h2>
              <p className="text-muted-foreground font-body mb-6">Ask questions, share tips, and connect with fellow nomads in Kenya.</p>
              <div className="space-y-4">
                {forumPosts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0 min-w-[40px]">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-body font-bold text-foreground text-sm">{post.upvotes}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display font-semibold text-foreground">{post.title}</h3>
                          <Badge variant="secondary" className="capitalize text-xs shrink-0">{post.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-body mb-2 line-clamp-2">{post.body}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                          <span className="font-medium text-foreground">{post.author_name}</span>
                          <span>{post.reply_count} replies</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(post.tags || []).map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {forumPosts.length === 0 && (
                <div className="text-center py-16 text-muted-foreground font-body">No forum posts yet. Be the first to start a discussion!</div>
              )}
            </TabsContent>

            {/* NETWORKING TAB */}
            <TabsContent value="networking">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 text-safari-green" /> Professional Networking
              </h2>
              <p className="text-muted-foreground font-body mb-6">Connect with professionals and communities in Kenya's growing tech ecosystem.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Kenya Nomads WhatsApp", members: "2,400+", type: "Community", desc: "Active WhatsApp group for digital nomads in Kenya. Housing tips, meetups, and daily banter.", link: "#", icon: Users },
                  { name: "Nairobi Tech Meetup", members: "5,000+", type: "Tech", desc: "Monthly meetups featuring local startups, tech talks, and networking. Great for freelancers.", link: "#", icon: Monitor },
                  { name: "Kenya Freelancers Network", members: "1,800+", type: "Freelance", desc: "Facebook group connecting freelancers with local and international clients.", link: "#", icon: Globe },
                  { name: "iHub Community", members: "10,000+", type: "Innovation", desc: "Africa's leading tech innovation hub. Events, mentorship, and co-creation opportunities.", link: "#", icon: Building },
                  { name: "Mombasa Digital Creatives", members: "600+", type: "Creative", desc: "Photographers, designers, and content creators on the Kenyan coast.", link: "#", icon: Coffee },
                  { name: "East Africa Startup Slack", members: "3,200+", type: "Startup", desc: "Slack workspace for entrepreneurs building in East Africa. Channels for funding, hiring, and more.", link: "#", icon: MessageSquare },
                ].map((community, i) => (
                  <motion.div key={community.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-safari-green/10 flex items-center justify-center">
                        <community.icon className="h-5 w-5 text-safari-green" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{community.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                          <Badge variant="outline" className="text-xs">{community.type}</Badge>
                          <span>{community.members} members</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-body mb-4">{community.desc}</p>
                    <button className="w-full py-2 rounded-lg border border-border text-sm font-body font-medium text-foreground hover:bg-muted transition-colors">
                      Join Community
                    </button>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default NomadsPage;
