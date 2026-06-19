import { useState } from "react";
import { Calendar, User, DollarSign, Clock } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "../hooks/useAdmin";
import { Card, DataTable, Button, StatusBadge } from "../components/Common";
import type { Booking } from "../types";

export function BookingsPage() {
  const [page, setPage] = useState(1);
  const [bookingType, setBookingType] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const {
    data: response,
    isLoading,
    error,
  } = useBookings(bookingType || undefined, page, 50, filters);
  const { mutate: updateStatus } = useUpdateBookingStatus();

  const handleStatusChange = (booking: Booking, status: string) => {
    updateStatus({ id: booking.id, status });
  };

  const columns = [
    {
      key: "booking_date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "booking_type",
      label: "Type",
      render: (value: string) => (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
          {value}
        </span>
      ),
    },
    {
      key: "total_price",
      label: "Amount",
      render: (value: number) =>
        `${value ? `KES ${value.toLocaleString()}` : "N/A"}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusColors: Record<string, "success" | "warning" | "danger"> = {
          pending: "warning",
          confirmed: "success",
          completed: "success",
          cancelled: "danger",
        };
        return (
          <StatusBadge
            status={value.charAt(0).toUpperCase() + value.slice(1)}
            variant={statusColors[value] || "default"}
          />
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString();
      },
    },
  ];

  const actions = [
    {
      label: "Confirm",
      onClick: (row: Booking) => handleStatusChange(row, "confirmed"),
    },
    {
      label: "Complete",
      onClick: (row: Booking) => handleStatusChange(row, "completed"),
    },
    {
      label: "Cancel",
      onClick: (row: Booking) => handleStatusChange(row, "cancelled"),
      variant: "danger" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-1">
          Manage all bookings and reservations
        </p>
      </div>

      {/* Filters */}
      <Card title="Filters & Search">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Type
            </label>
            <select
              value={bookingType}
              onChange={(e) => {
                setBookingType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="experience">Experience</option>
              <option value="guide">Guide</option>
              <option value="transport">Transport</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value || undefined,
                }));
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value || undefined,
                }));
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  dateTo: e.target.value || undefined,
                }));
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {response?.total || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {response?.data?.filter((b) => b.status === "pending").length ||
                  0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES{" "}
                {(
                  response?.data?.reduce(
                    (sum, b) => sum + (b.total_price || 0),
                    0,
                  ) || 0
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {response?.data?.filter((b) => b.status === "confirmed")
                  .length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <DataTable
          columns={columns}
          data={response?.data || []}
          isLoading={isLoading}
          error={error?.message}
          pagination={{
            page,
            limit: 50,
            total: response?.total || 0,
            onPageChange: setPage,
          }}
          actions={actions}
        />
      </Card>

      {/* Info Panel */}
      <Card title="Booking Management Guide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Booking Workflow
            </h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>
                1. <strong>Pending:</strong> New booking awaiting confirmation
              </li>
              <li>
                2. <strong>Confirmed:</strong> Admin/host has approved the
                booking
              </li>
              <li>
                3. <strong>Completed:</strong> Experience/service has been
                delivered
              </li>
              <li>
                4. <strong>Cancelled:</strong> Booking was cancelled (full or
                partial refund)
              </li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Confirm bookings to notify customers</li>
              <li>✓ Mark as complete after service delivery</li>
              <li>✓ Cancel with reason for refund processing</li>
              <li>✓ Export booking reports for accounting</li>
              <li>✓ Send follow-up messages to customers</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
