import React from 'react';
import { MapPin, X, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';
import { Region } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  newRegion: Region | null;
  onConfirmRegenerate: () => void;
  onKeepCurrentPlan: () => void;
}

export const RegionChangePromptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  newRegion,
  onConfirmRegenerate,
  onKeepCurrentPlan,
}) => {
  if (!isOpen || !newRegion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-white relative">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                Movement Detected
              </span>
              <h3 className="text-base font-extrabold text-white">📍 New Region Detected</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
          <p className="text-xs text-slate-300">
            You're currently in <strong className="text-white">{newRegion.city}, {newRegion.state}</strong>.
          </p>
          <p className="text-xs text-slate-400">
            We found foods & seasonal recipes commonly available in {newRegion.city}. Would you like us to regenerate your meal plan using your new region?
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onConfirmRegenerate();
              onClose();
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Regenerate Meal Plan</span>
          </button>

          <button
            onClick={() => {
              onKeepCurrentPlan();
              onClose();
            }}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold py-3 px-4 rounded-2xl text-xs transition-all"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
};
