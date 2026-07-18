import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType, PaymentMethod, BookingPaymentRow } from "../types/booking";

export interface SubmitBookingPaymentInput {
  resourceType: BookingResourceType;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  referenceNote?: string;
}

export function useSubmitBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitBookingPaymentInput) => {
      const { data, error } = await supabase.rpc("submit_booking_payment" as never, {
        p_resource_type: input.resourceType,
        p_booking_id: input.bookingId,
        p_amount: input.amount,
        p_currency: input.currency,
        p_method: input.method,
        p_reference_note: input.referenceNote ?? null,
      } as never);
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-payments"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to submit payment"),
  });
}

export interface VerifyBookingPaymentInput {
  paymentId: string;
  approve: boolean;
  rejectionReason?: string;
}

export function useVerifyBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VerifyBookingPaymentInput) => {
      const { error } = await supabase.rpc("verify_booking_payment" as never, {
        p_payment_id: input.paymentId,
        p_approve: input.approve,
        p_rejection_reason: input.rejectionReason ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.approve ? "Payment verified" : "Payment rejected");
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-payments"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to verify payment"),
  });
}

export function useBookingPayments(resourceType: BookingResourceType, bookingId: string | undefined) {
  return useQuery({
    queryKey: ["booking-payments", resourceType, bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_payments")
        .select("*")
        .eq("resource_type", resourceType)
        .eq("booking_id", bookingId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingPaymentRow[];
    },
    enabled: !!bookingId,
  });
}
