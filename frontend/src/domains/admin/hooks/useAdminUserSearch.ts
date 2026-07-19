import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUserSearchRow {
  user_id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
}

export function useAdminUserSearch(search: string) {
  return useQuery({
    queryKey: ["admin-user-search", search],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_search_users", { p_search: search });
      if (error) throw error;
      return (data ?? []) as AdminUserSearchRow[];
    },
    enabled: search.trim().length > 0,
  });
}
