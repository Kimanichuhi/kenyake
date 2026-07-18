import { BookingResourceType, PaymentMethod } from "../../types/booking";

export interface BookingFlowValues {
  // guide
  start_date?: string;
  end_date?: string;
  group_size?: number;
  message?: string;
  // experience
  booking_date?: string;
  start_time?: string;
  guest_count?: number;
  contact_email?: string;
  // accommodation
  check_in?: string;
  check_out?: string;
  rooms?: number;
  // transport
  pickup_location?: string;
  dropoff_location?: string;
  pickup_date?: string;
  pickup_time?: string;
  return_date?: string;
  passenger_count?: number;
  // common
  special_requests?: string;
  contact_phone?: string;
  // payment (step 3)
  payment_method?: PaymentMethod;
  reference_note?: string;
}

export function getInitialValues(resourceType: BookingResourceType): BookingFlowValues {
  switch (resourceType) {
    case "guide":
      return { start_date: "", end_date: "", group_size: 1, message: "" };
    case "experience":
      return { booking_date: "", start_time: "", guest_count: 1, contact_email: "", contact_phone: "" };
    case "accommodation":
      return { check_in: "", check_out: "", guest_count: 1, rooms: 1, contact_phone: "" };
    case "transport":
      return {
        pickup_location: "",
        dropoff_location: "",
        pickup_date: "",
        pickup_time: "",
        return_date: "",
        passenger_count: 1,
        contact_phone: "",
      };
  }
}

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** resource is the raw guides/experiences/accommodations/transport_vehicles row for the item being booked. */
export function calculatePrice(resourceType: BookingResourceType, values: BookingFlowValues, resource: any): number {
  switch (resourceType) {
    case "guide":
      return (resource.price_per_day ?? 0) * daysBetween(values.start_date ?? "", values.end_date ?? "");
    case "experience":
      return (resource.price_amount ?? 0) * (values.guest_count ?? 1);
    case "accommodation":
      return (
        (resource.price_per_night ?? 0) *
        Math.max(1, daysBetween(values.check_in ?? "", values.check_out ?? "") - 1) *
        (values.rooms ?? 1)
      );
    case "transport":
      return (
        (resource.price_per_day ?? 0) *
        daysBetween(values.pickup_date ?? "", values.return_date || values.pickup_date || "")
      );
  }
}

export function getCurrency(resourceType: BookingResourceType, resource: any): string {
  return resource.price_currency ?? "USD";
}

export function toRowPayload(
  resourceType: BookingResourceType,
  values: BookingFlowValues,
  resource: any,
  totalPrice: number,
): Record<string, unknown> {
  switch (resourceType) {
    case "guide":
      return {
        guide_id: resource.id,
        start_date: values.start_date,
        end_date: values.end_date,
        group_size: values.group_size,
        total_price: totalPrice,
        message: values.message || null,
      };
    case "experience":
      return {
        experience_id: resource.id,
        booking_date: values.booking_date,
        start_time: values.start_time || null,
        guest_count: values.guest_count,
        total_price: totalPrice,
        special_requests: values.special_requests || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
      };
    case "accommodation":
      return {
        accommodation_id: resource.id,
        check_in: values.check_in,
        check_out: values.check_out,
        guest_count: values.guest_count,
        rooms: values.rooms,
        total_price: totalPrice,
        special_requests: values.special_requests || null,
        contact_phone: values.contact_phone || null,
      };
    case "transport":
      return {
        driver_id: resource.driver_id ?? resource.driverId ?? null,
        vehicle_id: resource.id,
        booking_type: "vehicle-hire",
        pickup_location: values.pickup_location,
        dropoff_location: values.dropoff_location || null,
        pickup_date: values.pickup_date,
        pickup_time: values.pickup_time || null,
        return_date: values.return_date || null,
        passenger_count: values.passenger_count,
        total_price: totalPrice,
        price_currency: getCurrency(resourceType, resource),
        special_requests: values.special_requests || null,
        contact_phone: values.contact_phone || null,
      };
  }
}
