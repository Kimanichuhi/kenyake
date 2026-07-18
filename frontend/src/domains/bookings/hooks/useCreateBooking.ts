import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookingResourceType, RESOURCE_TABLE, RESOURCE_CUSTOMER_COLUMN } from "../types/booking";

export function useCreateBooking(resourceType: BookingResourceType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const table = RESOURCE_TABLE[resourceType];
      const customerColumn = RESOURCE_CUSTOMER_COLUMN[resourceType];
      const payload = { ...values, [customerColumn]: user!.id };

      const { data, error } = await (supabase.from(table as never) as any).insert(payload).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["resource-availability"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create booking"),
  });
}
