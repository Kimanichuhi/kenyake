import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ImageIcon, Trash2, FileText } from "lucide-react";
import { Dropzone } from "../../components/Dropzone";
import { useMediaLibraryList, useUpdateMedia, useDeleteMedia, MediaItem } from "../../hooks/useMediaLibrary";
import { formatDistanceToNow } from "date-fns";

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MediaDetailDialog = ({ item, onClose }: { item: MediaItem; onClose: () => void }) => {
  const [altText, setAltText] = useState(item.alt_text ?? "");
  const [caption, setCaption] = useState(item.caption ?? "");
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate">{item.file_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {item.mime_type.startsWith("image/") ? (
            <img src={item.public_url} alt={item.alt_text ?? ""} className="max-h-64 w-full rounded-md object-contain bg-muted" />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <span>{item.mime_type}</span>
            <span>{formatBytes(item.size_bytes)}</span>
            {item.width && item.height && <span>{item.width}×{item.height}px</span>}
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Alt text</label>
            <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe this image..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Caption</label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption..." />
          </div>
          <div className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteMedia.mutate(item);
                onClose();
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
            <Button
              size="sm"
              onClick={() => {
                updateMedia.mutate({ id: item.id, values: { alt_text: altText, caption } });
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MediaLibraryPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const { data: items, isLoading } = useMediaLibraryList(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Media Library</h1>
        <p className="text-sm text-muted-foreground">Images, videos and documents used across the site.</p>
      </div>

      <Dropzone onUploaded={() => {}} className="max-w-md" />

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search files..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items?.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative aspect-square overflow-hidden rounded-md border border-border hover:ring-2 hover:ring-primary"
            >
              {item.mime_type.startsWith("image/") ? (
                <img src={item.public_url} alt={item.alt_text ?? item.file_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-background/80 px-1.5 py-1 text-[10px] text-foreground">
                {item.file_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && <MediaDetailDialog item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MediaLibraryPage;
