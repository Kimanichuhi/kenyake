import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Car, CheckCircle2, Clock, DollarSign, Loader2, MapPin, Shield, Star, BadgeCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTransitionBookingStatus } from "@/domains/bookings/hooks/useTransitionBookingStatus";
import { useVerifyBookingPayment } from "@/domains/bookings/hooks/useBookingPayments";
import { useOwnerBookings } from "@/domains/bookings/hooks/useOwnerBookings";
import { BookingCard } from "@/domains/bookings/components/BookingCard";
import { BookingStatus } from "@/domains/bookings/types/booking";

interface DriverProfile {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  photo_url: string | null;
  phone: string | null;
  bio: string | null;
  languages: string[] | null;
  license_class: string | null;
  years_experience: number | null;
  is_verified: boolean | null;
  is_available: boolean | null;
  is_published: boolean | null;
  rating: number | null;
  review_count: number | null;
  total_trips: number | null;
  location: string | null;
  county: string | null;
  specializations: string[] | null;
}

interface TransportBookingRow {
  id: string;
  user_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  booking_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  pickup_date: string;
  pickup_time: string | null;
  return_date: string | null;
  passenger_count: number | null;
  total_price: number | null;
  price_currency: string | null;
  status: string;
  payment_status: string;
  special_requests: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  transport_vehicles: { name: string; vehicle_type: string } | null;
  transport_drivers: { name: string } | null;
}

const TransportDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const transitionBookingStatus = useTransitionBookingStatus();
  const verifyPayment = useVerifyBookingPayment();

  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "bookings">("overview");

  const { data: bookingsData } = useOwnerBookings("transport", !!driver);
  const bookings = (bookingsData ?? []) as unknown as TransportBookingRow[];

  useEffect(() => {
    if (user) fetchDriverProfile();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDriverProfile = async () => {
    const { data } = await supabase
      .from("transport_drivers")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setDriver(data as DriverProfile | null);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await transitionBookingStatus.mutateAsync({ resourceType: "transport", bookingId, newStatus: status });
    } catch {
      // useTransitionBookingStatus already surfaces a toast on error
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    const { data } = await supabase
      .from("booking_payments")
      .select("id")
      .eq("resource_type", "transport")
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

  if (!driver) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Not Registered Yet</h1>
          <p className="text-muted-foreground font-body mb-6">
            You're not registered as a driver yet. Driver registration isn't available on the platform right now — check back soon.
          </p>
        </div>
        <FooterSection />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgRating = Number(driver.rating ?? 0).toFixed(1);

  const formatDateLabel = (booking: TransportBookingRow) => {
    const pickup = new Date(booking.pickup_date).toLocaleDateString();
    return booking.return_date ? `${pickup} → ${new Date(booking.return_date).toLocaleDateString()}` : pickup;
  };

  const renderActions = (booking: TransportBookingRow) => (
    <>
      {booking.status === "pending" && (
        <>
          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, "rejected")} className="text-xs">
            Decline
          </Button>
          <Button size="sm" onClick={() => updateBookingStatus(booking.id, "confirmed")} className="text-xs">
            Accept
          </Button>
        </>
      )}
      {booking.status === "confirmed" && (
        <Button size="sm" onClick={() => updateBookingStatus(booking.id, "completed")} className="text-xs">
          Mark Complete
        </Button>
      )}
      {booking.payment_status === "pending_verification" && (
        <Button size="sm" variant="outline" onClick={() => handleVerifyPayment(booking.id)} className="text-xs">
          Verify Payment
        </Button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={driver.photo_url || "https://via.placeholder.com/64"}
                alt={driver.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-border"
              />
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  {driver.name}
                  {driver.is_verified && <BadgeCheck className="h-5 w-5 text-safari-green" />}
                </h1>
                <p className="text-sm text-muted-foreground font-body flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {driver.location}
                  <span className="text-secondary flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current" /> {avgRating}
                  </span>
                  {driver.license_class && (
                    <Badge variant="outline" className="text-[10px] capitalize">Class {driver.license_class}</Badge>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
            {(["overview", "bookings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-body font-medium whitespace-nowrap transition-colors ${
                  tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "overview" ? "📊 Overview" : "📋 Bookings"}
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
                  { label: "Total Trips", value: driver.total_trips ?? completedBookings.length, icon: Car, color: "text-accent" },
                  { label: "Rating", value: avgRating, icon: Star, color: "text-secondary" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-card rounded-xl p-4 border border-border">
                    <Icon className={`h-5 w-5 ${color} mb-2`} />
                    <div className="text-2xl font-display font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground font-body">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-lg font-display font-bold text-foreground">${totalEarned}</div>
                  <div className="text-xs text-muted-foreground font-body">Earned from {completedBookings.length} completed trip{completedBookings.length === 1 ? "" : "s"}</div>
                </div>
              </div>

              {pendingBookings.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">Pending Requests</h3>
                  <div className="space-y-3">
                    {pendingBookings.slice(0, 3).map((booking) => (
                      <BookingCard
                        key={booking.id}
                        title={booking.transport_vehicles?.name || "Vehicle"}
                        subtitle={`${booking.pickup_location} → ${booking.dropoff_location || booking.pickup_location}`}
                        dateLabel={formatDateLabel(booking)}
                        guestLabel={`${booking.passenger_count ?? 1} passengers`}
                        price={booking.total_price != null ? `${booking.price_currency ?? "USD"} ${booking.total_price}` : undefined}
                        status={booking.status}
                        paymentStatus={booking.payment_status}
                        notes={booking.special_requests || undefined}
                        actions={renderActions(booking)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {tab === "bookings" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-body">No bookings yet. Make sure your vehicles are published and available on the marketplace.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    title={booking.transport_vehicles?.name || "Vehicle"}
                    subtitle={`${booking.pickup_location} → ${booking.dropoff_location || booking.pickup_location}`}
                    dateLabel={formatDateLabel(booking)}
                    guestLabel={`${booking.passenger_count ?? 1} passengers`}
                    price={booking.total_price != null ? `${booking.price_currency ?? "USD"} ${booking.total_price}` : undefined}
                    status={booking.status}
                    paymentStatus={booking.payment_status}
                    notes={booking.special_requests || undefined}
                    actions={renderActions(booking)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default TransportDashboardPage;
