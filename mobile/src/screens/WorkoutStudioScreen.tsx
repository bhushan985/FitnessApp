import React, { useState, useEffect } from 'react';
import { Dumbbell, Sparkles, LayoutDashboard, Calendar, Search, Activity } from 'lucide-react';
import { workoutApi } from '../services/api';
import { WorkoutDashboard } from '../components/WorkoutDashboard';
import { MyRoutineScreen } from '../components/MyRoutineScreen';
import { WorkoutLibraryScreen } from '../components/WorkoutLibraryScreen';
import { CategoryWorkoutListScreen } from '../components/CategoryWorkoutListScreen';
import { WorkoutDetailsScreen } from '../components/WorkoutDetailsScreen';
import { ActivityTrackerScreen } from '../components/ActivityTrackerScreen';
import { CustomizeWorkoutModal } from '../components/CustomizeWorkoutModal';
import { LiveWorkoutTrackerModal } from '../components/LiveWorkoutTrackerModal';
import { ExerciseReplacementModal } from '../components/ExerciseReplacementModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AIWorkoutQueryModal } from '../components/AIWorkoutQueryModal';

interface Props {
  onLogSuccess?: () => void;
}

export const WorkoutStudioScreen: React.FC<Props> = ({ onLogSuccess }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'routine' | 'library' | 'activity'>('dashboard');

  // Selected Category / Workout Details View State
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string | null>(null);
  const [selectedWorkoutDetails, setSelectedWorkoutDetails] = useState<any | null>(null);

  // Today Workout Plan State
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

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
  }, []);

  const loadTodayWorkout = async (day?: string) => {
    try {
      setLoading(true);
      const res = await workoutApi.getTodayWorkout(day);
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

  const handleSelectQuickStart = async (title: string, durationMin: number) => {
    try {
      setLoading(true);
      const res = await workoutApi.generateWorkout({
        goal: title.toLowerCase().includes('abs') ? 'fat_loss' : 'hypertrophy',
        durationMin,
      });
      if (res.success && res.data) {
        setWorkoutPlan(res.data);
        setIsLiveTrackerOpen(true);
      }
    } catch (err) {
      console.error('Quick start error:', err);
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
      equipment: replacementCandidate.equipment,
      difficulty: replacementCandidate.difficulty,
      sets: 3,
      targetReps: '10-12',
      restSeconds: 60,
      media: { url: replacementCandidate.mediaUrl },
    };
    setWorkoutPlan(updated);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#030B16] text-white overflow-hidden font-['Inter',sans-serif]">
      {/* Top Fixed Header */}
      <div className="sticky top-0 z-20 bg-[#030B16]/95 backdrop-blur-md px-5 py-3 border-b border-[#14233A] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00D084]/20 border border-[#00D084]/30 text-[#00D084] flex items-center justify-center">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight leading-tight">NutriRegion Workout</h2>
            <p className="text-[10px] text-[#9AA8BA] font-medium">Personalized fitness & ACSM guidance</p>
          </div>
        </div>

        <button
          onClick={() => setIsAIModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#0D1728] border border-[#00D084]/40 text-[#00D084] hover:bg-[#152238] transition flex items-center space-x-1.5 shadow"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-xs font-bold hidden sm:inline">AI Builder</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="bg-[#0D1728] border-b border-[#1A2A42] px-3 py-2 flex items-center space-x-1 overflow-x-auto no-scrollbar flex-shrink-0">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'routine', label: 'My Routine', icon: Calendar },
          { id: 'library', label: 'Workout Library', icon: Search },
          { id: 'activity', label: 'Activity Tracking', icon: Activity },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id && !selectedCategoryTitle && !selectedWorkoutDetails;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategoryTitle(null);
                setSelectedWorkoutDetails(null);
                setActiveSubTab(tab.id as any);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#00D084] text-[#030B16] shadow-md shadow-[#00D084]/20 font-extrabold'
                  : 'text-[#9AA8BA] hover:text-white hover:bg-[#152238]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable View Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
        {selectedWorkoutDetails ? (
          <WorkoutDetailsScreen
            workout={selectedWorkoutDetails}
            onBack={() => setSelectedWorkoutDetails(null)}
            onStartWorkoutSession={(wk) => {
              setWorkoutPlan(wk);
              setIsLiveTrackerOpen(true);
            }}
          />
        ) : selectedCategoryTitle ? (
          <CategoryWorkoutListScreen
            categoryTitle={selectedCategoryTitle}
            onBack={() => setSelectedCategoryTitle(null)}
            onSelectWorkout={(wk) => setSelectedWorkoutDetails(wk)}
          />
        ) : activeSubTab === 'dashboard' ? (
          <WorkoutDashboard
            user={user}
            workoutPlan={workoutPlan}
            isCompletedToday={isCompletedToday}
            onStartWorkout={() => setIsLiveTrackerOpen(true)}
            onCustomizeWorkout={() => setIsCustomizeModalOpen(true)}
            onSelectQuickStart={handleSelectQuickStart}
            onNavigateToTab={(tab) => setActiveSubTab(tab as any)}
          />
        ) : activeSubTab === 'routine' ? (
          <MyRoutineScreen
            onStartWorkoutForDay={(dayKey) => {
              loadTodayWorkout(dayKey);
              setIsLiveTrackerOpen(true);
            }}
            onCreatePersonalRoutine={() => setIsCustomizeModalOpen(true)}
          />
        ) : activeSubTab === 'library' ? (
          <WorkoutLibraryScreen
            onSelectCategory={(categoryTitle) => setSelectedCategoryTitle(categoryTitle)}
          />
        ) : activeSubTab === 'activity' ? (
          <ActivityTrackerScreen
            onActivityLogged={() => {
              if (onLogSuccess) onLogSuccess();
            }}
          />
        ) : null}
      </div>

      {/* Modals */}
      <CustomizeWorkoutModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onWorkoutGenerated={(workout) => {
          setWorkoutPlan(workout);
          setSelectedWorkoutDetails(null);
          setSelectedCategoryTitle(null);
          setActiveSubTab('dashboard');
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
          setSelectedWorkoutDetails(null);
          setSelectedCategoryTitle(null);
          setActiveSubTab('dashboard');
        }}
      />

      {selectedExerciseId && (
        <ExerciseDetailModal exerciseId={selectedExerciseId} onClose={() => setSelectedExerciseId(null)} />
      )}
    </div>
  );
};
