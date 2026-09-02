import React, { useState } from 'react';
import { X, Footprints, Flame, MapPin, Clock, Smartphone, RefreshCw, Check } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  steps: number;
  target: number;
  distanceKm: number;
  caloriesBurned: number;
  activeMinutes: number;
  appleHealthConnected: boolean;
  healthConnectConnected: boolean;
  onUpdate: () => void;
}

export const StepsTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  steps,
  target,
  distanceKm,
  caloriesBurned,
  activeMinutes,
  appleHealthConnected,
  healthConnectConnected,
  onUpdate,
}) => {
  const [manualSteps, setManualSteps] = useState<string>(steps.toString());
  const [syncing, setSyncing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const isConnected = appleHealthConnected || healthConnectConnected;
  const pct = Math.min(100, Math.round((steps / Math.max(1, target)) * 100));

  const handleSyncData = async (source: 'apple_health' | 'health_connect' | 'manual') => {
    try {
      setSyncing(true);
      const val = parseInt(manualSteps) || steps;
      await healthApi.syncHealthData({
        steps: val,
        source,
      });
      setSuccessMsg('Health data synchronized successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
      onUpdate();
    } catch (err) {
      console.error('Step sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Steps & Activity</h3>
              <p className="text-xs text-slate-400">Track daily steps, distance & active time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Ring Visual */}
        <div className="my-6 text-center">
          <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-slate-800/80 border-4 border-purple-500/30 p-2 shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-4 border-purple-500 transition-all duration-500"
              style={{ clipPath: `polygon(0 0, 100% 0, 100% ${pct}%, 0 ${pct}%)` }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-2xl font-black text-white">{steps.toLocaleString()}</span>
              <span className="text-xs text-purple-300 font-medium">/ {target.toLocaleString()} steps</span>
              <span className="text-[10px] text-slate-400 mt-1">{pct}% of goal</span>
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl text-center">
            <MapPin className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">{distanceKm} km</div>
            <div className="text-[10px] text-slate-400">Distance</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl text-center">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">{caloriesBurned} kcal</div>
            <div className="text-[10px] text-slate-400">Calories</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl text-center">
            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">{activeMinutes} min</div>
            <div className="text-[10px] text-slate-400">Active Time</div>
          </div>
        </div>

        {/* Health Integration Status & Sync */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="bg-purple-950/40 border border-purple-500/20 p-3.5 rounded-2xl flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-white">
                  {isConnected ? 'Health Sync Active' : 'Connect Health Data'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isConnected ? 'Syncing steps via platform API' : 'Sync steps from Apple Health or Health Connect'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSyncData(appleHealthConnected ? 'apple_health' : 'health_connect')}
              disabled={syncing}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>

          {/* Manual Step Log Input */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={manualSteps}
              onChange={(e) => setManualSteps(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              placeholder="Or log steps manually..."
            />
            <button
              onClick={() => handleSyncData('manual')}
              disabled={syncing}
              className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-purple-300 text-xs font-bold rounded-xl transition"
            >
              Save Manual
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center space-x-1 text-xs text-emerald-400 justify-center mt-2">
              <Check className="w-3.5 h-3.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
