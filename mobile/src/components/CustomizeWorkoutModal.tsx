import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, ChevronDown, Award } from 'lucide-react';
import { workoutApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutGenerated: (workout: any) => void;
}

export const CustomizeWorkoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onWorkoutGenerated,
}) => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['Back', 'Biceps']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Dumbbell', 'Barbell']);
  const [selectedGoal, setSelectedGoal] = useState<string>('hypertrophy');
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [durationMin, setDurationMin] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const musclesList = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abs / Core',
  ];

  const equipmentList = [
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

  const goalsList = [
    {
      id: 'hypertrophy',
      title: 'Hypertrophy / Muscle Gain',
      recommendation: '3–4 sets × 8–12 reps',
      desc: 'Optimized for muscle size and growth',
    },
    {
      id: 'strength',
      title: 'Strength & Power',
      recommendation: '3–5 sets × 4–6 heavy reps',
      desc: 'Heavy loading with longer rest periods',
    },
    {
      id: 'fat_loss',
      title: 'Fat Loss / Conditioning',
      recommendation: '3 sets × 12–15 reps',
      desc: 'Higher reps with shorter rest intervals',
    },
    {
      id: 'general_fitness',
      title: 'General Fitness',
      recommendation: '3 sets × 10–12 reps',
      desc: 'Balanced volume for overall health & endurance',
    },
  ];

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await workoutApi.generateWorkout({
        muscleGroups: selectedMuscles.map((m) => m.toLowerCase().replace(' / core', '')),
        goal: selectedGoal,
        experienceLevel,
        availableEquipment: selectedEquipment,
        durationMin,
        includeAbs: selectedMuscles.includes('Abs / Core'),
      });

      if (res.success && res.data) {
        onWorkoutGenerated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate customized workout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030B16]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#0D1728] border border-[#1F2F4A] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1A2A42] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#00D084]" />
              <span>Customize Today's Workout</span>
            </h2>
            <p className="text-xs text-[#9AA8BA] mt-0.5">Select target muscles, equipment & goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#152238] text-[#9AA8BA] hover:text-white border border-[#203350]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          {/* SECTION 1: TARGET MUSCLES */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">
              What do you want to train today?
            </h3>
            <div className="flex flex-wrap gap-2">
              {musclesList.map((muscle) => {
                const isSelected = selectedMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(muscle)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-[#00D084]/20 border-2 border-[#00D084] text-[#00D084] shadow-sm'
                        : 'bg-[#152238] border border-[#203350] text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{muscle}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: AVAILABLE EQUIPMENT */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">
              Available Equipment
            </h3>
            <div className="flex flex-wrap gap-2">
              {equipmentList.map((eq) => {
                const isSelected = selectedEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-[#00D084]/20 border-2 border-[#00D084] text-[#00D084]'
                        : 'bg-[#152238] border border-[#203350] text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{eq}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: FITNESS GOAL (ACSM VOLUME GUIDELINES) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-[#00D084]" />
              <span>Fitness Goal (ACSM Volume Guidelines)</span>
            </h3>
            <div className="space-y-2">
              {goalsList.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#00D084]/15 border-2 border-[#00D084] text-white shadow-md'
                        : 'bg-[#152238] border-[#203350] hover:border-[#2A4268]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-white">{goal.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30">
                        {goal.recommendation}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9AA8BA] mt-1">{goal.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4 & 5: EXPERIENCE & DURATION */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider block">Experience</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-[#152238] border border-[#203350] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00D084]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider block">Duration</label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-[#152238] border border-[#203350] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00D084]"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={75}>75 mins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-[#1A2A42] bg-[#0D1728]">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-sm rounded-2xl shadow-xl shadow-[#00D084]/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current stroke-none" />
            <span>{loading ? 'Generating Workout...' : '⚡ Generate Customized Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
