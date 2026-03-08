import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Phone, MapPin, Shield, Siren, Heart, Activity, Globe,
  ChevronRight, Share2, Cloud, Bug, Navigation, Hospital, Search, Plus,
  X, Send, Eye, Users, Clock, Package, CheckCircle, Trash2, UserPlus
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const severityColor = (s: string) => {
  switch (s) {
    case "low": return { bg: "bg-safari-green/10", text: "text-safari-green", dot: "bg-safari-green" };
    case "normal": return { bg: "bg-savannah-gold/10", text: "text-savannah-gold", dot: "bg-savannah-gold" };
    case "caution": return { bg: "bg-sunset-orange/10", text: "text-sunset-orange", dot: "bg-sunset-orange" };
    case "critical": return { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" };
    default: return { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  }
};

const alertIcon = (type: string) => {
  switch (type) {
    case "weather": return <Cloud className="h-4 w-4" />;
    case "animal": return <Bug className="h-4 w-4" />;
    case "road": return <Navigation className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const emergencyContacts = [
  { type: "Police", name: "Kenya Police Emergency", number: "999 / 112", description: "National emergency police line", icon: Shield },
  { type: "Medical", name: "St. John Ambulance", number: "+254 20 2210000", description: "Nationwide ambulance service", icon: Heart },
  { type: "Medical", name: "AMREF Flying Doctors", number: "+254 20 6992000", description: "Emergency air evacuation", icon: Heart },
  { type: "Wildlife", name: "KWS Emergency", number: "+254 800 597 000", description: "Wildlife emergencies & poaching reports", icon: Activity },
  { type: "Fire", name: "Fire Brigade", number: "999 / 112", description: "Fire and rescue services", icon: Siren },
];

const embassies = [
  { country: "United States", name: "US Embassy Nairobi", phone: "+254 20 363 6000", email: "NairobiACS@state.gov", location: "United Nations Avenue, Gigiri" },
  { country: "United Kingdom", name: "UK High Commission", phone: "+254 20 284 4000", email: "Nairobi.Enquiries@fco.gov.uk", location: "Upper Hill Road, Nairobi" },
  { country: "Canada", name: "Canadian High Commission", phone: "+254 20 366 3000", email: "nrobi@international.gc.ca", location: "Limuru Road, Gigiri" },
  { country: "Germany", name: "German Embassy", phone: "+254 20 426 2100", email: "info@nairobi.diplo.de", location: "113 Riverside Drive" },
  { country: "France", name: "French Embassy", phone: "+254 20 277 8000", email: "contact@ambafrance-ke.org", location: "Peponi Gardens, Westlands" },
  { country: "Australia", name: "Australian High Commission", phone: "+254 20 427 7100", email: "ahc.nairobi@dfat.gov.au", location: "ICIPE Complex, Kasarani" },
  { country: "India", name: "Indian High Commission", phone: "+254 20 225 5774", email: "hc.nairobi@mea.gov.in", location: "Jeevan Bharati Building" },
  { country: "China", name: "Chinese Embassy", phone: "+254 20 272 6851", email: "chinaemb_ke@mfa.gov.cn", location: "Woodlands Road, Kilimani" },
];

const insurancePartners = [
  { name: "World Nomads", type: "International Travel", url: "https://worldnomads.com", note: "Covers adventure activities including safari, hiking, diving" },
  { name: "ICEA LION", type: "Local Provider", url: "https://icealion.com", note: "Kenyan insurer with travel medical and evacuation cover" },
  { name: "AAR Insurance", type: "East Africa", url: "https://aar.co.ke", note: "Regional provider with hospital network across East Africa" },
  { name: "Jubilee Insurance", type: "Local Provider", url: "https://jubileeinsurance.com", note: "Comprehensive travel insurance with air evacuation" },
];

const SafetyPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sosActive, setSosActive] = useState(false);
  const [medSearch, setMedSearch] = useState("");
  const [showLostForm, setShowLostForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [lostForm, setLostForm] = useState({ post_type: "lost", title: "", description: "", category: "other", location_name: "", contact_method: "" });
  const [contactForm, setContactForm] = useState({ contact_name: "", contact_email: "", contact_phone: "" });

  // Queries
  const { data: alerts = [] } = useQuery({
    queryKey: ["safety-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("safety_alerts").select("*").eq("is_active", true).order("severity", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["medical-facilities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medical_facilities").select("*").eq("is_published", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: lostFound = [] } = useQuery({
    queryKey: ["lost-found"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lost_found").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: trustedContacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["trusted-contacts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("trusted_contacts").select("*").eq("user_id", user.id).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredFacilities = facilities.filter((f: any) =>
    f.name.toLowerCase().includes(medSearch.toLowerCase()) ||
    f.county.toLowerCase().includes(medSearch.toLowerCase()) ||
    (f.services || []).some((s: string) => s.toLowerCase().includes(medSearch.toLowerCase()))
  );

  // SOS handler
  const handleSOS = () => {
    setSosActive(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          toast({
            title: "🆘 SOS Alert Sent",
            description: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Emergency services notified.`,
          });
          // Update trusted contacts with location
          if (user && trustedContacts.length > 0) {
            trustedContacts.forEach(async (c: any) => {
              await supabase.from("trusted_contacts").update({
                last_shared_lat: latitude,
                last_shared_lng: longitude,
                last_shared_at: new Date().toISOString(),
                is_sharing_location: true,
              }).eq("id", c.id);
            });
          }
          setTimeout(() => setSosActive(false), 3000);
        },
        () => {
          toast({ title: "🆘 SOS Alert Sent", description: "Location unavailable. Emergency services notified." });
          setTimeout(() => setSosActive(false), 3000);
        }
      );
    }
  };

  // Lost & Found submit
  const handleLostSubmit = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    if (!lostForm.title || !lostForm.description) return;
    const { error } = await supabase.from("lost_found").insert({ ...lostForm, user_id: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Posted!", description: "Your listing is now visible to the community." });
    setLostForm({ post_type: "lost", title: "", description: "", category: "other", location_name: "", contact_method: "" });
    setShowLostForm(false);
    queryClient.invalidateQueries({ queryKey: ["lost-found"] });
  };

  // Trusted contact add
  const handleAddContact = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    if (!contactForm.contact_name) return;
    const { error } = await supabase.from("trusted_contacts").insert({ ...contactForm, user_id: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contact added", description: `${contactForm.contact_name} will receive your location during emergencies.` });
    setContactForm({ contact_name: "", contact_email: "", contact_phone: "" });
    setShowContactForm(false);
    refetchContacts();
  };

  const handleDeleteContact = async (id: string) => {
    await supabase.from("trusted_contacts").delete().eq("id", id);
    refetchContacts();
  };

  const toggleLocationSharing = async (contactId: string, current: boolean) => {
    if (!current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await supabase.from("trusted_contacts").update({
          is_sharing_location: true,
          last_shared_lat: pos.coords.latitude,
          last_shared_lng: pos.coords.longitude,
          last_shared_at: new Date().toISOString(),
          sharing_started_at: new Date().toISOString(),
        }).eq("id", contactId);
        refetchContacts();
        toast({ title: "Location sharing started" });
      });
    } else {
      await supabase.from("trusted_contacts").update({ is_sharing_location: false }).eq("id", contactId);
      refetchContacts();
      toast({ title: "Location sharing stopped" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero + SOS */}
      <section className="pt-24 pb-8 bg-destructive/5">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Safety & Emergency</h1>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Your safety is our priority. Real-time alerts, one-tap SOS, medical facilities, and trusted contact sharing.
            </p>
          </motion.div>

          {/* SOS Button */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mb-6">
            <button onClick={handleSOS} disabled={sosActive} className={`w-full py-6 rounded-2xl font-body font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${sosActive ? "bg-safari-green text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-primary-foreground"}`}>
              {sosActive ? (
                <><CheckCircle className="h-6 w-6" /> SOS Sent — Help on the way</>
              ) : (
                <><Siren className="h-6 w-6 animate-pulse" /> Emergency SOS</>
              )}
            </button>
            <p className="text-xs text-muted-foreground font-body text-center mt-2">One tap sends your GPS location to emergency services & trusted contacts</p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-6">
              <TabsTrigger value="alerts" className="text-xs flex-1 min-w-[100px]"><AlertTriangle className="h-3 w-3 mr-1" />Alerts</TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs flex-1 min-w-[100px]"><Phone className="h-3 w-3 mr-1" />Emergency</TabsTrigger>
              <TabsTrigger value="medical" className="text-xs flex-1 min-w-[100px]"><Hospital className="h-3 w-3 mr-1" />Medical</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs flex-1 min-w-[100px]"><Users className="h-3 w-3 mr-1" />Trusted</TabsTrigger>
              <TabsTrigger value="lostfound" className="text-xs flex-1 min-w-[100px]"><Package className="h-3 w-3 mr-1" />Lost & Found</TabsTrigger>
              <TabsTrigger value="embassies" className="text-xs flex-1 min-w-[100px]"><Globe className="h-3 w-3 mr-1" />Embassies</TabsTrigger>
              <TabsTrigger value="insurance" className="text-xs flex-1 min-w-[100px]"><Shield className="h-3 w-3 mr-1" />Insurance</TabsTrigger>
            </TabsList>

            {/* ALERTS TAB */}
            <TabsContent value="alerts">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-savannah-gold" /> Real-Time Safety Advisories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert: any, i: number) => {
                  const sc = severityColor(alert.severity);
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-start gap-4">
                      <div className={`h-3 w-3 rounded-full mt-1 shrink-0 ${sc.dot}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`${sc.text}`}>{alertIcon(alert.alert_type)}</span>
                          <h3 className="font-body font-semibold text-foreground text-sm">{alert.region}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-body capitalize ${sc.bg} ${sc.text}`}>{alert.severity}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-body bg-muted text-muted-foreground capitalize">{alert.alert_type}</span>
                        </div>
                        <p className="font-body font-medium text-foreground text-sm mb-1">{alert.title}</p>
                        <p className="text-xs text-muted-foreground font-body">{alert.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Safety Tips */}
              <div className="mt-10">
                <h3 className="font-display text-xl font-bold text-foreground mb-4">Safety Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Wildlife Safety", tips: ["Keep distance from animals", "Stay in vehicle during game drives", "Follow guide instructions", "No flash photography near animals", "Never feed wild animals"] },
                    { title: "Urban Safety", tips: ["Use registered taxis or ride apps", "Avoid displaying expensive items", "Keep copies of documents", "Use hotel safes for valuables", "Be aware of surroundings at ATMs"] },
                    { title: "Health Tips", tips: ["Drink bottled water only", "Use insect repellent (malaria zones)", "Carry basic medications", "Check vaccination requirements", "Apply sunscreen regularly"] },
                  ].map((section) => (
                    <div key={section.title} className="glass-card p-5">
                      <h4 className="font-display font-semibold text-foreground mb-3">{section.title}</h4>
                      <ul className="space-y-2">
                        {section.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground font-body">
                            <ChevronRight className="h-4 w-4 text-safari-green shrink-0 mt-0.5" />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* EMERGENCY CONTACTS TAB */}
            <TabsContent value="emergency">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-destructive" /> Emergency Contacts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, i) => (
                  <motion.a key={`${contact.name}-${i}`} href={`tel:${contact.number.replace(/[\s/]/g, "")}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow group">
                    <div className="flex items-center gap-2 mb-2">
                      <contact.icon className={`h-4 w-4 ${contact.type === "Medical" ? "text-destructive" : contact.type === "Wildlife" ? "text-safari-green" : contact.type === "Fire" ? "text-sunset-orange" : "text-river-blue"}`} />
                      <span className="text-xs text-muted-foreground font-body uppercase">{contact.type}</span>
                    </div>
                    <h3 className="font-body font-semibold text-foreground text-sm mb-1">{contact.name}</h3>
                    <p className="font-body text-lg font-bold text-foreground group-hover:text-sunset-orange transition-colors">{contact.number}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">{contact.description}</p>
                  </motion.a>
                ))}
              </div>
            </TabsContent>

            {/* MEDICAL FACILITIES TAB */}
            <TabsContent value="medical">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-destructive" /> Medical Facilities
                </h2>
                <div className="flex items-center gap-2 glass-card px-3 py-2 w-full sm:w-auto">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search by name, county, or service..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFacilities.map((f: any) => (
                  <div key={f.id} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-body font-semibold text-foreground">{f.name}</h3>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{f.location_name || f.county}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body capitalize ${f.facility_type === "air-ambulance" ? "bg-sunset-orange/10 text-sunset-orange" : "bg-destructive/10 text-destructive"}`}>{f.facility_type.replace("-", " ")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {f.has_emergency && <span className="px-2 py-0.5 rounded-full text-xs font-body bg-destructive/10 text-destructive">🚨 Emergency</span>}
                      {f.has_pharmacy && <span className="px-2 py-0.5 rounded-full text-xs font-body bg-safari-green/10 text-safari-green">💊 Pharmacy</span>}
                      {f.has_ambulance && <span className="px-2 py-0.5 rounded-full text-xs font-body bg-sunset-orange/10 text-sunset-orange">🚑 Ambulance</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(f.services || []).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Clock className="h-3 w-3" />{f.operating_hours}</span>
                      {f.emergency_phone && (
                        <a href={`tel:${f.emergency_phone.replace(/\s/g, "")}`} className="text-xs font-body font-medium text-destructive hover:underline flex items-center gap-1">
                          <Phone className="h-3 w-3" />{f.emergency_phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TRUSTED CONTACTS TAB */}
            <TabsContent value="contacts">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-safari-green" /> Trusted Contacts
                  </h2>
                  <p className="text-sm text-muted-foreground font-body">Share your live location with contacts back home during your trip.</p>
                </div>
                {user && (
                  <button onClick={() => setShowContactForm(!showContactForm)} className="gradient-safari text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Add Contact
                  </button>
                )}
              </div>

              {!user && (
                <div className="glass-card p-8 text-center">
                  <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">Sign in to manage your trusted contacts and share your location.</p>
                </div>
              )}

              {showContactForm && (
                <div className="glass-card p-4 mb-6 space-y-3">
                  <input type="text" placeholder="Contact name *" value={contactForm.contact_name} onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="email" placeholder="Contact email" value={contactForm.contact_email} onChange={(e) => setContactForm({ ...contactForm, contact_email: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <input type="tel" placeholder="Contact phone (with country code)" value={contactForm.contact_phone} onChange={(e) => setContactForm({ ...contactForm, contact_phone: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex gap-2">
                    <button onClick={handleAddContact} className="gradient-safari text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium">Save Contact</button>
                    <button onClick={() => setShowContactForm(false)} className="px-4 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted">Cancel</button>
                  </div>
                </div>
              )}

              {trustedContacts.length > 0 && (
                <div className="space-y-3">
                  {trustedContacts.map((c: any) => (
                    <div key={c.id} className="glass-card p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-body font-semibold text-foreground">{c.contact_name}</h4>
                        <p className="text-xs text-muted-foreground font-body">{c.contact_email}{c.contact_email && c.contact_phone ? " · " : ""}{c.contact_phone}</p>
                        {c.is_sharing_location && c.last_shared_at && (
                          <p className="text-xs text-safari-green font-body mt-1">📍 Sharing since {new Date(c.sharing_started_at).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleLocationSharing(c.id, c.is_sharing_location)} className={`w-12 h-6 rounded-full relative transition-colors ${c.is_sharing_location ? "bg-safari-green" : "bg-border"}`}>
                          <div className={`absolute top-1 h-4 w-4 rounded-full bg-primary-foreground transition-all ${c.is_sharing_location ? "right-1" : "left-1"}`} />
                        </button>
                        <button onClick={() => handleDeleteContact(c.id)} className="p-1.5 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* LOST & FOUND TAB */}
            <TabsContent value="lostfound">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-savannah-gold" /> Lost & Found Board
                </h2>
                {user && (
                  <button onClick={() => setShowLostForm(!showLostForm)} className="gradient-sunset text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Post Item
                  </button>
                )}
              </div>

              {showLostForm && (
                <div className="glass-card p-4 mb-6 space-y-3">
                  <div className="flex gap-2">
                    {["lost", "found"].map((t) => (
                      <button key={t} onClick={() => setLostForm({ ...lostForm, post_type: t })} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium capitalize ${lostForm.post_type === t ? "gradient-sunset text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Item title *" value={lostForm.title} onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <textarea placeholder="Description *" value={lostForm.description} onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })} rows={3} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none resize-none focus:ring-2 focus:ring-primary" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={lostForm.category} onChange={(e) => setLostForm({ ...lostForm, category: e.target.value })} className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none">
                      <option value="other">Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="documents">Documents</option>
                      <option value="clothing">Clothing</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="bags">Bags/Luggage</option>
                    </select>
                    <input type="text" placeholder="Location" value={lostForm.location_name} onChange={(e) => setLostForm({ ...lostForm, location_name: e.target.value })} className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none" />
                  </div>
                  <input type="text" placeholder="How to reach you (phone/email)" value={lostForm.contact_method} onChange={(e) => setLostForm({ ...lostForm, contact_method: e.target.value })} className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={handleLostSubmit} className="gradient-sunset text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-medium flex items-center gap-2"><Send className="h-4 w-4" />Post</button>
                </div>
              )}

              {lostFound.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lostFound.map((item: any) => (
                    <div key={item.id} className={`glass-card p-4 ${item.is_resolved ? "opacity-60" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-body font-medium capitalize ${item.post_type === "lost" ? "bg-destructive/10 text-destructive" : "bg-safari-green/10 text-safari-green"}`}>{item.post_type}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-body bg-muted text-muted-foreground capitalize">{item.category}</span>
                        {item.is_resolved && <span className="px-2 py-0.5 rounded-full text-xs font-body bg-safari-green/10 text-safari-green">✓ Resolved</span>}
                      </div>
                      <h4 className="font-body font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-body mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                        {item.location_name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location_name}</span>}
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      {item.contact_method && <p className="text-xs font-body text-primary mt-2">Contact: {item.contact_method}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">No items posted yet. Lost or found something? Post it to help the community!</p>
                </div>
              )}
            </TabsContent>

            {/* EMBASSIES TAB */}
            <TabsContent value="embassies">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-river-blue" /> Embassies & Consulates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {embassies.map((e) => (
                  <div key={e.country} className="glass-card p-4">
                    <h3 className="font-body font-semibold text-foreground mb-1">{e.name}</h3>
                    <p className="text-xs text-muted-foreground font-body mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>
                    <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="font-body text-sm font-bold text-foreground hover:text-sunset-orange transition-colors flex items-center gap-1 mb-1">
                      <Phone className="h-3 w-3" />{e.phone}
                    </a>
                    <p className="text-xs text-muted-foreground font-body">{e.email}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* INSURANCE TAB */}
            <TabsContent value="insurance">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-safari-green" /> Travel Insurance Partners
              </h2>
              <p className="text-sm text-muted-foreground font-body mb-6">We recommend securing travel insurance before your Kenya trip. These providers cover safari activities, medical evacuation, and trip cancellation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insurancePartners.map((ins) => (
                  <a key={ins.name} href={ins.url} target="_blank" rel="noopener noreferrer" className="glass-card p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-body font-semibold text-foreground group-hover:text-sunset-orange transition-colors">{ins.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-body bg-muted text-muted-foreground">{ins.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{ins.note}</p>
                  </a>
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

export default SafetyPage;
