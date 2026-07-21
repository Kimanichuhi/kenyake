import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type NavItemRow = Tables<"nav_items">;

const navItemFormSchema = z.object({
  group_label: z.string().min(1, "Group label is required"),
  group_order: z.number().int(),
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Link is required"),
  display_order: z.number().int(),
  visible: z.boolean(),
});

export type NavItemFormValues = z.infer<typeof navItemFormSchema>;

export const navItemsResource: ResourceConfig<NavItemRow, NavItemFormValues> = {
  key: "nav-items",
  table: "nav_items",
  label: "Nav Item",
  labelPlural: "Navigation",
  basePath: "/admin/navigation",
  formSchema: navItemFormSchema,
  searchColumn: "label",
  defaultSort: { column: "group_order", ascending: true },
  listColumns: [
    { key: "group_label", header: "Group" },
    { key: "label", header: "Label" },
    { key: "href", header: "Link" },
    { key: "display_order", header: "Order" },
    { key: "visible", header: "Visible" },
  ],
  formFields: [
    { kind: "text", name: "group_label", label: "Group label", description: "The menu heading this link appears under, e.g. \"Destinations\"" },
    { kind: "number", name: "group_order", label: "Group order" },
    { kind: "text", name: "label", label: "Link label" },
    { kind: "text", name: "href", label: "Link target", placeholder: "/destinations" },
    { kind: "number", name: "display_order", label: "Order within group" },
    { kind: "switch", name: "visible", label: "Visible" },
  ],
  toFormValues: (row) => ({
    group_label: row?.group_label ?? "",
    group_order: row?.group_order ?? 0,
    label: row?.label ?? "",
    href: row?.href ?? "",
    display_order: row?.display_order ?? 0,
    visible: row?.visible ?? true,
  }),
  toRowPayload: (values) => ({ ...values }),
};
