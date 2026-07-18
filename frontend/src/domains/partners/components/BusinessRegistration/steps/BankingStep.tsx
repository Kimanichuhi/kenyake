import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

export function BankingStep({ values, onChange }: WizardStepProps<BusinessRegistrationValues>) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We don&apos;t have a live payout system yet — this is just to have your settlement details on file ahead of
        time. Nothing here triggers a payment today.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bank_name">Bank name</Label>
          <Input id="bank_name" value={values.bank_name ?? ""} onChange={(e) => onChange({ bank_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bank_branch">Bank branch</Label>
          <Input id="bank_branch" value={values.bank_branch ?? ""} onChange={(e) => onChange({ bank_branch: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bank_account_name">Account name</Label>
          <Input
            id="bank_account_name"
            value={values.bank_account_name ?? ""}
            onChange={(e) => onChange({ bank_account_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bank_account_number">Account number</Label>
          <Input
            id="bank_account_number"
            value={values.bank_account_number ?? ""}
            onChange={(e) => onChange({ bank_account_number: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mpesa_till_number">M-Pesa till number (optional)</Label>
          <Input
            id="mpesa_till_number"
            value={values.mpesa_till_number ?? ""}
            onChange={(e) => onChange({ mpesa_till_number: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mpesa_paybill_number">M-Pesa paybill number (optional)</Label>
          <Input
            id="mpesa_paybill_number"
            value={values.mpesa_paybill_number ?? ""}
            onChange={(e) => onChange({ mpesa_paybill_number: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
