import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { BusinessVerificationChecklistRow } from "../../hooks/usePartnerApplicationDetail";
import { useUpdateChecklist } from "../../hooks/usePartnerVerificationMutations";

type ChecklistField = keyof Pick<
  BusinessVerificationChecklistRow,
  | "email_verified"
  | "phone_verified"
  | "government_registration_verified"
  | "tourism_license_verified"
  | "insurance_verified"
  | "address_verified"
  | "inspection_passed"
  | "trusted_referral"
>;

type NoteField = keyof Pick<
  BusinessVerificationChecklistRow,
  | "email_verified_note"
  | "phone_verified_note"
  | "government_registration_note"
  | "tourism_license_note"
  | "insurance_note"
  | "address_note"
  | "inspection_note"
  | "trusted_referral_note"
>;

interface ChecklistItemDef {
  field: ChecklistField;
  noteField: NoteField;
  label: string;
  points: number;
  autoManaged?: boolean;
}

const CHECKLIST_ITEMS: ChecklistItemDef[] = [
  { field: "email_verified", noteField: "email_verified_note", label: "Email verified", points: 5 },
  { field: "phone_verified", noteField: "phone_verified_note", label: "Phone verified", points: 5 },
  {
    field: "government_registration_verified",
    noteField: "government_registration_note",
    label: "Government registration verified",
    points: 20,
  },
  { field: "tourism_license_verified", noteField: "tourism_license_note", label: "Tourism license verified", points: 25 },
  { field: "insurance_verified", noteField: "insurance_note", label: "Insurance verified", points: 15 },
  { field: "address_verified", noteField: "address_note", label: "Address verified", points: 10 },
  {
    field: "inspection_passed",
    noteField: "inspection_note",
    label: "Inspection passed",
    points: 30,
    autoManaged: true,
  },
  { field: "trusted_referral", noteField: "trusted_referral_note", label: "Trusted referral", points: 10 },
];

function ChecklistRow({
  businessId,
  item,
  checklist,
}: {
  businessId: string;
  item: ChecklistItemDef;
  checklist: BusinessVerificationChecklistRow;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(checklist[item.noteField] ?? "");
  const updateChecklist = useUpdateChecklist();

  const checked = Boolean(checklist[item.field]);

  const handleToggle = (value: boolean) => {
    updateChecklist.mutate({ businessId, patch: { [item.field]: value } as Partial<BusinessVerificationChecklistRow> });
  };

  const handleSaveNote = () => {
    updateChecklist.mutate({
      businessId,
      patch: { [item.noteField]: note } as Partial<BusinessVerificationChecklistRow>,
    });
  };

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex items-center gap-3">
          <Switch checked={checked} onCheckedChange={handleToggle} disabled={updateChecklist.isPending} />
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">Worth {item.points} risk-score points</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.autoManaged && (
            <Badge variant="outline" className="text-[10px]">
              Set via inspection
            </Badge>
          )}
          {updateChecklist.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded((e) => !e)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-2 border-t border-border px-3 py-2.5">
          <Textarea
            value={note ?? ""}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reviewer note (optional)..."
            rows={2}
            className="text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={handleSaveNote} disabled={updateChecklist.isPending}>
              Save note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChecklistPanelProps {
  businessId: string;
  checklist: BusinessVerificationChecklistRow | null | undefined;
}

export function ChecklistPanel({ businessId, checklist }: ChecklistPanelProps) {
  if (!checklist) {
    return <p className="text-sm text-muted-foreground">No checklist record found for this business.</p>;
  }

  return (
    <div className="space-y-2">
      {CHECKLIST_ITEMS.map((item) => (
        <ChecklistRow key={item.field} businessId={businessId} item={item} checklist={checklist} />
      ))}
    </div>
  );
}
