import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerField } from "../../MediaPicker";
import { HeroBlock } from "../../../types/block";

export const HeroBlockEditor = ({ value, onChange }: { value: HeroBlock; onChange: (v: HeroBlock) => void }) => (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label>Heading</Label>
      <Input value={value.heading} onChange={(e) => onChange({ ...value, heading: e.target.value })} />
    </div>
    <div className="space-y-1.5">
      <Label>Subheading</Label>
      <Input value={value.subheading ?? ""} onChange={(e) => onChange({ ...value, subheading: e.target.value })} />
    </div>
    <div className="space-y-1.5">
      <Label>Background image</Label>
      <MediaPickerField value={value.image} onChange={(url) => onChange({ ...value, image: url })} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Button label</Label>
        <Input value={value.ctaLabel ?? ""} onChange={(e) => onChange({ ...value, ctaLabel: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Button link</Label>
        <Input value={value.ctaHref ?? ""} onChange={(e) => onChange({ ...value, ctaHref: e.target.value })} />
      </div>
    </div>
  </div>
);
