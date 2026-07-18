import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Trash2, UploadCloud } from "lucide-react";
import { usePartnerBusiness } from "@/components/RequirePartnerBusiness";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUploadBusinessMedia } from "../../hooks/useBusinessMedia";
import { useBusinessDraftMutation } from "../../hooks/useBusinessDraftMutation";
import { isEditableStatus } from "../../types/business";

type SingleSlotField = "logo_url" | "cover_image_url" | "video_url";
type SingleSlotFolder = "logo" | "cover" | "video";

interface MediaSlotProps {
  label: string;
  description?: string;
  url: string | null | undefined;
  accept: string;
  disabled: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}

function MediaSlot({ label, description, url, accept, disabled, uploading, onUpload, onClear }: MediaSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = accept.startsWith("video");

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {url ? (
        <div className="relative overflow-hidden rounded-md border border-border">
          {isVideo ? (
            <video src={url} controls className="h-40 w-full bg-black object-contain" />
          ) : (
            <img src={url} alt={label} className="h-40 w-full object-cover" />
          )}
          {!disabled && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute right-2 top-2"
              onClick={onClear}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex h-40 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-center",
            !disabled && "cursor-pointer hover:border-primary",
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
          )}
          <p className="text-xs text-muted-foreground">Click to upload</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function BusinessMediaPanel() {
  const { business, refetch } = usePartnerBusiness();
  const uploadMedia = useUploadBusinessMedia();
  const upsertDraft = useBusinessDraftMutation();
  const [pending, setPending] = useState<SingleSlotFolder | "gallery" | null>(null);

  const status = business.business_verification?.status;
  const editable = isEditableStatus(status);

  const handleSingleUpload = async (folder: SingleSlotFolder, field: SingleSlotField, file: File) => {
    setPending(folder);
    try {
      const url = await uploadMedia.mutateAsync({ businessId: business.id, file, folder });
      await upsertDraft.mutateAsync({ businessId: business.id, values: { [field]: url } });
      refetch();
      toast.success("Uploaded");
    } finally {
      setPending(null);
    }
  };

  const handleClear = async (field: SingleSlotField) => {
    await upsertDraft.mutateAsync({ businessId: business.id, values: { [field]: null } });
    refetch();
  };

  const handleGalleryUpload = async (file: File) => {
    setPending("gallery");
    try {
      const url = await uploadMedia.mutateAsync({ businessId: business.id, file, folder: "gallery" });
      const next = [...(business.gallery_images ?? []), url];
      await upsertDraft.mutateAsync({ businessId: business.id, values: { gallery_images: next } });
      refetch();
      toast.success("Photo added");
    } finally {
      setPending(null);
    }
  };

  const handleGalleryRemove = async (url: string) => {
    const next = (business.gallery_images ?? []).filter((g) => g !== url);
    await upsertDraft.mutateAsync({ businessId: business.id, values: { gallery_images: next } });
    refetch();
  };

  return (
    <div className="max-w-3xl space-y-6">
      {!editable && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Media can't be changed right now</AlertTitle>
          <AlertDescription>
            {status === "approved"
              ? "This business is live. Contact support to update your photos or video."
              : "Media uploads are locked while your application is under review."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo & Cover</CardTitle>
          <CardDescription>These appear on your public listing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <MediaSlot
            label="Logo"
            url={business.logo_url}
            accept="image/*"
            disabled={!editable}
            uploading={pending === "logo"}
            onUpload={(file) => handleSingleUpload("logo", "logo_url", file)}
            onClear={() => handleClear("logo_url")}
          />
          <MediaSlot
            label="Cover image"
            url={business.cover_image_url}
            accept="image/*"
            disabled={!editable}
            uploading={pending === "cover"}
            onUpload={(file) => handleSingleUpload("cover", "cover_image_url", file)}
            onClear={() => handleClear("cover_image_url")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Video</CardTitle>
          <CardDescription>A short walkthrough or promo video (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaSlot
            label="Video"
            url={business.video_url}
            accept="video/*"
            disabled={!editable}
            uploading={pending === "video"}
            onUpload={(file) => handleSingleUpload("video", "video_url", file)}
            onClear={() => handleClear("video_url")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Gallery</CardTitle>
          <CardDescription>Show off your business with a few more photos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(business.gallery_images ?? []).map((url) => (
              <div key={url} className="relative overflow-hidden rounded-md border border-border">
                <img src={url} alt="Gallery" className="h-28 w-full object-cover" />
                {editable && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => handleGalleryRemove(url)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {editable && (
              <label
                className={cn(
                  "flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-center hover:border-primary",
                )}
              >
                {pending === "gallery" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <UploadCloud className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Add photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGalleryUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          {(business.gallery_images ?? []).length === 0 && !editable && (
            <p className="text-sm text-muted-foreground">No gallery photos yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
