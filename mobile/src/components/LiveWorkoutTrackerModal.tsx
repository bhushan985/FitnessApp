import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, RefreshCw, Clock, Plus, SkipForward, Flame, Award, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { workoutApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan: any;
  onReplaceExercise: (exerciseIndex: number, exerciseId: string) => void;
  onWorkoutCompleted: () => void;
}

export const LiveWorkoutTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  workoutPlan,
  onReplaceExercise,
  onWorkoutCompleted,
}) => {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [setsData, setSetsData] = useState<Record<string, Array<{ setNumber: number; weightKg: number; reps: number; completed: boolean }>>>({});
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (workoutPlan && workoutPlan.exercises) {
      const initial: Record<string, Array<{ setNumber: number; weightKg: number; reps: number; completed: boolean }>> = {};
      workoutPlan.exercises.forEach((ex: any) => {
        const numSets = ex.sets || 3;
        const suggestedWeight = ex.suggestedWeightKg || 12;
        const defaultReps = parseInt(ex.targetReps || '10') || 10;
        initial[ex.name] = Array.from({ length: numSets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: suggestedWeight,
          reps: defaultReps,
          completed: false,
        }));
      });
      setSetsData(initial);
    }
  }, [workoutPlan]);

  // Live Rest Timer Effect
  useEffect(() => {
    if (restTimerSeconds !== null && restTimerSeconds > 0) {
      const timer = setInterval(() => {
        setRestTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restTimerSeconds]);

  if (!isOpen || !workoutPlan || !workoutPlan.exercises || workoutPlan.exercises.length === 0) return null;

  const currentExercise = workoutPlan.exercises[activeExerciseIndex];
  const currentSets = setsData[currentExercise.name] || [];

  const handleToggleSet = (setIdx: number) => {
    setSetsData((prev) => {
      const list = [...(prev[currentExercise.name] || [])];
      if (list[setIdx]) {
        const isNowCompleted = !list[setIdx].completed;
        list[setIdx] = { ...list[setIdx], completed: isNowCompleted };
        if (isNowCompleted) {
          // Trigger rest timer
          setRestTimerSeconds(currentExercise.restSeconds || 60);
        }
      }
      return { ...prev, [currentExercise.name]: list };
    });
  };

  const handleWeightChange = (setIdx: number, val: number) => {
    setSetsData((prev) => {
      const list = [...(prev[currentExercise.name] || [])];
      if (list[setIdx]) {
        list[setIdx] = { ...list[setIdx], weightKg: val };
      }
      return { ...prev, [currentExercise.name]: list };
    });
  };

  const handleRepsChange = (setIdx: number, val: number) => {
    setSetsData((prev) => {
      const list = [...(prev[currentExercise.name] || [])];
      if (list[setIdx]) {
        list[setIdx] = { ...list[setIdx], reps: val };
      }
      return { ...prev, [currentExercise.name]: list };
    });
  };

  const handleAddSet = () => {
    setSetsData((prev) => {
      const list = [...(prev[currentExercise.name] || [])];
      const lastSet = list[list.length - 1];
      list.push({
        setNumber: list.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 12,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      });
      return { ...prev, [currentExercise.name]: list };
    });
  };

  const handleFinishWorkout = async () => {
    try {
      setSubmitting(true);
      const completedNames = Object.entries(setsData)
        .filter(([_, sets]) => sets.some((s) => s.completed))
        .map(([name]) => name);

      const payloadSetsData = Object.entries(setsData).map(([exerciseName, sets]) => ({
        exerciseName,
        sets: sets.filter((s) => s.completed).map((s) => ({ setNumber: s.setNumber, weightKg: s.weightKg, reps: s.reps })),
      }));

      await workoutApi.completeWorkout({
        workoutPlanId: workoutPlan._id,
        workoutTitle: workoutPlan.title || 'Custom Session',
        completedExercises: completedNames.length > 0 ? completedNames : workoutPlan.exercises.map((e: any) => e.name),
        durationMinutes: workoutPlan.estimatedDurationMin || 45,
        caloriesBurned: workoutPlan.totalCaloriesBurn || 320,
        setsData: payloadSetsData,
      });

      onWorkoutCompleted();
      onClose();
    } catch (err) {
      console.error('Complete workout error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastExercise = activeExerciseIndex === workoutPlan.exercises.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col h-full sm:h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Exercise {activeExerciseIndex + 1} of {workoutPlan.exercises.length}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">{currentExercise.name}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReplaceExercise(activeExerciseIndex, currentExercise.exerciseId)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-amber-300 text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Rest Timer Overlay (If active) */}
        {restTimerSeconds !== null && (
          <div className="my-3 p-3 bg-slate-800/90 border border-emerald-500/40 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rest Timer</span>
                <div className="text-lg font-black text-white">{Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60).toString().padStart(2, '0')}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setRestTimerSeconds((prev) => (prev || 0) + 30)}
                className="px-2.5 py-1 rounded-xl bg-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-600"
              >
                +30s
              </button>
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Exercise Visual Demonstration GIF */}
        <div className="my-3 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center">
          <img
            src={currentExercise.media?.url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'}
            alt={currentExercise.name}
            className="w-full h-48 object-cover opacity-90"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-slate-700/60 capitalize">
            {currentExercise.equipment || 'Equipment'} • {currentExercise.difficulty || 'Intermediate'}
          </div>
        </div>

        {/* Primary & Secondary Muscle Target Display */}
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl my-2 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Muscle Engagement</span>
          <div className="space-y-1.5">
            {(currentExercise.muscleEngagement || [
              { muscle: currentExercise.primaryMuscle, percentage: 70, isPrimary: true },
              ...(currentExercise.secondaryMuscles || []).map((m: string) => ({ muscle: m, percentage: 30, isPrimary: false })),
            ]).map((eng: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <span className="w-24 text-slate-300 font-medium truncate">{eng.muscle}</span>
                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${eng.isPrimary ? 'bg-emerald-400' : 'bg-teal-500/60'}`}
                    style={{ width: `${eng.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 w-8 text-right font-bold">{eng.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progressive Overload Hint */}
        {currentExercise.previousPerformance && (
          <div className="p-2.5 bg-teal-950/30 border border-teal-500/20 rounded-xl my-1 flex items-start space-x-2 text-xs text-teal-200">
            <Award className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <span>{currentExercise.previousPerformance.recommendedNote}</span>
          </div>
        )}

        {/* Set Tracker Table */}
        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 px-1">
            <span className="w-12">Set</span>
            <span className="flex-1 text-center">Weight (kg)</span>
            <span className="flex-1 text-center">Reps ({currentExercise.targetReps})</span>
            <span className="w-12 text-right">Done</span>
          </div>

          {currentSets.map((s, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                s.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              <span className="w-12 text-xs font-bold text-slate-300">Set {s.setNumber}</span>

              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  step="0.5"
                  value={s.weightKg}
                  onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-xl text-center py-1 text-xs text-white font-bold"
                />
              </div>

              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  value={s.reps}
                  onChange={(e) => handleRepsChange(idx, parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-xl text-center py-1 text-xs text-white font-bold"
                />
              </div>

              <div className="w-12 flex justify-end">
                <button
                  onClick={() => handleToggleSet(idx)}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition ${
                    s.completed
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600 text-transparent hover:border-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddSet}
            className="w-full py-2 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Additional Set</span>
          </button>
        </div>

        {/* Navigation & Finish Bar */}
        <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between space-x-2">
          <button
            onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeExerciseIndex === 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-bold flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {!isLastExercise ? (
            <button
              onClick={() => setActiveExerciseIndex((prev) => Math.min(workoutPlan.exercises.length - 1, prev + 1))}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1 shadow-lg shadow-emerald-500/20"
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishWorkout}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-xl shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving Session...' : 'Complete Workout Session'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
