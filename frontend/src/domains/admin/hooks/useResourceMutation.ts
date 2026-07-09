import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ResourceConfig } from "../types/resource";

async function recordVersion(resourceType: string, resourceId: string, snapshot: unknown, createdBy?: string) {
  const { data: existing } = await supabase
    .from("content_versions")
    .select("version_number")
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (existing?.version_number ?? 0) + 1;

  await supabase.from("content_versions").insert({
    resource_type: resourceType,
    resource_id: resourceId,
    snapshot: snapshot as never,
    version_number: nextVersion,
    created_by: createdBy ?? null,
  });
}

export function useResourceMutations<TRow extends { id: string }, TFormValues extends Record<string, unknown>>(
  resource: ResourceConfig<TRow, TFormValues>,
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-resource", resource.key] });

  const create = useMutation({
    mutationFn: async (values: TFormValues) => {
      const payload = {
        ...resource.toRowPayload(values),
        ...(resource.getCreateDefaults && user ? resource.getCreateDefaults(user.id) : {}),
      };
      const { data, error } = await (supabase.from(resource.table as never) as any)
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as TRow;
    },
    onSuccess: () => {
      toast.success(`${resource.label} created`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || `Failed to create ${resource.label.toLowerCase()}`),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TFormValues }) => {
      const payload = resource.toRowPayload(values);
      const { data, error } = await (supabase.from(resource.table as never) as any)
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      await recordVersion(resource.key, id, data, user?.id);
      return data as TRow;
    },
    onSuccess: () => {
      toast.success(`${resource.label} updated`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || `Failed to update ${resource.label.toLowerCase()}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(resource.table as never) as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success(`${resource.label} deleted`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || `Failed to delete ${resource.label.toLowerCase()}`),
  });

  return { create, update, remove };
}
