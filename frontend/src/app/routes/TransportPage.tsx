import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Star, MapPin, Users, Car, Truck, Plane, Bus, Bike, Footprints,
  Clock, ChevronRight, Loader2, Check, BadgeCheck, Fuel, AlertTriangle,
  Navigation, Calendar, Phone, DollarSign, Mountain, Route, Shield
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingFlow } from "@/domains/bookings/components/BookingFlow/BookingFlow";

interface Driver {
  id: string; name: string; slug: string; photo_url: string | null; bio: string | null;
  languages: string[] | null; years_experience: number | null; is_verified: boolean | null;
  rating: number | null; review_count: number | null; total_trips: number | null;
  location: string | null; county: string | null; specializations: string[] | null;
}

interface Vehicle {
  id: string; driver_id: string | null; vehicle_type: string; name: string;
  make: string | null; model: string | null; year: number | null;
  capacity: number | null; features: string[] | null; photo_url: string | null;
  price_per_day: number; price_display: string | null; is_available: boolean | null;
  transport_drivers: { name: string; slug: string; rating: number | null; is_verified: boolean | null } | null;
}

interface TransportRoute {
  id: string; route_type: string; name: string; slug: string; description: string | null;
  origin: string; destination: string; stops: string[] | null; distance_km: number | null;
  duration_minutes: number | null; difficulty: string | null; price_display: string | null;
  frequency: string | null; operating_hours: string | null; vehicle_type: string | null;
  elevation_gain_m: number | null; highlights: string[] | null; warnings: string[] | null;
  fuel_stations: string[] | null;
}

interface RoadCondition {
  id: string; route_name: string; segment: string | null; condition: string;
  description: string | null; reported_at: string;
}

interface ParkGate {
  id: string; park_name: string; gate_name: string; opening_time: string | null;
  closing_time: string | null; entry_fee_resident: string | null;
  entry_fee_nonresident: string | null; entry_fee_vehicle: string | null;
  requirements: string[] | null; notes: string | null;
}

const vehicleTypeIcons: Record<string, typeof Car> = {
  "safari-van": Truck, "4x4": Truck, suv: Car, minivan: Bus, luxury: Car, "airport-shuttle": Plane,
};

const routeTypeIcons: Record<string, typeof Bus> = {
  matatu: Bus, shuttle: Car, "walking-trail": Footprints, bicycle: Bike,
};

const conditionColors: Record<string, string> = {
  good: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  poor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  impassable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  challenging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const TransportPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [roadConditions, setRoadConditions] = useState<RoadCondition[]>([]);
  const [parkGates, setParkGates] = useState<ParkGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      const [vRes, dRes, rRes, rcRes, pgRes] = await Promise.all([
        supabase.from("transport_vehicles").select("*, transport_drivers(name, slug, rating, is_verified)").eq("is_published", true).eq("is_available", true),
        supabase.from("transport_drivers").select("*").eq("is_published", true).order("rating", { ascending: false }),
        supabase.from("transport_routes").select("*").eq("is_published", true),
        supabase.from("road_conditions").select("*").eq("is_current", true).order("reported_at", { ascending: false }).limit(20),
        supabase.from("park_gates").select("*").eq("is_published", true).order("park_name"),
      ]);
      if (vRes.data) setVehicles(vRes.data as unknown as Vehicle[]);
      if (dRes.data) setDrivers(dRes.data as Driver[]);
      if (rRes.data) setRoutes(rRes.data as TransportRoute[]);
      if (rcRes.data) setRoadConditions(rcRes.data as RoadCondition[]);
      if (pgRes.data) setParkGates(pgRes.data as ParkGate[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredVehicles = vehicles.filter((v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || (v.transport_drivers?.name || "").toLowerCase().includes(search.toLowerCase()) || (v.make || "").toLowerCase().includes(search.toLowerCase()));
  const filteredRoutes = routes.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.origin.toLowerCase().includes(search.toLowerCase()) || r.destination.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Getting Around Kenya</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Transport & Logistics</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Safari vehicles with verified drivers, airport transfers, public transport routes, walking trails, and real-time road conditions — all in one place.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search vehicles, routes, destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="vehicles" className="w-full">
              <TabsList className="w-full justify-start mb-6 bg-transparent gap-2 flex-wrap h-auto">
                <TabsTrigger value="vehicles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Car className="h-4 w-4 mr-1" />Safari Vehicles</TabsTrigger>
                <TabsTrigger value="routes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Bus className="h-4 w-4 mr-1" />Routes & Trails</TabsTrigger>
                <TabsTrigger value="roads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><AlertTriangle className="h-4 w-4 mr-1" />Road Conditions</TabsTrigger>
                <TabsTrigger value="gates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Navigation className="h-4 w-4 mr-1" />Park Gates</TabsTrigger>
              </TabsList>

              {/* VEHICLES TAB */}
              <TabsContent value="vehicles">
                <p className="font-body text-sm text-muted-foreground mb-6">{filteredVehicles.length} vehicles available</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((v, i) => {
                    const Icon = vehicleTypeIcons[v.vehicle_type] || Car;
                    return (
                      <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setSelectedVehicle(v)}>
                        <div className="relative h-44 bg-muted flex items-center justify-center">
                          {v.photo_url ? <img src={v.photo_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <Icon className="h-12 w-12 text-muted-foreground/30" />}
                          <Badge className="absolute top-2 left-2 capitalize text-xs">{v.vehicle_type.replace("-", " ")}</Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display text-lg font-semibold text-foreground mb-0.5">{v.name}</h3>
                          <p className="text-xs text-muted-foreground font-body">{v.make} {v.model} {v.year ? `(${v.year})` : ""}</p>
                          {v.transport_drivers && (
                            <button onClick={(e) => { e.stopPropagation(); const d = drivers.find(dr => dr.slug === v.transport_drivers?.slug); if (d) setSelectedDriver(d); }} className="text-xs text-muted-foreground font-body mt-1 hover:text-safari-green transition-colors flex items-center gap-1">
                              Driver: {v.transport_drivers.name} {v.transport_drivers.is_verified && <BadgeCheck className="h-3 w-3 text-safari-green" />}
                              {(v.transport_drivers.rating ?? 0) > 0 && <span className="flex items-center gap-0.5 text-savannah-gold"><Star className="h-2.5 w-2.5 fill-current" />{Number(v.transport_drivers.rating).toFixed(1)}</span>}
                            </button>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-body">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.capacity} seats</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {v.features && v.features.slice(0, 3).map((f, i) => <Badge key={i} variant="outline" className="text-[10px] px-1.5">{f}</Badge>)}
                            <span className="font-body font-bold text-foreground">{v.price_display}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* ROUTES TAB */}
              <TabsContent value="routes">
                <div className="flex flex-wrap gap-2 mb-6">
                  {["all", "matatu", "shuttle", "walking-trail", "bicycle"].map((t) => {
                    const Icon = t === "all" ? Route : routeTypeIcons[t] || Bus;
                    return <Button key={t} variant={search === "" ? "default" : "outline"} size="sm" className="capitalize gap-1" onClick={() => {}}><Icon className="h-3.5 w-3.5" />{t === "all" ? "All" : t.replace("-", " ")}</Button>;
                  })}
                </div>
                <div className="space-y-4">
                  {filteredRoutes.map((r) => {
                    const Icon = routeTypeIcons[r.route_type] || Bus;
                    return (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRoute(r)}>
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0"><Icon className="h-6 w-6 text-muted-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display font-semibold text-foreground">{r.name}</h4>
                              <Badge variant="outline" className="capitalize text-xs">{r.route_type.replace("-", " ")}</Badge>
                              {r.difficulty && <Badge className={`text-xs ${difficultyColors[r.difficulty]}`}>{r.difficulty}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{r.origin} → {r.destination}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground font-body">
                              {r.distance_km && <span>{r.distance_km}km</span>}
                              {r.duration_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(r.duration_minutes / 60)}h {r.duration_minutes % 60}m</span>}
                              {r.price_display && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{r.price_display}</span>}
                              {r.frequency && <span>{r.frequency}</span>}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* ROAD CONDITIONS TAB */}
              <TabsContent value="roads">
                <p className="font-body text-sm text-muted-foreground mb-4">Live road condition reports from travelers. Last updated reports first.</p>
                {roadConditions.length === 0 ? (
                  <div className="text-center py-12"><AlertTriangle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground font-body">No road condition reports yet.</p></div>
                ) : (
                  <div className="space-y-3">
                    {roadConditions.map((rc) => (
                      <div key={rc.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                        <Badge className={`${conditionColors[rc.condition]} capitalize shrink-0`}>{rc.condition}</Badge>
                        <div>
                          <h4 className="font-body font-semibold text-foreground">{rc.route_name}{rc.segment && ` — ${rc.segment}`}</h4>
                          {rc.description && <p className="text-sm text-muted-foreground font-body mt-0.5">{rc.description}</p>}
                          <p className="text-xs text-muted-foreground font-body mt-1">Reported {new Date(rc.reported_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* PARK GATES TAB */}
              <TabsContent value="gates">
                <p className="font-body text-sm text-muted-foreground mb-4">Opening hours, entry fees, and requirements for Kenya's national parks and reserves.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parkGates.map((pg) => (
                    <div key={pg.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-display font-semibold text-foreground">{pg.gate_name}</h4>
                          <p className="text-xs text-muted-foreground font-body">{pg.park_name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{pg.opening_time} – {pg.closing_time}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-body mb-2">
                        <div className="bg-muted rounded-lg p-2 text-center"><p className="text-muted-foreground">Resident</p><p className="font-semibold text-foreground">{pg.entry_fee_resident || "—"}</p></div>
                        <div className="bg-muted rounded-lg p-2 text-center"><p className="text-muted-foreground">Non-resident</p><p className="font-semibold text-foreground">{pg.entry_fee_nonresident || "—"}</p></div>
                        <div className="bg-muted rounded-lg p-2 text-center"><p className="text-muted-foreground">Vehicle</p><p className="font-semibold text-foreground">{pg.entry_fee_vehicle || "—"}</p></div>
                      </div>
                      {pg.requirements && pg.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pg.requirements.map((r, i) => <Badge key={i} variant="secondary" className="text-[10px]">{r}</Badge>)}
                        </div>
                      )}
                      {pg.notes && <p className="text-xs text-muted-foreground font-body italic">{pg.notes}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Vehicle Detail Modal */}
      <Dialog open={!!selectedVehicle && !showBooking} onOpenChange={(o) => !o && setSelectedVehicle(null)}>
        <DialogContent className="max-w-lg">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <Badge className="w-fit capitalize mb-1">{selectedVehicle.vehicle_type.replace("-", " ")}</Badge>
                <DialogTitle className="font-display text-2xl">{selectedVehicle.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">{selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year ? `(${selectedVehicle.year})` : ""}</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 text-sm font-body">
                  <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" />{selectedVehicle.capacity} passengers</span>
                  <span className="font-bold text-foreground text-lg">{selectedVehicle.price_display}</span>
                </div>
                {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                  <div>
                    <h4 className="font-body font-semibold text-foreground text-sm mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">{selectedVehicle.features.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}</div>
                  </div>
                )}
                {selectedVehicle.transport_drivers && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h4 className="font-body font-semibold text-foreground text-sm mb-1 flex items-center gap-1">Driver: {selectedVehicle.transport_drivers.name} {selectedVehicle.transport_drivers.is_verified && <BadgeCheck className="h-4 w-4 text-safari-green" />}</h4>
                    {(selectedVehicle.transport_drivers.rating ?? 0) > 0 && <p className="text-xs text-savannah-gold flex items-center gap-1"><Star className="h-3 w-3 fill-current" />{Number(selectedVehicle.transport_drivers.rating).toFixed(1)} rating</p>}
                  </div>
                )}
                <Button className="w-full gradient-sunset text-primary-foreground font-body font-semibold py-5" onClick={() => setShowBooking(true)}>Book This Vehicle <ChevronRight className="h-5 w-5 ml-1" /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Route Detail Modal */}
      <Dialog open={!!selectedRoute} onOpenChange={(o) => !o && setSelectedRoute(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedRoute && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="capitalize">{selectedRoute.route_type.replace("-", " ")}</Badge>
                  {selectedRoute.difficulty && <Badge className={`${difficultyColors[selectedRoute.difficulty]}`}>{selectedRoute.difficulty}</Badge>}
                </div>
                <DialogTitle className="font-display text-2xl">{selectedRoute.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body"><MapPin className="inline h-3 w-3" /> {selectedRoute.origin} → {selectedRoute.destination}</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-3 text-sm font-body">
                  {selectedRoute.distance_km && <span>{selectedRoute.distance_km}km</span>}
                  {selectedRoute.duration_minutes && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{Math.round(selectedRoute.duration_minutes / 60)}h {selectedRoute.duration_minutes % 60}m</span>}
                  {selectedRoute.price_display && <span className="font-bold text-foreground">{selectedRoute.price_display}</span>}
                  {selectedRoute.elevation_gain_m && <span className="flex items-center gap-1"><Mountain className="h-4 w-4" />{selectedRoute.elevation_gain_m}m gain</span>}
                </div>
                {selectedRoute.description && <p className="text-sm text-muted-foreground font-body">{selectedRoute.description}</p>}
                {selectedRoute.operating_hours && <p className="text-xs text-muted-foreground font-body">🕐 {selectedRoute.operating_hours}</p>}
                {selectedRoute.frequency && <p className="text-xs text-muted-foreground font-body">🔄 {selectedRoute.frequency}</p>}
                {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                  <div><h4 className="font-body font-semibold text-foreground text-sm mb-1">Stops</h4><p className="text-sm text-muted-foreground font-body">{selectedRoute.stops.join(" → ")}</p></div>
                )}
                {selectedRoute.highlights && selectedRoute.highlights.length > 0 && (
                  <div><h4 className="font-body font-semibold text-foreground text-sm mb-1">✨ Highlights</h4><ul className="text-sm text-muted-foreground font-body space-y-1">{selectedRoute.highlights.map((h, i) => <li key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-safari-green shrink-0 mt-0.5" />{h}</li>)}</ul></div>
                )}
                {selectedRoute.warnings && selectedRoute.warnings.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3"><h4 className="font-body font-semibold text-foreground text-sm mb-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-500" />Warnings</h4><ul className="text-sm text-muted-foreground font-body space-y-1">{selectedRoute.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
                )}
                {selectedRoute.fuel_stations && selectedRoute.fuel_stations.length > 0 && (
                  <div><h4 className="font-body font-semibold text-foreground text-sm mb-1 flex items-center gap-1"><Fuel className="h-4 w-4" />Fuel Stations</h4><p className="text-sm text-muted-foreground font-body">{selectedRoute.fuel_stations.join(", ")}</p></div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Profile Modal */}
      <Dialog open={!!selectedDriver} onOpenChange={(o) => !o && setSelectedDriver(null)}>
        <DialogContent className="max-w-lg">
          {selectedDriver && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">{selectedDriver.is_verified && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><BadgeCheck className="h-3 w-3 mr-1" />Verified</Badge>}</div>
                <DialogTitle className="font-display text-2xl">{selectedDriver.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body"><MapPin className="inline h-3 w-3" /> {selectedDriver.location}{selectedDriver.county ? `, ${selectedDriver.county}` : ""}</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 text-sm font-body">
                  {(selectedDriver.rating ?? 0) > 0 && <span className="flex items-center gap-1 text-savannah-gold"><Star className="h-4 w-4 fill-current" />{Number(selectedDriver.rating).toFixed(1)} ({selectedDriver.review_count} reviews)</span>}
                  <span className="text-muted-foreground">{selectedDriver.total_trips} trips</span>
                  <span className="text-muted-foreground">{selectedDriver.years_experience}+ years</span>
                </div>
                {selectedDriver.bio && <p className="text-sm text-muted-foreground font-body">{selectedDriver.bio}</p>}
                {selectedDriver.languages && <p className="text-xs text-muted-foreground font-body">🗣️ {selectedDriver.languages.join(", ")}</p>}
                {selectedDriver.specializations && selectedDriver.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2">{selectedDriver.specializations.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}</div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={showBooking} onOpenChange={(o) => { if (!o) setShowBooking(false); }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Book: {selectedVehicle.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">{selectedVehicle.price_display}</p>
              </DialogHeader>
              <div className="mt-4">
                {!user ? (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground font-body mb-3">Sign in to book this vehicle</p>
                    <Button asChild className="rounded-full">
                      <a href="/auth">Sign In</a>
                    </Button>
                  </div>
                ) : (
                  <BookingFlow
                    resourceType="transport"
                    resource={selectedVehicle}
                    onComplete={() => { setShowBooking(false); setSelectedVehicle(null); }}
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default TransportPage;
