import React, { useState } from 'react';
import { X, Dumbbell, Zap, Check, Flame, Clock, Award } from 'lucide-react';
import { workoutApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutGenerated: (workout: any) => void;
}

export const CustomizeWorkoutModal: React.FC<Props> = ({ isOpen, onClose, onWorkoutGenerated }) => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['back', 'biceps']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight', 'Bench']);
  const [goal, setGoal] = useState<'hypertrophy' | 'strength' | 'fat_loss' | 'general'>('hypertrophy');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [durationMin, setDurationMin] = useState<number>(45);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const muscleOptions = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'forearms', label: 'Forearms' },
    { id: 'quads', label: 'Quads' },
    { id: 'hamstrings', label: 'Hamstrings' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'calves', label: 'Calves' },
    { id: 'abs', label: 'Abs / Core' },
  ];

  const equipmentOptions = [
    'Dumbbell',
    'Barbell',
    'Cable',
    'Machine',
    'Bodyweight',
    'EZ Bar',
    'Smith Machine',
    'Kettlebell',
    'Resistance Band',
    'Bench',
  ];

  const toggleMuscle = (id: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleGenerate = async () => {
    if (selectedMuscles.length === 0) return;
    try {
      setLoading(true);
      const res = await workoutApi.generateWorkout({
        muscleGroups: selectedMuscles,
        goal,
        experienceLevel,
        availableEquipment: selectedEquipment,
        durationMin,
        includeAbs: selectedMuscles.includes('abs'),
      });

      if (res.success && res.data) {
        onWorkoutGenerated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed generating workout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Dumbbell className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Customize Today's Workout</h3>
              <p className="text-xs text-slate-400">Select target muscles, equipment & goals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto my-4 space-y-5 pr-1 no-scrollbar">
          {/* 1. Target Muscle Groups */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              What do you want to train today?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {muscleOptions.map((m) => {
                const isSelected = selectedMuscles.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMuscle(m.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{m.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Available Equipment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Available Equipment
            </label>
            <div className="flex flex-wrap gap-1.5">
              {equipmentOptions.map((eq) => {
                const isSelected = selectedEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Training Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Fitness Goal (ACSM Volume Guidelines)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hypertrophy', label: 'Hypertrophy / Muscle Gain', desc: '3–4 sets × 8–12 reps' },
                { id: 'strength', label: 'Strength & Power', desc: '3–5 sets × 4–6 heavy reps' },
                { id: 'fat_loss', label: 'Fat Loss / Conditioning', desc: '3 sets × 12–15 reps (45s rest)' },
                { id: 'general', label: 'General Fitness', desc: '3 sets × 10–12 reps' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-3 rounded-2xl text-left border transition ${
                    goal === g.id
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-0.5">{g.label}</div>
                  <div className="text-[10px] text-slate-400">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Experience Level & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Experience
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Workout Duration
              </label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={15}>15 Mins (Quick Session)</option>
                <option value={20}>20 Mins</option>
                <option value={30}>30 Mins</option>
                <option value={45}>45 Mins</option>
                <option value={60}>60 Mins</option>
                <option value={75}>75+ Mins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || selectedMuscles.length === 0}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-40"
        >
          <Zap className={`w-4 h-4 fill-current ${loading ? 'animate-bounce' : ''}`} />
          <span>{loading ? 'Generating Structured Workout...' : 'Generate Customized Session'}</span>
        </button>
      </div>
    </div>
  );
};
