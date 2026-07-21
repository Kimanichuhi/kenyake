import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWildlifeSpecies() {
  return useQuery({
    queryKey: ["public-wildlife-species"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wildlife_species")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMigrationEvents() {
  return useQuery({
    queryKey: ["public-migration-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wildlife_migration_events")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecentSightings(limit = 4) {
  return useQuery({
    queryKey: ["public-recent-sightings", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wildlife_sightings")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}
