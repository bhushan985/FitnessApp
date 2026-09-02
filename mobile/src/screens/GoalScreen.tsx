import React from 'react';
import { Flame, TrendingUp, Dumbbell, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
  onChangeFitnessGoal: (goal: any) => void;
  weightKg: number;
  onChangeWeightKg: (weight: number) => void;
  heightCm: number;
  onChangeHeightCm: (height: number) => void;
  targetWeightKg: number;
  onChangeTargetWeightKg: (target: number) => void;
  activityLevel: 'low' | 'moderate' | 'high';
  onChangeActivityLevel: (level: any) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const GoalScreen: React.FC<Props> = ({
  fitnessGoal,
  onChangeFitnessGoal,
  weightKg,
  onChangeWeightKg,
  heightCm,
  onChangeHeightCm,
  targetWeightKg,
  onChangeTargetWeightKg,
  activityLevel,
  onChangeActivityLevel,
  onSubmit,
  loading,
}) => {
  const GOALS = [
    { id: 'weight_loss', label: 'Weight Loss', desc: 'Calorie deficit for healthy fat loss', icon: Flame },
    { id: 'muscle_building', label: 'Muscle Building', desc: 'High protein target & lean gain', icon: Dumbbell },
    { id: 'weight_gain', label: 'Weight Gain', desc: 'Calorie surplus for bulk', icon: TrendingUp },
    { id: 'maintenance', label: 'Stay Fit / Maintain', desc: 'Maintain current body weight', icon: ShieldCheck },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-900 text-white justify-between overflow-y-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
          <span>Step 3 of 3</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Your Fitness Goal</h2>
        <p className="text-xs text-slate-400 mb-6">
          Calculates BMR & TDEE to build your exact daily calorie and macronutrient targets.
        </p>

        {/* Fitness Goal Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {GOALS.map((goal) => {
            const isSelected = fitnessGoal === goal.id;
            const Icon = goal.icon;
            return (
              <div
                key={goal.id}
                onClick={() => onChangeFitnessGoal(goal.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{goal.label}</h4>
                <p className="text-[10px] text-slate-400 leading-tight">{goal.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Body Stats Input Grid */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Body Stats & Activity</h3>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => onChangeWeightKg(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-extrabold text-base rounded-xl px-2 py-1 focus:outline-none text-center"
            />
          </div>
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => onChangeHeightCm(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-extrabold text-base rounded-xl px-2 py-1 focus:outline-none text-center"
            />
          </div>
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Target (kg)</label>
            <input
              type="number"
              value={targetWeightKg}
              onChange={(e) => onChangeTargetWeightKg(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-extrabold text-base rounded-xl px-2 py-1 focus:outline-none text-center"
            />
          </div>
        </div>

        {/* Activity Level Selector */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl mb-6">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Daily Activity Level</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Low' },
              { id: 'moderate', label: 'Moderate' },
              { id: 'high', label: 'High' },
            ].map((level) => {
              const isSelected = activityLevel === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => onChangeActivityLevel(level.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 text-base transition-all active:scale-[0.98] mt-4"
      >
        {loading ? (
          <span>Calculating Targets & AI Plan...</span>
        ) : (
          <>
            <span>Generate Personalized Meal Plan</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </>
        )}
      </button>
    </div>
  );
};
