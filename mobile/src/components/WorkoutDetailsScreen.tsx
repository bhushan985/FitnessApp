import React, { useState } from 'react';
import { ArrowLeft, Heart, Play, Clock, Flame, Dumbbell, Award, CheckCircle2 } from 'lucide-react';

interface Props {
  workout: any;
  onBack: () => void;
  onStartWorkoutSession: (workout: any) => void;
}

export const WorkoutDetailsScreen: React.FC<Props> = ({
  workout,
  onBack,
  onStartWorkoutSession,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const title = workout?.title || 'Lower Body Strength';
  const difficulty = workout?.difficulty || 'Beginner';
  const duration = workout?.duration || (workout?.estimatedDurationMin ? `${workout.estimatedDurationMin} min` : '45 min');
  const calories = workout?.calories || (workout?.totalCaloriesBurn ? `${workout.totalCaloriesBurn} kcal` : '280 kcal');
  const equipment = workout?.equipment || 'Dumbbells';
  const description = workout?.description || 'A 9-exercise strength and conditioning session designed for optimal muscle targeting and balanced volume.';
  const focusAreas = workout?.focusAreas || ['Quads', 'Hamstrings', 'Glutes', 'Shoulders'];
  const exercises = workout?.exercises || [
    { name: 'Barbell Back Squat', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
    { name: 'Romanian Deadlift', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
    { name: 'Leg Press', sets: 3, reps: 12, restSec: 60, equipment: 'Machine', targetReps: '10-12' },
    { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
    { name: 'Leg Extension', sets: 3, reps: 12, restSec: 45, equipment: 'Machine', targetReps: '12-15' },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
    { name: 'Dumbbell Lateral Raise', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '12-15' },
    { name: 'Rear Delt Dumbbell Fly', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '12-15' },
    { name: 'Face Pull', sets: 3, reps: 15, restSec: 45, equipment: 'Cable', targetReps: '12-15' },
  ];

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#0D1728] text-white hover:bg-[#152238] transition border border-[#1F2F4A]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-bold text-white tracking-tight max-w-[200px] truncate">{title}</h1>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="p-2 rounded-xl bg-[#0D1728] text-white hover:bg-[#152238] transition border border-[#1F2F4A]"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#00D084] text-[#00D084]' : 'text-[#9AA8BA]'}`} />
        </button>
      </div>

      {/* Hero Banner Image */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-[#1F2F4A] shadow-2xl">
        <img
          src={workout?.image || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030B16] via-[#030B16]/40 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 backdrop-blur-md">
              {difficulty}
            </span>
            <h2 className="text-xl font-extrabold text-white">{title}</h2>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#0D1728] border border-[#1F2F4A] p-3 rounded-2xl">
          <Clock className="w-4 h-4 text-[#00D084] mx-auto mb-1" />
          <span className="text-[10px] text-[#9AA8BA] font-semibold block">Duration</span>
          <span className="text-xs font-extrabold text-white">{duration}</span>
        </div>
        <div className="bg-[#0D1728] border border-[#1F2F4A] p-3 rounded-2xl">
          <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-[#9AA8BA] font-semibold block">Calories</span>
          <span className="text-xs font-extrabold text-amber-300">{calories}</span>
        </div>
        <div className="bg-[#0D1728] border border-[#1F2F4A] p-3 rounded-2xl">
          <Dumbbell className="w-4 h-4 text-teal-300 mx-auto mb-1" />
          <span className="text-[10px] text-[#9AA8BA] font-semibold block">Equipment</span>
          <span className="text-xs font-extrabold text-white truncate block">{equipment}</span>
        </div>
      </div>

      {/* Primary Start CTA */}
      <button
        onClick={() => onStartWorkoutSession({ ...workout, exercises })}
        className="w-full py-4 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-sm rounded-2xl shadow-xl shadow-[#00D084]/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
      >
        <span>Start Workout ({exercises.length} Exercises)</span>
        <Play className="w-4 h-4 fill-current stroke-none" />
      </button>

      {/* ABOUT THIS WORKOUT */}
      <div className="bg-[#0D1728] border border-[#1F2F4A] p-5 rounded-3xl space-y-2">
        <h3 className="text-xs font-bold text-[#00D084] uppercase tracking-wider">About This Session</h3>
        <p className="text-xs text-[#9AA8BA] leading-relaxed">{description}</p>
      </div>

      {/* EXERCISE LIST (ALL 9 EXERCISES DISPLAYED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Workout Exercises ({exercises.length})
          </h3>
          <span className="text-[10px] text-[#00D084] font-bold">5 Primary + 4 Secondary</span>
        </div>

        <div className="space-y-2.5">
          {exercises.map((ex: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#0D1728] border border-[#1F2F4A] p-3 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-[#152238] text-[#00D084] font-extrabold text-xs flex items-center justify-center border border-[#203350]">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                  <span className="text-[10px] text-[#9AA8BA]">
                    {ex.sets || 3} sets × {ex.targetReps || ex.reps || 10} reps ({ex.equipment || 'Dumbbell'})
                  </span>
                </div>
              </div>

              <CheckCircle2 className="w-4 h-4 text-[#00D084]/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
