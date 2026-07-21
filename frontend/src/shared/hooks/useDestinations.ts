import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Destination } from "@/data/destinations";

type DestinationRow = Tables<"destinations">;

export function mapDestinationRow(row: DestinationRow): Destination {
  return {
    id: row.slug,
    dbId: row.id,
    name: row.name,
    county: row.county,
    image: row.cover_image ?? "",
    gallery: row.gallery_images ?? [],
    category: row.category,
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    crowdLevel: row.crowd_level ?? "",
    bestTime: row.best_time ?? "",
    price: row.price_display ?? "",
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    safetyRating: row.safety_rating ?? 0,
    accessibilityRating: row.accessibility_rating ?? 0,
    photographyScore: row.photography_score ?? 0,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
  };
}

export function useDestinations() {
  return useQuery({
    queryKey: ["public-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("status", "published");
      if (error) throw error;
      return (data ?? []).map(mapDestinationRow);
    },
  });
}

export function useDestination(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-destination", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data ? mapDestinationRow(data) : null;
    },
    enabled: !!slug,
  });
}
