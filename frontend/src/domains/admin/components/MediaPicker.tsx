import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Search, X } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { useMediaLibraryList, MediaItem } from "../hooks/useMediaLibrary";

interface MediaPickerFieldProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}

const MediaGrid = ({ onSelect }: { onSelect: (item: MediaItem) => void }) => {
  const [search, setSearch] = useState("");
  const { data: items, isLoading } = useMediaLibraryList(search);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid max-h-80 grid-cols-4 gap-2 overflow-y-auto">
        {isLoading && <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && items?.length === 0 && (
          <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">No media found.</p>
        )}
        {items?.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="group relative aspect-square overflow-hidden rounded-md border border-border hover:ring-2 hover:ring-primary"
          >
            {item.mime_type.startsWith("image/") ? (
              <img src={item.public_url} alt={item.alt_text ?? item.file_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MediaPickerField = ({ value, onChange, label = "Choose image" }: MediaPickerFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-md border border-border">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onChange(undefined)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="mr-1.5 h-4 w-4" /> {value ? "Change image" : label}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select media</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library">
            <TabsList>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload new</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="pt-3">
              <MediaGrid
                onSelect={(item) => {
                  onChange(item.public_url);
                  setOpen(false);
                }}
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-3">
              <Dropzone
                onUploaded={(item) => {
                  onChange(item.public_url);
                  setOpen(false);
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MediaGalleryFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export const MediaGalleryField = ({ value, onChange }: MediaGalleryFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-0.5 top-0.5 h-5 w-5"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="mr-1.5 h-4 w-4" /> Add images
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add to gallery</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library">
            <TabsList>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload new</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="pt-3">
              <MediaGrid onSelect={(item) => onChange([...value, item.public_url])} />
            </TabsContent>
            <TabsContent value="upload" className="pt-3">
              <Dropzone onUploaded={(item) => onChange([...value, item.public_url])} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
