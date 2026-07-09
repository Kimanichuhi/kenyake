import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type AuditLogRow = Tables<"audit_logs">;

// Literal table names written by the `log_audit_event()` trigger — NOT
// ResourceConfig.key values (those diverge for Blog/Wildlife).
export const AUDITED_TABLES = [
  "destinations",
  "wildlife_sightings",
  "blog_posts",
  "pages",
  "guides",
  "experiences",
  "communities",
  "media_library",
] as const;

export const AUDIT_ACTIONS = ["create", "update", "delete"] as const;

const PAGE_SIZE = 25;

export interface AuditLogListOptions {
  page?: number;
  resourceType?: string;
  action?: string;
}

export function useAuditLogs(options: AuditLogListOptions = {}) {
  const { page = 0, resourceType, action } = options;

  return useQuery({
    queryKey: ["admin-audit-logs", page, resourceType, action],
    queryFn: async () => {
      let query = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (resourceType) query = query.eq("resource_type", resourceType);
      if (action) query = query.eq("action", action);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as AuditLogRow[], count: count ?? 0, pageSize: PAGE_SIZE };
    },
  });
}
