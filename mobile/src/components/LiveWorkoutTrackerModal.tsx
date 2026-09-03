import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, Check, ChevronLeft, ChevronRight, ListOrdered, Dumbbell, Award, Flame } from 'lucide-react';
import { workoutApi } from '../services/api';
import { WorkoutCompletionModal } from './WorkoutCompletionModal';

interface SetItem {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan: any;
  onReplaceExercise?: (index: number, exerciseId: string) => void;
  onWorkoutCompleted?: () => void;
}

export const LiveWorkoutTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  workoutPlan,
  onReplaceExercise,
  onWorkoutCompleted,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [exerciseSetsState, setExerciseSetsState] = useState<Record<number, SetItem[]>>({});
  const [showOrderedOverview, setShowOrderedOverview] = useState<boolean>(false);
  const [isCompletedSession, setIsCompletedSession] = useState<boolean>(false);
  const [completedMetrics, setCompletedMetrics] = useState<any>(null);

  const exercises = workoutPlan?.exercises || workoutPlan?.actualSession || [
    { name: 'Barbell Bench Press', equipment: 'Barbell', difficulty: 'Intermediate', sets: 3, targetReps: '8-12' },
    { name: 'Incline Dumbbell Press', equipment: 'Dumbbell', difficulty: 'Intermediate', sets: 3, targetReps: '8-12' },
    { name: 'Machine Chest Press', equipment: 'Machine', difficulty: 'Beginner', sets: 3, targetReps: '10-12' },
    { name: 'Cable Chest Fly', equipment: 'Cable', difficulty: 'Intermediate', sets: 3, targetReps: '12-15' },
    { name: 'Pec Deck Fly', equipment: 'Machine', difficulty: 'Beginner', sets: 3, targetReps: '12-15' },
    { name: 'Cable Triceps Pushdown', equipment: 'Cable', difficulty: 'Beginner', sets: 3, targetReps: '10-12' },
    { name: 'Overhead Cable Extension', equipment: 'Cable', difficulty: 'Intermediate', sets: 3, targetReps: '10-12' },
    { name: 'EZ-Bar Skull Crusher', equipment: 'EZ Bar', difficulty: 'Intermediate', sets: 3, targetReps: '8-12' },
    { name: 'Dumbbell Overhead Extension', equipment: 'Dumbbell', difficulty: 'Beginner', sets: 3, targetReps: '10-12' },
  ];

  useEffect(() => {
    if (exercises && exercises.length > 0) {
      const initialState: Record<number, SetItem[]> = {};
      exercises.forEach((ex: any, idx: number) => {
        const count = ex.sets || 3;
        const defaultReps = parseInt(ex.targetReps || ex.reps || 10, 10) || 10;
        initialState[idx] = Array.from({ length: count }, (_, sIdx) => ({
          setNumber: sIdx + 1,
          weightKg: 12,
          reps: defaultReps,
          completed: false,
        }));
      });
      setExerciseSetsState(initialState);
    }
  }, [workoutPlan]);

  if (!isOpen) return null;

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const currentSets = exerciseSetsState[currentExerciseIndex] || [
    { setNumber: 1, weightKg: 12, reps: 10, completed: false },
    { setNumber: 2, weightKg: 12, reps: 10, completed: false },
    { setNumber: 3, weightKg: 12, reps: 10, completed: false },
    { setNumber: 4, weightKg: 12, reps: 10, completed: false },
  ];

  const handleUpdateSet = (setIdx: number, field: 'weightKg' | 'reps', val: number) => {
    const updatedSets = [...currentSets];
    updatedSets[setIdx] = { ...updatedSets[setIdx], [field]: val };
    setExerciseSetsState((prev) => ({ ...prev, [currentExerciseIndex]: updatedSets }));
  };

  const handleToggleDone = (setIdx: number) => {
    const updatedSets = [...currentSets];
    updatedSets[setIdx] = { ...updatedSets[setIdx], completed: !updatedSets[setIdx].completed };
    setExerciseSetsState((prev) => ({ ...prev, [currentExerciseIndex]: updatedSets }));
  };

  const handleAddSet = () => {
    const nextNum = currentSets.length + 1;
    const lastSet = currentSets[currentSets.length - 1] || { weightKg: 12, reps: 10 };
    const newSet: SetItem = {
      setNumber: nextNum,
      weightKg: lastSet.weightKg,
      reps: lastSet.reps,
      completed: false,
    };
    setExerciseSetsState((prev) => ({ ...prev, [currentExerciseIndex]: [...currentSets, newSet] }));
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Final exercise reached & finishing workout session
      finishSession();
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const finishSession = async () => {
    let totalCompletedSets = 0;
    Object.values(exerciseSetsState).forEach((sets) => {
      sets.forEach((s) => {
        if (s.completed) totalCompletedSets++;
      });
    });

    const metrics = {
      duration: `${workoutPlan?.estimatedDurationMin || 32}:18`,
      calories: workoutPlan?.totalCaloriesBurn || 218,
      exercisesCount: exercises.length,
      setsCount: totalCompletedSets > 0 ? totalCompletedSets : exercises.length * 3,
      avgHeartRate: 128,
      workoutScore: 89,
    };

    try {
      await workoutApi.completeWorkout({
        workoutPlanId: workoutPlan?._id,
        workoutTitle: workoutPlan?.title || 'Custom Workout Session',
        completedExercises: exercises.map((e: any) => e.name),
        durationMinutes: workoutPlan?.estimatedDurationMin || 32,
        caloriesBurned: workoutPlan?.totalCaloriesBurn || 218,
      });
    } catch (e) {
      console.error('Session complete log error:', e);
    }

    setCompletedMetrics(metrics);
    setIsCompletedSession(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030B16] text-white flex flex-col animate-fadeIn overflow-hidden font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="px-5 py-4 bg-[#0D1728] border-b border-[#1F2F4A] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 rounded-xl bg-[#152238] text-[#9AA8BA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00D084]">
              EXERCISE {currentExerciseIndex + 1} OF {exercises.length}
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">{currentExercise.name}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOrderedOverview(!showOrderedOverview)}
            className="p-2 rounded-xl bg-[#152238] text-[#00D084] hover:bg-[#1C2C46] border border-[#203350]"
            title="View Exercise Overview"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (onReplaceExercise) {
                onReplaceExercise(currentExerciseIndex, currentExercise.exerciseId || currentExercise._id);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#152238] text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center space-x-1 border border-[#203350]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replace</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        {/* Ordered Exercise Overview Drawer/Modal */}
        {showOrderedOverview && (
          <div className="bg-[#0D1728] border border-[#00D084]/40 p-4 rounded-3xl space-y-3 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#00D084] uppercase tracking-wider">Workout Exercise Overview</h3>
              <button onClick={() => setShowOrderedOverview(false)} className="text-xs text-[#9AA8BA]">Close</button>
            </div>
            <div className="space-y-2">
              {exercises.map((ex: any, idx: number) => {
                const isCurrent = idx === currentExerciseIndex;
                const setsForItem = exerciseSetsState[idx] || [];
                const isDone = setsForItem.every((s) => s.completed) && setsForItem.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentExerciseIndex(idx);
                      setShowOrderedOverview(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isCurrent
                        ? 'bg-[#00D084]/20 border-[#00D084] text-white font-bold'
                        : isDone
                        ? 'bg-[#0D1728] border-[#00D084]/30 text-slate-300'
                        : 'bg-[#152238] border-[#203350] text-[#9AA8BA]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-[#030B16] text-[#00D084] font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{ex.name}</div>
                        <div className="text-[10px] text-[#9AA8BA]">
                          {ex.targetReps || ex.reps || 10} reps · {ex.sets || 3} sets
                        </div>
                      </div>
                    </div>
                    {isDone ? (
                      <Check className="w-4 h-4 text-[#00D084] stroke-[3]" />
                    ) : isCurrent ? (
                      <span className="text-[10px] bg-[#00D084] text-[#030B16] font-extrabold px-2 py-0.5 rounded">Active</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Large Exercise Media */}
        <div className="relative w-full h-44 rounded-3xl bg-[#0D1728] border border-[#1F2F4A] overflow-hidden shadow-2xl flex items-center justify-center">
          <img
            src={currentExercise.media?.url || currentExercise.imageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'}
            alt={currentExercise.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030B16] via-transparent to-transparent" />
          <span className="absolute top-3 left-3 bg-[#030B16]/80 backdrop-blur-md text-[#00D084] text-[10px] font-extrabold px-3 py-1 rounded-xl border border-[#00D084]/40">
            {currentExercise.equipment || 'Dumbbell'} · {currentExercise.difficulty || 'Intermediate'}
          </span>
        </div>

        {/* TARGET MUSCLE ENGAGEMENT */}
        <div className="bg-[#0D1728] border border-[#1F2F4A] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#9AA8BA] uppercase tracking-wider">Target Muscle Engagement</span>
            <span className="font-extrabold text-[#00D084]">70%</span>
          </div>
          <div className="w-full h-2 bg-[#152238] rounded-full overflow-hidden">
            <div className="h-full bg-[#00D084] rounded-full w-[70%] transition-all duration-500" />
          </div>
        </div>

        {/* SET TRACKING TABLE */}
        <div className="bg-[#0D1728] border border-[#1F2F4A] rounded-3xl p-4 space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-[#9AA8BA] uppercase tracking-wider pb-2 border-b border-[#1A2A42]">
            <div>SET</div>
            <div>WEIGHT (KG)</div>
            <div>REPS</div>
            <div>DONE</div>
          </div>

          <div className="space-y-2.5">
            {currentSets.map((setItem, sIdx) => (
              <div
                key={sIdx}
                className={`grid grid-cols-4 gap-2 items-center text-center p-2 rounded-2xl transition-all ${
                  setItem.completed ? 'bg-[#00D084]/10 border border-[#00D084]/40' : 'bg-[#152238] border border-[#203350]'
                }`}
              >
                <div className="text-xs font-extrabold text-white">Set {setItem.setNumber}</div>

                {/* Weight Input */}
                <input
                  type="number"
                  value={setItem.weightKg}
                  onChange={(e) => handleUpdateSet(sIdx, 'weightKg', Number(e.target.value))}
                  className="bg-[#0D1728] border border-[#243754] rounded-xl text-center text-xs font-bold text-white py-1.5 focus:outline-none focus:border-[#00D084]"
                />

                {/* Reps Input */}
                <input
                  type="number"
                  value={setItem.reps}
                  onChange={(e) => handleUpdateSet(sIdx, 'reps', Number(e.target.value))}
                  className="bg-[#0D1728] border border-[#243754] rounded-xl text-center text-xs font-bold text-white py-1.5 focus:outline-none focus:border-[#00D084]"
                />

                {/* Done Checkbox */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleToggleDone(sIdx)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      setItem.completed
                        ? 'bg-[#00D084] text-[#030B16] shadow-md shadow-[#00D084]/30'
                        : 'border-2 border-[#243754] text-transparent hover:border-[#00D084]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Additional Set Button */}
          <button
            onClick={handleAddSet}
            className="w-full py-2.5 bg-[#152238] hover:bg-[#1C2C46] border border-dashed border-[#2A4268] text-[#00D084] text-xs font-bold rounded-2xl flex items-center justify-center space-x-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Additional Set</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 bg-[#0D1728] border-t border-[#1F2F4A] flex items-center justify-between space-x-3">
        <button
          onClick={handlePrevExercise}
          disabled={currentExerciseIndex === 0}
          className="flex-1 py-3 bg-[#152238] hover:bg-[#1C2C46] text-[#9AA8BA] hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-1 border border-[#203350] disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <button
          onClick={handleNextExercise}
          className="flex-1 py-3 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-xs rounded-2xl shadow-xl shadow-[#00D084]/25 flex items-center justify-center space-x-1 transition active:scale-[0.98]"
        >
          <span>{currentExerciseIndex === exercises.length - 1 ? 'Finish Workout' : 'Next Exercise'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Workout Completion Summary Modal */}
      {isCompletedSession && completedMetrics && (
        <WorkoutCompletionModal
          isOpen={isCompletedSession}
          metrics={completedMetrics}
          onSave={() => {
            setIsCompletedSession(false);
            if (onWorkoutCompleted) onWorkoutCompleted();
            onClose();
          }}
        />
      )}
    </div>
  );
};
