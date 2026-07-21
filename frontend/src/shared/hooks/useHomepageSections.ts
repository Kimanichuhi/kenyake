import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHomepageSections() {
  return useQuery({
    queryKey: ["public-homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("enabled", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
