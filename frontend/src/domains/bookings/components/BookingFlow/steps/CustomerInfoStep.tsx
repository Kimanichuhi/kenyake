import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingResourceType } from "../../../types/booking";
import { BookingFlowValues } from "../BookingFlow.config";

interface CustomerInfoStepProps {
  resourceType: BookingResourceType;
  values: BookingFlowValues;
  onChange: (partial: Partial<BookingFlowValues>) => void;
}

export function CustomerInfoStep({ resourceType, values, onChange }: CustomerInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Contact phone</Label>
        <Input value={values.contact_phone ?? ""} onChange={(e) => onChange({ contact_phone: e.target.value })} placeholder="+254 7xx xxx xxx" />
      </div>
      {resourceType === "experience" && (
        <div className="space-y-1.5">
          <Label>Contact email</Label>
          <Input
            type="email"
            value={values.contact_email ?? ""}
            onChange={(e) => onChange({ contact_email: e.target.value })}
          />
        </div>
      )}
      {resourceType === "guide" && (
        <div className="space-y-1.5">
          <Label>Message to the guide (optional)</Label>
          <Textarea value={values.message ?? ""} onChange={(e) => onChange({ message: e.target.value })} rows={3} />
        </div>
      )}
      {resourceType !== "guide" && (
        <div className="space-y-1.5">
          <Label>Special requests (optional)</Label>
          <Textarea
            value={values.special_requests ?? ""}
            onChange={(e) => onChange({ special_requests: e.target.value })}
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
