import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePlatformStats() {
  return useQuery({
    queryKey: ["public-platform-stats"],
    queryFn: async () => {
      const [destinations, counties, experiences, communities] = await Promise.all([
        supabase.from("destinations").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("destinations").select("county").eq("status", "published"),
        supabase.from("experiences").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("communities").select("*", { count: "exact", head: true }).eq("is_published", true),
      ]);

      const uniqueCounties = new Set((counties.data ?? []).map((d) => d.county)).size;

      return {
        counties: uniqueCounties,
        destinations: destinations.count ?? 0,
        experiences: experiences.count ?? 0,
        communities: communities.count ?? 0,
      };
    },
  });
}
