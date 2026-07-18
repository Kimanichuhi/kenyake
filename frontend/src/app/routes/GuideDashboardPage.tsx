import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3, Calendar, CheckCircle2, Clock, DollarSign, Edit3, Eye,
  Loader2, MapPin, MessageCircle, Plus, Save, Star, Trash2, Users,
  X, Send, ChevronRight, Shield, Zap, Award
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTransitionBookingStatus } from "@/domains/bookings/hooks/useTransitionBookingStatus";
import { useVerifyBookingPayment } from "@/domains/bookings/hooks/useBookingPayments";
import { PaymentStatusBadge } from "@/domains/bookings/components/BookingStatusBadge";
import { BookingStatus } from "@/domains/bookings/types/booking";

interface GuideProfile {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  languages: string[];
  specializations: string[];
  certifications: string[];
  certification_level: string;
  location: string | null;
  county: string | null;
  price_per_day: number | null;
  rating: number;
  review_count: number;
  years_experience: number;
  response_time_minutes: number;
  is_available: boolean;
  is_verified: boolean;
  total_earnings: number;
  total_bookings: number;
}

interface Booking {
  id: string;
  tourist_id: string;
  start_date: string;
  end_date: string;
  group_size: number;
  total_price: number | null;
  status: string;
  payment_status: string;
  message: string | null;
  created_at: string;
}

interface GroupTripAssignment {
  id: string;
  trip_id: string;
  role: string;
  status: string;
  price_agreed: number | null;
  trip?: {
    title: string;
    start_date: string;
    end_date: string;
    group_size: number;
    status: string;
  };
}

interface TripMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const GuideDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const transitionBookingStatus = useTransitionBookingStatus();
  const verifyPayment = useVerifyBookingPayment();
  const [guide, setGuide] = useState<GuideProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groupAssignments, setGroupAssignments] = useState<GroupTripAssignment[]>([]);
  const [messages, setMessages] = useState<Record<string, TripMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "bookings" | "availability" | "profile" | "groups" | "earnings">("overview");
  const [availDates, setAvailDates] = useState<{ date: string; is_available: boolean }[]>([]);
  const [newAvailDate, setNewAvailDate] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<GuideProfile>>({});
  const [newMessage, setNewMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) fetchGuideProfile();
  }, [user]);

  const fetchGuideProfile = async () => {
    const { data } = await supabase
      .from("guides")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) {
      setGuide(data as unknown as GuideProfile);
      setProfileForm(data as unknown as GuideProfile);
      fetchBookings(data.id);
      fetchAvailability(data.id);
      fetchGroupAssignments(data.id);
    }
    setLoading(false);
  };

  const fetchBookings = async (guideId: string) => {
    const { data } = await supabase
      .from("guide_bookings")
      .select("*")
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false });
    if (data) setBookings(data as Booking[]);
  };

  const fetchAvailability = async (guideId: string) => {
    const { data } = await supabase
      .from("guide_availability")
      .select("date, is_available")
      .eq("guide_id", guideId)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date");
    if (data) setAvailDates(data);
  };

  const fetchGroupAssignments = async (guideId: string) => {
    const { data } = await supabase
      .from("group_trip_guides")
      .select("id, trip_id, role, status, price_agreed")
      .eq("guide_id", guideId);
    if (data) {
      // Fetch trip details for each assignment
      const tripIds = data.map((d: any) => d.trip_id);
      if (tripIds.length > 0) {
        const { data: trips } = await supabase
          .from("group_trips")
          .select("id, title, start_date, end_date, group_size, status")
          .in("id", tripIds);
        const tripMap = (trips || []).reduce((acc: any, t: any) => ({ ...acc, [t.id]: t }), {});
        setGroupAssignments(data.map((d: any) => ({ ...d, trip: tripMap[d.trip_id] })));
      } else {
        setGroupAssignments([]);
      }
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await transitionBookingStatus.mutateAsync({ resourceType: "guide", bookingId, newStatus: status });
      if (guide) fetchBookings(guide.id);
    } catch {
      // useTransitionBookingStatus already surfaces a toast on error
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    const { data } = await supabase
      .from("booking_payments")
      .select("id")
      .eq("resource_type", "guide")
      .eq("booking_id", bookingId)
      .eq("status", "pending_verification")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) {
      toast({ title: "No pending payment found for this booking" });
      return;
    }
    await verifyPayment.mutateAsync({ paymentId: data.id, approve: true });
    if (guide) fetchBookings(guide.id);
  };

  const addAvailability = async () => {
    if (!guide || !newAvailDate) return;
    const { error } = await supabase.from("guide_availability").upsert({
      guide_id: guide.id,
      date: newAvailDate,
      is_available: true,
    }, { onConflict: "guide_id,date" });
    if (!error) {
      setNewAvailDate("");
      fetchAvailability(guide.id);
      toast({ title: "Date added" });
    }
  };

  const removeAvailability = async (date: string) => {
    if (!guide) return;
    await supabase
      .from("guide_availability")
      .delete()
      .eq("guide_id", guide.id)
      .eq("date", date);
    fetchAvailability(guide.id);
  };

  const saveProfile = async () => {
    if (!guide) return;
    const { error } = await supabase
      .from("guides")
      .update({
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        county: profileForm.county,
        photo_url: profileForm.photo_url,
        price_per_day: profileForm.price_per_day,
        is_available: profileForm.is_available,
      })
      .eq("id", guide.id);
    if (!error) {
      toast({ title: "Profile saved!" });
      setEditingProfile(false);
      fetchGuideProfile();
    }
  };

  const updateGroupAssignment = async (assignmentId: string, status: string) => {
    const { error } = await supabase
      .from("group_trip_guides")
      .update({ status })
      .eq("id", assignmentId);
    if (!error) {
      toast({ title: `Trip ${status}` });
      if (guide) fetchGroupAssignments(guide.id);
    }
  };

  const sendTripMessage = async (tripId: string) => {
    if (!user || !newMessage[tripId]?.trim()) return;
    const { error } = await supabase.from("guide_messages").insert({
      trip_id: tripId,
      sender_id: user.id,
      message: newMessage[tripId].trim(),
    });
    if (!error) {
      setNewMessage((prev) => ({ ...prev, [tripId]: "" }));
      fetchTripMessages(tripId);
    }
  };

  const fetchTripMessages = async (tripId: string) => {
    const { data } = await supabase
      .from("guide_messages")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at");
    if (data) setMessages((prev) => ({ ...prev, [tripId]: data as TripMessage[] }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <Button asChild className="rounded-full"><a href="/auth">Sign In</a></Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Not Registered Yet</h1>
          <p className="text-muted-foreground font-body mb-6">Register as a guide to access your dashboard.</p>
          <Button asChild className="rounded-full"><Link to="/guide-register">Become a Guide</Link></Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgRating = Number(guide.rating).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={guide.photo_url || "https://via.placeholder.com/64"}
                alt={guide.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-border"
              />
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{guide.name}</h1>
                <p className="text-sm text-muted-foreground font-body flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {guide.location}
                  <span className="text-secondary flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current" /> {avgRating}
                  </span>
                  <Badge variant="outline" className="text-[10px] capitalize">{guide.certification_level}</Badge>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
            {(["overview", "bookings", "groups", "availability", "profile", "earnings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-body font-medium whitespace-nowrap transition-colors ${
                  tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "overview" ? "📊 Overview" : t === "bookings" ? "📋 Bookings" : t === "groups" ? "👥 Group Trips" : t === "availability" ? "📅 Availability" : t === "profile" ? "✏️ Profile" : "💰 Earnings"}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Pending Requests", value: pendingBookings.length, icon: Clock, color: "text-secondary" },
                  { label: "Active Bookings", value: confirmedBookings.length, icon: CheckCircle2, color: "text-primary" },
                  { label: "Total Earned", value: `$${totalEarned}`, icon: DollarSign, color: "text-accent" },
                  { label: "Rating", value: avgRating, icon: Star, color: "text-secondary" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-card rounded-xl p-4 border border-border">
                    <Icon className={`h-5 w-5 ${color} mb-2`} />
                    <div className="text-2xl font-display font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground font-body">{label}</div>
                  </div>
                ))}
              </div>

              {pendingBookings.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">Pending Requests</h3>
                  <div className="space-y-3">
                    {pendingBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                        <div>
                          <div className="text-sm font-body font-medium text-foreground">
                            {booking.start_date} → {booking.end_date}
                          </div>
                          <div className="text-xs text-muted-foreground font-body">
                            {booking.group_size} people · ${booking.total_price}
                          </div>
                          {booking.message && (
                            <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-1">"{booking.message}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, "rejected")} className="text-xs">
                            Decline
                          </Button>
                          <Button size="sm" onClick={() => updateBookingStatus(booking.id, "confirmed")} className="text-xs">
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupAssignments.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">Group Trip Invitations</h3>
                  {groupAssignments.filter((a) => a.status === "pending").map((assign) => (
                    <div key={assign.id} className="bg-card rounded-xl p-4 border border-border mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-body font-medium text-foreground">{assign.trip?.title || "Group Trip"}</div>
                          <div className="text-xs text-muted-foreground font-body">
                            {assign.trip?.start_date} → {assign.trip?.end_date} · {assign.trip?.group_size} people · Role: {assign.role}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateGroupAssignment(assign.id, "declined")} className="text-xs">Decline</Button>
                          <Button size="sm" onClick={() => updateGroupAssignment(assign.id, "accepted")} className="text-xs">Accept</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {tab === "bookings" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-body">No bookings yet. Make sure your profile is visible on the marketplace.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[10px] ${
                            booking.status === "pending" ? "bg-secondary/20 text-secondary-foreground" :
                            booking.status === "confirmed" ? "bg-primary/20 text-primary" :
                            booking.status === "completed" ? "bg-primary text-primary-foreground" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {booking.status}
                          </Badge>
                          {booking.payment_status && booking.payment_status !== "unpaid" && (
                            <PaymentStatusBadge status={booking.payment_status} />
                          )}
                          <span className="text-xs text-muted-foreground font-body">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-body font-medium text-foreground">
                          {booking.start_date} → {booking.end_date}
                        </div>
                        <div className="text-xs text-muted-foreground font-body mt-1">
                          {booking.group_size} people · ${booking.total_price}
                        </div>
                        {booking.message && (
                          <p className="text-xs text-muted-foreground font-body mt-2 bg-muted/50 rounded-lg p-2">"{booking.message}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, "rejected")} className="text-xs">Decline</Button>
                            <Button size="sm" onClick={() => updateBookingStatus(booking.id, "confirmed")} className="text-xs">Accept</Button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <Button size="sm" onClick={() => updateBookingStatus(booking.id, "completed")} className="text-xs">Mark Complete</Button>
                        )}
                        {booking.payment_status === "pending_verification" && (
                          <Button size="sm" variant="outline" onClick={() => handleVerifyPayment(booking.id)} className="text-xs">
                            Verify Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Group Trips */}
          {tab === "groups" && (
            <div className="space-y-4">
              {groupAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-body">No group trips yet.</p>
                </div>
              ) : (
                groupAssignments.map((assign) => (
                  <div key={assign.id} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-semibold text-foreground">{assign.trip?.title || "Group Trip"}</h3>
                          <div className="text-xs text-muted-foreground font-body mt-1">
                            {assign.trip?.start_date} → {assign.trip?.end_date} · {assign.trip?.group_size} people
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] capitalize">{assign.role}</Badge>
                            <Badge className={`text-[10px] ${
                              assign.status === "accepted" ? "bg-primary/20 text-primary" :
                              assign.status === "pending" ? "bg-secondary/20 text-secondary-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>{assign.status}</Badge>
                          </div>
                        </div>
                        {assign.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateGroupAssignment(assign.id, "declined")} className="text-xs">Decline</Button>
                            <Button size="sm" onClick={() => updateGroupAssignment(assign.id, "accepted")} className="text-xs">Accept</Button>
                          </div>
                        )}
                      </div>

                      {/* Trip chat */}
                      {assign.status === "accepted" && (
                        <div className="border-t border-border pt-3 mt-3">
                          <h4 className="text-xs font-body font-medium text-foreground mb-2 flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> Guide Coordination Chat
                          </h4>
                          <div className="bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 mb-2">
                            {(messages[assign.trip_id] || []).length === 0 ? (
                              <p className="text-xs text-muted-foreground font-body text-center py-2">
                                No messages yet. Start coordinating!
                                <button onClick={() => fetchTripMessages(assign.trip_id)} className="text-primary ml-1 underline">Load</button>
                              </p>
                            ) : (
                              (messages[assign.trip_id] || []).map((msg) => (
                                <div key={msg.id} className={`text-xs font-body p-2 rounded ${
                                  msg.sender_id === user?.id ? "bg-primary/10 text-foreground ml-8" : "bg-card text-foreground mr-8"
                                }`}>
                                  {msg.message}
                                  <span className="text-[10px] text-muted-foreground ml-2">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={newMessage[assign.trip_id] || ""}
                              onChange={(e) => setNewMessage((p) => ({ ...p, [assign.trip_id]: e.target.value }))}
                              placeholder="Message other guides..."
                              className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs font-body bg-background text-foreground"
                              onKeyDown={(e) => e.key === "Enter" && sendTripMessage(assign.trip_id)}
                            />
                            <Button size="sm" onClick={() => sendTripMessage(assign.trip_id)} className="text-xs">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Availability */}
          {tab === "availability" && (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Add Available Date</label>
                  <input
                    type="date"
                    value={newAvailDate}
                    onChange={(e) => setNewAvailDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <Button onClick={addAvailability} disabled={!newAvailDate} className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availDates.map((day) => (
                  <div
                    key={day.date}
                    className={`rounded-xl p-3 border flex items-center justify-between ${
                      day.is_available ? "bg-primary/10 border-primary/25" : "bg-muted border-border"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-body font-medium text-foreground">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{day.is_available ? "✓ Open" : "✕ Blocked"}</div>
                    </div>
                    <button onClick={() => removeAvailability(day.date)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {availDates.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-body">No dates set. Add your available dates so tourists know when you're free.</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Editor */}
          {tab === "profile" && (
            <div className="max-w-xl space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Name</label>
                <input
                  value={profileForm.name || ""}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Bio</label>
                <textarea
                  value={profileForm.bio || ""}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Location</label>
                  <input
                    value={profileForm.location || ""}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Daily Rate ($)</label>
                  <input
                    type="number"
                    value={profileForm.price_per_day || ""}
                    onChange={(e) => setProfileForm((p) => ({ ...p, price_per_day: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Photo URL</label>
                <input
                  value={profileForm.photo_url || ""}
                  onChange={(e) => setProfileForm((p) => ({ ...p, photo_url: e.target.value }))}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-body font-medium text-foreground">Available for bookings</label>
                <button
                  onClick={() => setProfileForm((p) => ({ ...p, is_available: !p.is_available }))}
                  className={`w-10 h-6 rounded-full transition-colors ${profileForm.is_available ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`h-4 w-4 rounded-full bg-primary-foreground transition-transform ml-1 ${profileForm.is_available ? "translate-x-4" : ""}`} />
                </button>
              </div>
              <Button onClick={saveProfile} className="rounded-full">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          )}

          {/* Earnings */}
          {tab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border">
                  <DollarSign className="h-5 w-5 text-primary mb-2" />
                  <div className="text-3xl font-display font-bold text-foreground">${totalEarned}</div>
                  <div className="text-xs text-muted-foreground font-body">Total Earned</div>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border">
                  <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                  <div className="text-3xl font-display font-bold text-foreground">{completedBookings.length}</div>
                  <div className="text-xs text-muted-foreground font-body">Completed Trips</div>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border">
                  <BarChart3 className="h-5 w-5 text-secondary mb-2" />
                  <div className="text-3xl font-display font-bold text-foreground">
                    ${completedBookings.length > 0 ? Math.round(totalEarned / completedBookings.length) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground font-body">Avg per Trip</div>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Completed Bookings</h3>
                {completedBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-8">No completed trips yet.</p>
                ) : (
                  <div className="space-y-2">
                    {completedBookings.map((b) => (
                      <div key={b.id} className="bg-card rounded-lg p-3 border border-border flex justify-between items-center">
                        <div className="text-sm font-body">
                          <span className="text-foreground font-medium">{b.start_date} → {b.end_date}</span>
                          <span className="text-muted-foreground ml-2">{b.group_size} people</span>
                        </div>
                        <span className="font-display font-bold text-primary">${b.total_price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default GuideDashboardPage;
