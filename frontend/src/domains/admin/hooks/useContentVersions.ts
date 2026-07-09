import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ContentVersionRow = Tables<"content_versions">;

/**
 * `resourceType` must be the resource's `ResourceConfig.key` (e.g. "blog",
 * "wildlife"), NOT the underlying table name — `useResourceMutations`'
 * `recordVersion` writes rows keyed by `resource.key`, which diverges from
 * the table name for Blog ("blog" vs "blog_posts") and Wildlife ("wildlife"
 * vs "wildlife_sightings").
 */
export function useContentVersions(resourceType: string, resourceId: string | undefined) {
  return useQuery({
    queryKey: ["admin-content-versions", resourceType, resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_versions")
        .select("*")
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId as string)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data as ContentVersionRow[];
    },
    enabled: !!resourceId,
  });
}
