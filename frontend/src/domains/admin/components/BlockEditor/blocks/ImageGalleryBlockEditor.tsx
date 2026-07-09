import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MediaGalleryField } from "../../MediaPicker";
import { ImageGalleryBlock } from "../../../types/block";

export const ImageGalleryBlockEditor = ({
  value,
  onChange,
}: {
  value: ImageGalleryBlock;
  onChange: (v: ImageGalleryBlock) => void;
}) => (
  <div className="space-y-3">
    <MediaGalleryField
      value={value.images.map((img) => img.url)}
      onChange={(urls) => onChange({ ...value, images: urls.map((url, i) => ({ url, caption: value.images[i]?.caption })) })}
    />
    {value.images.map((img, i) => (
      <div key={img.url + i} className="flex items-center gap-2">
        <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
        <Input
          placeholder="Caption (optional)"
          value={img.caption ?? ""}
          onChange={(e) => {
            const images = [...value.images];
            images[i] = { ...images[i], caption: e.target.value };
            onChange({ ...value, images });
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange({ ...value, images: value.images.filter((_, idx) => idx !== i) })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </div>
);
