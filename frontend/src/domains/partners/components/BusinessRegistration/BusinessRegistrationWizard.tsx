import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Wizard } from "../wizard/Wizard";
import { WizardConfig, WizardStepConfig } from "../../types/wizard";
import { useMyBusiness } from "../../hooks/useMyBusiness";
import { useBusinessDraftMutation } from "../../hooks/useBusinessDraftMutation";
import { useSaveBusinessContacts, ContactInput } from "../../hooks/useBusinessContacts";
import { useSubmitBusiness } from "../../hooks/useSubmitBusiness";
import { isEditableStatus } from "../../types/business";
import { AccountStep } from "./steps/AccountStep";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { LocationStep } from "./steps/LocationStep";
import { ContactPersonsStep } from "./steps/ContactPersonsStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { BankingStep } from "./steps/BankingStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

export interface BusinessRegistrationValues {
  // Index signature so this satisfies WizardConfig's `TAllValues extends
  // Record<string, unknown>` constraint — all named fields below remain
  // precisely typed for property access, this only affects the generic bound.
  [key: string]: unknown;

  // Account (not persisted to the businesses table — used only to sign up)
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Business info
  name: string;
  business_type_id: string;
  description: string;
  registration_number: string;
  kra_pin: string;
  year_established: number | undefined;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  whatsapp_number: string;
  logo_url: string;
  cover_image_url: string;
  video_url: string;

  // Location
  county: string;
  sub_county: string;
  ward: string;
  address_line: string;
  postal_code: string;
  nearby_landmark: string;
  lat: number | undefined;
  lng: number | undefined;

  // Contacts
  contacts: ContactInput[];

  // Banking
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  mpesa_till_number: string;
  mpesa_paybill_number: string;

  // Review
  gallery_images: string[];
  termsAccepted: boolean;
  privacyAccepted: boolean;
  commissionAccepted: boolean;
  communityStandardsAccepted: boolean;
}

function emptyValues(): BusinessRegistrationValues {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
    business_type_id: "",
    description: "",
    registration_number: "",
    kra_pin: "",
    year_established: undefined,
    website_url: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    whatsapp_number: "",
    logo_url: "",
    cover_image_url: "",
    video_url: "",
    county: "",
    sub_county: "",
    ward: "",
    address_line: "",
    postal_code: "",
    nearby_landmark: "",
    lat: undefined,
    lng: undefined,
    contacts: [],
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_branch: "",
    mpesa_till_number: "",
    mpesa_paybill_number: "",
    gallery_images: [],
    termsAccepted: false,
    privacyAccepted: false,
    commissionAccepted: false,
    communityStandardsAccepted: false,
  };
}

export function BusinessRegistrationWizard() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { data: myBusiness, isLoading } = useMyBusiness();
  const upsertDraft = useBusinessDraftMutation();
  const saveContacts = useSaveBusinessContacts();
  const submitBusiness = useSubmitBusiness();

  const status = myBusiness?.business_verification?.status;
  const isLocked = !!myBusiness && !isEditableStatus(status);

  useEffect(() => {
    if (isLocked) navigate("/partner");
  }, [isLocked, navigate]);

  const initialValues = useMemo<BusinessRegistrationValues>(() => {
    const base = emptyValues();
    base.email = user?.email ?? "";
    if (!myBusiness) return base;

    return {
      ...base,
      name: myBusiness.name ?? "",
      business_type_id: myBusiness.business_type_id ?? "",
      description: myBusiness.description ?? "",
      registration_number: myBusiness.registration_number ?? "",
      kra_pin: myBusiness.kra_pin ?? "",
      year_established: myBusiness.year_established ?? undefined,
      website_url: myBusiness.website_url ?? "",
      facebook_url: myBusiness.facebook_url ?? "",
      instagram_url: myBusiness.instagram_url ?? "",
      twitter_url: myBusiness.twitter_url ?? "",
      whatsapp_number: myBusiness.whatsapp_number ?? "",
      logo_url: myBusiness.logo_url ?? "",
      cover_image_url: myBusiness.cover_image_url ?? "",
      video_url: myBusiness.video_url ?? "",
      county: myBusiness.county ?? "",
      sub_county: myBusiness.sub_county ?? "",
      ward: myBusiness.ward ?? "",
      address_line: myBusiness.address_line ?? "",
      postal_code: myBusiness.postal_code ?? "",
      nearby_landmark: myBusiness.nearby_landmark ?? "",
      lat: myBusiness.lat ?? undefined,
      lng: myBusiness.lng ?? undefined,
      contacts: (myBusiness.business_contacts ?? []).map((c: any) => ({
        full_name: c.full_name ?? "",
        role: (c.role as ContactInput["role"]) ?? "secondary",
        designation: c.designation ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        is_primary: c.is_primary ?? false,
      })),
      bank_name: myBusiness.bank_name ?? "",
      bank_account_name: myBusiness.bank_account_name ?? "",
      bank_account_number: myBusiness.bank_account_number ?? "",
      bank_branch: myBusiness.bank_branch ?? "",
      mpesa_till_number: myBusiness.mpesa_till_number ?? "",
      mpesa_paybill_number: myBusiness.mpesa_paybill_number ?? "",
      gallery_images: myBusiness.gallery_images ?? [],
      termsAccepted: !!myBusiness.terms_accepted_at,
      privacyAccepted: !!myBusiness.terms_accepted_at,
      commissionAccepted: !!myBusiness.terms_accepted_at,
      communityStandardsAccepted: !!myBusiness.terms_accepted_at,
    };
  }, [myBusiness, user]);

  const steps = useMemo<WizardStepConfig<any>[]>(() => {
    const accountSchema = user
      ? z.object({})
      : z
          .object({
            fullName: z.string().min(2, "Enter your full name"),
            email: z.string().email("Enter a valid email address"),
            phone: z.string().min(7, "Enter a valid phone number"),
            password: z.string().min(8, "Password must be at least 8 characters"),
            confirmPassword: z.string(),
          })
          .refine((v) => v.password === v.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
          });

    return [
      {
        id: "account",
        title: "Account",
        description: "Sign up or continue with your existing account.",
        schema: accountSchema,
        Component: AccountStep,
        onSave: async (values: BusinessRegistrationValues) => {
          if (user) return;
          const { error } = await signUp(values.email, values.password, values.fullName);
          if (error) throw new Error(error.message ?? "Failed to create your account");
        },
      },
      {
        id: "business-info",
        title: "Business Info",
        description: "Tell us about your business.",
        schema: z.object({
          name: z.string().min(2, "Business name is required"),
          business_type_id: z.string().min(1, "Select a business type"),
        }),
        Component: BusinessInfoStep,
        onSave: async (values: BusinessRegistrationValues, ctx) => {
          const payload = {
            name: values.name,
            business_type_id: values.business_type_id || null,
            description: values.description || null,
            registration_number: values.registration_number || null,
            kra_pin: values.kra_pin || null,
            year_established: values.year_established ?? null,
            website_url: values.website_url || null,
            facebook_url: values.facebook_url || null,
            instagram_url: values.instagram_url || null,
            twitter_url: values.twitter_url || null,
            whatsapp_number: values.whatsapp_number || null,
            logo_url: values.logo_url || null,
            cover_image_url: values.cover_image_url || null,
            video_url: values.video_url || null,
          };
          const id = await upsertDraft.mutateAsync({ businessId: ctx.businessId, values: payload });
          if (!ctx.businessId) ctx.setBusinessId(id);
        },
      },
      {
        id: "location",
        title: "Location",
        description: "Where can travelers find you?",
        schema: z.object({
          county: z.string().min(1, "County is required"),
          address_line: z.string().min(1, "Address is required"),
        }),
        Component: LocationStep,
        onSave: async (values: BusinessRegistrationValues, ctx) => {
          if (!ctx.businessId) throw new Error("Please complete the Business Info step first.");
          await upsertDraft.mutateAsync({
            businessId: ctx.businessId,
            values: {
              county: values.county || null,
              sub_county: values.sub_county || null,
              ward: values.ward || null,
              address_line: values.address_line || null,
              postal_code: values.postal_code || null,
              nearby_landmark: values.nearby_landmark || null,
              lat: values.lat ?? null,
              lng: values.lng ?? null,
            },
          });
        },
      },
      {
        id: "contacts",
        title: "Contact Persons",
        description: "Who should we reach out to about this application?",
        schema: z.object({
          contacts: z
            .array(
              z.object({
                full_name: z.string().min(1, "Name is required"),
                role: z.enum(["primary", "secondary", "emergency"]),
                designation: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
                is_primary: z.boolean().optional(),
              }),
            )
            .min(1, "Add at least one contact person")
            .refine((arr) => arr.filter((c) => c.is_primary).length === 1, {
              message: "Mark exactly one contact as primary",
            }),
        }),
        Component: ContactPersonsStep,
        onSave: async (values: BusinessRegistrationValues, ctx) => {
          if (!ctx.businessId) throw new Error("Please complete the Business Info step first.");
          await saveContacts.mutateAsync({ businessId: ctx.businessId, contacts: values.contacts });
        },
      },
      {
        id: "documents",
        title: "Documents",
        description: "Upload verification documents.",
        schema: z.object({}),
        Component: DocumentsStep,
      },
      {
        id: "banking",
        title: "Banking",
        description: "How should payouts eventually reach you?",
        schema: z.object({}),
        Component: BankingStep,
        onSave: async (values: BusinessRegistrationValues, ctx) => {
          if (!ctx.businessId) throw new Error("Please complete the Business Info step first.");
          await upsertDraft.mutateAsync({
            businessId: ctx.businessId,
            values: {
              bank_name: values.bank_name || null,
              bank_account_name: values.bank_account_name || null,
              bank_account_number: values.bank_account_number || null,
              bank_branch: values.bank_branch || null,
              mpesa_till_number: values.mpesa_till_number || null,
              mpesa_paybill_number: values.mpesa_paybill_number || null,
            },
          });
        },
      },
      {
        id: "review",
        title: "Review & Submit",
        description: "Double-check everything before submitting for review.",
        schema: z.object({
          termsAccepted: z.boolean().refine((v) => v === true, {
            message: "You must accept the Platform Terms of Service",
          }),
          privacyAccepted: z.boolean().refine((v) => v === true, {
            message: "You must accept the Privacy Policy",
          }),
          commissionAccepted: z.boolean().refine((v) => v === true, {
            message: "You must accept the Commission Agreement",
          }),
          communityStandardsAccepted: z.boolean().refine((v) => v === true, {
            message: "You must agree to the Community Standards",
          }),
        }),
        Component: ReviewSubmitStep,
        onSave: async (values: BusinessRegistrationValues, ctx) => {
          if (!ctx.businessId) throw new Error("Please complete the Business Info step first.");
          await upsertDraft.mutateAsync({
            businessId: ctx.businessId,
            values: {
              gallery_images: values.gallery_images,
              terms_accepted_at: new Date().toISOString(),
              terms_version: "1.0",
              data_consent_accepted_at: new Date().toISOString(),
            },
          });
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, signUp]);

  const config: WizardConfig<BusinessRegistrationValues> = useMemo(
    () => ({
      steps,
      initialValues,
      initialBusinessId: myBusiness?.id ?? null,
      exitPath: "/partner",
      onComplete: async (_values, ctx) => {
        if (!ctx.businessId) throw new Error("Nothing to submit yet.");
        await submitBusiness.mutateAsync(ctx.businessId);
        navigate("/partner");
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steps, initialValues, myBusiness?.id],
  );

  if (isLoading || isLocked) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Wizard key={myBusiness?.id ?? "new"} config={config} />;
}
