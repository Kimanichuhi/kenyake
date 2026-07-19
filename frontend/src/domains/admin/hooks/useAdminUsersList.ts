import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUserRow {
  user_id: string;
  email: string;
  full_name: string | null;
  is_super_admin: boolean;
  granted_at: string;
}

export function useAdminUsersList() {
  return useQuery({
    queryKey: ["admin-admins-list"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_list_admins");
      if (error) throw error;
      return (data ?? []) as AdminUserRow[];
    },
  });
}
