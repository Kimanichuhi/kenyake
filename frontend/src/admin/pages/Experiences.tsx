import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import {
  useExperiences,
  useDeleteExperience,
  useFeatureExperience,
} from "../hooks/useAdmin";
import { Card, DataTable, Button, StatusBadge } from "../components/Common";
import type { Experience } from "../types";

export function ExperiencesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const {
    data: response,
    isLoading,
    error,
  } = useExperiences(page, 50, filters);
  const { mutate: deleteExperience } = useDeleteExperience();
  const { mutate: featureExperience } = useFeatureExperience();

  const handleDelete = (experience: Experience) => {
    if (confirm(`Are you sure you want to delete "${experience.title}"?`)) {
      deleteExperience(experience.id);
    }
  };

  const handleFeature = (experience: Experience) => {
    featureExperience(experience.id);
  };

  const columns = [
    {
      key: "title",
      label: "Experience Title",
      render: (value: string, row: Experience) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: "host_name",
      label: "Host",
    },
    {
      key: "price_display",
      label: "Price",
    },
    {
      key: "max_guests",
      label: "Capacity",
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{value.toFixed(1)}</span>
        </div>
      ),
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
  ];

  const actions = [
    {
      label: "Edit",
      onClick: (row: Experience) => navigate(`/admin/experiences/${row.id}`),
    },
    {
      label: "Delete",
      onClick: (row: Experience) => handleDelete(row),
      variant: "danger" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Experiences</h1>
          <p className="text-gray-600 mt-1">
            Manage tours, activities, and unique experiences
          </p>
        </div>
        <Button onClick={() => navigate("/admin/experiences/new")}>
          <Plus className="w-4 h-4" />
          Add Experience
        </Button>
      </div>

      {/* Filters */}
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="cultural">Cultural</option>
              <option value="food">Food</option>
              <option value="nature">Nature</option>
              <option value="adventure">Adventure</option>
              <option value="homestay">Homestay</option>
              <option value="photography">Photography</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  is_published: e.target.value === "published",
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured
            </label>
            <select
              value={filters.featured || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  is_featured: e.target.value === "true",
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Rating
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={filters.minRating || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minRating: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </Card>

      {/* Experiences Table */}
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
          onRowClick={(row) => navigate(`/admin/experiences/${row.id}`)}
          actions={actions}
        />
      </Card>

      {/* Info Panel */}
      <Card title="Experience Management Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              ✨ Best Practices
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Use compelling titles and descriptions</li>
              <li>• Include high-quality cover images</li>
              <li>• Set realistic pricing and duration</li>
              <li>• Specify capacity and skill level</li>
              <li>• Include what to bring/wear</li>
              <li>• List included amenities</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              📋 Experience Types
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                • <strong>Cultural:</strong> Traditional practices & stories
              </li>
              <li>
                • <strong>Food:</strong> Cooking & dining experiences
              </li>
              <li>
                • <strong>Nature:</strong> Wildlife & outdoor tours
              </li>
              <li>
                • <strong>Adventure:</strong> Active & thrilling activities
              </li>
              <li>
                • <strong>Homestay:</strong> Community accommodation
              </li>
              <li>
                • <strong>Photography:</strong> Guided photo tours
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
