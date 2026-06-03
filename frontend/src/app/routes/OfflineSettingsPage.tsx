import { useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useOfflineMaps, MAP_REGIONS } from '@/hooks/useOfflineMaps';
import { useDownloadPack } from '@/hooks/useDownloadPack';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Download, Trash2, Map, Package, WifiOff, Phone, Hash,
  HardDrive, RefreshCw, Signal
} from 'lucide-react';

const DESTINATION_PACKS = [
  { county: 'Narok', name: 'Masai Mara' },
  { county: 'Kajiado', name: 'Amboseli' },
  { county: 'Kwale', name: 'Diani Coast' },
  { county: 'Lamu', name: 'Lamu Island' },
  { county: 'Nakuru', name: 'Lake Nakuru' },
  { county: 'Nyeri', name: 'Mount Kenya' },
  { county: 'Mombasa', name: 'Mombasa City' },
  { county: 'Taita Taveta', name: 'Tsavo' },
];

export default function OfflineSettingsPage() {
  const {
    isOnline, pendingActions, isSyncing, lowDataMode, connectionType,
    syncAll, clearQueue, toggleLowDataMode
  } = useOfflineSync();

  const {
    regions, downloadedRegions, downloading, progress: mapProgress,
    loadDownloaded, downloadRegion, deleteRegion
  } = useOfflineMaps();

  const {
    downloadedPacks, isDownloading, downloadProgress,
    loadPacks, downloadPack, deletePack, emergencyContacts, ussdCodes
  } = useDownloadPack();

  useEffect(() => {
    loadDownloaded();
    loadPacks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Offline & Data Settings</h1>
          <p className="text-muted-foreground mt-1">Manage offline data, maps, and connectivity preferences</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Signal className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? `Online (${connectionType})` : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending sync actions</span>
              <span className="font-mono font-bold">{pendingActions.length}</span>
            </div>
            {pendingActions.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={syncAll} disabled={isSyncing || !isOnline}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing…' : 'Sync Now'}
                </Button>
                <Button size="sm" variant="outline" onClick={clearQueue}>
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Queue
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Data Mode</p>
                <p className="text-xs text-muted-foreground">Reduces image quality and disables auto-loading</p>
              </div>
              <Switch checked={lowDataMode} onCheckedChange={toggleLowDataMode} />
            </div>
          </CardContent>
        </Card>

        {/* Offline Maps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5" />
              Offline Maps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {regions.map(region => {
                const isDownloaded = downloadedRegions.includes(region.id);
                const isCurrentlyDownloading = downloading === region.id;
                return (
                  <div key={region.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{region.name}</p>
                      <p className="text-xs text-muted-foreground">~{region.sizeMB} MB · {region.tileCount} tiles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrentlyDownloading && (
                        <Progress value={mapProgress} className="w-20 h-2" />
                      )}
                      {isDownloaded ? (
                        <Button size="sm" variant="ghost" onClick={() => deleteRegion(region.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!downloading}
                          onClick={() => downloadRegion(region.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Destination Packs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Destination Download Packs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download guides, stays, food spots, and contacts for offline access
            </p>
            <div className="grid gap-3">
              {DESTINATION_PACKS.map(dest => {
                const pack = downloadedPacks.find(p => p.destinationId === dest.county.toLowerCase().replace(/\s/g, '-'));
                return (
                  <div key={dest.county} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{dest.name}</p>
                      {pack && (
                        <p className="text-xs text-muted-foreground">
                          {pack.sizeMB} MB · Downloaded {new Date(pack.downloadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {pack ? (
                      <Button size="sm" variant="ghost" onClick={() => deletePack(pack.destinationId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        onClick={() => downloadPack(dest.county, dest.name)}
                      >
                        {isDownloading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {isDownloading && <Progress value={downloadProgress} className="mt-3 h-2" />}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Emergency Contacts (Always Available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {emergencyContacts.map(c => (
                <div key={c.number} className="flex items-center justify-between p-2 rounded border border-border">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.category}</p>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="font-mono text-sm font-bold text-primary hover:underline"
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* USSD Codes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5" />
              USSD Fallback Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              For extreme low-connectivity — dial these codes on any phone
            </p>
            <div className="grid gap-2">
              {ussdCodes.map(u => (
                <div key={u.code + u.provider} className="flex items-center justify-between p-2 rounded border border-border">
                  <div>
                    <p className="text-sm font-medium">{u.description}</p>
                    <p className="text-xs text-muted-foreground">{u.provider}</p>
                  </div>
                  <a
                    href={`tel:${u.code}`}
                    className="font-mono text-sm font-bold text-primary"
                  >
                    {u.code}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Maps: {downloadedRegions.length} regions · Packs: {downloadedPacks.length} destinations
            </p>
          </CardContent>
        </Card>
      </main>
      <FooterSection />
    </div>
  );
}
