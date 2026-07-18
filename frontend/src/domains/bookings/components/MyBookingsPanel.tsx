import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Bed, Car, UserSquare2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyBookings } from "../hooks/useMyBookings";
import { useTransitionBookingStatus } from "../hooks/useTransitionBookingStatus";
import { BookingCard } from "./BookingCard";
import { BookingResourceType } from "../types/booking";

const dateFmt = (d: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Date(d).toLocaleDateString("en-US", opts);

const money = (amount: number | null, currency?: string | null) =>
  amount ? `${currency ?? "KES"} ${amount.toLocaleString()}` : undefined;

type SubTab = "guide" | "experience" | "accommodation" | "transport";

export function MyBookingsPanel() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyBookings();
  const transition = useTransitionBookingStatus();
  const [subTab, setSubTab] = useState<SubTab>("guide");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const guide = data?.guide ?? [];
  const experience = data?.experience ?? [];
  const accommodation = data?.accommodation ?? [];
  const transport = data?.transport ?? [];

  const handleCancel = async (resourceType: BookingResourceType, bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await transition.mutateAsync({ resourceType, bookingId, newStatus: "cancelled_by_customer" });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const noBookings =
    guide.length === 0 && experience.length === 0 && accommodation.length === 0 && transport.length === 0;

  if (noBookings) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
        <p className="text-muted-foreground font-body mb-4">
          Book a guide, experience, accommodation, or transport to see them here
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate("/guides")} variant="outline">Find a Guide</Button>
          <Button onClick={() => navigate("/experiences")} className="gradient-sunset text-primary-foreground border-0">
            Browse Experiences
          </Button>
          <Button onClick={() => navigate("/accommodation")} variant="outline">Find Accommodation</Button>
          <Button onClick={() => navigate("/transport")} variant="outline">Hire Transport</Button>
        </div>
      </motion.div>
    );
  }

  const tabs: { id: SubTab; label: string; icon: typeof Calendar; count: number }[] = [
    { id: "guide", label: "Guides", icon: UserSquare2, count: guide.length },
    { id: "experience", label: "Experiences", icon: Calendar, count: experience.length },
    { id: "accommodation", label: "Accommodation", icon: Bed, count: accommodation.length },
    { id: "transport", label: "Transport", icon: Car, count: transport.length },
  ];

  const cancelAction = (resourceType: BookingResourceType, bookingId: string, status: string) =>
    status === "pending" ? (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={cancellingId === bookingId}
        onClick={() => handleCancel(resourceType, bookingId)}
      >
        {cancellingId === bookingId ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </>
        )}
      </Button>
    ) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
              subTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <tab.icon className="h-3 w-3" /> {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {subTab === "guide" && (
        guide.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <UserSquare2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No guide bookings</h3>
            <p className="text-muted-foreground font-body mb-4">Connect with a local guide for your trip</p>
            <Button onClick={() => navigate("/guides")} variant="outline">Browse Guides</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {guide.map((b) => (
              <BookingCard
                key={b.id}
                title={b.guides?.name || "Guide"}
                subtitle={[b.guides?.location, b.guides?.county].filter(Boolean).join(", ") || undefined}
                dateLabel={`${dateFmt(b.start_date)} — ${dateFmt(b.end_date)}`}
                guestLabel={b.group_size ? `${b.group_size} guest${b.group_size > 1 ? "s" : ""}` : undefined}
                locationLabel={b.guides?.location ?? undefined}
                price={money(b.total_price, b.currency)}
                status={b.status}
                paymentStatus={b.payment_status}
                notes={b.message ?? undefined}
                actions={cancelAction("guide", b.id, b.status)}
              />
            ))}
          </div>
        )
      )}

      {subTab === "experience" && (
        experience.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No experience bookings</h3>
            <p className="text-muted-foreground font-body mb-4">Discover authentic cultural experiences</p>
            <Button onClick={() => navigate("/experiences")} variant="outline">Browse Experiences</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {experience.map((b) => (
              <BookingCard
                key={b.id}
                title={b.experiences?.title || "Experience"}
                subtitle={b.experiences?.host_name ? `Hosted by ${b.experiences.host_name}` : undefined}
                dateLabel={`${dateFmt(b.booking_date, { weekday: "short", month: "short", day: "numeric" })}${b.start_time ? ` · ${b.start_time}` : ""}`}
                guestLabel={b.guest_count ? `${b.guest_count} guest${b.guest_count > 1 ? "s" : ""}` : undefined}
                locationLabel={b.experiences?.location_name ?? undefined}
                price={money(b.total_price, b.currency)}
                status={b.status}
                paymentStatus={b.payment_status}
                notes={b.special_requests ?? undefined}
                actions={cancelAction("experience", b.id, b.status)}
              />
            ))}
          </div>
        )
      )}

      {subTab === "accommodation" && (
        accommodation.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Bed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No accommodation bookings</h3>
            <p className="text-muted-foreground font-body mb-4">Find a place to stay for your trip</p>
            <Button onClick={() => navigate("/accommodation")} variant="outline">Browse Accommodation</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accommodation.map((b) => (
              <BookingCard
                key={b.id}
                title={b.accommodations?.name || "Accommodation"}
                subtitle={b.accommodations?.property_type ?? undefined}
                dateLabel={`${dateFmt(b.check_in)} — ${dateFmt(b.check_out)}`}
                guestLabel={b.guest_count ? `${b.guest_count} guest${b.guest_count > 1 ? "s" : ""}${b.rooms ? `, ${b.rooms} room${b.rooms > 1 ? "s" : ""}` : ""}` : undefined}
                locationLabel={b.accommodations?.location_name ?? undefined}
                price={money(b.total_price, b.currency)}
                status={b.status}
                paymentStatus={b.payment_status}
                notes={b.special_requests ?? undefined}
                actions={cancelAction("accommodation", b.id, b.status)}
              />
            ))}
          </div>
        )
      )}

      {subTab === "transport" && (
        transport.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No transport bookings</h3>
            <p className="text-muted-foreground font-body mb-4">Hire a vehicle or book a transfer</p>
            <Button onClick={() => navigate("/transport")} variant="outline">Browse Transport</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transport.map((b) => (
              <BookingCard
                key={b.id}
                title={
                  b.transport_vehicles
                    ? `${b.transport_vehicles.name}${b.transport_vehicles.make ? ` (${b.transport_vehicles.make} ${b.transport_vehicles.model || ""})` : ""}`
                    : "Vehicle"
                }
                subtitle={b.transport_drivers ? `Driver: ${b.transport_drivers.name}` : undefined}
                dateLabel={`${dateFmt(b.pickup_date, { weekday: "short", month: "short", day: "numeric" })}${b.pickup_time ? ` · ${b.pickup_time}` : ""}${b.return_date ? ` · Return ${dateFmt(b.return_date)}` : ""}`}
                guestLabel={b.passenger_count ? `${b.passenger_count} passenger${b.passenger_count > 1 ? "s" : ""}` : undefined}
                locationLabel={`${b.pickup_location}${b.dropoff_location ? ` → ${b.dropoff_location}` : ""}`}
                price={money(b.total_price, b.price_currency)}
                status={b.status}
                paymentStatus={b.payment_status}
                notes={b.special_requests ?? undefined}
                actions={cancelAction("transport", b.id, b.status)}
              />
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}
