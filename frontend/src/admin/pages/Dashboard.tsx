import { useDashboardMetrics } from "../hooks/useAdmin";
import { Card, StatsGrid, DataTable, StatusBadge } from "../components/Common";
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  MessageCircle,
  Loader,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export function AdminDashboard() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-800">
          Failed to load dashboard metrics
        </span>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Bookings",
      value: metrics?.totalBookings || 0,
      icon: <BarChart3 className="w-8 h-8" />,
      change: "+12% from last month",
    },
    {
      label: "Total Revenue",
      value: `KES ${(metrics?.totalRevenue || 0).toLocaleString()}`,
      icon: <TrendingUp className="w-8 h-8" />,
      change: "+8% from last month",
    },
    {
      label: "Active Users",
      value: metrics?.totalUsers || 0,
      icon: <Users className="w-8 h-8" />,
      change: "+15% from last month",
    },
    {
      label: "Active Listings",
      value: metrics?.activeListings || 0,
      icon: <MapPin className="w-8 h-8" />,
      change: "Well maintained",
    },
  ];

  const contentStats = [
    {
      label: "Communities",
      value: metrics?.communityCount || 0,
      icon: <MapPin className="w-8 h-8" />,
    },
    {
      label: "Experiences",
      value: metrics?.experienceCount || 0,
      icon: <Calendar className="w-8 h-8" />,
    },
    {
      label: "Guides",
      value: metrics?.guideCount || 0,
      icon: <Users className="w-8 h-8" />,
    },
    {
      label: "Average Rating",
      value: `${(metrics?.averageRating || 0).toFixed(1)}/5.0`,
      icon: <MessageCircle className="w-8 h-8" />,
    },
  ];

  const activityColumns = [
    { key: "action", label: "Action" },
    { key: "table_name", label: "Entity" },
    {
      key: "record_id",
      label: "Record ID",
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value.slice(0, 8)}...
        </code>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: string) => formatDate(new Date(value)),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to SafariSync Admin Panel</p>
      </div>

      {/* Key Metrics */}
      <StatsGrid stats={stats} />

      {/* Content Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Content Overview
        </h2>
        <StatsGrid stats={contentStats} />
      </div>

      {/* Pending Actions */}
      {metrics?.pendingApprovals && metrics.pendingApprovals > 0 && (
        <Card title="⚠️ Action Required">
          <div className="space-y-3">
            <p className="text-gray-700">
              You have <strong>{metrics.pendingApprovals}</strong> items pending
              approval.
            </p>
            <div className="flex gap-3">
              <a
                href="/admin/communities"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Review Communities
              </a>
              <a
                href="/admin/experiences"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Review Experiences
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card
        title="Recent Activity"
        subtitle="Latest changes across the platform"
      >
        <DataTable
          columns={activityColumns}
          data={metrics?.recentActivity || []}
          isLoading={isLoading}
        />
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/communities/new"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-900">Add Community</p>
          </a>
          <a
            href="/admin/experiences/new"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-gray-900">Add Experience</p>
          </a>
          <a
            href="/admin/guides"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium text-gray-900">Manage Guides</p>
          </a>
          <a
            href="/admin/bookings"
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-sm font-medium text-gray-900">View Bookings</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
