import React, { useState, useEffect } from 'react';
import { X, Settings, Check, Bell, Flame, Droplet, Footprints, Moon } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const TrackerSettingsModal: React.FC<Props> = ({ isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [waterTargetMl, setWaterTargetMl] = useState<number>(2000);
  const [waterGlassSizeMl, setWaterGlassSizeMl] = useState<number>(250);
  const [stepTarget, setStepTarget] = useState<number>(8000);
  const [sleepTargetHours, setSleepTargetHours] = useState<number>(8);
  const [bedtime, setBedtime] = useState<string>('23:30');
  const [wakeTime, setWakeTime] = useState<string>('07:30');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await healthApi.getSettings();
      if (res.success && res.data) {
        setWaterTargetMl(res.data.waterTargetMl || 2000);
        setWaterGlassSizeMl(res.data.waterGlassSizeMl || 250);
        setStepTarget(res.data.stepTarget || 8000);
        setSleepTargetHours(res.data.sleepTargetHours || 8);
        setBedtime(res.data.bedtime || '23:30');
        setWakeTime(res.data.wakeTime || '07:30');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await healthApi.updateSettings({
        waterTargetMl,
        waterGlassSizeMl,
        stepTarget,
        sleepTargetHours,
        bedtime,
        wakeTime,
      });
      setSuccessMsg('Health tracking goals updated!');
      setTimeout(() => setSuccessMsg(''), 2500);
      onUpdate();
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tracker Settings</h3>
              <p className="text-xs text-slate-400">Customize target goals & preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="my-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Water Goal */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 mb-2">
                <Droplet className="w-4 h-4" />
                <span>Hydration Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Water (ml)</label>
                  <input
                    type="number"
                    value={waterTargetMl}
                    onChange={(e) => setWaterTargetMl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Glass Size (ml)</label>
                  <input
                    type="number"
                    value={waterGlassSizeMl}
                    onChange={(e) => setWaterGlassSizeMl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Step Goal */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 mb-2">
                <Footprints className="w-4 h-4" />
                <span>Daily Activity Goal</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Daily Step Target</label>
                <input
                  type="number"
                  step="500"
                  value={stepTarget}
                  onChange={(e) => setStepTarget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Sleep Goal */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 mb-2">
                <Moon className="w-4 h-4" />
                <span>Sleep Schedule & Target</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepTargetHours}
                    onChange={(e) => setSleepTargetHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Bedtime</label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-1.5 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-1.5 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </button>

            {successMsg && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 justify-center">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
