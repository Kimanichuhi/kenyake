import { Card, CardContent } from "@/components/ui/card";
import { BookingResourceType, PAYMENT_METHODS } from "../../../types/booking";
import { BookingFlowValues, calculatePrice, getCurrency } from "../BookingFlow.config";

interface ConfirmStepProps {
  resourceType: BookingResourceType;
  resource: any;
  values: BookingFlowValues;
}

export function ConfirmStep({ resourceType, resource, values }: ConfirmStepProps) {
  const total = calculatePrice(resourceType, values, resource);
  const currency = getCurrency(resourceType, resource);
  const methodLabel = PAYMENT_METHODS.find((m) => m.value === values.payment_method)?.label;

  const dateSummary = (() => {
    switch (resourceType) {
      case "guide":
        return `${values.start_date} → ${values.end_date} · ${values.group_size} guest(s)`;
      case "experience":
        return `${values.booking_date}${values.start_time ? ` at ${values.start_time}` : ""} · ${values.guest_count} guest(s)`;
      case "accommodation":
        return `${values.check_in} → ${values.check_out} · ${values.guest_count} guest(s), ${values.rooms} room(s)`;
      case "transport":
        return `${values.pickup_date}${values.return_date ? ` → ${values.return_date}` : ""} · ${values.passenger_count} passenger(s)`;
    }
  })();

  return (
    <div className="space-y-4">
      <Card className="bg-muted/40">
        <CardContent className="space-y-2 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking</span>
            <span className="text-right font-medium text-foreground">{dateSummary}</span>
          </div>
          {values.contact_phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact</span>
              <span className="text-foreground">{values.contact_phone}</span>
            </div>
          )}
          {methodLabel && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment method</span>
              <span className="text-foreground">{methodLabel}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span>
              {currency} {total.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Submitting this booking sends a request to the host — it isn't confirmed until they accept it.
      </p>
    </div>
  );
}
