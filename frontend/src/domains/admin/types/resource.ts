import { ReactNode } from "react";
import { z } from "zod";
import { Database } from "@/integrations/supabase/types";

export type AdminTableName = keyof Database["public"]["Tables"];

export type StatusColumn = "status" | "is_published";

export interface ListColumn<TRow> {
  key: keyof TRow & string;
  header: string;
  cell?: (row: TRow) => ReactNode;
  className?: string;
}

export interface ResourceFilter<TRow> {
  key: keyof TRow & string;
  label: string;
  type: "text" | "select";
  options?: { label: string; value: string }[];
}

export type FormFieldConfig =
  | { kind: "text" | "textarea" | "number"; name: string; label: string; placeholder?: string; description?: string }
  | { kind: "switch"; name: string; label: string; description?: string }
  | {
      kind: "select" | "multiselect";
      name: string;
      label: string;
      options: { label: string; value: string }[];
      description?: string;
    }
  | { kind: "tags"; name: string; label: string; description?: string; placeholder?: string }
  | { kind: "image"; name: string; label: string; description?: string }
  | { kind: "gallery"; name: string; label: string; description?: string }
  | { kind: "blocks"; name: string; label: string; description?: string };

export interface ResourceConfig<TRow extends { id: string }, TFormValues extends Record<string, unknown>> {
  key: string;
  table: AdminTableName;
  label: string;
  labelPlural: string;
  /** Omit for resources with no draft/published concept (e.g. taxonomy tables like categories/tags). */
  statusColumn?: StatusColumn;
  listColumns: ListColumn<TRow>[];
  filters?: ResourceFilter<TRow>[];
  searchColumn?: keyof TRow & string;
  defaultSort?: { column: keyof TRow & string; ascending: boolean };
  /** Typed as ZodTypeAny (not z.ZodType<TFormValues>) deliberately — embedding
   * TFormValues inside Zod's own generic here causes excessively-deep type
   * instantiation once instantiated against the generated Supabase Database
   * type across several resources. Each resource's local schema constant is
   * still fully typed; only this interface field erases it. */
  formSchema: z.ZodTypeAny;
  formFields: FormFieldConfig[];
  toFormValues: (row: TRow | undefined) => TFormValues;
  toRowPayload: (values: TFormValues) => Record<string, unknown>;
  /** Extra columns merged in only when inserting a new row (e.g. a required
   * user_id FK with no sensible default, set to the creating admin's id). */
  getCreateDefaults?: (currentUserId: string) => Record<string, unknown>;
  basePath: string;
}

export const STATUS_VALUES = ["draft", "published", "archived"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];
