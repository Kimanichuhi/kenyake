import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType, RESOURCE_TABLE } from "../types/booking";

const OWNER_SELECT: Record<BookingResourceType, string> = {
  guide: "*",
  experience: "*, experiences(title, location_name)",
  accommodation: "*, accommodations(name, location_name)",
  transport: "*, transport_vehicles(name, vehicle_type), transport_drivers(name)",
};

/**
 * Bookings visible to the currently-signed-in resource owner (guide,
 * community manager, driver) — relies entirely on RLS to scope to "my"
 * bookings, same as GuideDashboardPage already does, so no explicit
 * owner-id filter is needed here.
 */
export function useOwnerBookings(resourceType: BookingResourceType, enabled = true) {
  return useQuery({
    queryKey: ["owner-bookings", resourceType],
    queryFn: async () => {
      const table = RESOURCE_TABLE[resourceType];
      const { data, error } = await (supabase.from(table as never) as any)
        .select(OWNER_SELECT[resourceType])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled,
  });
}
