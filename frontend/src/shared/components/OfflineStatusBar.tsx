import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function OfflineStatusBar() {
  const { isOnline, pendingActions, isSyncing, syncAll, connectionType, lowDataMode } = useOfflineSync();

  // Don't show bar when online with no pending actions
  if (isOnline && pendingActions.length === 0 && !lowDataMode) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-between text-sm ${
      isOnline ? 'bg-secondary/90 text-secondary-foreground' : 'bg-destructive/90 text-destructive-foreground'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="font-medium">
          {isOnline ? (lowDataMode ? 'Low Data Mode' : `Online (${connectionType})`) : 'Offline'}
        </span>
        {pendingActions.length > 0 && (
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {pendingActions.length} pending
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {pendingActions.length > 0 && isOnline && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={syncAll}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        )}
        <Link to="/offline-settings" className="text-xs underline opacity-80 hover:opacity-100">
          Settings
        </Link>
      </div>
    </div>
  );
}
