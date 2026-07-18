import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { WizardProgress } from "@/domains/partners/components/wizard/WizardProgress";
import { BookingResourceType } from "../../types/booking";
import { useResourceAvailability } from "../../hooks/useResourceAvailability";
import { useCreateBooking } from "../../hooks/useCreateBooking";
import { useSubmitBookingPayment } from "../../hooks/useBookingPayments";
import { BookingFlowValues, getInitialValues, calculatePrice, getCurrency, toRowPayload } from "./BookingFlow.config";
import { DateGuestsStep } from "./steps/DateGuestsStep";
import { CustomerInfoStep } from "./steps/CustomerInfoStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import { ConfirmStep } from "./steps/ConfirmStep";

interface BookingFlowProps {
  resourceType: BookingResourceType;
  resource: any;
  onComplete: () => void;
}

const STEPS = [
  { id: "dates", title: "Dates & Guests" },
  { id: "info", title: "Your Details" },
  { id: "payment", title: "Payment" },
  { id: "confirm", title: "Confirm" },
];

export function BookingFlow({ resourceType, resource, onComplete }: BookingFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<BookingFlowValues>(getInitialValues(resourceType));

  const { data: availabilityWindows = [] } = useResourceAvailability(resourceType, resource?.id);
  const createBooking = useCreateBooking(resourceType);
  const submitPayment = useSubmitBookingPayment();

  const handleChange = (partial: Partial<BookingFlowValues>) => setValues((v) => ({ ...v, ...partial }));

  const isLast = stepIndex === STEPS.length - 1;
  const isSubmitting = createBooking.isPending || submitPayment.isPending;

  const handleNext = async () => {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }

    try {
      const total = calculatePrice(resourceType, values, resource);
      const payload = toRowPayload(resourceType, values, resource, total);
      const booking = await createBooking.mutateAsync(payload);

      if (values.payment_method) {
        await submitPayment.mutateAsync({
          resourceType,
          bookingId: booking.id,
          amount: total,
          currency: getCurrency(resourceType, resource),
          method: values.payment_method,
          referenceNote: values.reference_note,
        });
      }

      toast.success("Booking request sent! You'll be notified once it's reviewed.");
      onComplete();
    } catch {
      // useCreateBooking/useSubmitBookingPayment already surface a toast on error
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgress steps={STEPS} currentIndex={stepIndex} furthestIndex={stepIndex} onStepClick={setStepIndex} />

      <div className="min-h-[200px]">
        {stepIndex === 0 && (
          <DateGuestsStep
            resourceType={resourceType}
            resource={resource}
            values={values}
            onChange={handleChange}
            availabilityWindows={availabilityWindows}
          />
        )}
        {stepIndex === 1 && <CustomerInfoStep resourceType={resourceType} values={values} onChange={handleChange} />}
        {stepIndex === 2 && <PaymentMethodStep values={values} onChange={handleChange} />}
        {stepIndex === 3 && <ConfirmStep resourceType={resourceType} resource={resource} values={values} />}
      </div>

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0 || isSubmitting}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {isLast ? "Submit Booking" : "Next"}
          {!isLast && !isSubmitting && <ArrowRight className="ml-1.5 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
