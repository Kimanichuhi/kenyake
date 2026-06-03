import { useState, useCallback } from 'react';
import { get, set, del } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';

export interface DownloadPack {
  destinationId: string;
  name: string;
  downloadedAt: string;
  sizeMB: number;
  data: {
    experiences: any[];
    accommodations: any[];
    guides: any[];
    foodListings: any[];
    emergencyContacts: EmergencyContact[];
    ussdCodes: UssdCode[];
  };
}

export interface EmergencyContact {
  name: string;
  number: string;
  category: string;
}

export interface UssdCode {
  provider: string;
  code: string;
  description: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Kenya Police', number: '999', category: 'police' },
  { name: 'Emergency (toll-free)', number: '112', category: 'emergency' },
  { name: 'KWS Emergency', number: '+254-800-597-000', category: 'wildlife' },
  { name: 'Ambulance (AMREF)', number: '+254-20-699-2000', category: 'medical' },
  { name: 'Red Cross Kenya', number: '1199', category: 'medical' },
  { name: 'Fire Department', number: '999', category: 'fire' },
  { name: 'Tourism Police Unit', number: '+254-800-225-588', category: 'tourist' },
];

const USSD_CODES: UssdCode[] = [
  { provider: 'Safaricom', code: '*100#', description: 'Check airtime balance' },
  { provider: 'Safaricom', code: '*544#', description: 'Buy data bundles' },
  { provider: 'Safaricom', code: '*234#', description: 'M-PESA menu' },
  { provider: 'Airtel', code: '*131#', description: 'Check balance' },
  { provider: 'Airtel', code: '*100#', description: 'Airtel Money' },
  { provider: 'Telkom', code: '*130#', description: 'Check balance' },
  { provider: 'Emergency', code: '112', description: 'Universal emergency' },
];

const PACK_PREFIX = 'download-pack-';

export function useDownloadPack() {
  const [downloadedPacks, setDownloadedPacks] = useState<DownloadPack[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const loadPacks = useCallback(async () => {
    const allKeys = await import('idb-keyval').then(m => m.keys());
    const packKeys = (allKeys as string[]).filter(k => typeof k === 'string' && k.startsWith(PACK_PREFIX));
    const packs: DownloadPack[] = [];
    for (const key of packKeys) {
      const pack = await get<DownloadPack>(key);
      if (pack) packs.push(pack);
    }
    setDownloadedPacks(packs);
  }, []);

  const downloadPack = useCallback(async (county: string, destinationName: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Fetch experiences for county
      setDownloadProgress(20);
      const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('county', county)
        .eq('is_published', true)
        .limit(50);

      setDownloadProgress(40);
      const { data: accommodations } = await supabase
        .from('accommodations')
        .select('*')
        .eq('county', county)
        .eq('is_published', true)
        .limit(50);

      setDownloadProgress(60);
      const { data: guides } = await supabase
        .from('guides')
        .select('*')
        .eq('county', county)
        .eq('is_published', true)
        .limit(30);

      setDownloadProgress(80);
      const { data: foodListings } = await supabase
        .from('food_listings')
        .select('*')
        .eq('county', county)
        .eq('is_published', true)
        .limit(50);

      const pack: DownloadPack = {
        destinationId: county.toLowerCase().replace(/\s/g, '-'),
        name: destinationName,
        downloadedAt: new Date().toISOString(),
        sizeMB: Math.round(
          JSON.stringify({ experiences, accommodations, guides, foodListings }).length / 1024 / 1024 * 100
        ) / 100,
        data: {
          experiences: experiences || [],
          accommodations: accommodations || [],
          guides: guides || [],
          foodListings: foodListings || [],
          emergencyContacts: EMERGENCY_CONTACTS,
          ussdCodes: USSD_CODES,
        },
      };

      await set(`${PACK_PREFIX}${pack.destinationId}`, pack);
      setDownloadProgress(100);
      setDownloadedPacks(prev => [...prev.filter(p => p.destinationId !== pack.destinationId), pack]);
    } catch (err) {
      console.error('Download pack failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const deletePack = useCallback(async (destinationId: string) => {
    await del(`${PACK_PREFIX}${destinationId}`);
    setDownloadedPacks(prev => prev.filter(p => p.destinationId !== destinationId));
  }, []);

  const getPack = useCallback(async (destinationId: string): Promise<DownloadPack | null> => {
    return (await get<DownloadPack>(`${PACK_PREFIX}${destinationId}`)) || null;
  }, []);

  return {
    downloadedPacks,
    isDownloading,
    downloadProgress,
    loadPacks,
    downloadPack,
    deletePack,
    getPack,
    emergencyContacts: EMERGENCY_CONTACTS,
    ussdCodes: USSD_CODES,
  };
}
