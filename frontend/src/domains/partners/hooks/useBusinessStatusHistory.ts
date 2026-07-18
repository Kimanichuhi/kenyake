import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessStatusHistoryRow } from "../types/business";

export function useBusinessStatusHistory(businessId: string | null | undefined) {
  return useQuery({
    queryKey: ["business-status-history", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_status_history")
        .select("*")
        .eq("business_id", businessId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BusinessStatusHistoryRow[];
    },
    enabled: !!businessId,
  });
}
