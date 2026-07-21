import { z } from "zod";
import { ResourceConfig } from "../../types/resource";
import { Tables } from "@/integrations/supabase/types";

type ReviewRow = Tables<"multi_reviews">;

const reviewFormSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  overall_rating: z.number().min(1).max(5),
  is_verified_visit: z.boolean(),
  is_flagged: z.boolean(),
  flag_reason: z.string().optional(),
  operator_response: z.string().optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const reviewsResource: ResourceConfig<ReviewRow, ReviewFormValues> = {
  key: "reviews",
  table: "multi_reviews",
  label: "Review",
  labelPlural: "Reviews",
  basePath: "/admin/reviews",
  formSchema: reviewFormSchema,
  searchColumn: "title",
  defaultSort: { column: "created_at", ascending: false },
  filters: [
    {
      key: "is_flagged",
      label: "Flagged",
      type: "select",
      options: [
        { label: "Flagged", value: "true" },
        { label: "Not flagged", value: "false" },
      ],
    },
  ],
  listColumns: [
    { key: "reviewable_type", header: "Type" },
    { key: "title", header: "Title" },
    { key: "overall_rating", header: "Rating" },
    { key: "is_verified_visit", header: "Verified" },
    { key: "is_flagged", header: "Flagged" },
    { key: "created_at", header: "Submitted" },
  ],
  formFields: [
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "body", label: "Review body" },
    { kind: "number", name: "overall_rating", label: "Overall rating (1-5)" },
    { kind: "switch", name: "is_verified_visit", label: "Verified visit" },
    { kind: "switch", name: "is_flagged", label: "Flagged for moderation" },
    { kind: "text", name: "flag_reason", label: "Flag reason" },
    { kind: "textarea", name: "operator_response", label: "Operator response" },
  ],
  toFormValues: (row) => ({
    title: row?.title ?? "",
    body: row?.body ?? "",
    overall_rating: row?.overall_rating ?? 5,
    is_verified_visit: row?.is_verified_visit ?? false,
    is_flagged: row?.is_flagged ?? false,
    flag_reason: row?.flag_reason ?? "",
    operator_response: row?.operator_response ?? "",
  }),
  toRowPayload: (values) => ({ ...values }),
};
