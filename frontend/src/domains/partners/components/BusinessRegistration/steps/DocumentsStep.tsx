import { BusinessDocumentUpload } from "../../BusinessDocumentUpload";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

export function DocumentsStep({ businessId }: WizardStepProps<BusinessRegistrationValues>) {
  if (!businessId) {
    return (
      <p className="text-sm text-muted-foreground">
        Please complete the Business Info step first — we need your business profile created before you can upload
        documents.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload the documents our review team needs to verify your business: your business registration certificate,
        tourism license, insurance certificate, a national ID or passport for the business owner, and your KRA PIN
        certificate.
      </p>
      <BusinessDocumentUpload businessId={businessId} />
    </div>
  );
}
