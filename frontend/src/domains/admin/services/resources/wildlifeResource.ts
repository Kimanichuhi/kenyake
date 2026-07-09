import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type WildlifeRow = Tables<"wildlife_sightings">;

const speciesCategories = [
  { label: "Mammal", value: "mammal" },
  { label: "Bird", value: "bird" },
  { label: "Reptile", value: "reptile" },
  { label: "Primate", value: "primate" },
  { label: "Marine", value: "marine" },
  { label: "Other", value: "other" },
];

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const wildlifeFormSchema = z.object({
  species: z.string().min(1, "Species is required"),
  species_category: z.string().min(1, "Category is required"),
  location_name: z.string().min(1, "Location is required"),
  park_name: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  animal_count: z.number().int().min(1).optional(),
  behavior: z.string().optional(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  verified: z.boolean(),
  status: z.string(),
});

export type WildlifeFormValues = z.infer<typeof wildlifeFormSchema>;

export const wildlifeResource: ResourceConfig<WildlifeRow, WildlifeFormValues> = {
  key: "wildlife",
  table: "wildlife_sightings",
  label: "Sighting",
  labelPlural: "Wildlife Sightings",
  statusColumn: "status",
  basePath: "/admin/wildlife",
  formSchema: wildlifeFormSchema,
  searchColumn: "species",
  defaultSort: { column: "created_at", ascending: false },
  filters: [
    { key: "species_category", label: "Category", type: "select", options: speciesCategories },
    { key: "status", label: "Status", type: "select", options: statusOptions },
  ],
  listColumns: [
    { key: "species", header: "Species" },
    { key: "species_category", header: "Category" },
    { key: "location_name", header: "Location" },
    { key: "park_name", header: "Park" },
    { key: "animal_count", header: "Count" },
  ],
  formFields: [
    { kind: "text", name: "species", label: "Species" },
    { kind: "select", name: "species_category", label: "Category", options: speciesCategories },
    { kind: "text", name: "location_name", label: "Location name" },
    { kind: "text", name: "park_name", label: "Park (optional)" },
    { kind: "number", name: "lat", label: "Latitude" },
    { kind: "number", name: "lng", label: "Longitude" },
    { kind: "number", name: "animal_count", label: "Animal count" },
    { kind: "text", name: "behavior", label: "Behavior (optional)" },
    { kind: "textarea", name: "description", label: "Description" },
    { kind: "image", name: "photo_url", label: "Photo" },
    { kind: "switch", name: "verified", label: "Verified sighting" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    species: row?.species ?? "",
    species_category: row?.species_category ?? "other",
    location_name: row?.location_name ?? "",
    park_name: row?.park_name ?? "",
    lat: row?.lat ?? 0,
    lng: row?.lng ?? 0,
    animal_count: row?.animal_count ?? 1,
    behavior: row?.behavior ?? "",
    description: row?.description ?? "",
    photo_url: row?.photo_url ?? "",
    verified: row?.verified ?? false,
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
  getCreateDefaults: (currentUserId) => ({ user_id: currentUserId }),
};
