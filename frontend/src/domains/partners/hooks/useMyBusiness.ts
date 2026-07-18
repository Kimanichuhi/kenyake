import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MyBusiness } from "../types/business";

const SELECT = `
  *,
  business_verification (*),
  business_verification_checklist (*),
  business_contacts (*),
  business_documents (*),
  business_categories (code, label)
`;

export function useMyBusiness() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-business", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("businesses" as never) as any)
        .select(SELECT)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as MyBusiness | null;
    },
    enabled: !!user,
  });
}

export function useBusinessCategories() {
  return useQuery({
    queryKey: ["business-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_categories")
        .select("id, code, label")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
