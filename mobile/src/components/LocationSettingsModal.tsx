import React, { useState } from 'react';
import { MapPin, X, Navigation, RefreshCw, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { profileApi } from '../services/api';
import { UserProfile, Region } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile, isRegionChanged: boolean, newRegion: Region) => void;
  onOpenManualRegionPicker: () => void;
}

export const LocationSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onOpenManualRegionPicker,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRegion = profile?.regionId;
  const locationSource = profile?.location?.source || 'gps';
  const lastUpdated = profile?.locationUpdatedAt || profile?.updatedAt
    ? new Date(profile.locationUpdatedAt || profile.updatedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  const handleRefreshLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your device or browser.');
      return;
    }

    setRefreshing(true);
    setStatusMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const res = await profileApi.updateLocation({
            latitude,
            longitude,
            accuracy: Math.round(accuracy || 25),
            permissionStatus: 'granted',
            source: 'gps',
          });

          if (res.success && res.data) {
            const isChanged = Boolean(res.data.isRegionChanged);
            setStatusMessage(`📍 Location synced! Matched region: ${res.data.detectedCity}, ${res.data.detectedState}`);
            onProfileUpdated(res.data.profile, isChanged, res.data.matchedRegion);
          }
        } catch (err: any) {
          console.error('Refresh location error:', err);
          setStatusMessage(err?.response?.data?.message || 'Unable to sync GPS location with backend.');
        } finally {
          setRefreshing(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setRefreshing(false);
        setStatusMessage('Location permission denied or GPS services unavailable.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-5 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Location Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Region Card */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Current Region</span>
            <span className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>GPS Status: Active</span>
            </span>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-emerald-500/20 mt-0.5">
              <MapPin className="w-5 h-5 fill-slate-950 stroke-none" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">
                {currentRegion?.city || 'Pune'}, {currentRegion?.state || 'Maharashtra'}
              </h4>
              <p className="text-xs text-slate-400">{currentRegion?.country || 'India'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Location Source</span>
              <span className="font-bold text-emerald-300 capitalize">{locationSource.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Last Synced</span>
              <span className="font-bold text-slate-200">{lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div className="bg-slate-800 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleRefreshLocation}
            disabled={refreshing}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm transition-all active:scale-[0.98]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing GPS Location...' : 'Refresh Location'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenManualRegionPicker();
            }}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 text-sm transition-all"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Change Region Manually</span>
          </button>
        </div>
      </div>
    </div>
  );
};
