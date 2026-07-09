import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, Loader2 } from "lucide-react";
import { useUploadMedia, MediaItem } from "../hooks/useMediaLibrary";

interface DropzoneProps {
  folder?: string;
  accept?: string;
  onUploaded: (item: MediaItem) => void;
  className?: string;
}

export function Dropzone({ folder, accept = "image/*", onUploaded, className }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMedia = useUploadMedia();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const item = await uploadMedia.mutateAsync({ file, folder });
      onUploaded(item);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
    >
      {uploadMedia.isPending ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Click to upload</span> or drag and drop
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
