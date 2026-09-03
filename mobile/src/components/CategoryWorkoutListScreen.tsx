import React, { useState } from 'react';
import { ArrowLeft, Filter, Clock, Flame, Users, Play, Dumbbell } from 'lucide-react';

interface Props {
  categoryTitle: string;
  onBack: () => void;
  onSelectWorkout: (workout: any) => void;
}

export const CategoryWorkoutListScreen: React.FC<Props> = ({
  categoryTitle,
  onBack,
  onSelectWorkout,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const mockWorkouts = [
    {
      id: 'w1',
      title: 'Legs & Shoulders Sculpt',
      difficulty: 'Beginner',
      duration: '45 min',
      calories: '280 kcal',
      startedCount: 75,
      equipment: 'Barbell & Dumbbells',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
      description: 'Complete 9-exercise legs and shoulders split combining 5 leg movements and 4 shoulder exercises.',
      focusAreas: ['Quads', 'Hamstrings', 'Glutes', 'Shoulders'],
      exercises: [
        { name: 'Barbell Back Squat', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
        { name: 'Leg Press', sets: 3, reps: 12, restSec: 60, equipment: 'Machine', targetReps: '10-12' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
        { name: 'Leg Extension', sets: 3, reps: 12, restSec: 45, equipment: 'Machine', targetReps: '12-15' },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
        { name: 'Dumbbell Lateral Raise', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '12-15' },
        { name: 'Rear Delt Dumbbell Fly', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '12-15' },
        { name: 'Face Pull', sets: 3, reps: 15, restSec: 45, equipment: 'Cable', targetReps: '12-15' },
      ],
    },
    {
      id: 'w2',
      title: 'Chest & Triceps Hypertrophy',
      difficulty: 'Intermediate',
      duration: '45 min',
      calories: '310 kcal',
      startedCount: 112,
      equipment: 'Barbell, Dumbbells & Cable',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      description: 'Hypertrophy session with 5 chest exercises and 4 triceps exercises.',
      focusAreas: ['Chest', 'Triceps'],
      exercises: [
        { name: 'Barbell Bench Press', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
        { name: 'Machine Chest Press', sets: 3, reps: 10, restSec: 60, equipment: 'Machine', targetReps: '10-12' },
        { name: 'Cable Chest Fly', sets: 3, reps: 12, restSec: 45, equipment: 'Cable', targetReps: '12-15' },
        { name: 'Pec Deck Fly', sets: 3, reps: 12, restSec: 45, equipment: 'Machine', targetReps: '12-15' },
        { name: 'Cable Triceps Pushdown', sets: 3, reps: 12, restSec: 45, equipment: 'Cable', targetReps: '10-12' },
        { name: 'Overhead Cable Extension', sets: 3, reps: 12, restSec: 45, equipment: 'Cable', targetReps: '10-12' },
        { name: 'EZ-Bar Skull Crusher', sets: 3, reps: 10, restSec: 60, equipment: 'EZ Bar', targetReps: '8-12' },
        { name: 'Dumbbell Overhead Extension', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '10-12' },
      ],
    },
    {
      id: 'w3',
      title: 'Back & Biceps Power Builder',
      difficulty: 'Intermediate',
      duration: '45 min',
      calories: '290 kcal',
      startedCount: 140,
      equipment: 'Barbell, Dumbbells & Cables',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
      description: 'Comprehensive pull split with 5 back exercises and 4 biceps exercises.',
      focusAreas: ['Back', 'Biceps'],
      exercises: [
        { name: 'Lat Pulldown', sets: 3, reps: 10, restSec: 60, equipment: 'Cable', targetReps: '8-12' },
        { name: 'Barbell Bent-Over Row', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
        { name: 'Seated Cable Row', sets: 3, reps: 10, restSec: 60, equipment: 'Cable', targetReps: '10-12' },
        { name: 'One-Arm Dumbbell Row', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '8-12' },
        { name: 'Chest-Supported Dumbbell Row', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '10-12' },
        { name: 'Barbell Biceps Curl', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', targetReps: '8-12' },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: 10, restSec: 60, equipment: 'Dumbbell', targetReps: '10-12' },
        { name: 'Hammer Curl', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbell', targetReps: '10-12' },
        { name: 'Preacher Curl', sets: 3, reps: 10, restSec: 60, equipment: 'EZ Bar', targetReps: '8-12' },
      ],
    },
  ];

  const filteredWorkouts = mockWorkouts.filter((w) => {
    if (selectedDifficulty === 'all') return true;
    return w.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#0D1728] text-white hover:bg-[#152238] transition border border-[#1F2F4A]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-extrabold text-white tracking-tight">{categoryTitle}</h1>

        <div className="w-9" />
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex items-center space-x-2 bg-[#0D1728] p-1.5 rounded-2xl border border-[#1F2F4A]">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              selectedDifficulty === diff
                ? 'bg-[#00D084] text-[#030B16] font-extrabold shadow-md'
                : 'text-[#9AA8BA] hover:text-white'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Workouts Grid */}
      <div className="space-y-4">
        {filteredWorkouts.map((workout) => (
          <div
            key={workout.id}
            onClick={() => onSelectWorkout(workout)}
            className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 rounded-3xl p-4 transition-all duration-300 shadow-xl cursor-pointer group"
          >
            <div className="flex space-x-4">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={workout.image} alt={workout.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-2 left-2 bg-[#030B16]/80 text-[#00D084] text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-[#00D084]/30">
                  {workout.difficulty}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-[#00D084] transition">{workout.title}</h3>
                  <p className="text-[11px] text-[#9AA8BA] line-clamp-2 mt-1">{workout.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#152238] text-[10px] text-[#9AA8BA]">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#00D084]" />
                      <span>{workout.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{workout.calories}</span>
                    </span>
                  </div>

                  <span className="text-[#00D084] font-bold flex items-center space-x-1">
                    <span>9 Exercises</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
