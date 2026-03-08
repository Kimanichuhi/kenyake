import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Binoculars, Bird, MapPin, Clock, AlertTriangle, Camera, Shield,
  Loader2, RefreshCw, Eye, Zap, TrendingUp, Users, ChevronRight,
  Plus, Send, X
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const speciesEmoji: Record<string, string> = {
  lion: "🦁", leopard: "🐆", elephant: "🐘", buffalo: "🦬", rhino: "🦏",
  cheetah: "🐆", giraffe: "🦒", zebra: "🦓", hippo: "🦛", bird: "🦅", other: "🐾"
};

const makeIcon = (emoji: string, bg: string) => new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:${bg};width:30px;height:30px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:16px;">${emoji}</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15],
});

type Tab = "feed" | "species" | "migration" | "bigfive" | "birding" | "parks";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "feed", label: "Live Feed", icon: <Zap className="h-4 w-4" /> },
  { key: "species", label: "Species", icon: <Eye className="h-4 w-4" /> },
  { key: "migration", label: "Migration", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "bigfive", label: "Big Five", icon: <Binoculars className="h-4 w-4" /> },
  { key: "birding", label: "Birding", icon: <Bird className="h-4 w-4" /> },
  { key: "parks", label: "Parks", icon: <MapPin className="h-4 w-4" /> },
];

const congestionColors: Record<string, string> = {
  low: "bg-primary text-primary-foreground",
  moderate: "bg-secondary text-secondary-foreground",
  high: "bg-accent text-accent-foreground",
  very_high: "bg-destructive text-destructive-foreground",
};

const WildlifeIntelPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [loading, setLoading] = useState(false);
  const [sightings, setSightings] = useState<any[]>([]);
  const [speciesData, setSpeciesData] = useState<any>(null);
  const [migrationData, setMigrationData] = useState<any>(null);
  const [bigFiveData, setBigFiveData] = useState<any>(null);
  const [birdingData, setBirdingData] = useState<any>(null);
  const [parksData, setParksData] = useState<any>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ species: "", location_name: "", lat: "", lng: "", park_name: "", description: "", animal_count: "1", behavior: "", species_category: "other" });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch live sightings
  const fetchSightings = useCallback(async () => {
    const { data } = await supabase
      .from("wildlife_sightings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setSightings(data);
  }, []);

  useEffect(() => { fetchSightings(); }, [fetchSightings]);

  // Realtime sightings
  useEffect(() => {
    const channel = supabase
      .channel("wildlife-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wildlife_sightings" }, (payload) => {
        setSightings((prev) => [payload.new as any, ...prev]);
        toast({ title: "🐾 New Sighting!", description: `${(payload.new as any).species} spotted at ${(payload.new as any).location_name}` });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  // AI data fetcher
  const fetchAI = useCallback(async (queryType: string, setter: (d: any) => void, extra?: Record<string, string>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("wildlife-intel", {
        body: { queryType, ...extra },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setter(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load data on tab switch
  useEffect(() => {
    if (activeTab === "species" && !speciesData) fetchAI("species_tracking", setSpeciesData);
    if (activeTab === "migration" && !migrationData) fetchAI("migration", setMigrationData);
    if (activeTab === "bigfive" && !bigFiveData) fetchAI("big_five", setBigFiveData);
    if (activeTab === "birding" && !birdingData) fetchAI("birding", setBirdingData);
    if (activeTab === "parks" && !parksData) fetchAI("park_intel", setParksData);
  }, [activeTab, speciesData, migrationData, bigFiveData, birdingData, parksData, fetchAI]);

  const submitSighting = async () => {
    if (!user) { toast({ title: "Sign in required", description: "Please sign in to report sightings", variant: "destructive" }); return; }
    if (!reportForm.species || !reportForm.location_name) { toast({ title: "Missing fields", description: "Species and location are required", variant: "destructive" }); return; }
    const { error } = await supabase.from("wildlife_sightings").insert({
      user_id: user.id,
      species: reportForm.species,
      species_category: reportForm.species_category,
      location_name: reportForm.location_name,
      lat: parseFloat(reportForm.lat) || -1.5,
      lng: parseFloat(reportForm.lng) || 37.0,
      park_name: reportForm.park_name || null,
      description: reportForm.description || null,
      animal_count: parseInt(reportForm.animal_count) || 1,
      behavior: reportForm.behavior || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Sighting reported! 🎉", description: "Your sighting is now live on the feed" });
    setShowReportForm(false);
    setReportForm({ species: "", location_name: "", lat: "", lng: "", park_name: "", description: "", animal_count: "1", behavior: "", species_category: "other" });
  };

  const timeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="gradient-safari px-4 py-10">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Binoculars className="h-5 w-5 text-primary-foreground" />
                <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">AI-Powered Wildlife Intelligence</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
                Wildlife & Nature <span className="text-savannah-gold">Intelligence</span>
              </h1>
              <p className="text-primary-foreground/70 text-sm max-w-lg mx-auto">
                Live sightings, species tracking, migration predictions, Big Five probability maps, and park intelligence.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-16 z-30 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {loading && (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm font-medium">AI is analyzing wildlife data...</p>
            </div>
          )}

          {/* LIVE FEED TAB */}
          {activeTab === "feed" && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
                  <MapContainer center={[-1.0, 37.5]} zoom={6} scrollWheelZoom style={{ height: "450px", width: "100%" }} className="z-0">
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {sightings.map((s) => (
                      <Marker key={s.id} position={[s.lat, s.lng]} icon={makeIcon(speciesEmoji[s.species_category] || "🐾", "linear-gradient(135deg, hsl(145,35%,28%), hsl(100,25%,45%))")}>
                        <Popup>
                          <div className="font-body min-w-[160px]">
                            <h3 className="font-display font-semibold text-sm">{speciesEmoji[s.species_category] || "🐾"} {s.species}</h3>
                            <p className="text-xs text-muted-foreground">{s.location_name}</p>
                            {s.description && <p className="text-xs mt-1">{s.description}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{timeSince(s.created_at)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Feed + Report */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg">Live Sightings</h2>
                  <Button size="sm" onClick={() => setShowReportForm(true)} className="gradient-sunset border-0 text-primary-foreground">
                    <Plus className="h-3 w-3 mr-1" /> Report
                  </Button>
                </div>

                {/* Report form */}
                <AnimatePresence>
                  {showReportForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="glass-card p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-semibold text-sm">Report a Sighting</h3>
                          <button onClick={() => setShowReportForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Species *" value={reportForm.species} onChange={(e) => setReportForm((p) => ({ ...p, species: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none col-span-2" />
                          <select value={reportForm.species_category} onChange={(e) => setReportForm((p) => ({ ...p, species_category: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none">
                            {Object.keys(speciesEmoji).map((k) => <option key={k} value={k}>{speciesEmoji[k]} {k}</option>)}
                          </select>
                          <input placeholder="Count" type="number" value={reportForm.animal_count} onChange={(e) => setReportForm((p) => ({ ...p, animal_count: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none" />
                          <input placeholder="Location name *" value={reportForm.location_name} onChange={(e) => setReportForm((p) => ({ ...p, location_name: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none col-span-2" />
                          <input placeholder="Park name" value={reportForm.park_name} onChange={(e) => setReportForm((p) => ({ ...p, park_name: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none col-span-2" />
                          <input placeholder="Latitude" value={reportForm.lat} onChange={(e) => setReportForm((p) => ({ ...p, lat: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none" />
                          <input placeholder="Longitude" value={reportForm.lng} onChange={(e) => setReportForm((p) => ({ ...p, lng: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none" />
                          <input placeholder="Behavior (e.g. hunting, grazing)" value={reportForm.behavior} onChange={(e) => setReportForm((p) => ({ ...p, behavior: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none col-span-2" />
                          <textarea placeholder="Description" value={reportForm.description} onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))} className="text-xs bg-muted rounded-lg px-3 py-2 outline-none col-span-2" rows={2} />
                        </div>
                        <Button size="sm" onClick={submitSighting} className="w-full gradient-safari border-0 text-primary-foreground">
                          <Send className="h-3 w-3 mr-1" /> Submit Sighting
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sighting list */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sightings.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">No sightings yet. Be the first to report!</p>
                  )}
                  {sightings.map((s) => (
                    <div key={s.id} className="glass-card p-3 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{speciesEmoji[s.species_category] || "🐾"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-sm">{s.species}</span>
                            {s.animal_count > 1 && <Badge variant="secondary" className="text-[10px]">x{s.animal_count}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location_name}{s.park_name ? ` · ${s.park_name}` : ""}</p>
                          {s.behavior && <p className="text-xs text-accent mt-0.5 italic">{s.behavior}</p>}
                          {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeSince(s.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SPECIES TAB */}
          {activeTab === "species" && !loading && speciesData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speciesData.species?.map((sp: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{speciesEmoji[sp.category] || "🐾"}</span>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-base">{sp.name}</h3>
                      <p className="text-xs text-muted-foreground italic">{sp.scientificName}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]"><Shield className="h-3 w-3 mr-0.5" /> {sp.conservationStatus}</Badge>
                        <Badge variant="secondary" className="text-[10px]">Pop: {sp.population}</Badge>
                      </div>
                      <div className="mt-3 space-y-2 text-xs">
                        <div><strong className="text-foreground">Current behavior:</strong> <span className="text-muted-foreground">{sp.currentBehavior}</span></div>
                        <div><strong className="text-foreground">Best time:</strong> <span className="text-muted-foreground">{sp.bestTimeOfDay}</span></div>
                        <div className="flex items-start gap-1"><Camera className="h-3 w-3 mt-0.5 text-accent shrink-0" /> <span className="text-muted-foreground">{sp.photographyTips}</span></div>
                        <div className="flex items-start gap-1"><Camera className="h-3 w-3 mt-0.5 text-secondary shrink-0" /> <span className="text-muted-foreground">{sp.bestPhotoConditions}</span></div>
                      </div>
                      {sp.bestZones?.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-medium">Top zones:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sp.bestZones.map((z: any, j: number) => (
                              <Badge key={j} variant="secondary" className="text-[10px]">{z.name} ({z.probability})</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 bg-muted/50 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">💡 {sp.funFact}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* MIGRATION TAB */}
          {activeTab === "migration" && !loading && migrationData && (
            <div className="space-y-6">
              {/* Wildebeest status */}
              <div className="glass-card p-6 border-l-4 border-accent">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">🦬 Great Migration Status</h2>
                {migrationData.wildebeestMigration?.crossingAlert && (
                  <div className="mt-2 bg-destructive/10 rounded-lg px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Crossing Alert Active!</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <span className="text-xs text-muted-foreground">Current Phase</span>
                    <p className="font-display font-semibold text-sm mt-1">{migrationData.wildebeestMigration?.currentPhase}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <p className="font-display font-semibold text-sm mt-1">{migrationData.wildebeestMigration?.currentLocation}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <span className="text-xs text-muted-foreground">Crossing Prediction</span>
                    <p className="font-display font-semibold text-sm mt-1">{migrationData.wildebeestMigration?.crossingPrediction}</p>
                  </div>
                </div>
                {migrationData.wildebeestMigration?.bestViewingSpots?.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-medium">Best viewing spots:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {migrationData.wildebeestMigration.bestViewingSpots.map((s: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded-lg px-3 py-2 flex items-start gap-2">
                          <MapPin className="h-3 w-3 mt-0.5 text-accent shrink-0" />
                          <div>
                            <span className="text-xs font-medium">{s.name}</span>
                            <p className="text-[11px] text-muted-foreground">{s.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly calendar */}
              <div>
                <h3 className="font-display font-bold text-base mb-3">Migration Calendar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {migrationData.monthlyCalendar?.map((m: any, i: number) => (
                    <div key={i} className={`rounded-xl p-3 text-center ${m.isCurrent ? "ring-2 ring-accent bg-accent/5" : "bg-muted/50"}`}>
                      <span className={`text-xs font-bold ${m.isCurrent ? "text-accent" : "text-foreground"}`}>{m.month}</span>
                      <div className="mt-1 space-y-0.5">
                        {m.highlights?.map((h: string, j: number) => (
                          <p key={j} className="text-[10px] text-muted-foreground">{h}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bird migrations */}
              {migrationData.birdMigrations?.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-base mb-3">🦅 Bird Migrations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {migrationData.birdMigrations.map((b: any, i: number) => (
                      <div key={i} className="glass-card p-3">
                        <span className="font-display font-semibold text-sm">{b.species}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.status}</p>
                        <p className="text-xs mt-1"><MapPin className="h-3 w-3 inline mr-0.5" />{b.bestLocation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BIG FIVE TAB */}
          {activeTab === "bigfive" && !loading && bigFiveData && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg">Big Five Probability by Zone</h2>
              <div className="grid grid-cols-1 gap-4">
                {bigFiveData.zones?.map((zone: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-base">{zone.name}</h3>
                        <p className="text-xs text-muted-foreground">{zone.bestTime} · Crowds: {zone.crowdLevel}</p>
                      </div>
                      <Badge variant="secondary">{zone.overallRating}</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "Lion", emoji: "🦁", val: zone.lion },
                        { label: "Leopard", emoji: "🐆", val: zone.leopard },
                        { label: "Elephant", emoji: "🐘", val: zone.elephant },
                        { label: "Buffalo", emoji: "🦬", val: zone.buffalo },
                        { label: "Rhino", emoji: "🦏", val: zone.rhino },
                      ].map((a) => (
                        <div key={a.label} className="text-center">
                          <span className="text-lg">{a.emoji}</span>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${a.val}%`,
                                background: a.val > 70 ? "hsl(var(--primary))" : a.val > 40 ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-medium">{a.val}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* BIRDING TAB */}
          {activeTab === "birding" && !loading && birdingData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
                <MapContainer center={[-0.5, 37.5]} zoom={6} scrollWheelZoom style={{ height: "400px", width: "100%" }} className="z-0">
                  <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {birdingData.zones?.map((z: any, i: number) => (
                    <Marker key={i} position={[z.lat, z.lng]} icon={makeIcon("🦅", "linear-gradient(135deg, hsl(200,50%,45%), hsl(280,60%,50%))")}>
                      <Popup>
                        <div className="font-body min-w-[160px]">
                          <h3 className="font-display font-semibold text-sm">🦅 {z.name}</h3>
                          <p className="text-xs text-muted-foreground">{z.speciesCount} species</p>
                          <p className="text-xs mt-1">{z.currentHighlight}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="space-y-3">
                {birdingData.zones?.map((z: any, i: number) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🦅</span>
                      <div>
                        <h3 className="font-display font-semibold text-sm">{z.name}</h3>
                        <p className="text-xs text-muted-foreground">{z.speciesCount} species · {z.bestSeason}</p>
                      </div>
                    </div>
                    <p className="text-xs text-accent mt-2">{z.currentHighlight}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {z.keySpecies?.map((s: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARKS TAB */}
          {activeTab === "parks" && !loading && parksData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parksData.parks?.map((park: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-base">{park.name}</h3>
                    <Badge className={`text-[10px] ${congestionColors[park.congestionLevel] || "bg-muted"}`}>
                      {park.congestionLevel === "very_high" ? "Very Busy" : park.congestionLevel.charAt(0).toUpperCase() + park.congestionLevel.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <span className="text-xs text-muted-foreground">Gate Wait</span>
                      <p className="text-sm font-bold">{park.gateWaitMinutes}m</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <span className="text-xs text-muted-foreground">Entry Fee</span>
                      <p className="text-sm font-bold">${park.entryFeeUSD}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <span className="text-xs text-muted-foreground">Best Entry</span>
                      <p className="text-sm font-bold">{park.bestEntryTime}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {park.currentHighlights?.map((h: string, j: number) => (
                      <p key={j} className="text-xs flex items-center gap-1"><ChevronRight className="h-3 w-3 text-primary" />{h}</p>
                    ))}
                  </div>
                  {park.alerts?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {park.alerts.map((a: string, j: number) => (
                        <div key={j} className="bg-destructive/5 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                          <span className="text-[11px] text-destructive">{a}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Refresh */}
          {!loading && activeTab !== "feed" && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => {
                if (activeTab === "species") { setSpeciesData(null); fetchAI("species_tracking", setSpeciesData); }
                if (activeTab === "migration") { setMigrationData(null); fetchAI("migration", setMigrationData); }
                if (activeTab === "bigfive") { setBigFiveData(null); fetchAI("big_five", setBigFiveData); }
                if (activeTab === "birding") { setBirdingData(null); fetchAI("birding", setBirdingData); }
                if (activeTab === "parks") { setParksData(null); fetchAI("park_intel", setParksData); }
              }}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Intelligence
              </Button>
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default WildlifeIntelPage;
