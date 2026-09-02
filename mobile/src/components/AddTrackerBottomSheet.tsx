import React from 'react';
import { X, Utensils, Dumbbell, Scale, Droplets, Footprints, Moon, Pill, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'food' | 'workout' | 'weight' | 'water' | 'steps' | 'sleep' | 'medicine' | 'ai') => void;
}

export const AddTrackerBottomSheet: React.FC<Props> = ({ isOpen, onClose, onSelectOption }) => {
  if (!isOpen) return null;

  const trackerOptions = [
    { id: 'food', label: 'Food Log', subtitle: 'Search regional food or Snap Check photo', icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'workout', label: 'Workout', subtitle: 'Log duration, reps & calories burned', icon: Dumbbell, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'weight', label: 'Weight', subtitle: 'Record current body weight', icon: Scale, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'water', label: 'Water', subtitle: 'Quick add 250ml glass or custom intake', icon: Droplets, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    { id: 'steps', label: 'Steps', subtitle: 'Sync HealthConnect / Apple Health or log steps', icon: Footprints, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'sleep', label: 'Sleep Goal', subtitle: 'Record hours slept & set bedtime', icon: Moon, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'medicine', label: 'Medicine & Reminders', subtitle: 'Track daily supplements & meds', icon: Pill, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'ai', label: 'Ask NutriRegion AI', subtitle: 'Instant advice on macros & dinner suggestions', icon: Sparkles, color: 'text-teal-300 bg-teal-500/20 border-teal-400/40' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">What would you like to track?</h3>
            <p className="text-xs text-slate-400">Select a quick action to log into your daily Health Hub</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {trackerOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectOption(opt.id as any);
                  onClose();
                }}
                className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className={`p-2.5 rounded-xl border ${opt.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{opt.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
