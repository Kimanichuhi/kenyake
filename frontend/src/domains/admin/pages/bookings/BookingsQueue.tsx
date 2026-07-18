import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/DataTable";
import { useBookings, ALL_RESOURCE_TYPES, ALL_BOOKING_STATUSES, UnifiedBookingRow } from "../../hooks/useBookings";
import { useProfileNames } from "../../hooks/useProfileNames";
import { supabase } from "@/integrations/supabase/client";
import { useTransitionBookingStatus } from "@/domains/bookings/hooks/useTransitionBookingStatus";
import { useVerifyBookingPayment } from "@/domains/bookings/hooks/useBookingPayments";
import { BookingStatusBadge, PaymentStatusBadge } from "@/domains/bookings/components/BookingStatusBadge";
import { BookingResourceType, BookingStatus } from "@/domains/bookings/types/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RESOURCE_LABEL: Record<BookingResourceType, string> = {
  guide: "Guide",
  experience: "Experience",
  accommodation: "Accommodation",
  transport: "Transport",
};

function useBookingStatusHistory(resourceType?: BookingResourceType, bookingId?: string) {
  return useQuery({
    queryKey: ["booking-status-history", resourceType, bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status_history")
        .select("*")
        .eq("resource_type", resourceType as string)
        .eq("booking_id", bookingId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!resourceType && !!bookingId,
  });
}

function usePendingPayment(resourceType?: BookingResourceType, bookingId?: string) {
  return useQuery({
    queryKey: ["booking-pending-payment", resourceType, bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_payments")
        .select("id, amount, currency, method")
        .eq("resource_type", resourceType as string)
        .eq("booking_id", bookingId as string)
        .eq("status", "pending_verification")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!resourceType && !!bookingId,
  });
}

const BookingsQueue = () => {
  const [page, setPage] = useState(0);
  const [resourceType, setResourceType] = useState<BookingResourceType | "">("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [detailRow, setDetailRow] = useState<UnifiedBookingRow | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus | "">("");
  const [reason, setReason] = useState("");

  const { data, isLoading } = useBookings({ page, resourceType, status });
  const { data: names } = useProfileNames((data?.rows ?? []).map((r) => r.customerId));
  const { data: history, isLoading: historyLoading } = useBookingStatusHistory(
    detailRow?.resourceType,
    detailRow?.id,
  );
  const { data: pendingPayment } = usePendingPayment(detailRow?.resourceType, detailRow?.id);

  const transitionStatus = useTransitionBookingStatus();
  const verifyPayment = useVerifyBookingPayment();

  const openDetail = (row: UnifiedBookingRow) => {
    setDetailRow(row);
    setNewStatus("");
    setReason("");
  };

  const handleApplyStatus = async () => {
    if (!detailRow || !newStatus) return;
    await transitionStatus.mutateAsync({
      resourceType: detailRow.resourceType,
      bookingId: detailRow.id,
      newStatus,
      reason: reason || undefined,
    });
    setDetailRow({ ...detailRow, status: newStatus });
    setNewStatus("");
    setReason("");
  };

  const handleVerifyPayment = async (approve: boolean) => {
    if (!pendingPayment) return;
    await verifyPayment.mutateAsync({ paymentId: pendingPayment.id, approve });
  };

  const columns = useMemo<ColumnDef<UnifiedBookingRow, unknown>[]>(
    () => [
      {
        id: "resource_type",
        header: "Resource",
        cell: ({ row }) => <Badge variant="outline">{RESOURCE_LABEL[row.original.resourceType]}</Badge>,
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => names?.[row.original.customerId] ?? "…",
      },
      {
        id: "resource_name",
        header: "Booking",
        cell: ({ row }) => row.original.resourceName,
      },
      {
        id: "date",
        header: "Date(s)",
        cell: ({ row }) => row.original.dateLabel,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
      },
      {
        id: "payment_status",
        header: "Payment",
        cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
      },
      {
        id: "total_price",
        header: "Total",
        cell: ({ row }) =>
          row.original.totalPrice != null
            ? `${row.original.currency} ${row.original.totalPrice.toLocaleString()}`
            : "—",
      },
      {
        id: "created_at",
        header: "Created",
        cell: ({ row }) => formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true }),
      },
    ],
    [names],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Cross-platform view of every guide, experience, accommodation, and transport booking.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={resourceType || "__all"}
          onValueChange={(v) => {
            setResourceType(v === "__all" ? "" : (v as BookingResourceType));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All resource types</SelectItem>
            {ALL_RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {RESOURCE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || "__all"}
          onValueChange={(v) => {
            setStatus(v === "__all" ? "" : (v as BookingStatus));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All statuses</SelectItem>
            {ALL_BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 25}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={openDetail}
        emptyMessage="No bookings found."
      />

      <Dialog open={!!detailRow} onOpenChange={(o) => !o && setDetailRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailRow?.resourceName}</DialogTitle>
          </DialogHeader>

          {detailRow && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Resource type</p>
                  <p className="font-medium text-foreground">{RESOURCE_LABEL[detailRow.resourceType]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{names?.[detailRow.customerId] ?? "…"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date(s)</p>
                  <p className="font-medium text-foreground">{detailRow.dateLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium text-foreground">
                    {detailRow.totalPrice != null ? `${detailRow.currency} ${detailRow.totalPrice.toLocaleString()}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <BookingStatusBadge status={detailRow.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <PaymentStatusBadge status={detailRow.paymentStatus} />
                </div>
              </div>

              {pendingPayment && (
                <div className="rounded-md border border-border p-3">
                  <p className="font-medium text-foreground">
                    Pending payment: {pendingPayment.currency} {pendingPayment.amount.toLocaleString()} via{" "}
                    {String(pendingPayment.method).replace(/_/g, " ")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => handleVerifyPayment(true)} disabled={verifyPayment.isPending}>
                      Approve payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyPayment(false)}
                      disabled={verifyPayment.isPending}
                    >
                      Reject payment
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status history</p>
                {historyLoading ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : !history || history.length === 0 ? (
                  <p className="text-muted-foreground">No status changes recorded.</p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {history.map((h: any) => (
                      <div key={h.id} className="rounded-md border border-border p-2 text-xs">
                        <p className="text-foreground">
                          {h.from_status ? `${h.from_status} → ${h.to_status}` : `Created as ${h.to_status}`}
                        </p>
                        {h.reason && <p className="text-muted-foreground">Reason: {h.reason}</p>}
                        <p className="text-muted-foreground/70">
                          {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Admin override
                </p>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BookingStatus)}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Set new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_BOOKING_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleApplyStatus} disabled={!newStatus || transitionStatus.isPending}>
                    Apply
                  </Button>
                </div>
                <Textarea
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-16"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsQueue;
