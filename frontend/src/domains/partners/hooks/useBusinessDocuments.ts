import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocumentRow } from "../types/business";

const BUCKET = "business-documents";

export const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "business_registration_certificate", label: "Business Registration Certificate" },
  { value: "kra_pin_certificate", label: "KRA PIN Certificate" },
  { value: "tourism_license", label: "Tourism License" },
  { value: "insurance_certificate", label: "Insurance Certificate" },
  { value: "tax_compliance_certificate", label: "Tax Compliance Certificate" },
  { value: "other", label: "Other" },
];

export function useBusinessDocuments(businessId: string | null | undefined) {
  return useQuery({
    queryKey: ["business-documents", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_documents")
        .select("*")
        .eq("business_id", businessId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BusinessDocumentRow[];
    },
    enabled: !!businessId,
  });
}

export function useSignedDocumentUrl(storagePath: string | undefined) {
  return useQuery({
    queryKey: ["business-document-signed-url", storagePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath as string, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: 4 * 60 * 1000,
  });
}

export function useUploadBusinessDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ businessId, file, docType }: { businessId: string; file: File; docType: string }) => {
      const ext = file.name.split(".").pop();
      const path = `${businessId}/${docType}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("business_documents")
        .insert({
          business_id: businessId,
          doc_type: docType,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: user!.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as BusinessDocumentRow;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["business-documents", vars.businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to upload document"),
  });
}

export function useDeleteBusinessDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: BusinessDocumentRow) => {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      const { error } = await supabase.from("business_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: (_data, doc) => {
      queryClient.invalidateQueries({ queryKey: ["business-documents", doc.business_id] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete document"),
  });
}
