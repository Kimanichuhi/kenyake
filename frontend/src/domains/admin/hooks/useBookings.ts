import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingResourceType, BookingStatus } from "@/domains/bookings/types/booking";

const PAGE_SIZE = 25;

export const ALL_RESOURCE_TYPES: BookingResourceType[] = ["guide", "experience", "accommodation", "transport"];

export const ALL_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled_by_customer",
  "cancelled_by_partner",
  "completed",
  "no_show",
];

export interface UnifiedBookingRow {
  id: string;
  resourceType: BookingResourceType;
  customerId: string;
  resourceName: string;
  dateLabel: string;
  status: BookingStatus;
  paymentStatus: string;
  totalPrice: number | null;
  currency: string;
  createdAt: string;
}

async function fetchResource(resourceType: BookingResourceType): Promise<UnifiedBookingRow[]> {
  switch (resourceType) {
    case "guide": {
      const { data, error } = await supabase
        .from("guide_bookings")
        .select(
          "id, tourist_id, start_date, end_date, status, payment_status, total_price, currency, created_at, guides(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        resourceType: "guide" as const,
        customerId: row.tourist_id,
        resourceName: row.guides?.name ?? "Guide",
        dateLabel: `${row.start_date} — ${row.end_date}`,
        status: row.status,
        paymentStatus: row.payment_status,
        totalPrice: row.total_price,
        currency: row.currency,
        createdAt: row.created_at,
      }));
    }
    case "experience": {
      const { data, error } = await supabase
        .from("experience_bookings")
        .select(
          "id, user_id, booking_date, start_time, status, payment_status, total_price, currency, created_at, experiences(title)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        resourceType: "experience" as const,
        customerId: row.user_id,
        resourceName: row.experiences?.title ?? "Experience",
        dateLabel: row.start_time ? `${row.booking_date} · ${row.start_time}` : row.booking_date,
        status: row.status,
        paymentStatus: row.payment_status,
        totalPrice: row.total_price,
        currency: row.currency,
        createdAt: row.created_at,
      }));
    }
    case "accommodation": {
      const { data, error } = await supabase
        .from("accommodation_bookings")
        .select(
          "id, user_id, check_in, check_out, status, payment_status, total_price, currency, created_at, accommodations(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        resourceType: "accommodation" as const,
        customerId: row.user_id,
        resourceName: row.accommodations?.name ?? "Accommodation",
        dateLabel: `${row.check_in} — ${row.check_out}`,
        status: row.status,
        paymentStatus: row.payment_status,
        totalPrice: row.total_price,
        currency: row.currency,
        createdAt: row.created_at,
      }));
    }
    case "transport": {
      const { data, error } = await supabase
        .from("transport_bookings")
        .select(
          "id, user_id, pickup_date, return_date, status, payment_status, total_price, price_currency, created_at, transport_vehicles(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        resourceType: "transport" as const,
        customerId: row.user_id,
        resourceName: row.transport_vehicles?.name ?? "Vehicle",
        dateLabel: row.return_date ? `${row.pickup_date} — ${row.return_date}` : row.pickup_date,
        status: row.status,
        paymentStatus: row.payment_status,
        totalPrice: row.total_price,
        currency: row.price_currency ?? "KES",
        createdAt: row.created_at,
      }));
    }
  }
}

export interface UseBookingsOptions {
  page?: number;
  resourceType?: BookingResourceType | "";
  status?: BookingStatus | "";
}

/**
 * There is no unified SQL view across the 4 booking tables (deliberately, this phase).
 * Runs one query per resource type (or a single targeted query when filtered), merges +
 * sorts by created_at client-side, and paginates in JS. Simplest correct approach given
 * the volumes expected at this stage — not meant to scale past a few thousand rows.
 */
export function useBookings({ page = 0, resourceType, status }: UseBookingsOptions = {}) {
  return useQuery({
    queryKey: ["admin-bookings", page, resourceType, status],
    queryFn: async () => {
      const types = resourceType ? [resourceType] : ALL_RESOURCE_TYPES;
      const results = await Promise.all(types.map(fetchResource));
      let merged = results.flat();
      if (status) merged = merged.filter((r) => r.status === status);
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const count = merged.length;
      const from = page * PAGE_SIZE;
      const rows = merged.slice(from, from + PAGE_SIZE);
      return { rows, count, pageSize: PAGE_SIZE };
    },
  });
}
