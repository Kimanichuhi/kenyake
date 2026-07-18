import { usePartnerBusiness } from "@/components/RequirePartnerBusiness";
import { BusinessDocumentUpload } from "../BusinessDocumentUpload";

export function BusinessDocumentsPanel() {
  const { business } = usePartnerBusiness();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the documents our team needs to verify your business — PDF, JPG, or PNG accepted.
        </p>
      </div>
      <BusinessDocumentUpload businessId={business.id} />
    </div>
  );
}
