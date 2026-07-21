import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDestinations } from "@/hooks/useDestinations";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const safariIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background: linear-gradient(135deg, hsl(145,35%,28%), hsl(38,55%,55%)); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const DestinationMap = () => {
  // Kenya center
  const center: [number, number] = [-0.5, 37.8];
  const { data: destinations = [] } = useDestinations();

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {destinations.map((dest) => (
          <Marker key={dest.id} position={[dest.lat, dest.lng]} icon={safariIcon}>
            <Popup>
              <div className="min-w-[200px] font-body">
                <img src={dest.image} alt={dest.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                <h3 className="font-display font-semibold text-sm">{dest.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {dest.county}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-savannah-gold fill-current" /> {dest.rating}
                  </span>
                  <span className="text-xs font-semibold text-sunset-orange">{dest.price}</span>
                </div>
                <Link
                  to={`/destinations/${dest.id}`}
                  className="block mt-2 text-center text-xs font-medium text-primary-foreground gradient-safari rounded-full px-3 py-1.5"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DestinationMap;
