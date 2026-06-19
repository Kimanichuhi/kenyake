import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import {
  useCommunities,
  useDeleteCommunity,
  usePublishCommunity,
} from "../hooks/useAdmin";
import { Card, DataTable, Button, StatusBadge } from "../components/Common";
import type { Community } from "../types";

export function CommunitiesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useCommunities(page);
  const { mutate: deleteCommunity, isPending: isDeleting } =
    useDeleteCommunity();
  const { mutate: publishCommunity, isPending: isPublishing } =
    usePublishCommunity();

  const handleDelete = (community: Community) => {
    if (confirm(`Are you sure you want to delete "${community.name}"?`)) {
      deleteCommunity(community.id);
    }
  };

  const handlePublish = (community: Community) => {
    publishCommunity(community.id);
  };

  const columns = [
    {
      key: "name",
      label: "Community Name",
      render: (value: string, row: Community) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.county}</p>
        </div>
      ),
    },
    {
      key: "county",
      label: "County",
    },
    {
      key: "population",
      label: "Population",
      render: (value: number | undefined) =>
        value ? value.toLocaleString() : "N/A",
    },
    {
      key: "is_published",
      label: "Status",
      render: (value: boolean) => (
        <StatusBadge
          status={value ? "Published" : "Draft"}
          variant={value ? "success" : "warning"}
        />
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: (row: Community) => navigate(`/admin/communities/${row.id}`),
    },
    {
      label: "Delete",
      onClick: (row: Community) => handleDelete(row),
      variant: "danger" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-600 mt-1">
            Manage community profiles and content
          </p>
        </div>
        <Button onClick={() => navigate("/admin/communities/new")}>
          <Plus className="w-4 h-4" />
          Add Community
        </Button>
      </div>

      {/* Communities Table */}
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
          onRowClick={(row) => navigate(`/admin/communities/${row.id}`)}
          actions={actions}
        />
      </Card>

      {/* Info Panel */}
      <Card title="About Community Management">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What You Can Do
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Create and update community profiles</li>
              <li>✓ Manage cultural content and media</li>
              <li>✓ Set visitor guidelines and capacity</li>
              <li>✓ Publish/unpublish communities</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Community Content
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Cultural practices</li>
              <li>✓ Traditional phrases</li>
              <li>✓ Sacred sites info</li>
              <li>✓ Oral histories</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Use high-quality images</li>
              <li>✓ Write detailed descriptions</li>
              <li>✓ Include visitor guidelines</li>
              <li>✓ Verify all information</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
