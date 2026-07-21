import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Experience } from "@/data/destinations";

type ExperienceRow = Tables<"experiences">;

function mapExperienceRow(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    host: row.host_name,
    image: row.cover_image ?? "",
    duration: row.duration_minutes ? `${row.duration_minutes} min` : "",
    price: row.price_display ?? "",
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    tag: row.category,
    description: row.short_description ?? row.description ?? "",
  };
}

export function useExperiences() {
  return useQuery({
    queryKey: ["public-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapExperienceRow);
    },
  });
}

export function useExperiencesByCounty(county: string | undefined, limit = 4) {
  return useQuery({
    queryKey: ["public-experiences-by-county", county],
    queryFn: async () => {
      if (!county) return [];
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_published", true)
        .eq("county", county)
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(mapExperienceRow);
    },
    enabled: !!county,
  });
}
