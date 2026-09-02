import React, { useState } from 'react';
import { X, Pill, Plus, Check, SkipForward, Clock, ShieldAlert } from 'lucide-react';
import { healthApi } from '../services/api';

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  status: 'taken' | 'skipped' | 'pending';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicineReminders: MedicineItem[];
  onUpdate: () => void;
}

export const MedicineTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medicineReminders,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('1 tablet');
  const [time, setTime] = useState<string>('08:00 AM');
  const [frequency, setFrequency] = useState<string>('daily');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'taken' ? 'pending' : currentStatus === 'pending' ? 'taken' : 'taken';
      await healthApi.updateMedicineStatus(id, nextStatus as any);
      onUpdate();
    } catch (err) {
      console.error('Medicine status update error:', err);
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await healthApi.updateMedicineStatus(id, 'skipped');
      onUpdate();
    } catch (err) {
      console.error('Medicine skip error:', err);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !time) return;

    try {
      setLoading(true);
      await healthApi.addMedicineReminder({
        name,
        dosage,
        time,
        frequency,
        notes,
      });
      setName('');
      setShowAddForm(false);
      onUpdate();
    } catch (err) {
      console.error('Add medicine error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Medicine Reminders</h3>
              <p className="text-xs text-slate-400">Track daily supplements & medications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        {!showAddForm ? (
          <div className="my-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {medicineReminders.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/40 rounded-2xl border border-slate-800">
                <Pill className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-400">No medicine reminders created yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl transition"
                >
                  + Add First Reminder
                </button>
              </div>
            ) : (
              medicineReminders.map((med) => (
                <div
                  key={med.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    med.status === 'taken'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : med.status === 'skipped'
                      ? 'bg-slate-800/40 border-slate-800 opacity-60'
                      : 'bg-slate-800/70 border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleStatusToggle(med.id, med.status)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                        med.status === 'taken'
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 hover:border-emerald-400 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <div className={`text-sm font-semibold ${med.status === 'taken' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{med.dosage}</span>
                        <span>•</span>
                        <span className="flex items-center text-rose-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {med.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {med.status === 'pending' && (
                      <button
                        onClick={() => handleSkip(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 text-[10px] flex items-center space-x-1"
                        title="Skip dose"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Skip</span>
                      </button>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      med.status === 'taken' ? 'bg-emerald-500/20 text-emerald-300' : med.status === 'skipped' ? 'bg-slate-700 text-slate-400' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {med.status}
                    </span>
                  </div>
                </div>
              ))
            )}

            {medicineReminders.length > 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-center space-x-1 transition mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Reminder</span>
              </button>
            )}
          </div>
        ) : (
          /* Add Form */
          <form onSubmit={handleAddReminder} className="my-4 space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Medicine / Supplement Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                placeholder="e.g. Vitamin D3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. 1 tablet"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. 8:00 AM"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="daily">Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-500/20"
              >
                {loading ? 'Creating...' : 'Save Reminder'}
              </button>
            </div>
          </form>
        )}

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-start space-x-2 text-[10px] text-slate-500">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>Reminders are for convenience only. NutriRegion does not prescribe or provide medical recommendations.</span>
        </div>
      </div>
    </div>
  );
};
