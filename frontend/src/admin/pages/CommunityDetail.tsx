import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import {
  useCommunity,
  useUpdateCommunity,
  useUploadHeroImage,
  useCommunityContent,
  useCreateCommunityContent,
  useDeleteCommunityContent,
  useUploadCommunityMedia,
} from "../hooks/useAdmin";
import {
  Card,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  Button,
} from "../components/Common";
import type { Community, CommunityContent } from "../types";

export function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: community, isLoading } = useCommunity(id || "");
  const { mutate: updateCommunity, isPending: isUpdating } =
    useUpdateCommunity();
  const { mutate: uploadHero } = useUploadHeroImage();
  const { data: contentList } = useCommunityContent(id || "");
  const { mutate: createContent, isPending: isCreatingContent } =
    useCreateCommunityContent();
  const { mutate: uploadMedia } = useUploadCommunityMedia();
  const { mutate: deleteContent } = useDeleteCommunityContent();

  const [formData, setFormData] = useState<Partial<Community>>(
    community || {
      name: "",
      slug: "",
      county: "",
      region: "",
      description: "",
      origin_story: "",
      history: "",
      population: undefined,
      leader_name: "",
      leader_title: "",
      contact_email: "",
      contact_phone: "",
      max_daily_visitors: 20,
      is_published: false,
    },
  );

  const [newContent, setNewContent] = useState<Partial<CommunityContent>>({
    content_type: "cultural_practice",
    title: "",
    body: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFieldChange = (field: keyof Community, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.county) {
      alert("Please fill in all required fields");
      return;
    }

    if (isNew) {
      // Create new community
      createContent({
        communityId: "new",
        data: formData as Partial<CommunityContent>,
      });
    } else if (id) {
      updateCommunity({ id, data: formData });
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      uploadHero({ id, file }, {
        onSuccess: (data) => {
          handleFieldChange("hero_image", data.url);
        },
      } as any);
    }
  };

  const handleAddContent = () => {
    if (!newContent.title || !newContent.body) {
      alert("Please fill in title and content");
      return;
    }
    if (id) {
      createContent({ communityId: id, data: newContent }, {
        onSuccess: () => {
          setNewContent({
            content_type: "cultural_practice",
            title: "",
            body: "",
          });
        },
      } as any);
    }
  };

  if (isLoading && !isNew) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/communities")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? "Add Community" : formData.name || "Community"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew
              ? "Create a new community profile"
              : "Edit community details"}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <Card title="Basic Information">
        <div className="space-y-6">
          {/* Hero Image */}
          <FormGroup label="Hero Image">
            {formData.hero_image && (
              <div className="mb-4">
                <img
                  src={formData.hero_image}
                  alt="Hero"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload hero image
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                className="hidden"
              />
            </label>
          </FormGroup>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Community Name" required>
              <TextInput
                value={formData.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g., Maasai Mara Community"
              />
            </FormGroup>

            <FormGroup label="Slug" required>
              <TextInput
                value={formData.slug || ""}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                placeholder="e.g., maasai-mara"
              />
            </FormGroup>

            <FormGroup label="County" required>
              <TextInput
                value={formData.county || ""}
                onChange={(e) => handleFieldChange("county", e.target.value)}
                placeholder="e.g., Narok"
              />
            </FormGroup>

            <FormGroup label="Region">
              <TextInput
                value={formData.region || ""}
                onChange={(e) => handleFieldChange("region", e.target.value)}
                placeholder="e.g., Rift Valley"
              />
            </FormGroup>

            <FormGroup label="Population">
              <TextInput
                type="number"
                value={formData.population || ""}
                onChange={(e) =>
                  handleFieldChange("population", parseInt(e.target.value))
                }
              />
            </FormGroup>

            <FormGroup label="Max Daily Visitors">
              <TextInput
                type="number"
                value={formData.max_daily_visitors || 20}
                onChange={(e) =>
                  handleFieldChange(
                    "max_daily_visitors",
                    parseInt(e.target.value),
                  )
                }
              />
            </FormGroup>
          </div>

          {/* Text Fields */}
          <FormGroup label="Description">
            <TextArea
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Describe the community..."
              rows={3}
            />
          </FormGroup>

          <FormGroup label="Origin Story">
            <TextArea
              value={formData.origin_story || ""}
              onChange={(e) =>
                handleFieldChange("origin_story", e.target.value)
              }
              placeholder="Tell the community's origin story..."
              rows={3}
            />
          </FormGroup>

          <FormGroup label="History">
            <TextArea
              value={formData.history || ""}
              onChange={(e) => handleFieldChange("history", e.target.value)}
              placeholder="Describe the community's history..."
              rows={3}
            />
          </FormGroup>

          <FormGroup label="Visitor Guidelines">
            <TextArea
              value={formData.visitor_guidelines || ""}
              onChange={(e) =>
                handleFieldChange("visitor_guidelines", e.target.value)
              }
              placeholder="Guidelines for visitors..."
              rows={3}
            />
          </FormGroup>

          {/* Leadership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <FormGroup label="Leader Name">
              <TextInput
                value={formData.leader_name || ""}
                onChange={(e) =>
                  handleFieldChange("leader_name", e.target.value)
                }
              />
            </FormGroup>

            <FormGroup label="Leader Title">
              <TextInput
                value={formData.leader_title || ""}
                onChange={(e) =>
                  handleFieldChange("leader_title", e.target.value)
                }
              />
            </FormGroup>

            <FormGroup label="Contact Email">
              <TextInput
                type="email"
                value={formData.contact_email || ""}
                onChange={(e) =>
                  handleFieldChange("contact_email", e.target.value)
                }
              />
            </FormGroup>

            <FormGroup label="Contact Phone">
              <TextInput
                value={formData.contact_phone || ""}
                onChange={(e) =>
                  handleFieldChange("contact_phone", e.target.value)
                }
              />
            </FormGroup>
          </div>

          {/* Publish Status */}
          <div className="pt-6 border-t border-gray-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_published || false}
                onChange={(e) =>
                  handleFieldChange("is_published", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-900">
                Publish this community (make it visible to users)
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <Button onClick={handleSave} loading={isUpdating} size="lg">
              Save Community
            </Button>
          </div>
        </div>
      </Card>

      {/* Community Content */}
      {!isNew && (
        <Card
          title="Community Content"
          subtitle="Cultural practices, stories, and information"
        >
          <div className="space-y-6">
            {/* Add New Content */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900">Add New Content</h3>

              <Select
                value={newContent.content_type || ""}
                onChange={(e) =>
                  setNewContent((prev) => ({
                    ...prev,
                    content_type: e.target.value as any,
                  }))
                }
              >
                <option value="cultural_practice">Cultural Practice</option>
                <option value="phrase">Phrase</option>
                <option value="sacred_site">Sacred Site</option>
                <option value="dos_donts">Dos & Donts</option>
                <option value="oral_history">Oral History</option>
                <option value="tradition">Tradition</option>
                <option value="ecological_knowledge">
                  Ecological Knowledge
                </option>
              </Select>

              <TextInput
                placeholder="Content Title"
                value={newContent.title || ""}
                onChange={(e) =>
                  setNewContent((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              <TextArea
                placeholder="Content Body"
                value={newContent.body || ""}
                onChange={(e) =>
                  setNewContent((prev) => ({ ...prev, body: e.target.value }))
                }
              />

              <Button onClick={handleAddContent} loading={isCreatingContent}>
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </div>

            {/* Existing Content */}
            {contentList && contentList.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Existing Content
                </h3>
                {contentList.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {content.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {content.content_type}
                      </p>
                      {content.body && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {content.body}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        id &&
                        deleteContent(
                          { communityId: id, contentId: content.id },
                          {
                            onSuccess: () => console.log("Content deleted"),
                          } as any,
                        )
                      }
                      className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
