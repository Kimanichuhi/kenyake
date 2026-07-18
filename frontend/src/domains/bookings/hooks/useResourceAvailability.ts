import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType } from "../types/booking";

export interface ResourceBookingWindow {
  start: string; // ISO date
  end: string; // ISO date — same as start for single-day resources
  guestCount?: number;
}

/**
 * Fetches existing pending/confirmed bookings for a resource so the booking
 * flow can give a soft client-side conflict hint. This is a convenience
 * check only — the DB triggers in the booking migrations are the
 * authoritative enforcement, so a stale/racy client-side result here can
 * never actually let a double-booking through.
 */
export function useResourceAvailability(resourceType: BookingResourceType, resourceId: string | undefined) {
  return useQuery({
    queryKey: ["resource-availability", resourceType, resourceId],
    queryFn: async (): Promise<ResourceBookingWindow[]> => {
      if (!resourceId) return [];

      switch (resourceType) {
        case "guide": {
          const [bookings, unavailable] = await Promise.all([
            supabase
              .from("guide_bookings")
              .select("start_date,end_date")
              .eq("guide_id", resourceId)
              .in("status", ["pending", "confirmed"]),
            supabase.from("guide_availability").select("date").eq("guide_id", resourceId).eq("is_available", false),
          ]);
          if (bookings.error) throw bookings.error;
          if (unavailable.error) throw unavailable.error;
          return [
            ...(bookings.data ?? []).map((b) => ({ start: b.start_date, end: b.end_date })),
            ...(unavailable.data ?? []).map((d) => ({ start: d.date, end: d.date })),
          ];
        }
        case "accommodation": {
          const { data, error } = await supabase
            .from("accommodation_bookings")
            .select("check_in,check_out")
            .eq("accommodation_id", resourceId)
            .in("status", ["pending", "confirmed"]);
          if (error) throw error;
          return (data ?? []).map((b) => ({ start: b.check_in, end: b.check_out }));
        }
        case "transport": {
          const { data, error } = await supabase
            .from("transport_bookings")
            .select("pickup_date,return_date")
            .eq("vehicle_id", resourceId)
            .in("status", ["pending", "confirmed"]);
          if (error) throw error;
          return (data ?? []).map((b) => ({ start: b.pickup_date, end: b.return_date ?? b.pickup_date }));
        }
        case "experience": {
          const { data, error } = await supabase
            .from("experience_bookings")
            .select("booking_date,guest_count")
            .eq("experience_id", resourceId)
            .in("status", ["pending", "confirmed"]);
          if (error) throw error;
          return (data ?? []).map((b) => ({
            start: b.booking_date,
            end: b.booking_date,
            guestCount: b.guest_count ?? 1,
          }));
        }
      }
    },
    enabled: !!resourceId,
  });
}

export function isDateRangeBlocked(windows: ResourceBookingWindow[], start: string, end: string): boolean {
  if (!start || !end) return false;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return windows.some((w) => {
    const ws = new Date(w.start).getTime();
    const we = new Date(w.end).getTime();
    return s <= we && ws <= e;
  });
}

export function bookedGuestsOnDate(windows: ResourceBookingWindow[], date: string): number {
  return windows.filter((w) => w.start === date).reduce((sum, w) => sum + (w.guestCount ?? 0), 0);
}
