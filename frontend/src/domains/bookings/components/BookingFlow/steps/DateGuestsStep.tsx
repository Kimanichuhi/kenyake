import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { BookingResourceType } from "../../../types/booking";
import { BookingFlowValues } from "../BookingFlow.config";
import { ResourceBookingWindow, isDateRangeBlocked, bookedGuestsOnDate } from "../../../hooks/useResourceAvailability";

interface DateGuestsStepProps {
  resourceType: BookingResourceType;
  resource: any;
  values: BookingFlowValues;
  onChange: (partial: Partial<BookingFlowValues>) => void;
  availabilityWindows: ResourceBookingWindow[];
}

export function DateGuestsStep({ resourceType, resource, values, onChange, availabilityWindows }: DateGuestsStepProps) {
  const conflict = (() => {
    switch (resourceType) {
      case "guide":
        return values.start_date && values.end_date
          ? isDateRangeBlocked(availabilityWindows, values.start_date, values.end_date)
          : false;
      case "accommodation":
        return values.check_in && values.check_out
          ? isDateRangeBlocked(availabilityWindows, values.check_in, values.check_out)
          : false;
      case "transport":
        return values.pickup_date
          ? isDateRangeBlocked(availabilityWindows, values.pickup_date, values.return_date || values.pickup_date)
          : false;
      case "experience": {
        if (!values.booking_date) return false;
        const booked = bookedGuestsOnDate(availabilityWindows, values.booking_date);
        const max = resource.max_guests as number | null;
        return max != null && booked + (values.guest_count ?? 1) > max;
      }
    }
  })();

  return (
    <div className="space-y-4">
      {resourceType === "guide" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={values.start_date} onChange={(e) => onChange({ start_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input type="date" value={values.end_date} onChange={(e) => onChange({ end_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Group size</Label>
            <Input
              type="number"
              min={1}
              value={values.group_size}
              onChange={(e) => onChange({ group_size: Number(e.target.value) })}
            />
          </div>
        </>
      )}

      {resourceType === "experience" && (
        <>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={values.booking_date} onChange={(e) => onChange({ booking_date: e.target.value })} />
          </div>
          {resource.start_times?.length > 0 && (
            <div className="space-y-1.5">
              <Label>Start time</Label>
              <div className="flex flex-wrap gap-2">
                {resource.start_times.map((t: string) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ start_time: t })}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      values.start_time === t ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              value={values.guest_count}
              onChange={(e) => onChange({ guest_count: Number(e.target.value) })}
            />
          </div>
        </>
      )}

      {resourceType === "accommodation" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Check-in</Label>
              <Input type="date" value={values.check_in} onChange={(e) => onChange({ check_in: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Check-out</Label>
              <Input type="date" value={values.check_out} onChange={(e) => onChange({ check_out: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Guests</Label>
              <Input
                type="number"
                min={1}
                value={values.guest_count}
                onChange={(e) => onChange({ guest_count: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rooms</Label>
              <Input type="number" min={1} value={values.rooms} onChange={(e) => onChange({ rooms: Number(e.target.value) })} />
            </div>
          </div>
        </>
      )}

      {resourceType === "transport" && (
        <>
          <div className="space-y-1.5">
            <Label>Pickup location</Label>
            <Input value={values.pickup_location} onChange={(e) => onChange({ pickup_location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Dropoff location (optional)</Label>
            <Input value={values.dropoff_location} onChange={(e) => onChange({ dropoff_location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pickup date</Label>
              <Input type="date" value={values.pickup_date} onChange={(e) => onChange({ pickup_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Pickup time</Label>
              <Input type="time" value={values.pickup_time} onChange={(e) => onChange({ pickup_time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Return date (optional)</Label>
              <Input type="date" value={values.return_date} onChange={(e) => onChange({ return_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Passengers</Label>
              <Input
                type="number"
                min={1}
                value={values.passenger_count}
                onChange={(e) => onChange({ passenger_count: Number(e.target.value) })}
              />
            </div>
          </div>
        </>
      )}

      {conflict && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {resourceType === "experience"
            ? "This experience is fully booked for the selected date."
            : "This item is already booked for an overlapping date. Please choose different dates."}
        </p>
      )}
    </div>
  );
}
