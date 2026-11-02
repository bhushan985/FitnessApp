import React from 'react';
import { Check, Flame, Clock, Award, Share2, Sparkles, Heart } from 'lucide-react';

interface MetricProps {
  duration?: string;
  calories?: number;
  exercisesCount?: number;
  setsCount?: number;
  avgHeartRate?: number;
  workoutScore?: number;
}

interface Props {
  isOpen: boolean;
  metrics: MetricProps;
  user?: any;
  onSave: () => void;
}

export const WorkoutCompletionModal: React.FC<Props> = ({
  isOpen,
  metrics,
  user,
  onSave,
}) => {
  if (!isOpen) return null;

  const userName = user?.name ? user.name.split(' ')[0] : 'Champ';

  return (
    <div className="fixed inset-0 z-50 bg-[#030B16]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#0D1728] border border-[#00D084]/40 w-full max-w-sm rounded-3xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle Glow & Confetti visual */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00D084]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Green Check Indicator */}
        <div className="w-16 h-16 rounded-full bg-[#00D084] text-[#030B16] flex items-center justify-center mx-auto shadow-lg shadow-[#00D084]/40 border-4 border-[#030B16]">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Workout Complete!</h2>
          <p className="text-xs text-[#9AA8BA] font-medium">Great job, {userName} 💪</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-[#152238] border border-[#203350] p-4 rounded-2xl">
          <div>
            <Clock className="w-4 h-4 text-[#00D084] mx-auto mb-1" />
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Duration</span>
            <span className="text-sm font-extrabold text-white">{metrics.duration || '32:18'}</span>
          </div>

          <div>
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Calories</span>
            <span className="text-sm font-extrabold text-amber-300">{metrics.calories || 218} kcal</span>
          </div>

          <div>
            <Award className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Exercises</span>
            <span className="text-sm font-extrabold text-white">{metrics.exercisesCount || 8} / {metrics.exercisesCount || 8}</span>
          </div>

          <div className="pt-2">
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Sets</span>
            <span className="text-sm font-extrabold text-white">{metrics.setsCount || 24}</span>
          </div>

          <div className="pt-2">
            <Heart className="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Avg HR</span>
            <span className="text-xs font-extrabold text-white">{metrics.avgHeartRate || 128} bpm</span>
          </div>

          <div className="pt-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00D084] mx-auto mb-0.5" />
            <span className="text-[9px] text-[#9AA8BA] font-semibold block uppercase">Score</span>
            <span className="text-xs font-extrabold text-[#00D084]">{metrics.workoutScore || 89}%</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onSave}
            className="w-full py-3.5 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-sm rounded-2xl shadow-xl shadow-[#00D084]/25 transition active:scale-[0.98]"
          >
            Save Workout
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'NutriRegion Workout', text: 'I just completed a Workout on NutriRegion!' });
              }
            }}
            className="w-full py-3 bg-[#152238] hover:bg-[#1C2C46] text-[#9AA8BA] hover:text-white font-bold text-xs rounded-2xl border border-[#203350] flex items-center justify-center space-x-1.5 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
