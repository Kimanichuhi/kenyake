import { useRef } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBusinessDocuments } from "../../../hooks/useBusinessDocuments";
import { useUploadBusinessMedia } from "../../../hooks/useBusinessMedia";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

function SummaryRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 text-foreground">{value || "—"}</span>
    </div>
  );
}

export function ReviewSubmitStep({ values, onChange, businessId }: WizardStepProps<BusinessRegistrationValues>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: documents } = useBusinessDocuments(businessId);
  const uploadMedia = useUploadBusinessMedia();
  const galleryImages = values.gallery_images ?? [];

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !businessId) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadMedia.mutateAsync({ businessId, file, folder: "gallery" });
      urls.push(url);
    }
    onChange({ gallery_images: [...galleryImages, ...urls] });
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeGalleryImage = (url: string) => {
    onChange({ gallery_images: galleryImages.filter((g) => g !== url) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Business</h3>
        <SummaryRow label="Name" value={values.name} />
        <SummaryRow label="Registration #" value={values.registration_number} />
        <SummaryRow label="KRA PIN" value={values.kra_pin} />
        <SummaryRow label="Website" value={values.website_url} />
      </div>

      <div className="space-y-1 rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Location</h3>
        <SummaryRow label="County" value={values.county} />
        <SummaryRow label="Address" value={values.address_line} />
      </div>

      <div className="space-y-1 rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Contacts</h3>
        <SummaryRow label="Contacts added" value={values.contacts?.length ?? 0} />
      </div>

      <div className="space-y-1 rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Documents</h3>
        <SummaryRow label="Documents uploaded" value={documents?.length ?? 0} />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Gallery photos (optional)</h3>
        <div className="flex flex-wrap gap-2">
          {galleryImages.map((url) => (
            <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
              <img src={url} alt="Gallery" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(url)}
                className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        {!businessId ? (
          <p className="text-xs text-muted-foreground">Complete earlier steps to add gallery photos.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploadMedia.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {uploadMedia.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              Add photos
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGalleryFiles(e.target.files)}
            />
          </>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Terms &amp; agreements</h3>
        <div className="flex items-start gap-2">
          <Checkbox
            id="termsAccepted"
            checked={!!values.termsAccepted}
            onCheckedChange={(c) => onChange({ termsAccepted: c === true })}
          />
          <Label htmlFor="termsAccepted" className="text-sm font-normal leading-snug">
            I accept the{" "}
            <a href="#" className="text-primary underline">
              Platform Terms of Service
            </a>
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="privacyAccepted"
            checked={!!values.privacyAccepted}
            onCheckedChange={(c) => onChange({ privacyAccepted: c === true })}
          />
          <Label htmlFor="privacyAccepted" className="text-sm font-normal leading-snug">
            I accept the{" "}
            <a href="#" className="text-primary underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="commissionAccepted"
            checked={!!values.commissionAccepted}
            onCheckedChange={(c) => onChange({ commissionAccepted: c === true })}
          />
          <Label htmlFor="commissionAccepted" className="text-sm font-normal leading-snug">
            I accept the{" "}
            <a href="#" className="text-primary underline">
              Commission Agreement
            </a>
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="communityStandardsAccepted"
            checked={!!values.communityStandardsAccepted}
            onCheckedChange={(c) => onChange({ communityStandardsAccepted: c === true })}
          />
          <Label htmlFor="communityStandardsAccepted" className="text-sm font-normal leading-snug">
            I agree to follow the{" "}
            <a href="#" className="text-primary underline">
              Community Standards
            </a>
          </Label>
        </div>
      </div>
    </div>
  );
}
