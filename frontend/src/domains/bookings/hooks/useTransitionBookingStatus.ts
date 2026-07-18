import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType, BookingStatus } from "../types/booking";

export interface TransitionBookingStatusInput {
  resourceType: BookingResourceType;
  bookingId: string;
  newStatus: BookingStatus;
  reason?: string;
}

export function useTransitionBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resourceType, bookingId, newStatus, reason }: TransitionBookingStatusInput) => {
      const { error } = await supabase.rpc("transition_booking_status" as never, {
        p_resource_type: resourceType,
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_reason: reason ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-status-history"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update booking"),
  });
}
