import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMyBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const [guide, experience, accommodation, transport] = await Promise.all([
        supabase
          .from("guide_bookings")
          .select("*, guides(name, photo_url, location, county)")
          .order("start_date", { ascending: false }),
        supabase
          .from("experience_bookings")
          .select("*, experiences(title, host_name, location_name, price_display, duration_minutes)")
          .order("booking_date", { ascending: false }),
        supabase
          .from("accommodation_bookings")
          .select("*, accommodations(name, location_name, price_display, property_type)")
          .order("check_in", { ascending: false }),
        supabase
          .from("transport_bookings")
          .select("*, transport_vehicles(name, vehicle_type, make, model), transport_drivers(name)")
          .order("pickup_date", { ascending: false }),
      ]);

      if (guide.error) throw guide.error;
      if (experience.error) throw experience.error;
      if (accommodation.error) throw accommodation.error;
      if (transport.error) throw transport.error;

      return {
        guide: guide.data ?? [],
        experience: experience.data ?? [],
        accommodation: accommodation.data ?? [],
        transport: transport.data ?? [],
      };
    },
    enabled: !!user,
  });
}
