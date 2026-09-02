import React, { useState } from 'react';
import { X, Moon, Clock, Sunset, Sunrise, ShieldCheck, Check } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sleepHours: number;
  targetHours: number;
  bedtime: string;
  wakeTime: string;
  onUpdate: () => void;
}

export const SleepTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sleepHours,
  targetHours,
  bedtime,
  wakeTime,
  onUpdate,
}) => {
  const [hoursInput, setHoursInput] = useState<string>(sleepHours.toString() || '7.5');
  const [targetInput, setTargetInput] = useState<number>(targetHours || 8);
  const [bedtimeInput, setBedtimeInput] = useState<string>(bedtime || '23:30');
  const [wakeTimeInput, setWakeTimeInput] = useState<string>(wakeTime || '07:30');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(hoursInput);
    if (isNaN(hrs)) return;

    try {
      setLoading(true);
      await healthApi.logSleep({
        sleepHours: hrs,
        targetHours: targetInput,
        bedtime: bedtimeInput,
        wakeTime: wakeTimeInput,
      });
      setSuccessMsg('Sleep goals & log updated!');
      setTimeout(() => setSuccessMsg(''), 2500);
      onUpdate();
    } catch (err) {
      console.error('Sleep log error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentHrs = parseFloat(hoursInput) || 0;
  const isGoalMet = currentHrs >= targetInput;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Moon className="w-6 h-6 fill-indigo-400/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sleep Tracker</h3>
              <p className="text-xs text-slate-400">Welcome to NutriRegion Sleep Goal setup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Sleep & Goal Visual */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 my-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-indigo-300 font-medium uppercase tracking-wider block">Recorded Sleep</span>
            <div className="text-2xl font-black text-white mt-1">
              {currentHrs} <span className="text-sm font-normal text-slate-400">/ {targetInput} hours</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isGoalMet
                ? 'Your sleep duration met your target goal!'
                : `Your sleep duration was ${Math.round((targetInput - currentHrs) * 10) / 10}h below your target.`}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Hours Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Sleep Goal (Recommended 7-9h)</span>
              <span className="text-indigo-400 font-bold">{targetInput} Hours</span>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="0.5"
              value={targetInput}
              onChange={(e) => setTargetInput(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Schedule: Bedtime & Wake Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-amber-300 mb-1 font-medium">
                <Sunset className="w-4 h-4 text-amber-400" />
                <span>Regular Bedtime</span>
              </div>
              <input
                type="time"
                value={bedtimeInput}
                onChange={(e) => setBedtimeInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-300 mb-1 font-medium">
                <Sunrise className="w-4 h-4 text-emerald-400" />
                <span>Regular Wake Time</span>
              </div>
              <input
                type="time"
                value={wakeTimeInput}
                onChange={(e) => setWakeTimeInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Hours Slept Input */}
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">Hours Slept Today</label>
            <input
              type="number"
              step="0.1"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 7.5"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            {loading ? 'Saving...' : 'Save Sleep Configuration'}
          </button>

          {successMsg && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 justify-center mt-1">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* Non-Diagnostic Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start space-x-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>NutriRegion Sleep Tracker provides wellness guidance and sleep duration tracking. It is not intended for clinical sleep diagnosis.</span>
        </div>
      </div>
    </div>
  );
};
