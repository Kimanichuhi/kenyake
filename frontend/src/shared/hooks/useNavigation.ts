import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  children: NavChild[];
}

export function useNavGroups() {
  const query = useQuery({
    queryKey: ["public-nav-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_items")
        .select("*")
        .eq("visible", true)
        .order("group_order", { ascending: true })
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const groups = useMemo<NavGroup[]>(() => {
    const items = query.data ?? [];
    const byGroup = new Map<string, NavGroup>();
    for (const item of items) {
      if (!byGroup.has(item.group_label)) {
        byGroup.set(item.group_label, { label: item.group_label, children: [] });
      }
      byGroup.get(item.group_label)!.children.push({ label: item.label, href: item.href });
    }
    return Array.from(byGroup.values());
  }, [query.data]);

  return { groups, isLoading: query.isLoading };
}
