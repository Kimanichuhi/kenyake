import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceConfig } from "../types/resource";

const PAGE_SIZE = 20;

export interface ResourceListOptions {
  page?: number;
  search?: string;
  filters?: Record<string, string>;
}

export function useResourceList<TRow extends { id: string }, TFormValues extends Record<string, unknown>>(
  resource: ResourceConfig<TRow, TFormValues>,
  options: ResourceListOptions = {},
) {
  const { page = 0, search = "", filters = {} } = options;

  return useQuery({
    queryKey: ["admin-resource", resource.key, "list", page, search, filters],
    queryFn: async () => {
      let query = (supabase.from(resource.table as never) as any)
        .select("*", { count: "exact" });

      if (search && resource.searchColumn) {
        query = query.ilike(resource.searchColumn as string, `%${search}%`);
      }

      for (const [key, value] of Object.entries(filters)) {
        if (value) query = query.eq(key, value);
      }

      if (resource.defaultSort) {
        query = query.order(resource.defaultSort.column as string, { ascending: resource.defaultSort.ascending });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as TRow[], count: count ?? 0, pageSize: PAGE_SIZE };
    },
  });
}

export function useResourceOne<TRow extends { id: string }, TFormValues extends Record<string, unknown>>(
  resource: ResourceConfig<TRow, TFormValues>,
  id: string | undefined,
) {
  return useQuery({
    queryKey: ["admin-resource", resource.key, "one", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase.from(resource.table as never) as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as TRow;
    },
    enabled: !!id,
  });
}
