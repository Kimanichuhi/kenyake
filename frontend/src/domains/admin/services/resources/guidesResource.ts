import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type GuideRow = Tables<"guides">;

const certificationLevelOptions = [
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
];

const priceCurrencyOptions = [
  { label: "USD", value: "USD" },
  { label: "KES", value: "KES" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
];

const guidesFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  photo_url: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()),
  specializations: z.array(z.string()),
  certifications: z.array(z.string()),
  certification_level: z.string(),
  location: z.string().optional(),
  county: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  price_per_day: z.number().optional(),
  price_currency: z.string(),
  years_experience: z.number().int().optional(),
  response_time_minutes: z.number().int().optional(),
  is_available: z.boolean(),
  is_verified: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean(),
});

export type GuidesFormValues = z.infer<typeof guidesFormSchema>;

export const guidesResource: ResourceConfig<GuideRow, GuidesFormValues> = {
  key: "guides",
  table: "guides",
  label: "Guide",
  labelPlural: "Guides",
  statusColumn: "is_published",
  basePath: "/admin/guides",
  formSchema: guidesFormSchema,
  searchColumn: "name",
  defaultSort: { column: "created_at", ascending: false },
  filters: [
    { key: "certification_level", label: "Certification", type: "select", options: certificationLevelOptions },
    { key: "price_currency", label: "Currency", type: "select", options: priceCurrencyOptions },
  ],
  listColumns: [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    { key: "location", header: "Location" },
    { key: "county", header: "County" },
    { key: "certification_level", header: "Certification" },
    { key: "price_per_day", header: "Price/day" },
  ],
  formFields: [
    { kind: "text", name: "name", label: "Name" },
    {
      kind: "text",
      name: "slug",
      label: "Slug",
      placeholder: "e.g. john-kamau",
      description: "Lowercase letters, numbers, and hyphens only. Used in the public URL.",
    },
    { kind: "image", name: "photo_url", label: "Photo" },
    { kind: "textarea", name: "bio", label: "Bio" },
    { kind: "tags", name: "languages", label: "Languages", description: "Comma-separated, e.g. English, Swahili, French" },
    { kind: "tags", name: "specializations", label: "Specializations", description: "Comma-separated" },
    { kind: "tags", name: "certifications", label: "Certifications", description: "Comma-separated" },
    { kind: "select", name: "certification_level", label: "Certification level", options: certificationLevelOptions },
    { kind: "text", name: "location", label: "Location" },
    { kind: "text", name: "county", label: "County" },
    { kind: "number", name: "lat", label: "Latitude" },
    { kind: "number", name: "lng", label: "Longitude" },
    { kind: "number", name: "price_per_day", label: "Price per day" },
    { kind: "select", name: "price_currency", label: "Currency", options: priceCurrencyOptions },
    { kind: "number", name: "years_experience", label: "Years of experience" },
    { kind: "number", name: "response_time_minutes", label: "Response time (minutes)" },
    { kind: "switch", name: "is_available", label: "Available for bookings" },
    { kind: "switch", name: "is_verified", label: "Verified" },
    { kind: "text", name: "meta_title", label: "Meta title" },
    { kind: "textarea", name: "meta_description", label: "Meta description" },
    { kind: "switch", name: "is_published", label: "Published" },
  ],
  toFormValues: (row) => ({
    name: row?.name ?? "",
    slug: row?.slug ?? "",
    photo_url: row?.photo_url ?? "",
    bio: row?.bio ?? "",
    languages: row?.languages ?? [],
    specializations: row?.specializations ?? [],
    certifications: row?.certifications ?? [],
    certification_level: row?.certification_level ?? "bronze",
    location: row?.location ?? "",
    county: row?.county ?? "",
    lat: row?.lat ?? undefined,
    lng: row?.lng ?? undefined,
    price_per_day: row?.price_per_day ?? undefined,
    price_currency: row?.price_currency ?? "USD",
    years_experience: row?.years_experience ?? 0,
    response_time_minutes: row?.response_time_minutes ?? 60,
    is_available: row?.is_available ?? true,
    is_verified: row?.is_verified ?? false,
    meta_title: row?.meta_title ?? "",
    meta_description: row?.meta_description ?? "",
    is_published: row?.is_published ?? true,
  }),
  toRowPayload: (values) => ({ ...values }),
  getCreateDefaults: (currentUserId) => ({ user_id: currentUserId }),
};
