import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type MigrationEventRow = Tables<"wildlife_migration_events">;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const migrationEventFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  event_name: z.string().min(1, "Event name is required"),
  intensity: z.number().int().min(1).max(5),
  description: z.string().optional(),
  display_order: z.number().int(),
  status: z.string(),
});

export type MigrationEventFormValues = z.infer<typeof migrationEventFormSchema>;

export const wildlifeMigrationResource: ResourceConfig<MigrationEventRow, MigrationEventFormValues> = {
  key: "wildlife-migration",
  table: "wildlife_migration_events",
  label: "Migration Event",
  labelPlural: "Migration Calendar",
  statusColumn: "status",
  basePath: "/admin/migration-calendar",
  formSchema: migrationEventFormSchema,
  searchColumn: "event_name",
  defaultSort: { column: "display_order", ascending: true },
  filters: [{ key: "status", label: "Status", type: "select", options: statusOptions }],
  listColumns: [
    { key: "month", header: "Month" },
    { key: "event_name", header: "Event" },
    { key: "intensity", header: "Intensity" },
    { key: "display_order", header: "Order" },
  ],
  formFields: [
    { kind: "text", name: "month", label: "Month", placeholder: "e.g. Jul — Aug" },
    { kind: "text", name: "event_name", label: "Event name" },
    { kind: "number", name: "intensity", label: "Intensity (1-5)" },
    { kind: "textarea", name: "description", label: "Description" },
    { kind: "number", name: "display_order", label: "Display order" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    month: row?.month ?? "",
    event_name: row?.event_name ?? "",
    intensity: row?.intensity ?? 3,
    description: row?.description ?? "",
    display_order: row?.display_order ?? 0,
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
};
