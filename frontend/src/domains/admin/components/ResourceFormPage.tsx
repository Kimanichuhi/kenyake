import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResourceConfig, FormFieldConfig } from "../types/resource";
import { useResourceOne } from "../hooks/useResourceQuery";
import { useResourceMutations } from "../hooks/useResourceMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPickerField, MediaGalleryField } from "./MediaPicker";
import { BlockEditor } from "./BlockEditor/BlockEditor";
import { Block } from "../types/block";
import { VersionHistoryDialog } from "./VersionHistoryDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ArrowLeft, Loader2, History, ShieldAlert } from "lucide-react";

interface ResourceFormPageProps<TRow extends { id: string }, TFormValues extends Record<string, unknown>> {
  resource: ResourceConfig<TRow, TFormValues>;
}

// `form` is intentionally typed as `UseFormReturn<any>` here, not the caller's
// concrete TFormValues: react-hook-form's Control/FieldPath generics don't
// resolve usefully when the field name comes from a runtime string (this is a
// generic field renderer driven by ResourceConfig.formFields), so the precise
// per-resource typing is deliberately erased at this boundary.
//
// `disabled` locks every field (editor viewing an already-published row —
// RLS would reject the whole update anyway, see ResourceFormPage below).
// `hidePublishOption` only affects the statusColumn field: editors below the
// lock threshold can still edit drafts, just can't select "published".
function renderField(
  field: FormFieldConfig,
  form: UseFormReturn<any>,
  disabled: boolean,
  hidePublishOption: boolean,
  statusColumnName?: string,
) {
  const isStatusField = !!statusColumnName && field.name === statusColumnName;

  switch (field.kind) {
    case "text":
    case "number":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type={field.kind === "number" ? "number" : "text"}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  {...rhf}
                  onChange={(e) => rhf.onChange(field.kind === "number" ? e.target.valueAsNumber : e.target.value)}
                  value={rhf.value ?? ""}
                />
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "textarea":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={field.placeholder} disabled={disabled} {...rhf} value={rhf.value ?? ""} />
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "switch":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <FormLabel className="!mt-0">{field.label}</FormLabel>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                {isStatusField && hidePublishOption && !disabled && (
                  <FormDescription>Only an admin or content manager can publish this.</FormDescription>
                )}
              </div>
              <FormControl>
                <Switch
                  checked={!!rhf.value}
                  onCheckedChange={rhf.onChange}
                  disabled={disabled || (isStatusField && hidePublishOption)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    case "select": {
      const options = isStatusField && hidePublishOption ? field.options.filter((o) => o.value !== "published") : field.options;
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <Select value={rhf.value ?? ""} onValueChange={rhf.onChange} disabled={disabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              {isStatusField && hidePublishOption && !disabled && (
                <FormDescription>Only an admin or content manager can publish this.</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    case "tags":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder={field.placeholder ?? "Comma-separated values"}
                  value={Array.isArray(rhf.value) ? rhf.value.join(", ") : ""}
                  onChange={(e) =>
                    rhf.onChange(
                      e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "image":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <fieldset disabled={disabled}>
                  <MediaPickerField value={rhf.value} onChange={rhf.onChange} />
                </fieldset>
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "gallery":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <fieldset disabled={disabled}>
                  <MediaGalleryField value={rhf.value ?? []} onChange={rhf.onChange} />
                </fieldset>
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "blocks":
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: rhf }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <fieldset disabled={disabled}>
                  <BlockEditor value={(rhf.value as Block[]) ?? []} onChange={rhf.onChange} />
                </fieldset>
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    default:
      return null;
  }
}

export function ResourceFormPage<TRow extends { id: string }, TFormValues extends Record<string, unknown>>({
  resource,
}: ResourceFormPageProps<TRow, TFormValues>) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== "new";
  const { hasRole, hasAnyRole } = useUserRoles();
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: existing, isLoading } = useResourceOne(resource, isEditing ? id : undefined);
  const { create, update } = useResourceMutations(resource);

  const isEditorOnly = hasRole("editor") && !hasAnyRole(["admin", "content_manager"]);
  const currentlyPublished =
    !!existing &&
    (resource.statusColumn === "is_published"
      ? !!(existing as Record<string, unknown>)[resource.statusColumn]
      : resource.statusColumn
        ? (existing as Record<string, unknown>)[resource.statusColumn] === "published"
        : false);
  const formLocked = isEditorOnly && currentlyPublished;
  const canViewHistory = isEditing && hasAnyRole(["admin", "content_manager"]);

  const form = useForm<TFormValues>({
    resolver: zodResolver(resource.formSchema as never),
    defaultValues: resource.toFormValues(undefined) as never,
  });

  useEffect(() => {
    if (isEditing && existing) {
      form.reset(resource.toFormValues(existing) as never);
    }
  }, [existing, isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: TFormValues) => {
    if (isEditing && id) {
      await update.mutateAsync({ id, values });
    } else {
      const created = await create.mutateAsync(values);
      navigate(`${resource.basePath}/${created.id}`, { replace: true });
      return;
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(resource.basePath)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {isEditing ? `Edit ${resource.label}` : `New ${resource.label}`}
          </h1>
        </div>
        {canViewHistory && (
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <History className="mr-1.5 h-4 w-4" /> History
          </Button>
        )}
      </div>

      {formLocked && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>This content is published</AlertTitle>
          <AlertDescription>Only an admin or content manager can edit published content.</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as never)} className="space-y-6">
          <Card>
            <CardContent className="space-y-5 pt-6">
              {resource.formFields.map((field) =>
                renderField(field, form, formLocked, isEditorOnly, resource.statusColumn),
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(resource.basePath)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLocked || create.isPending || update.isPending}>
              {(create.isPending || update.isPending) && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : `Create ${resource.label}`}
            </Button>
          </div>
        </form>
      </Form>

      {isEditing && id && (
        <VersionHistoryDialog resource={resource} resourceId={id} open={historyOpen} onOpenChange={setHistoryOpen} />
      )}
    </div>
  );
}
