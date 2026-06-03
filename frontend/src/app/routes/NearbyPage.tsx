import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Compass, Eye, Zap, Route, Loader2, AlertCircle, ChevronRight, Gem, Utensils, Mountain, Users, Timer, Star } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { destinations } from "@/data/destinations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const gemIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background: linear-gradient(135deg, hsl(280,60%,50%), hsl(320,70%,55%)); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="font-size:14px;">💎</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const alertIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background: linear-gradient(135deg, hsl(20,70%,52%), hsl(38,55%,55%)); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="font-size:14px;">⚡</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const detourIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background: linear-gradient(135deg, hsl(145,35%,28%), hsl(100,25%,45%)); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="font-size:14px;">🔀</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const userIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background: hsl(200,50%,45%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px hsl(200,50%,45%), 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface HiddenGem {
  name: string;
  description: string;
  lat: number;
  lng: number;
  type: string;
  distanceMinutes: number;
  whyHidden: string;
}

interface TimeSensitive {
  title: string;
  description: string;
  type: string;
  urgency: string;
  timeWindow: string;
  lat: number;
  lng: number;
}

interface DetourSuggestion {
  name: string;
  description: string;
  lat: number;
  lng: number;
  addedMinutes: number;
  worthIt: string;
  highlights: string[];
}

interface WhatTouristsMiss {
  title: string;
  description: string;
  category: string;
  insiderTip: string;
}

interface Discoveries {
  hiddenGems: HiddenGem[];
  timeSensitive: TimeSensitive[];
  detourSuggestions: DetourSuggestion[];
  whatTouristsMiss: WhatTouristsMiss[];
}

const radiusOptions = [
  { label: "1 hour", value: 1, km: 60 },
  { label: "2 hours", value: 2, km: 120 },
  { label: "3 hours", value: 3, km: 180 },
];

const categoryIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  viewpoint: <Mountain className="h-4 w-4" />,
  interaction: <Users className="h-4 w-4" />,
  timing: <Timer className="h-4 w-4" />,
  route: <Route className="h-4 w-4" />,
};

const urgencyColors: Record<string, string> = {
  now: "bg-destructive text-destructive-foreground",
  today: "bg-accent text-accent-foreground",
  this_week: "bg-secondary text-secondary-foreground",
};

const NearbyPage = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusHours, setRadiusHours] = useState(1);
  const [discoveries, setDiscoveries] = useState<Discoveries | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"gems" | "alerts" | "detours" | "tips">("gems");
  const [showOverlay, setShowOverlay] = useState({ gems: true, alerts: true, detours: true });
  const { toast } = useToast();

  // Auto-detect location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      // Default to Nairobi
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocationError("Location access denied. Showing results for Nairobi.");
        setUserLocation({ lat: -1.2921, lng: 36.8219 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const fetchDiscoveries = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const nearbyDests = destinations.filter((d) => {
        const dist = Math.sqrt(Math.pow(d.lat - userLocation.lat, 2) + Math.pow(d.lng - userLocation.lng, 2));
        return dist < radiusHours * 1.5; // rough degree filter
      });

      const { data, error } = await supabase.functions.invoke("nearby-discover", {
        body: { lat: userLocation.lat, lng: userLocation.lng, radiusHours, destinations: nearbyDests },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDiscoveries(data);
    } catch (e: any) {
      toast({ title: "Discovery failed", description: e.message || "Could not fetch nearby discoveries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusHours, toast]);

  // Fetch on location or radius change
  useEffect(() => {
    if (userLocation) fetchDiscoveries();
  }, [userLocation, radiusHours, fetchDiscoveries]);

  const selectedRadius = radiusOptions.find((r) => r.value === radiusHours)!;

  const tabs = [
    { key: "gems" as const, label: "Hidden Gems", icon: <Gem className="h-4 w-4" />, count: discoveries?.hiddenGems?.length || 0 },
    { key: "alerts" as const, label: "Time-Sensitive", icon: <Zap className="h-4 w-4" />, count: discoveries?.timeSensitive?.length || 0 },
    { key: "detours" as const, label: "Detours", icon: <Route className="h-4 w-4" />, count: discoveries?.detourSuggestions?.length || 0 },
    { key: "tips" as const, label: "Insider Tips", icon: <Eye className="h-4 w-4" />, count: discoveries?.whatTouristsMiss?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-12 px-4 gradient-safari">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Compass className="h-6 w-6 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">AI-Powered Discovery</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-3">
                Discover What's <span className="text-savannah-gold">Near You</span>
              </h1>
              <p className="text-primary-foreground/70 font-body max-w-xl mx-auto">
                Real-time AI recommendations for hidden gems, urgent events, and smart detours based on your current location.
              </p>

              {locationError && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-foreground/60">
                  <AlertCircle className="h-4 w-4" /> {locationError}
                </div>
              )}

              {/* Radius Selector */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-sm text-primary-foreground/70">Travel radius:</span>
                {radiusOptions.map((r) => (
                  <Button
                    key={r.value}
                    variant={radiusHours === r.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRadiusHours(r.value)}
                    className={radiusHours === r.value
                      ? "gradient-sunset border-0 text-primary-foreground"
                      : "border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10"}
                  >
                    <Clock className="h-3 w-3 mr-1" /> {r.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)] sticky top-24">
                {/* Map Overlay Toggles */}
                <div className="bg-card px-4 py-2 flex items-center gap-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">Show:</span>
                  {(["gems", "alerts", "detours"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setShowOverlay((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${showOverlay[key] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {key === "gems" ? "💎 Gems" : key === "alerts" ? "⚡ Alerts" : "🔀 Detours"}
                    </button>
                  ))}
                </div>
                {userLocation && (
                  <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={9}
                    scrollWheelZoom={true}
                    style={{ height: "500px", width: "100%" }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* User location */}
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                      <Popup><span className="font-body text-sm font-medium">📍 You are here</span></Popup>
                    </Marker>
                    {/* Radius circle */}
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={selectedRadius.km * 1000}
                      pathOptions={{ color: "hsl(200,50%,45%)", fillColor: "hsl(200,50%,45%)", fillOpacity: 0.08, weight: 2, dashArray: "8 4" }}
                    />
                    {/* Hidden gems */}
                    {showOverlay.gems && discoveries?.hiddenGems?.map((gem, i) => (
                      <Marker key={`gem-${i}`} position={[gem.lat, gem.lng]} icon={gemIcon}>
                        <Popup>
                          <div className="min-w-[180px] font-body">
                            <h3 className="font-display font-semibold text-sm">💎 {gem.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{gem.description}</p>
                            <p className="text-xs mt-1"><strong>{gem.distanceMinutes} min</strong> away · {gem.type}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {/* Time sensitive */}
                    {showOverlay.alerts && discoveries?.timeSensitive?.map((alert, i) => (
                      <Marker key={`alert-${i}`} position={[alert.lat, alert.lng]} icon={alertIcon}>
                        <Popup>
                          <div className="min-w-[180px] font-body">
                            <h3 className="font-display font-semibold text-sm">⚡ {alert.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                            <p className="text-xs mt-1 font-medium">{alert.timeWindow}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {/* Detours */}
                    {showOverlay.detours && discoveries?.detourSuggestions?.map((d, i) => (
                      <Marker key={`detour-${i}`} position={[d.lat, d.lng]} icon={detourIcon}>
                        <Popup>
                          <div className="min-w-[180px] font-body">
                            <h3 className="font-display font-semibold text-sm">🔀 {d.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                            <p className="text-xs mt-1">+{d.addedMinutes} min detour</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Tab bar */}
              <div className="flex gap-1 bg-muted rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] rounded-full px-1.5">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm font-medium">AI is scanning nearby areas...</p>
                  <p className="text-xs">Analyzing hidden gems, events & detours</p>
                </div>
              )}

              {/* Content */}
              {!loading && discoveries && (
                <AnimatePresence mode="wait">
                  {activeTab === "gems" && (
                    <motion.div key="gems" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      {discoveries.hiddenGems.map((gem, i) => (
                        <div key={i} className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-sunset flex items-center justify-center text-lg shrink-0">💎</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-semibold text-sm">{gem.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{gem.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px]">{gem.type}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {gem.distanceMinutes} min
                                </span>
                              </div>
                              <p className="text-xs text-accent mt-1.5 italic">Why hidden: {gem.whyHidden}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "alerts" && (
                    <motion.div key="alerts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      {discoveries.timeSensitive.map((alert, i) => (
                        <div key={i} className="glass-card p-4 border-l-4 border-accent hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0">
                              {alert.type === "wildlife" ? "🦁" : alert.type === "cultural" ? "🎭" : alert.type === "weather" ? "🌅" : "🎪"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display font-semibold text-sm">{alert.title}</h3>
                                <Badge className={`text-[10px] ${urgencyColors[alert.urgency]}`}>
                                  {alert.urgency === "now" ? "🔴 NOW" : alert.urgency === "today" ? "🟠 Today" : "🟡 This week"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                              <p className="text-xs font-medium mt-1.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {alert.timeWindow}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "detours" && (
                    <motion.div key="detours" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      {discoveries.detourSuggestions.map((detour, i) => (
                        <div key={i} className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-safari flex items-center justify-center text-lg shrink-0">🔀</div>
                            <div className="flex-1">
                              <h3 className="font-display font-semibold text-sm">{detour.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{detour.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px]">+{detour.addedMinutes} min</Badge>
                                <span className="text-xs text-primary font-medium flex items-center gap-1">
                                  <Star className="h-3 w-3" /> {detour.worthIt}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {detour.highlights.map((h, j) => (
                                  <Badge key={j} variant="secondary" className="text-[10px]">{h}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "tips" && (
                    <motion.div key="tips" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      <div className="text-center mb-4">
                        <h2 className="font-display text-lg font-bold text-foreground">What Most Tourists Miss</h2>
                        <p className="text-xs text-muted-foreground">Insider knowledge near your location</p>
                      </div>
                      {discoveries.whatTouristsMiss.map((tip, i) => (
                        <div key={i} className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              {categoryIcons[tip.category] || <Eye className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display font-semibold text-sm">{tip.title}</h3>
                                <Badge variant="secondary" className="text-[10px] capitalize">{tip.category}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                              <div className="mt-2 bg-muted/50 rounded-lg px-3 py-2">
                                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3 text-accent" /> Insider tip: <span className="font-normal text-muted-foreground">{tip.insiderTip}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Refresh button */}
              {!loading && discoveries && (
                <Button onClick={fetchDiscoveries} variant="outline" className="w-full mt-4">
                  <Compass className="h-4 w-4 mr-2" /> Refresh Discoveries
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default NearbyPage;
