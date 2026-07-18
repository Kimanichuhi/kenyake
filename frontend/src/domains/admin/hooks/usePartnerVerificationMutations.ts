import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessStatus } from "./usePartnerApplications";
import { BusinessVerificationChecklistRow, InspectionPhoto } from "./usePartnerApplicationDetail";

const DOCUMENTS_BUCKET = "business-documents";

function invalidateBusiness(queryClient: ReturnType<typeof useQueryClient>, businessId: string) {
  queryClient.invalidateQueries({ queryKey: ["admin-partner-application", businessId] });
  queryClient.invalidateQueries({ queryKey: ["admin-partner-applications"] });
  queryClient.invalidateQueries({ queryKey: ["admin-business-status-history", businessId] });
  queryClient.invalidateQueries({ queryKey: ["admin-business-inspections", businessId] });
}

/** Patch one or more columns on the fixed-shape verification checklist row. */
export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      businessId,
      patch,
    }: {
      businessId: string;
      patch: Partial<BusinessVerificationChecklistRow>;
    }) => {
      const { error } = await (supabase.from("business_verification_checklist" as never) as any)
        .update({ ...patch, updated_by: user?.id ?? null })
        .eq("business_id", businessId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => invalidateBusiness(queryClient, vars.businessId),
    onError: (error: Error) => toast.error(error.message || "Failed to update checklist"),
  });
}

export function useUpdateInternalNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, internalNotes }: { businessId: string; internalNotes: string }) => {
      const { error } = await (supabase.from("business_verification" as never) as any)
        .update({ internal_notes: internalNotes })
        .eq("business_id", businessId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Internal notes saved");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save internal notes"),
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ documentId, businessId }: { documentId: string; businessId: string }) => {
      const { error } = await (supabase.from("business_documents" as never) as any)
        .update({
          is_verified: true,
          verified_by: user?.id ?? null,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq("id", documentId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Document verified");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to verify document"),
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      documentId,
      businessId,
      reason,
    }: {
      documentId: string;
      businessId: string;
      reason: string;
    }) => {
      const { error } = await (supabase.from("business_documents" as never) as any)
        .update({
          is_verified: false,
          verified_by: user?.id ?? null,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", documentId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Document rejected");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to reject document"),
  });
}

export function useTransitionBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      newStatus,
      reason,
      notes,
    }: {
      businessId: string;
      newStatus: BusinessStatus;
      reason?: string;
      notes?: string;
    }) => {
      const { error } = await (supabase.rpc as any)("transition_business_status", {
        p_business_id: businessId,
        p_new_status: newStatus,
        p_reason: reason ?? null,
        p_notes: notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success(`Status changed to "${vars.newStatus.replace(/_/g, " ")}"`);
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to change status"),
  });
}

export function useScheduleInspection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      businessId,
      scheduledAt,
      inspectorId,
    }: {
      businessId: string;
      scheduledAt: string;
      inspectorId?: string;
    }) => {
      const { error } = await (supabase.from("business_inspections" as never) as any).insert({
        business_id: businessId,
        scheduled_at: scheduledAt,
        inspector_id: inspectorId || user?.id || null,
        status: "scheduled",
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Inspection scheduled");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to schedule inspection"),
  });
}

export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inspectionId,
      businessId,
      patch,
    }: {
      inspectionId: string;
      businessId: string;
      patch: Record<string, unknown>;
    }) => {
      const { error } = await (supabase.from("business_inspections" as never) as any)
        .update(patch)
        .eq("id", inspectionId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Inspection updated");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update inspection"),
  });
}

export function useCancelInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inspectionId, businessId }: { inspectionId: string; businessId: string }) => {
      const { error } = await (supabase.from("business_inspections" as never) as any)
        .update({ status: "cancelled" })
        .eq("id", inspectionId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success("Inspection cancelled");
      invalidateBusiness(queryClient, vars.businessId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to cancel inspection"),
  });
}

export function useUploadInspectionPhoto() {
  return useMutation({
    mutationFn: async ({
      businessId,
      inspectionId,
      file,
    }: {
      businessId: string;
      inspectionId: string;
      file: File;
    }): Promise<InspectionPhoto> => {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${businessId}/inspections/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file);
      if (error) throw error;
      return { storage_path: path, taken_at: new Date().toISOString() };
    },
    onError: (error: Error) => toast.error(error.message || "Failed to upload inspection photo"),
  });
}
