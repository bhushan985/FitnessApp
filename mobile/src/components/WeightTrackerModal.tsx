import React, { useState } from 'react';
import { X, Scale, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWeightKg: number;
  targetWeightKg: number;
  changeKg: number;
  onUpdate: () => void;
}

export const WeightTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentWeightKg,
  targetWeightKg,
  changeKg,
  onUpdate,
}) => {
  const [weightInput, setWeightInput] = useState<string>(currentWeightKg.toString());
  const [noteInput, setNoteInput] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '3M' | '6M' | '1Y'>('30D');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;

    try {
      setLoading(true);
      await healthApi.logWeight(val, undefined, noteInput);
      setSuccessMsg('Weight logged successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
      onUpdate();
    } catch (err) {
      console.error('Weight log error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isGain = changeKg > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Weight Tracker</h3>
              <p className="text-xs text-slate-400">Track body weight & goal progress</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current & Target Summary Cards */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400 font-medium">Current</div>
            <div className="text-lg font-black text-white mt-0.5">{currentWeightKg} <span className="text-xs font-normal">kg</span></div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400 font-medium">Target</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{targetWeightKg} <span className="text-xs font-normal">kg</span></div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400 font-medium">Net Change</div>
            <div className={`text-base font-black flex items-center justify-center space-x-0.5 mt-0.5 ${isGain ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isGain ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(changeKg)} kg</span>
            </div>
          </div>
        </div>

        {/* Add Weight Form */}
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Log New Weight</h4>
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 68.5"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">Note (Optional)</label>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Morning fast"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            {loading ? 'Saving...' : 'Record Weight Log'}
          </button>

          {successMsg && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 justify-center mt-1">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* Timeframe Selector for History */}
        <div className="mt-5 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">History Trend</span>
            <div className="flex space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {(['7D', '30D', '3M', '6M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    timeframe === tf ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-16 flex items-center justify-center bg-slate-800/30 rounded-xl border border-slate-800/80 text-xs text-slate-500">
            Chart data for past {timeframe} active
          </div>
        </div>
      </div>
    </div>
  );
};
