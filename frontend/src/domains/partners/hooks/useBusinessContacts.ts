import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ContactInput {
  full_name: string;
  role: "primary" | "secondary" | "emergency";
  designation?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
}

/** Replaces all contacts for a business in one go — the simplest correct
 * implementation for a wizard step save (no client-side diffing needed). */
export function useSaveBusinessContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, contacts }: { businessId: string; contacts: ContactInput[] }) => {
      const { error: deleteError } = await supabase.from("business_contacts").delete().eq("business_id", businessId);
      if (deleteError) throw deleteError;

      if (contacts.length === 0) return;

      const { error: insertError } = await supabase
        .from("business_contacts")
        .insert(contacts.map((c) => ({ ...c, business_id: businessId })));
      if (insertError) throw insertError;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      queryClient.invalidateQueries({ queryKey: ["business-contacts", vars.businessId] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save contact persons"),
  });
}
