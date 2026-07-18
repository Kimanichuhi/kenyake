import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase.rpc("submit_business_application" as never, {
        p_business_id: businessId,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      toast.success("Application submitted — we'll review it soon.");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to submit application"),
  });
}
