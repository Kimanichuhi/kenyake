import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessLocationPicker } from "../../BusinessLocationPicker";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

export function LocationStep({ values, onChange }: WizardStepProps<BusinessRegistrationValues>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="county">County</Label>
          <Input id="county" value={values.county ?? ""} onChange={(e) => onChange({ county: e.target.value })} placeholder="e.g. Narok" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub_county">Sub-county</Label>
          <Input id="sub_county" value={values.sub_county ?? ""} onChange={(e) => onChange({ sub_county: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ward">Ward</Label>
          <Input id="ward" value={values.ward ?? ""} onChange={(e) => onChange({ ward: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="postal_code">Postal code</Label>
          <Input id="postal_code" value={values.postal_code ?? ""} onChange={(e) => onChange({ postal_code: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address_line">Address</Label>
        <Input
          id="address_line"
          value={values.address_line ?? ""}
          onChange={(e) => onChange({ address_line: e.target.value })}
          placeholder="Street / building / area"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nearby_landmark">Nearby landmark (optional)</Label>
        <Input
          id="nearby_landmark"
          value={values.nearby_landmark ?? ""}
          onChange={(e) => onChange({ nearby_landmark: e.target.value })}
          placeholder="e.g. Opposite the market"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Pin your location on the map</Label>
        <BusinessLocationPicker lat={values.lat} lng={values.lng} onChange={(lat, lng) => onChange({ lat, lng })} />
      </div>
    </div>
  );
}
