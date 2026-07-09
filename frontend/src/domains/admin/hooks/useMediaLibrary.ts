import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

export type MediaItem = Tables<"media_library">;

const BUCKET = "media-library";

export function useMediaLibraryList(search = "") {
  return useQuery({
    queryKey: ["admin-media-library", search],
    queryFn: async () => {
      let query = supabase.from("media_library").select("*").order("created_at", { ascending: false }).limit(60);
      if (search) query = query.ilike("file_name", `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as MediaItem[];
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const ext = file.name.split(".").pop();
      const path = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const dimensions = await new Promise<{ width: number | null; height: number | null }>((resolve) => {
        if (!file.type.startsWith("image/")) return resolve({ width: null, height: null });
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: null, height: null });
        img.src = URL.createObjectURL(file);
      });

      const { data, error } = await supabase
        .from("media_library")
        .insert({
          storage_bucket: BUCKET,
          storage_path: path,
          public_url: urlData.publicUrl,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          width: dimensions.width,
          height: dimensions.height,
          folder: folder ?? null,
          uploaded_by: user?.id ?? null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-library"] });
    },
    onError: (error: Error) => toast.error(error.message || "Upload failed"),
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<MediaItem> }) => {
      const { data, error } = await supabase.from("media_library").update(values).eq("id", id).select("*").single();
      if (error) throw error;
      return data as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-library"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update media"),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: MediaItem) => {
      await supabase.storage.from(item.storage_bucket).remove([item.storage_path]);
      const { error } = await supabase.from("media_library").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-media-library"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete file"),
  });
}
