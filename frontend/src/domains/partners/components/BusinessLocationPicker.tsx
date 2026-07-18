import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// Fix default marker icons (same fix DestinationMap.tsx uses)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const KENYA_CENTER: [number, number] = [-0.5, 37.8];

interface BusinessLocationPickerProps {
  lat: number | undefined;
  lng: number | undefined;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onChange(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export function BusinessLocationPicker({ lat, lng, onChange }: BusinessLocationPickerProps) {
  const hasPin = typeof lat === "number" && typeof lng === "number";
  const center: [number, number] = hasPin ? [lat, lng] : KENYA_CENTER;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-border">
        <MapContainer center={center} zoom={hasPin ? 13 : 6} scrollWheelZoom style={{ height: "320px", width: "100%" }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {hasPin && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {hasPin ? `Pinned at ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Click the map to drop a pin at your business location"}
      </p>
    </div>
  );
}
