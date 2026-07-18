import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS } from "../../../types/booking";
import { BookingFlowValues } from "../BookingFlow.config";

interface PaymentMethodStepProps {
  values: BookingFlowValues;
  onChange: (partial: Partial<BookingFlowValues>) => void;
}

export function PaymentMethodStep({ values, onChange }: PaymentMethodStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Payment method</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange({ payment_method: m.value })}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                values.payment_method === m.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {values.payment_method && values.payment_method !== "cash_on_arrival" && (
        <div className="space-y-1.5">
          <Label>Payment reference</Label>
          <Input
            value={values.reference_note ?? ""}
            onChange={(e) => onChange({ reference_note: e.target.value })}
            placeholder={values.payment_method === "mpesa" ? "e.g. M-Pesa transaction code" : "Transaction reference"}
          />
          <p className="text-xs text-muted-foreground">
            No live payment gateway is connected yet — enter the reference from your payment and the host/admin will
            manually confirm it.
          </p>
        </div>
      )}

      {values.payment_method === "cash_on_arrival" && (
        <p className="text-sm text-muted-foreground">You'll pay in person. No reference needed.</p>
      )}
    </div>
  );
}
