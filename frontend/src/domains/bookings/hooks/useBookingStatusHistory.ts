import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType, BookingStatusHistoryRow } from "../types/booking";

export function useBookingStatusHistory(resourceType: BookingResourceType, bookingId: string | undefined) {
  return useQuery({
    queryKey: ["booking-status-history", resourceType, bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status_history")
        .select("*")
        .eq("resource_type", resourceType)
        .eq("booking_id", bookingId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingStatusHistoryRow[];
    },
    enabled: !!bookingId,
  });
}
