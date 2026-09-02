import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Search,
  Filter,
  Flame,
  Clock,
  Award,
  Play,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  Info,
  ChevronRight,
  Zap,
  Bookmark,
  History,
  ShieldCheck,
} from 'lucide-react';
import { workoutApi, exerciseApi } from '../services/api';
import { WorkoutPlan } from '../types';
import { CustomizeWorkoutModal } from '../components/CustomizeWorkoutModal';
import { LiveWorkoutTrackerModal } from '../components/LiveWorkoutTrackerModal';
import { ExerciseReplacementModal } from '../components/ExerciseReplacementModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AIWorkoutQueryModal } from '../components/AIWorkoutQueryModal';

interface Props {
  onLogSuccess?: () => void;
}

export const WorkoutStudioScreen: React.FC<Props> = ({ onLogSuccess }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'abs' | 'templates'>('today');

  // Today Workout State
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Exercise Library State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);

  // Modals state
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [isLiveTrackerOpen, setIsLiveTrackerOpen] = useState<boolean>(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState<boolean>(false);
  const [replacementSlotIndex, setReplacementSlotIndex] = useState<number>(0);
  const [replacementTargetId, setReplacementTargetId] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTodayWorkout();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'library') {
      loadLibraryExercises();
    }
  }, [activeTab, searchQuery, selectedMuscle, selectedEquipment]);

  const loadTodayWorkout = async () => {
    try {
      setLoading(true);
      const res = await workoutApi.getTodayWorkout();
      if (res.success && res.data) {
        setWorkoutPlan(res.data.workoutPlan);
        setIsCompletedToday(res.data.isCompletedToday);
      }
    } catch (err) {
      console.error('Failed loading workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLibraryExercises = async () => {
    try {
      setLibraryLoading(true);
      const res = await exerciseApi.searchExercises({
        q: searchQuery || undefined,
        muscle: selectedMuscle !== 'all' ? selectedMuscle : undefined,
        equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
      });
      if (res.success && res.data) {
        setLibraryExercises(res.data);
      }
    } catch (err) {
      console.error('Library search error:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await workoutApi.getTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Templates fetch error:', err);
    }
  };

  const handleGenerateAbs = async (durationMin: number) => {
    try {
      setLoading(true);
      const res = await workoutApi.generateAbsWorkout(durationMin);
      if (res.success && res.data) {
        setWorkoutPlan(res.data);
        setActiveTab('today');
      }
    } catch (err) {
      console.error('Generate abs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleExerciseReplace = (index: number, exerciseId: string) => {
    setReplacementSlotIndex(index);
    setReplacementTargetId(exerciseId);
    setIsReplacementModalOpen(true);
  };

  const handleApplyReplacement = (replacementCandidate: any) => {
    if (!workoutPlan || !workoutPlan.exercises) return;
    const updated = { ...workoutPlan };
    updated.exercises[replacementSlotIndex] = {
      exerciseId: replacementCandidate.exerciseId,
      name: replacementCandidate.name,
      primaryMuscle: replacementCandidate.primaryMuscle,
      secondaryMuscles: replacementCandidate.secondaryMuscles,
      equipment: replacementCandidate.equipment,
      difficulty: replacementCandidate.difficulty,
      sets: 3,
      targetReps: '10-12',
      restSeconds: 60,
      media: { url: replacementCandidate.mediaUrl },
    };
    setWorkoutPlan(updated);
  };

  const muscleOptions = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'quads', 'glutes', 'calves'];
  const equipmentOptions = ['all', 'Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight', 'EZ Bar'];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto pb-24 font-['Plus_Jakarta_Sans',sans-serif] no-scrollbar">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <span>NutriRegion Workout Studio</span>
          </h2>
          <p className="text-[11px] text-slate-400">Structured ACSM programming & equipment-aware exercise library</p>
        </div>

        <button
          onClick={() => setIsAIModalOpen(true)}
          className="p-2 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 hover:bg-teal-500/30 transition flex items-center space-x-1"
          title="Ask AI Workout Builder"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold hidden sm:inline">AI Builder</span>
        </button>
      </div>

      {/* Main Tab Navigation */}
      <div className="px-5 pt-3 flex space-x-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'today', label: "Today's Workout" },
          { id: 'library', label: 'Exercise Library' },
          { id: 'abs', label: 'Abs / Core Module' },
          { id: 'templates', label: 'Saved Templates' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TODAY'S WORKOUT */}
      {activeTab === 'today' && (
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center space-y-2">
              <Dumbbell className="w-7 h-7 text-emerald-400 animate-bounce" />
              <span>Loading today's workout plan...</span>
            </div>
          ) : workoutPlan ? (
            <>
              {/* Workout Hero Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-4 rounded-3xl space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
                    {workoutPlan.focusArea || 'Workout Routine'}
                  </span>
                  <button
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                  >
                    Customize Today's Workout
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{workoutPlan.title}</h3>
                  {workoutPlan.selectionReasoning && (
                    <p className="text-[11px] text-slate-400 mt-1">{workoutPlan.selectionReasoning}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
                    <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
                    <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                    <span className="text-xs font-bold text-white">{workoutPlan.estimatedDurationMin || 45} mins</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
                    <Flame className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
                    <span className="text-[10px] text-slate-400 block font-medium">Est. Burn</span>
                    <span className="text-xs font-bold text-amber-300">{workoutPlan.totalCaloriesBurn || 320} kcal</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
                    <Award className="w-4 h-4 text-teal-300 mx-auto mb-0.5" />
                    <span className="text-[10px] text-slate-400 block font-medium">Exercises</span>
                    <span className="text-xs font-bold text-teal-300">{workoutPlan.exercises?.length || 0} Movements</span>
                  </div>
                </div>
              </div>

              {/* Start Workout Primary Action */}
              <button
                onClick={() => setIsLiveTrackerOpen(true)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Today's Workout Tracker</span>
              </button>

              {/* Exercise Routine List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exercise Routine</h4>
                  <span className="text-[11px] text-slate-500">Tap exercise to view details or replace</span>
                </div>

                {workoutPlan.exercises.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group"
                  >
                    <div className="flex items-center space-x-3.5 flex-1">
                      <img
                        src={ex.media?.url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'}
                        alt={ex.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-white group-hover:text-emerald-300">{ex.name}</h5>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="text-emerald-400 font-semibold">{ex.sets || 3} Sets × {ex.targetReps || ex.reps || '10'}</span>
                          <span>•</span>
                          <span>{ex.equipment || 'Dumbbell'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleSingleExerciseReplace(idx, ex.exerciseId || ex._id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold flex items-center space-x-1 border border-slate-700"
                        title="Replace this exercise"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>

                      {ex.exerciseId && (
                        <button
                          onClick={() => setSelectedExerciseId(ex.exerciseId)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Info className="w-4 h-4 text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-slate-400">No workout active for today.</p>
              <button
                onClick={() => setIsCustomizeModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
              >
                Customize Workout Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY & SEARCH */}
      {activeTab === 'library' && (
        <div className="p-5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise 'back dumbbell', 'biceps machine', 'abs'..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Muscle Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Filter Muscle</span>
            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
              {muscleOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                    selectedMuscle === m
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Filter Equipment</span>
            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipment(eq)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                    selectedEquipment === eq
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Library Results List */}
          {libraryLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Searching exercises...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {libraryExercises.map((ex) => (
                <div
                  key={ex._id}
                  onClick={() => setSelectedExerciseId(ex._id)}
                  className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center space-x-3 cursor-pointer transition group"
                >
                  <img
                    src={ex.media?.url || ex.imageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'}
                    alt={ex.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300">{ex.name}</h5>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      <span className="text-emerald-400 font-semibold">{ex.primaryMuscle}</span> • {ex.equipment}
                    </div>
                    <span className="text-[9px] text-slate-500 capitalize">{ex.difficulty} difficulty</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ABS / CORE MODULE */}
      {activeTab === 'abs' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-2">
            <h3 className="text-sm font-bold text-white">Dedicated Abs & Core Studio</h3>
            <p className="text-xs text-slate-400">
              Select a quick core workout duration preset. Includes upper abs, lower abs, obliques, and anti-extension core exercises.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[10, 15, 20, 30].map((dur) => (
              <button
                key={dur}
                onClick={() => handleGenerateAbs(dur)}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-black text-white">{dur} Mins</span>
                  <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-semibold text-emerald-300">Abs / Core Routine</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Weighted crunches, raises & planks</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workout Templates</h3>
          {templates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              No saved templates. Customize a workout and save it as a template!
            </div>
          ) : (
            templates.map((tpl) => (
              <div key={tpl._id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{tpl.title}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {tpl.focusArea} • {tpl.estimatedDurationMin} mins • {tpl.exercises?.length || 0} exercises
                  </div>
                </div>
                <button
                  onClick={() => {
                    setWorkoutPlan(tpl);
                    setActiveTab('today');
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Load Routine
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <CustomizeWorkoutModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onWorkoutGenerated={(workout) => {
          setWorkoutPlan(workout);
          setActiveTab('today');
        }}
      />

      <LiveWorkoutTrackerModal
        isOpen={isLiveTrackerOpen}
        onClose={() => setIsLiveTrackerOpen(false)}
        workoutPlan={workoutPlan}
        onReplaceExercise={(index, exerciseId) => handleSingleExerciseReplace(index, exerciseId)}
        onWorkoutCompleted={() => {
          setIsCompletedToday(true);
          if (onLogSuccess) onLogSuccess();
        }}
      />

      <ExerciseReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => setIsReplacementModalOpen(false)}
        targetExerciseId={replacementTargetId}
        onSelectReplacement={handleApplyReplacement}
      />

      <AIWorkoutQueryModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onWorkoutGenerated={(workout) => {
          setWorkoutPlan(workout);
          setActiveTab('today');
        }}
      />

      {selectedExerciseId && (
        <ExerciseDetailModal exerciseId={selectedExerciseId} onClose={() => setSelectedExerciseId(null)} />
      )}
    </div>
  );
};
