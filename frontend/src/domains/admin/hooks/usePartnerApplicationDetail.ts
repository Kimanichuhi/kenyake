import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessStatus, RiskLevel } from "./usePartnerApplications";

export interface BusinessVerificationRow {
  business_id: string;
  status: BusinessStatus;
  risk_score: number;
  risk_level: RiskLevel;
  confidence_percentage: number;
  assigned_reviewer_id: string | null;
  internal_notes: string | null;
  last_reviewed_by: string | null;
  last_reviewed_at: string | null;
  updated_at: string;
}

export interface BusinessVerificationChecklistRow {
  business_id: string;
  email_verified: boolean;
  email_verified_note: string | null;
  phone_verified: boolean;
  phone_verified_note: string | null;
  government_registration_verified: boolean;
  government_registration_note: string | null;
  tourism_license_verified: boolean;
  tourism_license_note: string | null;
  insurance_verified: boolean;
  insurance_note: string | null;
  address_verified: boolean;
  address_note: string | null;
  inspection_passed: boolean;
  inspection_note: string | null;
  trusted_referral: boolean;
  trusted_referral_note: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface BusinessContactRow {
  id: string;
  business_id: string;
  full_name: string;
  role: "primary" | "secondary" | "emergency";
  designation: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
}

export interface BusinessDocumentRow {
  id: string;
  business_id: string;
  doc_type: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface BusinessStatusHistoryRow {
  id: string;
  business_id: string;
  from_status: BusinessStatus | null;
  to_status: BusinessStatus;
  changed_by: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface InspectionPhoto {
  storage_path: string;
  caption?: string;
  taken_at?: string;
}

export interface BusinessInspectionRow {
  id: string;
  business_id: string;
  inspector_id: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  gps_lat: number | null;
  gps_lng: number | null;
  gps_captured_at: string | null;
  checklist: Record<string, unknown>;
  photos: InspectionPhoto[];
  outcome: "pass" | "fail" | "conditional" | null;
  recommendation: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerApplicationDetail {
  id: string;
  user_id: string;
  business_type_id: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  registration_number: string | null;
  kra_pin: string | null;
  year_established: number | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  whatsapp_number: string | null;
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  address_line: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  nearby_landmark: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_branch: string | null;
  mpesa_till_number: string | null;
  mpesa_paybill_number: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  gallery_images: string[];
  video_url: string | null;
  terms_accepted_at: string | null;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  business_categories: { id: string; code: string; label: string } | null;
  business_verification: BusinessVerificationRow | null;
  business_verification_checklist: BusinessVerificationChecklistRow | null;
  business_contacts: BusinessContactRow[];
  business_documents: BusinessDocumentRow[];
}

const SELECT = `
  *,
  business_categories ( id, code, label ),
  business_verification ( * ),
  business_verification_checklist ( * ),
  business_contacts ( * ),
  business_documents ( * )
`;

export function usePartnerApplicationDetail(businessId: string | undefined) {
  return useQuery({
    queryKey: ["admin-partner-application", businessId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("businesses" as never) as any)
        .select(SELECT)
        .eq("id", businessId)
        .single();
      if (error) throw error;
      return data as PartnerApplicationDetail;
    },
    enabled: !!businessId,
  });
}

export function useBusinessStatusHistory(businessId: string | undefined) {
  return useQuery({
    queryKey: ["admin-business-status-history", businessId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("business_status_history" as never) as any)
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BusinessStatusHistoryRow[];
    },
    enabled: !!businessId,
  });
}

export function useBusinessInspections(businessId: string | undefined) {
  return useQuery({
    queryKey: ["admin-business-inspections", businessId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("business_inspections" as never) as any)
        .select("*")
        .eq("business_id", businessId)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BusinessInspectionRow[];
    },
    enabled: !!businessId,
  });
}
