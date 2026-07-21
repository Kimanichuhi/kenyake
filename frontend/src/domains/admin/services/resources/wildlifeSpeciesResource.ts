import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type WildlifeSpeciesRow = Tables<"wildlife_species">;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const wildlifeSpeciesFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().optional(),
  location_name: z.string().optional(),
  population_estimate: z.string().optional(),
  conservation_status: z.string().optional(),
  best_month: z.string().optional(),
  sightings_note: z.string().optional(),
  display_order: z.number().int(),
  status: z.string(),
});

export type WildlifeSpeciesFormValues = z.infer<typeof wildlifeSpeciesFormSchema>;

export const wildlifeSpeciesResource: ResourceConfig<WildlifeSpeciesRow, WildlifeSpeciesFormValues> = {
  key: "wildlife-species",
  table: "wildlife_species",
  label: "Species",
  labelPlural: "Big Five Species",
  statusColumn: "status",
  basePath: "/admin/wildlife-species",
  formSchema: wildlifeSpeciesFormSchema,
  searchColumn: "name",
  defaultSort: { column: "display_order", ascending: true },
  filters: [{ key: "status", label: "Status", type: "select", options: statusOptions }],
  listColumns: [
    { key: "name", header: "Name" },
    { key: "location_name", header: "Location" },
    { key: "conservation_status", header: "Conservation Status" },
    { key: "best_month", header: "Best Month" },
    { key: "display_order", header: "Order" },
  ],
  formFields: [
    { kind: "text", name: "name", label: "Name" },
    { kind: "text", name: "emoji", label: "Emoji", placeholder: "🦁" },
    { kind: "text", name: "location_name", label: "Best location", placeholder: "e.g. Maasai Mara" },
    { kind: "text", name: "population_estimate", label: "Population estimate" },
    { kind: "text", name: "conservation_status", label: "Conservation status" },
    { kind: "text", name: "best_month", label: "Best month to see", placeholder: "e.g. Jul — Oct" },
    { kind: "textarea", name: "sightings_note", label: "Sightings note" },
    { kind: "number", name: "display_order", label: "Display order" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    name: row?.name ?? "",
    emoji: row?.emoji ?? "",
    location_name: row?.location_name ?? "",
    population_estimate: row?.population_estimate ?? "",
    conservation_status: row?.conservation_status ?? "",
    best_month: row?.best_month ?? "",
    sightings_note: row?.sightings_note ?? "",
    display_order: row?.display_order ?? 0,
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
};
