import { useState, useEffect } from 'react';
import { Dumbbell, Flame, Clock, CheckCircle2, Award, Play, Info } from 'lucide-react';
import { WorkoutPlan } from '../types';
import { workoutApi, exerciseApi } from '../services/api';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface Props {
  onLogSuccess?: () => void;
}

export const WorkoutScreen = ({ onLogSuccess }: Props) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [dbExerciseMap, setDbExerciseMap] = useState<Record<string, string>>({});

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    loadTodayWorkout();
    loadCatalogExercises();
  }, [selectedDay]);

  const loadCatalogExercises = async () => {
    try {
      const res = await exerciseApi.getExercises();
      if (res.success && res.data) {
        const map: Record<string, string> = {};
        res.data.forEach((ex: any) => {
          map[ex.name.toLowerCase()] = ex._id;
        });
        setDbExerciseMap(map);
      }
    } catch (e) {
      console.error('Catalog fetch error:', e);
    }
  };

  const loadTodayWorkout = async () => {
    try {
      setLoading(true);
      const res = await workoutApi.getTodayWorkout(selectedDay || undefined);
      if (res.success && res.data) {
        setWorkoutPlan(res.data.workoutPlan);
        setIsCompletedToday(res.data.isCompletedToday);
        if (res.data.todayLog) {
          setCompletedExercises(res.data.todayLog.completedExercises || []);
        }
      }
    } catch (err) {
      console.error('Failed loading workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = (exerciseName: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseName)
        ? prev.filter((name) => name !== exerciseName)
        : [...prev, exerciseName]
    );
  };

  const handleCompleteWorkout = async () => {
    if (!workoutPlan) return;
    try {
      setSubmitting(true);
      await workoutApi.completeWorkout({
        workoutPlanId: workoutPlan._id,
        workoutTitle: workoutPlan.title,
        completedExercises: completedExercises.length > 0 ? completedExercises : workoutPlan.exercises.map((e) => e.name),
        durationMinutes: workoutPlan.estimatedDurationMin,
        caloriesBurned: workoutPlan.totalCaloriesBurn,
      });

      setIsCompletedToday(true);
      if (onLogSuccess) onLogSuccess();
    } catch (err) {
      console.error('Failed logging workout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-900 text-white p-5 flex items-center justify-center space-x-2">
        <Dumbbell className="w-6 h-6 text-emerald-400 animate-bounce" />
        <span className="text-xs text-slate-400">Loading today's workout plan...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <span>Today's Workout</span>
          </h2>
          <p className="text-xs text-slate-400">Personalized routine supporting your fitness goal</p>
        </div>
        {isCompletedToday && (
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-xl text-xs flex items-center space-x-1 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        )}
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => {
          const isSelected = (selectedDay || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()) === d;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {workoutPlan ? (
        <>
          {/* Workout Overview Hero Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 rounded-2xl p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {workoutPlan.focusArea}
              </span>
              <span className="text-xs text-slate-400 capitalize font-medium">{workoutPlan.difficulty} Level</span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">{workoutPlan.title}</h3>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                <span className="text-xs font-bold text-white">{workoutPlan.estimatedDurationMin} mins</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                <Flame className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 block font-semibold">Est. Burn</span>
                <span className="text-xs font-bold text-amber-300">{workoutPlan.totalCaloriesBurn} kcal</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                <Award className="w-3.5 h-3.5 text-teal-300 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 block font-semibold">Exercises</span>
                <span className="text-xs font-bold text-teal-300">{workoutPlan.exercises.length} Exercises</span>
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exercise Routine</h4>

            {workoutPlan.exercises.map((ex, idx) => {
              const isChecked = completedExercises.includes(ex.name);
              const catalogId = dbExerciseMap[ex.name.toLowerCase()];

              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-slate-800/40 border-emerald-500/50'
                      : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div
                    onClick={() => handleToggleExercise(ex.name)}
                    className="flex items-center space-x-3.5 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                          : 'border-slate-600 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className={`text-sm font-bold transition-all ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                        {ex.name}
                      </h5>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="text-emerald-400 font-semibold">{ex.sets} Sets × {ex.reps} Reps</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {catalogId && (
                      <button
                        onClick={() => setSelectedExerciseId(catalogId)}
                        className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Exercise Demonstration & Instructions"
                      >
                        <Info className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">{ex.restSec || 60}s rest</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Workout Button */}
          <button
            onClick={handleCompleteWorkout}
            disabled={submitting || isCompletedToday}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xl transition-all ${
              isCompletedToday
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isCompletedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Today's Workout Session Completed!</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{completedExercises.length > 0 ? `Mark Completed (${completedExercises.length}/${workoutPlan.exercises.length})` : 'Start Workout Session'}</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="py-12 text-center text-slate-400 text-xs">
          No workout routine found for this day. Select another day above.
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExerciseId && (
        <ExerciseDetailModal exerciseId={selectedExerciseId} onClose={() => setSelectedExerciseId(null)} />
      )}
    </div>
  );
};
