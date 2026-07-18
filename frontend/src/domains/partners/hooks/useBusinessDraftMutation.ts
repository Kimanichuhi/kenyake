import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBusinessDraftMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      businessId,
      values,
    }: {
      businessId: string | null;
      values: Record<string, unknown>;
    }) => {
      if (businessId) {
        const { data, error } = await (supabase.from("businesses" as never) as any)
          .update(values)
          .eq("id", businessId)
          .select("id")
          .single();
        if (error) throw error;
        return data.id as string;
      }

      const { data, error } = await (supabase.from("businesses" as never) as any)
        .insert({ ...values, user_id: user!.id })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save your progress"),
  });
}
