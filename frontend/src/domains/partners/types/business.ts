import { Tables } from "@/integrations/supabase/types";

export type BusinessRow = Tables<"businesses">;
export type BusinessVerificationRow = Tables<"business_verification">;
export type BusinessChecklistRow = Tables<"business_verification_checklist">;
export type BusinessContactRow = Tables<"business_contacts">;
export type BusinessDocumentRow = Tables<"business_documents">;
export type BusinessCategoryRow = Tables<"business_categories">;
export type BusinessStatusHistoryRow = Tables<"business_status_history">;
export type BusinessInspectionRow = Tables<"business_inspections">;

export interface MyBusiness extends BusinessRow {
  business_verification: BusinessVerificationRow | null;
  business_verification_checklist: BusinessChecklistRow | null;
  business_contacts: BusinessContactRow[];
  business_documents: BusinessDocumentRow[];
  business_categories: Pick<BusinessCategoryRow, "code" | "label"> | null;
}

export const EDITABLE_STATUSES = ["draft", "documents_requested"] as const;

export function isEditableStatus(status: string | undefined): boolean {
  return !!status && (EDITABLE_STATUSES as readonly string[]).includes(status);
}
