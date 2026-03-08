import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar, MapPin, Users, Clock, Info, AlertCircle, ChevronRight,
  Send, CheckCircle, XCircle, Camera, Bell, Shirt, Backpack,
  Repeat, Star, Filter, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import culturalCeremony from "@/assets/cultural-ceremony.jpg";
import expBeadwork from "@/assets/exp-beadwork.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import destLamu from "@/assets/dest-lamu.jpg";
import communityMarket from "@/assets/community-market.jpg";

const eventTypeColors: Record<string, string> = {
  ceremony: "bg-sunset-orange/10 text-sunset-orange",
  festival: "bg-savannah-gold/10 text-savannah-gold",
  market: "bg-safari-green/10 text-safari-green",
  celebration: "bg-river-blue/10 text-river-blue",
  naming: "bg-accent/10 text-accent",
  harvest: "bg-acacia-green/10 text-acacia-green",
  age_set: "bg-earth-brown/10 text-earth-brown",
};

const eventTypeLabels: Record<string, string> = {
  ceremony: "🙏 Ceremony",
  festival: "🎉 Festival",
  market: "🛍️ Market",
  celebration: "🎊 Celebration",
  naming: "👶 Naming",
  harvest: "🌾 Harvest",
  age_set: "⚔️ Age-Set",
};

const months = [
  "All", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const monthMap: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const eventTypes = ["All", "ceremony", "festival", "market", "celebration", "naming", "harvest", "age_set"];

const EventsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [notifyRecurring, setNotifyRecurring] = useState(false);

  // Fetch events with community info
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["community-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_events")
        .select("*, communities(name, slug, county)")
        .order("start_date");
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's invitations
  const { data: myInvitations = [] } = useQuery({
    queryKey: ["my-invitations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_invitations")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch approved event photos
  const { data: eventPhotos = [] } = useQuery({
    queryKey: ["event-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Submit invitation request
  const inviteMutation = useMutation({
    mutationFn: async ({ eventId, message, groupSize, notifyRecurring }: any) => {
      const { error } = await supabase.from("event_invitations").insert({
        event_id: eventId,
        user_id: user!.id,
        message,
        group_size: groupSize,
        notify_recurring: notifyRecurring,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      setShowInviteDialog(false);
      setInviteMessage("");
      setGroupSize(1);
      toast({ title: "Invitation Requested!", description: "The community will review your request and respond." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message?.includes("duplicate") ? "You've already requested an invitation to this event." : err.message, variant: "destructive" });
    },
  });

  // Filter events
  const filtered = events.filter((e: any) => {
    const matchMonth = selectedMonth === "All" || new Date(e.start_date).getMonth() === monthMap[selectedMonth];
    const matchType = selectedType === "All" || e.event_type === selectedType;
    return matchMonth && matchType;
  });

  const upcomingEvents = filtered.filter((e: any) => !e.is_past && new Date(e.start_date) >= new Date());
  const pastEvents = filtered.filter((e: any) => e.is_past || new Date(e.end_date || e.start_date) < new Date());
  const recurringEvents = filtered.filter((e: any) => e.recurrence && e.recurrence !== "once");

  const getInvitationStatus = (eventId: string) => {
    return myInvitations.find((inv: any) => inv.event_id === eventId);
  };

  const formatDateRange = (start: string, end: string | null) => {
    const s = new Date(start);
    if (!end || start === end) return s.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const e = new Date(end);
    if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString("en-US", { month: "long", day: "numeric" })}–${e.getDate()}, ${e.getFullYear()}`;
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const EventCard = ({ event, index }: { event: any; index: number }) => {
    const capacityPct = event.max_attendees ? Math.round((event.current_attendees / event.max_attendees) * 100) : 0;
    const spotsLeft = (event.max_attendees || 0) - (event.current_attendees || 0);
    const invitation = getInvitationStatus(event.id);
    const community = event.communities;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow"
      >
        <div className="md:flex">
          <div className="md:w-2/5 h-48 md:h-auto relative">
            <img src={culturalCeremony} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
            {event.recurrence && event.recurrence !== "once" && (
              <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm border-0 text-xs">
                <Repeat className="h-3 w-3 mr-1" />{event.recurrence_detail || event.recurrence}
              </Badge>
            )}
            {spotsLeft <= 10 && spotsLeft > 0 && (
              <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0 text-xs">
                {spotsLeft} spots left
              </Badge>
            )}
            {spotsLeft <= 0 && (
              <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0 text-xs">
                Fully Booked
              </Badge>
            )}
          </div>
          <div className="p-5 md:w-3/5 flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${eventTypeColors[event.event_type] || "bg-muted text-muted-foreground"}`}>
                {eventTypeLabels[event.event_type] || event.event_type}
              </span>
              {event.invitation_required && (
                <Badge variant="outline" className="text-xs border-sunset-orange/30 text-sunset-orange">
                  Invitation Required
                </Badge>
              )}
            </div>

            <h3 className="font-display text-lg font-semibold text-foreground mb-1">{event.title}</h3>
            {community && (
              <Link to={`/community/${community.slug}`} className="text-sm text-safari-green font-body hover:underline mb-1 inline-block">
                {community.name}
              </Link>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-2 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location_name || event.county}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateRange(event.start_date, event.end_date)}</span>
              {event.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.start_time}–{event.end_time}</span>}
            </div>

            <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{event.description}</p>

            {/* Capacity bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />Attendance</span>
                <span>{event.current_attendees}/{event.max_attendees}</span>
              </div>
              <Progress value={capacityPct} className="h-1.5" />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-4">
              <span className="font-semibold text-foreground">{event.price || "Free"}</span>
            </div>

            <div className="mt-auto flex gap-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="flex-1 border border-border text-foreground py-2 rounded-xl text-sm font-body font-medium hover:bg-muted transition-colors"
              >
                View Details
              </button>
              {invitation ? (
                <div className={`flex-1 py-2 rounded-xl text-sm font-body font-medium text-center ${
                  invitation.status === "approved" ? "bg-safari-green/10 text-safari-green" :
                  invitation.status === "declined" ? "bg-destructive/10 text-destructive" :
                  "bg-savannah-gold/10 text-savannah-gold"
                }`}>
                  {invitation.status === "approved" ? "✓ Approved" :
                   invitation.status === "declined" ? "✗ Declined" :
                   invitation.status === "waitlisted" ? "⏳ Waitlisted" : "⏳ Pending"}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      toast({ title: "Sign in required", description: "Please sign in to request event invitations.", variant: "destructive" });
                      return;
                    }
                    setSelectedEvent(event);
                    setShowInviteDialog(true);
                  }}
                  disabled={spotsLeft <= 0}
                  className="flex-1 gradient-sunset text-primary-foreground py-2 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {event.invitation_required ? "Request Invitation" : "Register"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Cultural Calendar</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Authentic Events & Ceremonies</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Community-posted events across Kenya — sacred ceremonies, vibrant festivals, craft markets, and cultural celebrations. Request invitations directly from the hosting community.
            </p>
          </motion.div>

          {/* Month filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {months.map((m) => (
              <button key={m} onClick={() => setSelectedMonth(m)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedMonth === m ? "gradient-sunset text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {m}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {eventTypes.map((t) => (
              <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedType === t ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                {t === "All" ? "All Types" : eventTypeLabels[t] || t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="upcoming" className="text-xs font-body">📅 Upcoming ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="recurring" className="text-xs font-body">🔄 Recurring ({recurringEvents.length})</TabsTrigger>
              <TabsTrigger value="past" className="text-xs font-body">📸 Past Events ({pastEvents.length})</TabsTrigger>
              {user && <TabsTrigger value="my-invitations" className="text-xs font-body">🎟️ My Invitations ({myInvitations.length})</TabsTrigger>}
            </TabsList>

            {/* Upcoming */}
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="text-center py-16 text-muted-foreground font-body animate-pulse">Loading events...</div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingEvents.map((event: any, i: number) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-body text-muted-foreground">No upcoming events match your filters.</p>
                </div>
              )}
            </TabsContent>

            {/* Recurring */}
            <TabsContent value="recurring">
              {recurringEvents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recurringEvents.map((event: any, i: number) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Repeat className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-body text-muted-foreground">No recurring events match your filters.</p>
                </div>
              )}
            </TabsContent>

            {/* Past Events & Photos */}
            <TabsContent value="past">
              {pastEvents.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pastEvents.map((event: any, i: number) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </div>
                  {eventPhotos.length > 0 && (
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-river-blue" /> Community-Approved Event Photos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {eventPhotos.map((photo: any) => (
                          <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                            <img src={photo.photo_url} alt={photo.caption || "Event photo"} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Camera className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-body text-muted-foreground">No past events to show.</p>
                </div>
              )}
            </TabsContent>

            {/* My Invitations */}
            {user && (
              <TabsContent value="my-invitations">
                {myInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {myInvitations.map((inv: any) => {
                      const event = events.find((e: any) => e.id === inv.event_id);
                      return (
                        <div key={inv.id} className="glass-card p-5">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <h3 className="font-display font-semibold text-foreground">{event?.title || "Event"}</h3>
                              <p className="text-xs text-muted-foreground font-body">Requested {new Date(inv.created_at).toLocaleDateString()}</p>
                              {inv.message && <p className="text-sm text-muted-foreground font-body mt-1 italic">"{inv.message}"</p>}
                            </div>
                            <Badge className={
                              inv.status === "approved" ? "bg-safari-green/10 text-safari-green border-safari-green/30" :
                              inv.status === "declined" ? "bg-destructive/10 text-destructive border-destructive/30" :
                              inv.status === "waitlisted" ? "bg-savannah-gold/10 text-savannah-gold border-savannah-gold/30" :
                              "bg-muted text-muted-foreground"
                            }>
                              {inv.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {inv.status === "declined" && <XCircle className="h-3 w-3 mr-1" />}
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </Badge>
                          </div>
                          {inv.response_message && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-body font-semibold text-safari-green mb-1">Community Response:</p>
                              <p className="text-sm text-muted-foreground font-body italic">{inv.response_message}</p>
                            </div>
                          )}
                          {inv.notify_recurring && (
                            <p className="text-xs text-muted-foreground font-body mt-2 flex items-center gap-1">
                              <Bell className="h-3 w-3 text-savannah-gold" /> Notifications enabled for recurring events
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-body text-muted-foreground">You haven't requested any event invitations yet.</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent && !showInviteDialog} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${eventTypeColors[selectedEvent.event_type] || ""}`}>
                    {eventTypeLabels[selectedEvent.event_type] || selectedEvent.event_type}
                  </span>
                  {selectedEvent.recurrence && selectedEvent.recurrence !== "once" && (
                    <Badge variant="outline" className="text-xs"><Repeat className="h-3 w-3 mr-1" />{selectedEvent.recurrence_detail}</Badge>
                  )}
                </div>
                <DialogTitle className="font-display text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="font-body">
                  {selectedEvent.communities?.name && (
                    <Link to={`/community/${selectedEvent.communities.slug}`} className="text-safari-green hover:underline">
                      {selectedEvent.communities.name}
                    </Link>
                  )}
                  {" • "}{selectedEvent.location_name || selectedEvent.county}
                  {" • "}{formatDateRange(selectedEvent.start_date, selectedEvent.end_date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <p className="text-sm text-muted-foreground font-body">{selectedEvent.description}</p>

                {/* Capacity */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between text-sm font-body mb-2">
                    <span className="font-medium text-foreground flex items-center gap-1"><Users className="h-4 w-4" /> Attendance Capacity</span>
                    <span className="text-muted-foreground">{selectedEvent.current_attendees}/{selectedEvent.max_attendees}</span>
                  </div>
                  <Progress value={selectedEvent.max_attendees ? (selectedEvent.current_attendees / selectedEvent.max_attendees) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground font-body mt-2">
                    {selectedEvent.invitation_required ? "Community-controlled capacity. Invitation approval required." : "Open attendance until capacity is reached."}
                  </p>
                </div>

                {/* Preparation Guide */}
                {selectedEvent.preparation_guide && (
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-4 w-4 text-river-blue" /> Preparation Guide
                    </h4>
                    <p className="text-sm text-muted-foreground font-body">{selectedEvent.preparation_guide}</p>
                  </div>
                )}

                {/* What to Bring & Wear */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedEvent.what_to_bring && (
                    <div className="glass-card p-4">
                      <h4 className="font-body font-semibold text-foreground text-sm flex items-center gap-1 mb-2">
                        <Backpack className="h-4 w-4 text-savannah-gold" /> What to Bring
                      </h4>
                      <ul className="text-xs text-muted-foreground font-body space-y-1">
                        {selectedEvent.what_to_bring.split(",").map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-savannah-gold mt-0.5">•</span>{item.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedEvent.what_to_wear && (
                    <div className="glass-card p-4">
                      <h4 className="font-body font-semibold text-foreground text-sm flex items-center gap-1 mb-2">
                        <Shirt className="h-4 w-4 text-sunset-orange" /> What to Wear
                      </h4>
                      <p className="text-xs text-muted-foreground font-body">{selectedEvent.what_to_wear}</p>
                    </div>
                  )}
                </div>

                {/* Etiquette */}
                {selectedEvent.etiquette_notes && (
                  <div className="glass-card p-4 border-l-4 border-l-destructive">
                    <h4 className="font-body font-semibold text-foreground text-sm flex items-center gap-1 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" /> Etiquette & Respect
                    </h4>
                    <p className="text-xs text-muted-foreground font-body">{selectedEvent.etiquette_notes}</p>
                  </div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-display text-lg font-bold text-foreground">{selectedEvent.price || "Free"}</span>
                  {!getInvitationStatus(selectedEvent.id) ? (
                    <button
                      onClick={() => {
                        if (!user) {
                          toast({ title: "Sign in required", description: "Please sign in to request event invitations.", variant: "destructive" });
                          return;
                        }
                        setShowInviteDialog(true);
                      }}
                      className="gradient-sunset text-primary-foreground px-6 py-2 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity"
                    >
                      {selectedEvent.invitation_required ? "Request Invitation" : "Register to Attend"}
                    </button>
                  ) : (
                    <Badge className="bg-safari-green/10 text-safari-green border-safari-green/30 text-sm py-2 px-4">
                      <CheckCircle className="h-4 w-4 mr-1" /> Invitation {getInvitationStatus(selectedEvent.id)?.status}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invitation Request Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Request Invitation</DialogTitle>
            <DialogDescription className="font-body">
              Send a message to the {selectedEvent?.communities?.name || "community"} explaining your interest in attending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1 block">Your Message to the Community</label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Share why you'd like to attend and any relevant background..."
                className="font-body text-sm"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1 block">Group Size</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                className="font-body text-sm w-24"
              />
            </div>
            {selectedEvent?.recurrence && selectedEvent.recurrence !== "once" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyRecurring}
                  onChange={(e) => setNotifyRecurring(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm font-body text-muted-foreground flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Notify me about future occurrences of this event
                </span>
              </label>
            )}
            <button
              onClick={() => {
                if (!selectedEvent) return;
                inviteMutation.mutate({
                  eventId: selectedEvent.id,
                  message: inviteMessage,
                  groupSize,
                  notifyRecurring,
                });
              }}
              disabled={inviteMutation.isPending}
              className="w-full gradient-safari text-primary-foreground py-2.5 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {inviteMutation.isPending ? "Submitting..." : "Submit Invitation Request"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default EventsPage;
