import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type DestinationRow = Tables<"destinations">;

const categoryOptions = [
  { label: "Wildlife Safari", value: "Wildlife Safari" },
  { label: "Beach & Marine", value: "Beach & Marine" },
  { label: "Adventure & Hiking", value: "Adventure & Hiking" },
  { label: "Birdwatching", value: "Birdwatching" },
  { label: "Culture & Heritage", value: "Culture & Heritage" },
  { label: "Wildlife & Mountains", value: "Wildlife & Mountains" },
];

const crowdLevelOptions = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const destinationFormSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  county: z.string().min(1, "County is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  highlights: z.array(z.string()),
  cover_image: z.string().optional(),
  gallery_images: z.array(z.string()),
  best_time: z.string().optional(),
  price_display: z.string().optional(),
  crowd_level: z.string().optional(),
  safety_rating: z.number().min(1).max(5).optional(),
  accessibility_rating: z.number().min(1).max(5).optional(),
  photography_score: z.number().min(1).max(5).optional(),
  rating: z.number().min(0).optional(),
  review_count: z.number().int().min(0).optional(),
  lat: z.number(),
  lng: z.number(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.string(),
});

export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

export const destinationsResource: ResourceConfig<DestinationRow, DestinationFormValues> = {
  key: "destinations",
  table: "destinations",
  label: "Destination",
  labelPlural: "Destinations",
  statusColumn: "status",
  basePath: "/admin/destinations",
  formSchema: destinationFormSchema,
  searchColumn: "name",
  defaultSort: { column: "created_at", ascending: false },
  filters: [
    { key: "category", label: "Category", type: "select", options: categoryOptions },
    { key: "status", label: "Status", type: "select", options: statusOptions },
  ],
  listColumns: [
    { key: "name", header: "Name" },
    { key: "county", header: "County" },
    { key: "category", header: "Category" },
    { key: "crowd_level", header: "Crowd Level" },
    { key: "rating", header: "Rating" },
  ],
  formFields: [
    { kind: "text", name: "slug", label: "Slug", description: "Used in the public URL, e.g. maasai-mara" },
    { kind: "text", name: "name", label: "Name" },
    { kind: "text", name: "county", label: "County" },
    { kind: "select", name: "category", label: "Category", options: categoryOptions },
    { kind: "textarea", name: "description", label: "Description" },
    { kind: "tags", name: "highlights", label: "Highlights", description: "Comma-separated list" },
    { kind: "image", name: "cover_image", label: "Cover image" },
    { kind: "gallery", name: "gallery_images", label: "Gallery" },
    { kind: "text", name: "best_time", label: "Best time to visit", placeholder: "e.g. Jul — Oct" },
    { kind: "text", name: "price_display", label: "Price display", placeholder: "e.g. From $120/day" },
    { kind: "select", name: "crowd_level", label: "Crowd level", options: crowdLevelOptions },
    { kind: "number", name: "safety_rating", label: "Safety rating (1-5)" },
    { kind: "number", name: "accessibility_rating", label: "Accessibility rating (1-5)" },
    { kind: "number", name: "photography_score", label: "Photography score (1-5)" },
    { kind: "number", name: "rating", label: "Rating", description: "Admin-editable until review aggregation ships" },
    { kind: "number", name: "review_count", label: "Review count", description: "Admin-editable until review aggregation ships" },
    { kind: "number", name: "lat", label: "Latitude" },
    { kind: "number", name: "lng", label: "Longitude" },
    { kind: "text", name: "meta_title", label: "Meta title" },
    { kind: "textarea", name: "meta_description", label: "Meta description" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    slug: row?.slug ?? "",
    name: row?.name ?? "",
    county: row?.county ?? "",
    category: row?.category ?? categoryOptions[0].value,
    description: row?.description ?? "",
    highlights: row?.highlights ?? [],
    cover_image: row?.cover_image ?? "",
    gallery_images: row?.gallery_images ?? [],
    best_time: row?.best_time ?? "",
    price_display: row?.price_display ?? "",
    crowd_level: row?.crowd_level ?? "Medium",
    safety_rating: row?.safety_rating ?? 3,
    accessibility_rating: row?.accessibility_rating ?? 3,
    photography_score: row?.photography_score ?? 3,
    rating: row?.rating ?? 0,
    review_count: row?.review_count ?? 0,
    lat: row?.lat ?? 0,
    lng: row?.lng ?? 0,
    meta_title: row?.meta_title ?? "",
    meta_description: row?.meta_description ?? "",
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
};
