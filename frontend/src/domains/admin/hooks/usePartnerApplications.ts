import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 20;

export type BusinessStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "documents_requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived";

export const BUSINESS_STATUSES: BusinessStatus[] = [
  "draft",
  "submitted",
  "pending_review",
  "documents_requested",
  "under_review",
  "approved",
  "rejected",
  "suspended",
  "archived",
];

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  pending_review: "Pending Review",
  documents_requested: "Documents Requested",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  archived: "Archived",
};

export type RiskLevel = "unrated" | "low" | "medium" | "high";

export const RISK_LEVELS: RiskLevel[] = ["unrated", "low", "medium", "high"];

export interface PartnerApplicationRow {
  business_id: string;
  status: BusinessStatus;
  risk_score: number;
  risk_level: RiskLevel;
  confidence_percentage: number;
  assigned_reviewer_id: string | null;
  last_reviewed_by: string | null;
  last_reviewed_at: string | null;
  updated_at: string;
  businesses: {
    id: string;
    name: string;
    county: string | null;
    created_at: string;
    submitted_at: string | null;
    business_type_id: string | null;
    business_categories: { label: string } | null;
  } | null;
}

export interface PartnerApplicationListOptions {
  page?: number;
  status?: string;
  riskLevel?: string;
  businessTypeId?: string;
  search?: string;
}

const SELECT = `
  business_id,
  status,
  risk_score,
  risk_level,
  confidence_percentage,
  assigned_reviewer_id,
  last_reviewed_by,
  last_reviewed_at,
  updated_at,
  businesses!inner (
    id, name, county, created_at, submitted_at, business_type_id,
    business_categories ( label )
  )
`;

export function usePartnerApplications(options: PartnerApplicationListOptions = {}) {
  const { page = 0, status, riskLevel, businessTypeId, search } = options;

  return useQuery({
    queryKey: ["admin-partner-applications", page, status, riskLevel, businessTypeId, search],
    queryFn: async () => {
      let query = (supabase.from("business_verification" as never) as any)
        .select(SELECT, { count: "exact" })
        .order("created_at", { foreignTable: "businesses", ascending: false });

      if (status) query = query.eq("status", status);
      if (riskLevel) query = query.eq("risk_level", riskLevel);
      if (businessTypeId) query = query.eq("businesses.business_type_id", businessTypeId);
      if (search) query = query.ilike("businesses.name", `%${search}%`);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as PartnerApplicationRow[], count: count ?? 0, pageSize: PAGE_SIZE };
    },
  });
}

export interface BusinessCategoryOption {
  id: string;
  code: string;
  label: string;
}

export function useBusinessCategoryOptions() {
  return useQuery({
    queryKey: ["admin-business-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("business_categories" as never) as any)
        .select("id, code, label")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BusinessCategoryOption[];
    },
  });
}
