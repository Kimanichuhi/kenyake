import { useState, useEffect, useCallback } from 'react';
import { get, set, del, keys } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';

export interface QueuedAction {
  id: string;
  type: 'booking' | 'message' | 'review' | 'invitation';
  table: string;
  data: Record<string, unknown>;
  createdAt: string;
}

const QUEUE_KEY = 'offline-action-queue';
const LOW_DATA_KEY = 'low-data-mode';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  // Load state from IDB
  useEffect(() => {
    get<QueuedAction[]>(QUEUE_KEY).then(q => setPendingActions(q || []));
    get<boolean>(LOW_DATA_KEY).then(v => setLowDataMode(v ?? false));
  }, []);

  // Listen for network changes
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Detect connection type
    const nav = navigator as any;
    if (nav.connection) {
      setConnectionType(nav.connection.effectiveType || 'unknown');
      const handleChange = () => {
        setConnectionType(nav.connection.effectiveType || 'unknown');
        // Auto low-data on 2g
        if (['slow-2g', '2g'].includes(nav.connection.effectiveType)) {
          setLowDataMode(true);
          set(LOW_DATA_KEY, true);
        }
      };
      nav.connection.addEventListener('change', handleChange);
      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
        nav.connection.removeEventListener('change', handleChange);
      };
    }

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncAll();
    }
  }, [isOnline]);

  const queueAction = useCallback(async (action: Omit<QueuedAction, 'id' | 'createdAt'>) => {
    const newAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...pendingActions, newAction];
    setPendingActions(updated);
    await set(QUEUE_KEY, updated);
    return newAction.id;
  }, [pendingActions]);

  const syncAll = useCallback(async () => {
    if (isSyncing || pendingActions.length === 0) return;
    setIsSyncing(true);

    const remaining: QueuedAction[] = [];

    for (const action of pendingActions) {
      try {
        const { error } = await supabase
          .from(action.table as any)
          .insert(action.data as any);

        if (error) {
          console.error('Sync failed for action:', action.id, error.message);
          remaining.push(action);
        }
      } catch {
        remaining.push(action);
      }
    }

    setPendingActions(remaining);
    await set(QUEUE_KEY, remaining);
    setIsSyncing(false);
  }, [pendingActions, isSyncing]);

  const clearQueue = useCallback(async () => {
    setPendingActions([]);
    await del(QUEUE_KEY);
  }, []);

  const toggleLowDataMode = useCallback(async (value: boolean) => {
    setLowDataMode(value);
    await set(LOW_DATA_KEY, value);
  }, []);

  return {
    isOnline,
    pendingActions,
    isSyncing,
    lowDataMode,
    connectionType,
    queueAction,
    syncAll,
    clearQueue,
    toggleLowDataMode,
  };
}
