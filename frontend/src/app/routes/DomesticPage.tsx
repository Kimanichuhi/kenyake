import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, Clock, Users, Bus, Utensils, ChevronRight, Search,
  Wallet, Target, TrendingUp, Award, Phone, Plus, X, Send, Crown,
  GraduationCap, Building2, Church, UserPlus, Calendar, Gift, Coins,
  CheckCircle, ArrowRight, Smartphone, Shield
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const budgetTiers = [
  { key: "all", label: "Zote / All", labelSw: "Zote" },
  { key: "under_5k", label: "Under KES 5,000", labelSw: "Chini ya 5,000" },
  { key: "under_10k", label: "Under KES 10,000", labelSw: "Chini ya 10,000" },
  { key: "under_20k", label: "Under KES 20,000", labelSw: "Chini ya 20,000" },
];

const suitableFor = ["all", "solo", "couple", "family", "friends", "students", "corporate", "church", "school"];

const outingTypes = [
  { key: "general", label: "General / Kawaida", icon: Users },
  { key: "school", label: "School Trip / Safari ya Shule", icon: GraduationCap },
  { key: "corporate", label: "Corporate / Kampuni", icon: Building2 },
  { key: "church", label: "Church / Kanisa", icon: Church },
];

const loyaltyTiers = [
  { key: "safari-starter", label: "Safari Starter", labelSw: "Mwanzo wa Safari", min: 0, color: "bg-muted text-muted-foreground", icon: "🌱" },
  { key: "savanna-explorer", label: "Savanna Explorer", labelSw: "Mtafiti wa Savanna", min: 500, color: "bg-savannah-gold/20 text-savannah-gold", icon: "🦁" },
  { key: "mara-champion", label: "Mara Champion", labelSw: "Bingwa wa Mara", min: 2000, color: "bg-sunset-orange/20 text-sunset-orange", icon: "🏆" },
  { key: "kenya-legend", label: "Kenya Legend", labelSw: "Hadithi ya Kenya", min: 5000, color: "bg-safari-green/20 text-safari-green", icon: "👑" },
];

const DomesticPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedFor, setSelectedFor] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showOutingForm, setShowOutingForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [showMpesa, setShowMpesa] = useState<string | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("07");
  const [mpesaAmount, setMpesaAmount] = useState("");

  const [outingForm, setOutingForm] = useState({
    title: "", outing_type: "general", destination: "", start_date: "",
    end_date: "", group_size: 10, budget_per_person: 0, description: ""
  });

  const [savingsForm, setSavingsForm] = useState({
    title: "", target_amount: 0, target_date: "", destination: "",
    installment_amount: 0, installment_frequency: "monthly"
  });

  // Queries
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["budget-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budget_packages").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("price_kes");
      if (error) throw error;
      return data;
    },
  });

  const { data: savingsGoals = [], refetch: refetchGoals } = useQuery({
    queryKey: ["savings-goals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("savings_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: loyaltyAccount, refetch: refetchLoyalty } = useQuery({
    queryKey: ["loyalty-account", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("loyalty_accounts").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myOutings = [] } = useQuery({
    queryKey: ["my-outings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("group_outings").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = packages.filter((p: any) => {
    const matchTier = selectedTier === "all" || p.budget_tier === selectedTier;
    const matchFor = selectedFor === "all" || (p.suitable_for || []).includes(selectedFor);
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.destination.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchFor && matchSearch;
  });

  // Handlers
  const handleCreateOuting = async () => {
    if (!user) { toast({ title: "Ingia kwanza / Sign in first", variant: "destructive" }); return; }
    if (!outingForm.title || !outingForm.start_date) return;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("group_outings").insert({
      ...outingForm,
      organizer_id: user.id,
      total_budget: outingForm.budget_per_person * outingForm.group_size,
      invite_code: inviteCode,
    });
    if (error) { toast({ title: "Hitilafu / Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Imeundwa! / Created!", description: `Invite code: ${inviteCode}` });
    setShowOutingForm(false);
    setOutingForm({ title: "", outing_type: "general", destination: "", start_date: "", end_date: "", group_size: 10, budget_per_person: 0, description: "" });
    queryClient.invalidateQueries({ queryKey: ["my-outings"] });
  };

  const handleCreateSavings = async () => {
    if (!user) { toast({ title: "Ingia kwanza / Sign in first", variant: "destructive" }); return; }
    if (!savingsForm.title || !savingsForm.target_amount) return;
    const { error } = await supabase.from("savings_goals").insert({ ...savingsForm, user_id: user.id });
    if (error) { toast({ title: "Hitilafu / Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lengo limeundwa! / Goal created!" });
    setShowSavingsForm(false);
    setSavingsForm({ title: "", target_amount: 0, target_date: "", destination: "", installment_amount: 0, installment_frequency: "monthly" });
    refetchGoals();
  };

  const handleMpesaPayment = (context: string) => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast({ title: "Nambari batili / Invalid number", variant: "destructive" });
      return;
    }
    toast({
      title: "📱 M-Pesa STK Push Imetumwa / Sent",
      description: `Angalia simu yako ${mpesaPhone} kupitisha malipo ya KES ${mpesaAmount}. Check your phone to approve.`,
    });
    setShowMpesa(null);
    setMpesaPhone("07");
    setMpesaAmount("");
  };

  const handleJoinLoyalty = async () => {
    if (!user) { toast({ title: "Ingia kwanza / Sign in first", variant: "destructive" }); return; }
    const { error } = await supabase.from("loyalty_accounts").insert({ user_id: user.id });
    if (error && error.code !== "23505") { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "🎉 Karibu! / Welcome!", description: "You've joined Safari Rewards. Earn points on every trip!" });
    refetchLoyalty();
  };

  const currentTier = loyaltyTiers.find(t => t.key === (loyaltyAccount?.tier || "safari-starter")) || loyaltyTiers[0];
  const nextTier = loyaltyTiers[loyaltyTiers.indexOf(currentTier) + 1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Tembea Kenya 🇰🇪</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
              Domestic Travel / Safari za Ndani
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Budget-friendly packages, group coordination, M-Pesa payments, savings goals, and loyalty rewards — all designed for Kenyan travelers. <span className="text-safari-green">Kwa wasafiri wa Kenya.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-6">
              <TabsTrigger value="packages" className="text-xs flex-1 min-w-[80px]"><MapPin className="h-3 w-3 mr-1" />Packages / Vifurushi</TabsTrigger>
              <TabsTrigger value="groups" className="text-xs flex-1 min-w-[80px]"><Users className="h-3 w-3 mr-1" />Groups / Vikundi</TabsTrigger>
              <TabsTrigger value="savings" className="text-xs flex-1 min-w-[80px]"><Target className="h-3 w-3 mr-1" />Savings / Akiba</TabsTrigger>
              <TabsTrigger value="rewards" className="text-xs flex-1 min-w-[80px]"><Award className="h-3 w-3 mr-1" />Rewards / Tuzo</TabsTrigger>
            </TabsList>

            {/* PACKAGES TAB */}
            <TabsContent value="packages">
              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="max-w-xl mx-auto flex items-center gap-3 glass-card px-4 py-3">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input type="text" placeholder="Tafuta safari / Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {budgetTiers.map((t) => (
                    <button key={t.key} onClick={() => setSelectedTier(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedTier === t.key ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                      <Wallet className="h-3 w-3 inline mr-1" />{t.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {suitableFor.map((s) => (
                    <button key={s} onClick={() => setSelectedFor(s)} className={`px-2.5 py-1 rounded-full text-xs font-body font-medium capitalize transition-all ${selectedFor === s ? "bg-savannah-gold text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                      {s === "all" ? "Wote / All" : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-72 animate-pulse bg-muted/50" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((pkg: any, i: number) => (
                    <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => setSelectedPackage(pkg)} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer group">
                      <div className="relative h-44 bg-muted overflow-hidden">
                        {pkg.cover_image ? (
                          <img src={pkg.cover_image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-safari-green/20 to-savannah-gold/20">
                            <MapPin className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-body font-bold bg-safari-green text-primary-foreground">
                            KES {pkg.price_kes.toLocaleString()}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 flex gap-1">
                          {pkg.transport_included && <span className="px-1.5 py-0.5 rounded-full text-xs bg-card/90 backdrop-blur">🚌</span>}
                          {pkg.meals_included && <span className="px-1.5 py-0.5 rounded-full text-xs bg-card/90 backdrop-blur">🍽</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-base font-semibold text-foreground mb-0.5">{pkg.title}</h3>
                        {pkg.title_sw && <p className="text-xs text-safari-green font-body italic mb-1">{pkg.title_sw}</p>}
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" />{pkg.destination} · <Clock className="h-3 w-3" />{pkg.duration_days} siku/day{pkg.duration_days > 1 ? "s" : ""}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-savannah-gold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-body font-semibold">{Number(pkg.rating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({pkg.review_count})</span>
                          </div>
                          <div className="flex gap-1">
                            {(pkg.suitable_for || []).slice(0, 3).map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 rounded-full bg-muted text-xs font-body capitalize">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* GROUPS TAB */}
            <TabsContent value="groups">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Group Travel / Safari za Vikundi</h2>
                  <p className="text-sm text-muted-foreground font-body">Coordinate school trips, corporate retreats, church outings & friend groups. Split costs via M-Pesa.</p>
                </div>
                {user && (
                  <button onClick={() => setShowOutingForm(!showOutingForm)} className="gradient-safari text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Unda Kikundi / Create Group
                  </button>
                )}
              </div>

              {showOutingForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {outingTypes.map((t) => (
                      <button key={t.key} onClick={() => setOutingForm({ ...outingForm, outing_type: t.key })} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium flex items-center gap-1.5 ${outingForm.outing_type === t.key ? "gradient-sunset text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <t.icon className="h-3 w-3" />{t.label}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Trip name / Jina la safari *" value={outingForm.title} onChange={(e) => setOutingForm({ ...outingForm, title: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="text" placeholder="Destination / Mahali" value={outingForm.destination} onChange={(e) => setOutingForm({ ...outingForm, destination: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <textarea placeholder="Description / Maelezo" value={outingForm.description} onChange={(e) => setOutingForm({ ...outingForm, description: e.target.value })} rows={2} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none resize-none focus:ring-2 focus:ring-primary" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground font-body">Start / Kuanza</label><input type="date" value={outingForm.start_date} onChange={(e) => setOutingForm({ ...outingForm, start_date: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                    <div><label className="text-xs text-muted-foreground font-body">End / Mwisho</label><input type="date" value={outingForm.end_date} onChange={(e) => setOutingForm({ ...outingForm, end_date: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                    <div><label className="text-xs text-muted-foreground font-body">Group Size / Idadi</label><input type="number" value={outingForm.group_size} onChange={(e) => setOutingForm({ ...outingForm, group_size: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                    <div><label className="text-xs text-muted-foreground font-body">Budget/Person (KES)</label><input type="number" value={outingForm.budget_per_person || ""} onChange={(e) => setOutingForm({ ...outingForm, budget_per_person: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                  </div>
                  {outingForm.budget_per_person > 0 && outingForm.group_size > 0 && (
                    <p className="text-xs font-body text-safari-green">Jumla / Total: KES {(outingForm.budget_per_person * outingForm.group_size).toLocaleString()}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleCreateOuting} className="gradient-safari text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium">Unda / Create</button>
                    <button onClick={() => setShowOutingForm(false)} className="px-4 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted">Ghairi / Cancel</button>
                  </div>
                </motion.div>
              )}

              {/* My Outings */}
              {myOutings.length > 0 ? (
                <div className="space-y-4">
                  {myOutings.map((o: any) => (
                    <div key={o.id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-xs font-body capitalize bg-muted text-muted-foreground">{o.outing_type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-body capitalize ${o.status === "planning" ? "bg-savannah-gold/10 text-savannah-gold" : o.status === "confirmed" ? "bg-safari-green/10 text-safari-green" : "bg-muted text-muted-foreground"}`}>{o.status}</span>
                          </div>
                          <h3 className="font-display font-semibold text-foreground">{o.title}</h3>
                          <p className="text-xs text-muted-foreground font-body">{o.destination} · {o.group_size} people · {new Date(o.start_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-body font-bold text-foreground">KES {(o.total_budget || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground font-body">KES {(o.budget_per_person || 0).toLocaleString()}/person</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <span className="text-xs font-body text-muted-foreground">Invite code:</span>
                        <span className="px-2 py-0.5 rounded bg-muted text-foreground font-mono text-sm font-bold">{o.invite_code}</span>
                        <button onClick={() => { setShowMpesa(o.id); setMpesaAmount(String(o.budget_per_person || 0)); }} className="ml-auto text-xs font-body text-safari-green hover:underline flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> Collect via M-Pesa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showOutingForm && (
                  <div className="glass-card p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-body text-muted-foreground">{user ? "No group outings yet. Create one to start coordinating!" : "Ingia ili kuunda kikundi / Sign in to create a group outing."}</p>
                  </div>
                )
              )}
            </TabsContent>

            {/* SAVINGS TAB */}
            <TabsContent value="savings">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Trip Savings / Akiba ya Safari</h2>
                  <p className="text-sm text-muted-foreground font-body">Save toward your dream trip in installments via M-Pesa. Weka akiba kidogo kidogo.</p>
                </div>
                {user && (
                  <button onClick={() => setShowSavingsForm(!showSavingsForm)} className="gradient-sunset text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" /> Lengo Jipya / New Goal
                  </button>
                )}
              </div>

              {showSavingsForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 space-y-3">
                  <input type="text" placeholder="Goal name / Jina la lengo *" value={savingsForm.title} onChange={(e) => setSavingsForm({ ...savingsForm, title: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="text" placeholder="Destination / Mahali pa kwenda" value={savingsForm.destination} onChange={(e) => setSavingsForm({ ...savingsForm, destination: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground font-body">Target (KES)</label><input type="number" value={savingsForm.target_amount || ""} onChange={(e) => setSavingsForm({ ...savingsForm, target_amount: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                    <div><label className="text-xs text-muted-foreground font-body">Installment (KES)</label><input type="number" value={savingsForm.installment_amount || ""} onChange={(e) => setSavingsForm({ ...savingsForm, installment_amount: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                    <div><label className="text-xs text-muted-foreground font-body">Frequency</label>
                      <select value={savingsForm.installment_frequency} onChange={(e) => setSavingsForm({ ...savingsForm, installment_frequency: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none">
                        <option value="weekly">Kila wiki / Weekly</option>
                        <option value="biweekly">Wiki 2 / Biweekly</option>
                        <option value="monthly">Kila mwezi / Monthly</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-muted-foreground font-body">Target Date</label><input type="date" value={savingsForm.target_date} onChange={(e) => setSavingsForm({ ...savingsForm, target_date: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none" /></div>
                  </div>
                  {savingsForm.target_amount > 0 && savingsForm.installment_amount > 0 && (
                    <p className="text-xs font-body text-safari-green">
                      ≈ {Math.ceil(savingsForm.target_amount / savingsForm.installment_amount)} installments to reach your goal
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleCreateSavings} className="gradient-sunset text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium">Unda Lengo / Create Goal</button>
                    <button onClick={() => setShowSavingsForm(false)} className="px-4 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted">Cancel</button>
                  </div>
                </motion.div>
              )}

              {/* Savings Goals List */}
              {savingsGoals.length > 0 ? (
                <div className="space-y-4">
                  {savingsGoals.map((goal: any) => {
                    const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100)) : 0;
                    return (
                      <div key={goal.id} className="glass-card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{goal.title}</h3>
                            <p className="text-xs text-muted-foreground font-body">{goal.destination}{goal.target_date ? ` · Target: ${new Date(goal.target_date).toLocaleDateString()}` : ""}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-body capitalize ${goal.status === "active" ? "bg-safari-green/10 text-safari-green" : goal.status === "completed" ? "bg-savannah-gold/10 text-savannah-gold" : "bg-muted text-muted-foreground"}`}>{goal.status}</span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs font-body mb-1">
                            <span className="text-muted-foreground">KES {(goal.saved_amount || 0).toLocaleString()} saved</span>
                            <span className="text-foreground font-semibold">KES {goal.target_amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-safari-green to-savannah-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground font-body mt-1">{pct}% — {goal.installment_amount ? `KES ${goal.installment_amount.toLocaleString()} ${goal.installment_frequency}` : ""}</p>
                        </div>
                        <button onClick={() => { setShowMpesa(goal.id); setMpesaAmount(String(goal.installment_amount || 1000)); }} className="text-xs font-body text-safari-green hover:underline flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> Deposit via M-Pesa / Weka Akiba
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !showSavingsForm && (
                  <div className="glass-card p-8 text-center">
                    <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-body text-muted-foreground">{user ? "Huna malengo bado. Anza kuweka akiba! / No goals yet. Start saving!" : "Sign in to create savings goals."}</p>
                  </div>
                )
              )}
            </TabsContent>

            {/* REWARDS TAB */}
            <TabsContent value="rewards">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Safari Rewards / Tuzo za Safari</h2>
              <p className="text-sm text-muted-foreground font-body mb-6">Earn points on every domestic trip. Redeem for discounts, upgrades, and free experiences. Pata pointi kwa kila safari.</p>

              {!user ? (
                <div className="glass-card p-8 text-center">
                  <Award className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">Ingia ili kujiunga na Safari Rewards / Sign in to join.</p>
                </div>
              ) : !loyaltyAccount ? (
                <div className="glass-card p-8 text-center">
                  <Award className="h-12 w-12 text-savannah-gold mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Join Safari Rewards / Jiunge na Tuzo</h3>
                  <p className="text-sm text-muted-foreground font-body mb-4 max-w-md mx-auto">Earn 10 points per KES 1,000 spent. Unlock tiers, get discounts, and enjoy exclusive perks.</p>
                  <button onClick={handleJoinLoyalty} className="gradient-sunset text-primary-foreground px-6 py-3 rounded-lg font-body font-medium text-sm">
                    <Gift className="h-4 w-4 inline mr-2" /> Jiunge Sasa / Join Now — It's Free!
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{currentTier.icon}</span>
                      <div>
                        <p className="text-xs text-muted-foreground font-body uppercase">Your Tier / Kiwango Chako</p>
                        <h3 className="font-display text-xl font-bold text-foreground">{currentTier.label}</h3>
                        <p className="text-xs text-safari-green font-body italic">{currentTier.labelSw}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-display text-3xl font-bold text-savannah-gold">{loyaltyAccount.points}</p>
                        <p className="text-xs text-muted-foreground font-body">Pointi / Points</p>
                      </div>
                    </div>

                    {nextTier && (
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span className="text-muted-foreground">{currentTier.label}</span>
                          <span className="text-foreground">{nextTier.label} ({nextTier.min} pts)</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-savannah-gold to-sunset-orange rounded-full" style={{ width: `${Math.min(100, (loyaltyAccount.points / nextTier.min) * 100)}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground font-body mt-1">{nextTier.min - loyaltyAccount.points} points to next tier</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div className="text-center"><p className="font-display text-lg font-bold text-foreground">{loyaltyAccount.total_trips}</p><p className="text-xs text-muted-foreground font-body">Safari / Trips</p></div>
                      <div className="text-center"><p className="font-display text-lg font-bold text-foreground">KES {(loyaltyAccount.total_spent_kes || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground font-body">Jumla / Total Spent</p></div>
                      <div className="text-center"><p className="font-display text-lg font-bold text-foreground">{new Date(loyaltyAccount.member_since).toLocaleDateString()}</p><p className="text-xs text-muted-foreground font-body">Tangu / Since</p></div>
                    </div>
                  </div>

                  {/* Tier Overview */}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">Reward Tiers / Viwango vya Tuzo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {loyaltyTiers.map((t) => (
                        <div key={t.key} className={`glass-card p-4 ${t.key === currentTier.key ? "ring-2 ring-savannah-gold" : ""}`}>
                          <div className="text-2xl mb-2">{t.icon}</div>
                          <h4 className="font-body font-semibold text-foreground text-sm">{t.label}</h4>
                          <p className="text-xs text-safari-green font-body italic mb-2">{t.labelSw}</p>
                          <p className="text-xs text-muted-foreground font-body">{t.min}+ points</p>
                          {t.key === currentTier.key && <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-body bg-savannah-gold/20 text-savannah-gold">Wewe hapa / You're here</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How to Earn */}
                  <div className="glass-card p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">Jinsi ya Kupata Pointi / How to Earn</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { action: "Book a trip package / Agiza safari", points: "10 pts per KES 1,000" },
                        { action: "Write a review / Andika tathmini", points: "50 pts" },
                        { action: "Refer a friend / Alika rafiki", points: "100 pts" },
                        { action: "Complete a savings goal / Maliza lengo", points: "200 pts" },
                        { action: "Organize a group trip / Panga safari ya kikundi", points: "150 pts" },
                        { action: "Share on social media / Shiriki mitandaoni", points: "25 pts" },
                      ].map((item) => (
                        <div key={item.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="text-sm font-body text-foreground">{item.action}</span>
                          <span className="text-xs font-body font-semibold text-savannah-gold">{item.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Package Detail Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedPackage(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-body font-bold bg-safari-green text-primary-foreground">KES {selectedPackage.price_kes.toLocaleString()}</span>
                    <h2 className="font-display text-2xl font-bold text-foreground mt-2">{selectedPackage.title}</h2>
                    {selectedPackage.title_sw && <p className="text-sm text-safari-green font-body italic">{selectedPackage.title_sw}</p>}
                    <p className="text-sm text-muted-foreground font-body mt-1 flex items-center gap-2"><MapPin className="h-3 w-3" />{selectedPackage.destination} · <Clock className="h-3 w-3" />{selectedPackage.duration_days} days</p>
                  </div>
                  <button onClick={() => setSelectedPackage(null)} className="p-2 hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
                </div>

                <p className="text-sm font-body text-muted-foreground mb-4">{selectedPackage.description}</p>
                {selectedPackage.description_sw && <p className="text-sm font-body text-safari-green/80 italic mb-4">{selectedPackage.description_sw}</p>}

                {/* Includes */}
                <div className="mb-4">
                  <h4 className="font-body font-semibold text-foreground text-sm mb-2">Inajumuisha / Includes:</h4>
                  <div className="flex flex-wrap gap-1.5">{(selectedPackage.includes || []).map((i: string) => <span key={i} className="px-2 py-0.5 rounded-full bg-safari-green/10 text-safari-green text-xs font-body">{i}</span>)}</div>
                </div>

                {/* Itinerary */}
                {selectedPackage.itinerary && (selectedPackage.itinerary as any[]).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-body font-semibold text-foreground text-sm mb-2">Ratiba / Itinerary:</h4>
                    <div className="space-y-3">
                      {(selectedPackage.itinerary as any[]).map((day: any, di: number) => (
                        <div key={di} className="glass-card p-3">
                          <h5 className="font-body font-semibold text-foreground text-sm mb-1.5">Siku {day.day} / Day {day.day}: {day.title}</h5>
                          <ul className="space-y-1">{(day.activities || []).map((a: string, ai: number) => <li key={ai} className="text-xs text-muted-foreground font-body flex items-start gap-1.5"><ChevronRight className="h-3 w-3 text-safari-green shrink-0 mt-0.5" />{a}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suitable For */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs font-body text-muted-foreground">Inafaa kwa / Suitable for:</span>
                  {(selectedPackage.suitable_for || []).map((s: string) => <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body capitalize">{s}</span>)}
                </div>

                {/* Book / Pay */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button onClick={() => { setShowMpesa(selectedPackage.id); setMpesaAmount(String(selectedPackage.price_kes)); }} className="flex-1 gradient-safari text-primary-foreground py-3 rounded-lg font-body font-medium text-sm flex items-center justify-center gap-2">
                    <Smartphone className="h-4 w-4" /> Lipa na M-Pesa / Pay with M-Pesa
                  </button>
                  <button onClick={() => { setShowSavingsForm(true); setSavingsForm({ ...savingsForm, title: `Save for ${selectedPackage.title}`, target_amount: selectedPackage.price_kes, destination: selectedPackage.destination }); setSelectedPackage(null); }} className="flex-1 border border-border text-foreground py-3 rounded-lg font-body font-medium text-sm flex items-center justify-center gap-2">
                    <Target className="h-4 w-4" /> Weka Akiba / Save for It
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* M-Pesa Modal */}
      <AnimatePresence>
        {showMpesa && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowMpesa(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-xl max-w-sm w-full border border-border">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-safari-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-safari-green" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">M-Pesa Payment</h3>
                <p className="text-sm text-muted-foreground font-body mb-4">Lipa Kupitia M-Pesa</p>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-xs font-body text-muted-foreground">Nambari ya Simu / Phone Number</label>
                    <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712345678" className="w-full bg-transparent border border-border rounded-lg px-3 py-3 text-lg font-body font-bold text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-safari-green text-center" />
                  </div>
                  <div>
                    <label className="text-xs font-body text-muted-foreground">Kiasi / Amount (KES)</label>
                    <input type="number" value={mpesaAmount} onChange={(e) => setMpesaAmount(e.target.value)} className="w-full bg-transparent border border-border rounded-lg px-3 py-3 text-lg font-body font-bold text-foreground outline-none focus:ring-2 focus:ring-safari-green text-center" />
                  </div>
                </div>

                <button onClick={() => handleMpesaPayment("payment")} className="w-full gradient-safari text-primary-foreground py-3 rounded-lg font-body font-bold text-sm mt-4 flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Tuma STK Push / Send Payment Request
                </button>
                <button onClick={() => setShowMpesa(null)} className="w-full text-muted-foreground py-2 text-sm font-body mt-2">Ghairi / Cancel</button>
                <p className="text-xs text-muted-foreground font-body mt-3 flex items-center justify-center gap-1"><Shield className="h-3 w-3" /> Secure M-Pesa Lipa Na transaction</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection />
    </div>
  );
};

export default DomesticPage;
