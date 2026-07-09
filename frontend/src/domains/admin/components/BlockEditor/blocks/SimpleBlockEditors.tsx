import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListItemsEditor } from "./ListItemsEditor";
import { FeatureCardsBlock, TestimonialsBlock, FaqBlock, CtaBlock, StatsBlock } from "../../../types/block";

export const FeatureCardsBlockEditor = ({
  value,
  onChange,
}: {
  value: FeatureCardsBlock;
  onChange: (v: FeatureCardsBlock) => void;
}) => (
  <ListItemsEditor
    items={value.items}
    onChange={(items) => onChange({ ...value, items })}
    fields={[
      { key: "title", placeholder: "Title" },
      { key: "body", placeholder: "Description", multiline: true },
    ]}
    emptyItem={{ title: "", body: "" }}
    addLabel="Add card"
  />
);

export const TestimonialsBlockEditor = ({
  value,
  onChange,
}: {
  value: TestimonialsBlock;
  onChange: (v: TestimonialsBlock) => void;
}) => (
  <ListItemsEditor
    items={value.items}
    onChange={(items) => onChange({ ...value, items })}
    fields={[
      { key: "quote", placeholder: "Quote", multiline: true },
      { key: "author", placeholder: "Author name" },
      { key: "role", placeholder: "Role / location (optional)" },
    ]}
    emptyItem={{ quote: "", author: "", role: "" }}
    addLabel="Add testimonial"
  />
);

export const FaqBlockEditor = ({ value, onChange }: { value: FaqBlock; onChange: (v: FaqBlock) => void }) => (
  <ListItemsEditor
    items={value.items}
    onChange={(items) => onChange({ ...value, items })}
    fields={[
      { key: "question", placeholder: "Question" },
      { key: "answer", placeholder: "Answer", multiline: true },
    ]}
    emptyItem={{ question: "", answer: "" }}
    addLabel="Add question"
  />
);

export const StatsBlockEditor = ({ value, onChange }: { value: StatsBlock; onChange: (v: StatsBlock) => void }) => (
  <ListItemsEditor
    items={value.items}
    onChange={(items) => onChange({ ...value, items })}
    fields={[
      { key: "value", placeholder: "Value (e.g. 40%)" },
      { key: "label", placeholder: "Label (e.g. Community revenue share)" },
    ]}
    emptyItem={{ value: "", label: "" }}
    addLabel="Add stat"
  />
);

export const CtaBlockEditor = ({ value, onChange }: { value: CtaBlock; onChange: (v: CtaBlock) => void }) => (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label>Heading</Label>
      <Input value={value.heading} onChange={(e) => onChange({ ...value, heading: e.target.value })} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Button label</Label>
        <Input value={value.buttonLabel} onChange={(e) => onChange({ ...value, buttonLabel: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Button link</Label>
        <Input value={value.buttonHref} onChange={(e) => onChange({ ...value, buttonHref: e.target.value })} />
      </div>
    </div>
  </div>
);
