import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Block } from "../../types/block";
import { Tables } from "@/integrations/supabase/types";

type BlogPostRow = Tables<"blog_posts">;
type BlogCategoryRow = Tables<"blog_categories">;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

// =============================================================================
// Blog Posts
// =============================================================================

const blogPostFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  cover_image: z.string().optional(),
  body_blocks: z.array(z.custom<Block>()),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.string(),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export const blogPostsResource: ResourceConfig<BlogPostRow, BlogPostFormValues> = {
  key: "blog",
  table: "blog_posts",
  label: "Post",
  labelPlural: "Blog Posts",
  statusColumn: "status",
  basePath: "/admin/blog",
  formSchema: blogPostFormSchema,
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
      placeholder: "e.g. best-time-to-visit-maasai-mara",
      description: "Lowercase letters, numbers, and hyphens only. Used in the public URL.",
    },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "excerpt", label: "Excerpt" },
    { kind: "image", name: "cover_image", label: "Cover image" },
    { kind: "blocks", name: "body_blocks", label: "Content", description: "The main body of the post." },
    { kind: "text", name: "meta_title", label: "Meta title" },
    { kind: "textarea", name: "meta_description", label: "Meta description" },
    { kind: "select", name: "status", label: "Status", options: statusOptions },
  ],
  toFormValues: (row) => ({
    slug: row?.slug ?? "",
    title: row?.title ?? "",
    excerpt: row?.excerpt ?? "",
    cover_image: row?.cover_image ?? "",
    body_blocks: ((row?.body_blocks as unknown as Block[]) ?? []) as Block[],
    meta_title: row?.meta_title ?? "",
    meta_description: row?.meta_description ?? "",
    status: row?.status ?? "draft",
  }),
  toRowPayload: (values) => ({ ...values }),
};

// =============================================================================
// Blog Categories
// =============================================================================

const blogCategoryFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;

export const blogCategoriesResource: ResourceConfig<BlogCategoryRow, BlogCategoryFormValues> = {
  key: "blog-categories",
  table: "blog_categories",
  label: "Category",
  labelPlural: "Blog Categories",
  basePath: "/admin/blog/categories",
  formSchema: blogCategoryFormSchema,
  searchColumn: "name",
  defaultSort: { column: "created_at", ascending: false },
  listColumns: [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    { key: "description", header: "Description" },
  ],
  formFields: [
    {
      kind: "text",
      name: "slug",
      label: "Slug",
      placeholder: "e.g. travel-tips",
      description: "Lowercase letters, numbers, and hyphens only. Used in the public URL.",
    },
    { kind: "text", name: "name", label: "Name" },
    { kind: "textarea", name: "description", label: "Description" },
  ],
  toFormValues: (row) => ({
    slug: row?.slug ?? "",
    name: row?.name ?? "",
    description: row?.description ?? "",
  }),
  toRowPayload: (values) => ({ ...values }),
};
