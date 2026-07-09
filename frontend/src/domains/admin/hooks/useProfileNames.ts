import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfileNames(userIds: (string | null | undefined)[]) {
  const uniqueIds = Array.from(new Set(userIds.filter((id): id is string => !!id))).sort();

  return useQuery({
    queryKey: ["admin-profile-names", uniqueIds],
    queryFn: async () => {
      if (uniqueIds.length === 0) return {} as Record<string, string>;
      const { data, error } = await supabase.from("profiles").select("user_id, full_name").in("user_id", uniqueIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        map[row.user_id] = row.full_name || "Unnamed user";
      }
      return map;
    },
    enabled: uniqueIds.length > 0,
  });
}
