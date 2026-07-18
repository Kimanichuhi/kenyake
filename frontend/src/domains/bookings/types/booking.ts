import { Tables } from "@/integrations/supabase/types";

export type BookingResourceType = "guide" | "experience" | "accommodation" | "transport";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled_by_customer"
  | "cancelled_by_partner"
  | "completed"
  | "no_show";

export type PaymentStatus = "unpaid" | "pending_verification" | "paid" | "refund_requested" | "refunded";

export type PaymentMethod = "mpesa" | "airtel_money" | "card" | "bank_transfer" | "cash_on_arrival";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash_on_arrival", label: "Cash on Arrival" },
];

export type GuideBookingRow = Tables<"guide_bookings">;
export type ExperienceBookingRow = Tables<"experience_bookings">;
export type AccommodationBookingRow = Tables<"accommodation_bookings">;
export type TransportBookingRow = Tables<"transport_bookings">;

export type AnyBookingRow = GuideBookingRow | ExperienceBookingRow | AccommodationBookingRow | TransportBookingRow;

export type BookingPaymentRow = Tables<"booking_payments">;
export type BookingStatusHistoryRow = Tables<"booking_status_history">;
export type NotificationRow = Tables<"notifications">;

export const RESOURCE_TABLE: Record<BookingResourceType, string> = {
  guide: "guide_bookings",
  experience: "experience_bookings",
  accommodation: "accommodation_bookings",
  transport: "transport_bookings",
};

/** Column holding the customer's user id — differs only for guide bookings. */
export const RESOURCE_CUSTOMER_COLUMN: Record<BookingResourceType, string> = {
  guide: "tourist_id",
  experience: "user_id",
  accommodation: "user_id",
  transport: "user_id",
};
