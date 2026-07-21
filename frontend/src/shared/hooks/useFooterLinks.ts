import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  label: string;
  links: FooterLinkItem[];
}

export function useFooterColumns() {
  const query = useQuery({
    queryKey: ["public-footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("visible", true)
        .order("column_order", { ascending: true })
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const columns = useMemo<FooterColumn[]>(() => {
    const items = query.data ?? [];
    const byColumn = new Map<string, FooterColumn>();
    for (const item of items) {
      if (!byColumn.has(item.column_label)) {
        byColumn.set(item.column_label, { label: item.column_label, links: [] });
      }
      byColumn.get(item.column_label)!.links.push({ label: item.label, href: item.href });
    }
    return Array.from(byColumn.values());
  }, [query.data]);

  return { columns, isLoading: query.isLoading };
}
