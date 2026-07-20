import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface AdminInvite {
  token: string;
  expires_at: string;
}

export function useCreateAdminInvite() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await (supabase.rpc as any)("admin_create_invite", { p_email: email });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as AdminInvite;
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create invite"),
  });
}
