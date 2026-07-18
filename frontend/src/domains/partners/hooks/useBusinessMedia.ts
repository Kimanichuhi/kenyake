import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "business-media";

export function useUploadBusinessMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      file,
      folder,
    }: {
      businessId: string;
      file: File;
      folder: "logo" | "cover" | "gallery" | "video";
    }) => {
      const ext = file.name.split(".").pop();
      const path = `${businessId}/${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to upload media"),
  });
}
