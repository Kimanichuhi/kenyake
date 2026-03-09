import { useState, useCallback } from 'react';
import { get, set } from 'idb-keyval';

export interface MapRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  tileCount: number;
  sizeMB: number;
}

export const MAP_REGIONS: MapRegion[] = [
  { id: 'masai-mara', name: 'Masai Mara', lat: -1.4833, lng: 35.1333, zoom: 12, tileCount: 256, sizeMB: 15 },
  { id: 'amboseli', name: 'Amboseli', lat: -2.6527, lng: 37.2606, zoom: 12, tileCount: 256, sizeMB: 12 },
  { id: 'diani', name: 'Diani Coast', lat: -4.3477, lng: 39.5682, zoom: 13, tileCount: 196, sizeMB: 10 },
  { id: 'lamu', name: 'Lamu Island', lat: -2.2717, lng: 40.9020, zoom: 14, tileCount: 144, sizeMB: 8 },
  { id: 'nairobi', name: 'Nairobi', lat: -1.2921, lng: 36.8219, zoom: 13, tileCount: 324, sizeMB: 18 },
  { id: 'nakuru', name: 'Lake Nakuru', lat: -0.3031, lng: 36.0800, zoom: 12, tileCount: 196, sizeMB: 11 },
  { id: 'mount-kenya', name: 'Mount Kenya', lat: -0.1521, lng: 37.3084, zoom: 11, tileCount: 196, sizeMB: 14 },
  { id: 'tsavo', name: 'Tsavo', lat: -2.9833, lng: 38.4667, zoom: 11, tileCount: 324, sizeMB: 20 },
];

const DOWNLOADED_KEY = 'offline-maps-downloaded';

export function useOfflineMaps() {
  const [downloadedRegions, setDownloadedRegions] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Load downloaded regions
  const loadDownloaded = useCallback(async () => {
    const saved = await get<string[]>(DOWNLOADED_KEY);
    setDownloadedRegions(saved || []);
  }, []);

  const downloadRegion = useCallback(async (regionId: string) => {
    const region = MAP_REGIONS.find(r => r.id === regionId);
    if (!region) return;

    setDownloading(regionId);
    setProgress(0);

    // Cache tiles using Cache API
    const cache = await caches.open(`map-tiles-${regionId}`);
    const tileUrl = 'https://tile.openstreetmap.org';
    const z = region.zoom;
    const tilesPerSide = Math.ceil(Math.sqrt(region.tileCount));
    const centerTileX = Math.floor((region.lng + 180) / 360 * Math.pow(2, z));
    const centerTileY = Math.floor((1 - Math.log(Math.tan(region.lat * Math.PI / 180) + 1 / Math.cos(region.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

    let cached = 0;
    const halfSide = Math.floor(tilesPerSide / 2);

    for (let dx = -halfSide; dx <= halfSide; dx++) {
      for (let dy = -halfSide; dy <= halfSide; dy++) {
        const x = centerTileX + dx;
        const y = centerTileY + dy;
        const url = `${tileUrl}/${z}/${x}/${y}.png`;
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            await cache.put(url, resp);
          }
        } catch { /* skip failed tiles */ }
        cached++;
        setProgress(Math.round((cached / region.tileCount) * 100));
      }
    }

    const updated = [...downloadedRegions, regionId];
    setDownloadedRegions(updated);
    await set(DOWNLOADED_KEY, updated);
    setDownloading(null);
    setProgress(100);
  }, [downloadedRegions]);

  const deleteRegion = useCallback(async (regionId: string) => {
    await caches.delete(`map-tiles-${regionId}`);
    const updated = downloadedRegions.filter(r => r !== regionId);
    setDownloadedRegions(updated);
    await set(DOWNLOADED_KEY, updated);
  }, [downloadedRegions]);

  return {
    regions: MAP_REGIONS,
    downloadedRegions,
    downloading,
    progress,
    loadDownloaded,
    downloadRegion,
    deleteRegion,
  };
}
