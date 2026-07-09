import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Block } from "../../types/block";
import { Tables } from "@/integrations/supabase/types";

type PageRow = Tables<"pages">;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const pageFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  body_blocks: z.array(z.custom<Block>()),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.string(),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

export const pagesResource: ResourceConfig<PageRow, PageFormValues> = {
  key: "pages",
  table: "pages",
  label: "Page",
  labelPlural: "Pages",
  statusColumn: "status",
  basePath: "/admin/pages",
  formSchema: pageFormSchema,
  searchColumn: "title",
  defaultSort: { column: "created_at", ascending: false },
  filters: [{ key: "status", label: "Status", type: "select", options: statusOptions }],
  listColumns: [
    { key: "title", header: "Title" },
    { key: "slug", header: "Slug" },
    {
      key: "created_at",
      header: "Created",
      cell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"),
    },
  ],
  formFields: [
    {
      kind: "text",
      name: "slug",
      label: "Slug",
      placeholder: "e.g. about",
      description: "Lowercase letters, numbers, and hyphens only. Used in the public URL.",
    },
    { kind: "text", name: "title", label: "Title" },
    { kind: "blocks", name: "body_blocks", label: "Content", description: "The main body of the page." },
    { kind: "text", name: "meta_title", label: "Meta title" },
    { kind: "textarea", name: "meta_description", label: "Meta description" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    slug: row?.slug ?? "",
    title: row?.title ?? "",
    body_blocks: ((row?.body_blocks as unknown as Block[]) ?? []) as Block[],
    meta_title: row?.meta_title ?? "",
    meta_description: row?.meta_description ?? "",
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
};
