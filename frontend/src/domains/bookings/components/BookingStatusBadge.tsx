import { Badge } from "@/components/ui/badge";
import { BookingStatus, PaymentStatus } from "../types/booking";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled_by_customer: "Cancelled",
  cancelled_by_partner: "Cancelled by Partner",
  completed: "Completed",
  no_show: "No Show",
};

const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  rejected: "destructive",
  cancelled_by_customer: "outline",
  cancelled_by_partner: "outline",
  completed: "default",
  no_show: "destructive",
};

export function BookingStatusBadge({ status }: { status: BookingStatus | string }) {
  const s = status as BookingStatus;
  return <Badge variant={STATUS_VARIANT[s] ?? "outline"}>{STATUS_LABEL[s] ?? status}</Badge>;
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending_verification: "Payment Pending Verification",
  paid: "Paid",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
};

const PAYMENT_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "outline",
  pending_verification: "secondary",
  paid: "default",
  refund_requested: "destructive",
  refunded: "outline",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  const s = status as PaymentStatus;
  return <Badge variant={PAYMENT_VARIANT[s] ?? "outline"}>{PAYMENT_LABEL[s] ?? status}</Badge>;
}
