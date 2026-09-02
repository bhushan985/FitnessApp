import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600/90 text-slate-950 px-4 py-2 flex items-center justify-between font-bold text-xs shadow-md border-b border-amber-500">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
        <span>Offline Mode — Changes will sync when internet connection returns.</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="p-1 rounded bg-amber-700/40 text-slate-950 hover:bg-amber-700/60"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
