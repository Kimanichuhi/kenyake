import { useRef } from "react";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessCategories } from "../../../hooks/useMyBusiness";
import { useUploadBusinessMedia } from "../../../hooks/useBusinessMedia";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

function MediaUploadSlot({
  label,
  businessId,
  folder,
  value,
  onUploaded,
}: {
  label: string;
  businessId: string | null;
  folder: "logo" | "cover";
  value: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadBusinessMedia();

  const handleFile = async (file: File | undefined) => {
    if (!file || !businessId) return;
    const url = await upload.mutateAsync({ businessId, file, folder });
    onUploaded(url);
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {!businessId ? (
        <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          Available after you continue to the next step — that&apos;s when your business profile is created.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {value ? (
              <img src={value} alt={label} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {upload.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              {value ? "Replace" : "Upload"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function BusinessInfoStep({ values, onChange, businessId }: WizardStepProps<BusinessRegistrationValues>) {
  const { data: categories } = useBusinessCategories();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input
          id="name"
          value={values.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Amboseli Wildlife Safaris"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="business_type_id">Business type</Label>
        <Select value={values.business_type_id || undefined} onValueChange={(v) => onChange({ business_type_id: v })}>
          <SelectTrigger id="business_type_id">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={values.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Tell travelers what makes your business special..."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="registration_number">Business registration number</Label>
          <Input
            id="registration_number"
            value={values.registration_number ?? ""}
            onChange={(e) => onChange({ registration_number: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kra_pin">KRA PIN (optional)</Label>
          <Input id="kra_pin" value={values.kra_pin ?? ""} onChange={(e) => onChange({ kra_pin: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year_established">Year established</Label>
          <Input
            id="year_established"
            type="number"
            value={values.year_established ?? ""}
            onChange={(e) => onChange({ year_established: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 2015"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp_number">WhatsApp number</Label>
          <Input
            id="whatsapp_number"
            value={values.whatsapp_number ?? ""}
            onChange={(e) => onChange({ whatsapp_number: e.target.value })}
            placeholder="07XX XXX XXX"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website_url">Website</Label>
          <Input
            id="website_url"
            value={values.website_url ?? ""}
            onChange={(e) => onChange({ website_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="facebook_url">Facebook</Label>
          <Input
            id="facebook_url"
            value={values.facebook_url ?? ""}
            onChange={(e) => onChange({ facebook_url: e.target.value })}
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instagram_url">Instagram</Label>
          <Input
            id="instagram_url"
            value={values.instagram_url ?? ""}
            onChange={(e) => onChange({ instagram_url: e.target.value })}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="twitter_url">Twitter / X</Label>
          <Input
            id="twitter_url"
            value={values.twitter_url ?? ""}
            onChange={(e) => onChange({ twitter_url: e.target.value })}
            placeholder="https://x.com/..."
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="video_url">Promo video link (optional)</Label>
        <Input
          id="video_url"
          value={values.video_url ?? ""}
          onChange={(e) => onChange({ video_url: e.target.value })}
          placeholder="https://youtube.com/..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MediaUploadSlot
          label="Logo"
          businessId={businessId}
          folder="logo"
          value={values.logo_url ?? ""}
          onUploaded={(url) => onChange({ logo_url: url })}
        />
        <MediaUploadSlot
          label="Cover photo"
          businessId={businessId}
          folder="cover"
          value={values.cover_image_url ?? ""}
          onUploaded={(url) => onChange({ cover_image_url: url })}
        />
      </div>
    </div>
  );
}
