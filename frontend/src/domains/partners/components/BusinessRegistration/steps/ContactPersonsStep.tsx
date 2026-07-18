import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactInput } from "../../../hooks/useBusinessContacts";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

const ROLE_OPTIONS: { value: ContactInput["role"]; label: string }[] = [
  { value: "primary", label: "Primary contact" },
  { value: "secondary", label: "Secondary contact" },
  { value: "emergency", label: "Emergency contact" },
];

function emptyContact(): ContactInput {
  return { full_name: "", role: "secondary", designation: "", email: "", phone: "", is_primary: false };
}

export function ContactPersonsStep({ values, onChange }: WizardStepProps<BusinessRegistrationValues>) {
  const contacts = values.contacts ?? [];

  const updateContact = (index: number, patch: Partial<ContactInput>) => {
    const next = contacts.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ contacts: next });
  };

  const setPrimary = (index: number) => {
    const next = contacts.map((c, i) => ({ ...c, is_primary: i === index }));
    onChange({ contacts: next });
  };

  const addContact = () => onChange({ contacts: [...contacts, emptyContact()] });
  const removeContact = (index: number) => onChange({ contacts: contacts.filter((_, i) => i !== index) });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add at least one contact person. Mark exactly one as primary — that&apos;s who we&apos;ll reach out to
        during review.
      </p>
      {contacts.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No contacts added yet.
        </p>
      )}
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Contact {index + 1}</p>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(index)}>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={contact.full_name} onChange={(e) => updateContact(index, { full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={contact.role} onValueChange={(v) => updateContact(index, { role: v as ContactInput["role"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Designation (optional)</Label>
                <Input value={contact.designation ?? ""} onChange={(e) => updateContact(index, { designation: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={contact.email ?? ""} onChange={(e) => updateContact(index, { email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={contact.phone ?? ""} onChange={(e) => updateContact(index, { phone: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`primary-${index}`}
                checked={!!contact.is_primary}
                onCheckedChange={() => setPrimary(index)}
              />
              <Label htmlFor={`primary-${index}`} className="text-sm font-normal">
                Primary contact
              </Label>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addContact}>
        <Plus className="mr-1.5 h-4 w-4" /> Add contact
      </Button>
    </div>
  );
}
