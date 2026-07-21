import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type FooterLinkRow = Tables<"footer_links">;

const footerLinkFormSchema = z.object({
  column_label: z.string().min(1, "Column label is required"),
  column_order: z.number().int(),
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Link is required"),
  display_order: z.number().int(),
  visible: z.boolean(),
});

export type FooterLinkFormValues = z.infer<typeof footerLinkFormSchema>;

export const footerLinksResource: ResourceConfig<FooterLinkRow, FooterLinkFormValues> = {
  key: "footer-links",
  table: "footer_links",
  label: "Footer Link",
  labelPlural: "Footer Links",
  basePath: "/admin/footer-links",
  formSchema: footerLinkFormSchema,
  searchColumn: "label",
  defaultSort: { column: "column_order", ascending: true },
  listColumns: [
    { key: "column_label", header: "Column" },
    { key: "label", header: "Label" },
    { key: "href", header: "Link" },
    { key: "display_order", header: "Order" },
    { key: "visible", header: "Visible" },
  ],
  formFields: [
    { kind: "text", name: "column_label", label: "Column label", description: "The footer column this link appears under, e.g. \"Explore\"" },
    { kind: "number", name: "column_order", label: "Column order" },
    { kind: "text", name: "label", label: "Link label" },
    { kind: "text", name: "href", label: "Link target", placeholder: "/about" },
    { kind: "number", name: "display_order", label: "Order within column" },
    { kind: "switch", name: "visible", label: "Visible" },
  ],
  toFormValues: (row) => ({
    column_label: row?.column_label ?? "",
    column_order: row?.column_order ?? 0,
    label: row?.label ?? "",
    href: row?.href ?? "",
    display_order: row?.display_order ?? 0,
    visible: row?.visible ?? true,
  }),
  toRowPayload: (values) => ({ ...values }),
};
