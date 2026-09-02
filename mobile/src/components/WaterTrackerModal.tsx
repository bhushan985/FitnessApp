import React, { useState } from 'react';
import { X, Droplet, Plus, Minus, RotateCcw, Bell } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAmountMl: number;
  targetMl: number;
  glasses: number;
  targetGlasses: number;
  onUpdate: () => void;
}

export const WaterTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAmountMl,
  targetMl,
  glasses,
  targetGlasses,
  onUpdate,
}) => {
  const [glassSize, setGlassSize] = useState<number>(250);
  const [loading, setLoading] = useState<boolean>(false);
  const [remindersOn, setRemindersOn] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAction = async (action: 'add' | 'subtract' | 'reset') => {
    try {
      setLoading(true);
      await healthApi.logWater({
        amountMl: glassSize,
        glassSizeMl: glassSize,
        action,
      });
      onUpdate();
    } catch (err) {
      console.error('Water log error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min(100, Math.round((currentAmountMl / Math.max(1, targetMl)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Droplet className="w-6 h-6 fill-sky-400/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Water Tracker</h3>
              <p className="text-xs text-slate-400">Stay hydrated throughout your day</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Progress */}
        <div className="my-6 text-center">
          <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-slate-800/80 border-4 border-sky-500/30 p-2 shadow-inner">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-600 to-sky-400 opacity-30 rounded-b-full transition-all duration-500"
              style={{ height: `${pct}%` }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-3xl font-black text-white">{glasses}</span>
              <span className="text-xs text-sky-300 font-medium">of {targetGlasses} glasses</span>
              <span className="text-[10px] text-slate-400 mt-1">{currentAmountMl} / {targetMl} ml</span>
            </div>
          </div>
        </div>

        {/* Quick Increment Controls */}
        <div className="flex items-center justify-center space-x-6 my-4">
          <button
            onClick={() => handleAction('subtract')}
            disabled={loading || currentAmountMl <= 0}
            className="p-4 rounded-full bg-slate-800 border border-slate-700 text-sky-400 hover:bg-sky-500/20 hover:border-sky-400/50 disabled:opacity-40 transition"
          >
            <Minus className="w-6 h-6 stroke-[3]" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Glass Size</span>
            <div className="flex space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[250, 300, 500].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setGlassSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    glassSize === sz ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sz}ml
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleAction('add')}
            disabled={loading}
            className="p-4 rounded-full bg-sky-500 border border-sky-400 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Reminder Schedule Toggle */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Bell className="w-4 h-4 text-sky-400" />
            <span>Hydration Reminder (Every 60m)</span>
          </div>
          <button
            onClick={() => setRemindersOn(!remindersOn)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
              remindersOn ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                remindersOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleAction('reset')}
            disabled={loading}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset today's water</span>
          </button>
        </div>
      </div>
    </div>
  );
};
