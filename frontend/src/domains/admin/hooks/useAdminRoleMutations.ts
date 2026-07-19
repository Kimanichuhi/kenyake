import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function invalidateAdmins(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["admin-admins-list"] });
  queryClient.invalidateQueries({ queryKey: ["admin-user-search"] });
}

export function useGrantAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await (supabase.rpc as any)("admin_grant_admin_role", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin access granted");
      invalidateAdmins(queryClient);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to grant admin access"),
  });
}

export function useRevokeAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await (supabase.rpc as any)("admin_revoke_admin_role", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin access revoked");
      invalidateAdmins(queryClient);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to revoke admin access"),
  });
}
