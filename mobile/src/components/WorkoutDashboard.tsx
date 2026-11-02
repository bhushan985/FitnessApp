import React, { useState, useEffect } from 'react';
import { Play, Dumbbell, Flame, Clock, Zap, Sparkles, ChevronRight, Activity, Award, Footprints } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { healthApi } from '../services/api';

interface Props {
  user: any;
  workoutPlan: any;
  isCompletedToday: boolean;
  onStartWorkout: () => void;
  onCustomizeWorkout: () => void;
  onSelectQuickStart: (title: string, durationMin: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export const WorkoutDashboard: React.FC<Props> = ({
  user,
  workoutPlan,
  isCompletedToday,
  onStartWorkout,
  onCustomizeWorkout,
  onSelectQuickStart,
  onNavigateToTab,
}) => {
  const userName = user?.name ? user.name.split(' ')[0] : 'Friend';
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    healthApi.getDashboard()
      .then((res: any) => {
        if (isMounted && res.success && res.data) {
          setDashboardData(res.data);
        }
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, [user]);

  const workoutSummary = dashboardData?.summary?.workout || { count: 0, durationMinutes: 0, caloriesBurned: 0 };
  const stepsSummary = dashboardData?.summary?.steps || { current: 0, target: 10000 };

  const weeklyWorkouts = workoutSummary.count || 0;
  const weeklyTarget = 5;
  const burnedCalories = workoutSummary.caloriesBurned || 0;
  const totalDurationMin = workoutSummary.durationMinutes || 0;

  const currentSteps = stepsSummary.current || 0;
  const targetSteps = stepsSummary.target || 10000;
  const stepsProgress = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  const targetCalorieBurn = 700;
  const caloriesProgress = Math.min(100, Math.round((burnedCalories / targetCalorieBurn) * 100));
  const workoutsProgress = Math.min(100, Math.round((weeklyWorkouts / weeklyTarget) * 100));

  const title = workoutPlan?.title || 'Lower Body Strength';
  const difficulty = workoutPlan?.difficulty || 'Beginner';
  const duration = workoutPlan?.estimatedDurationMin || 32;
  const calories = workoutPlan?.totalCaloriesBurn || 210;
  const equipment = workoutPlan?.exercises?.[0]?.equipment || 'Dumbbells';

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Top Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white tracking-tight">Hi, {userName} 👋</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">Ready to train today?</h1>
          <p className="text-xs text-[#9AA8BA] mt-1 font-medium">Let's keep the momentum going!</p>
        </div>

        <button
          onClick={onCustomizeWorkout}
          className="p-2.5 rounded-2xl bg-[#0D1728] border border-[#1C2C46] text-[#00D084] hover:bg-[#152238] transition flex items-center space-x-1.5 shadow-lg"
          title="Customize Workout Plan"
        >
          <Sparkles className="w-4 h-4 text-[#00D084]" />
          <span className="text-xs font-semibold hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* TODAY'S WORKOUT Featured Hero Card */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Today's Workout</h2>
          <button
            onClick={onCustomizeWorkout}
            className="text-xs font-semibold text-[#00D084] hover:underline"
          >
            Modify Plan
          </button>
        </div>

        <div className="relative bg-gradient-to-br from-[#0D1728] via-[#111D30] to-[#0A1424] border border-[#1F2F4A] rounded-3xl p-5 shadow-2xl overflow-hidden group">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#00D084]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-2 max-w-[65%]">
              <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30">
                {difficulty}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">{title}</h3>
              <div className="flex items-center space-x-2 text-xs font-medium text-[#9AA8BA] flex-wrap gap-y-1">
                <span>{duration} min</span>
                <span>•</span>
                <span>{calories} kcal</span>
                <span>•</span>
                <span>{equipment}</span>
              </div>
            </div>

            {/* Fitness Illustration / Visual */}
            <div className="w-24 h-24 rounded-2xl bg-[#152238] border border-[#223555] flex items-center justify-center relative overflow-hidden shadow-inner flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80"
                alt="Fitness Training"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1728] via-transparent to-transparent" />
              <Dumbbell className="w-6 h-6 text-[#00D084] absolute bottom-2 right-2 drop-shadow-md" />
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-4 relative z-10">
            <button
              onClick={onStartWorkout}
              className="w-full py-3.5 px-5 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-sm rounded-2xl shadow-lg shadow-[#00D084]/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <span>{isCompletedToday ? 'Review Completed Session' : 'Start Workout'}</span>
              <Play className="w-4 h-4 fill-current stroke-none" />
            </button>
          </div>
        </div>
      </div>

      {/* YOUR PROGRESS Section */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Your Progress</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0D1728] border border-[#1A2A42] p-3.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-[#00D084] mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[10px] font-bold text-[#9AA8BA]">Workouts</span>
            </div>
            <div className="text-lg font-extrabold text-white">{weeklyWorkouts} / {weeklyTarget}</div>
            <span className="text-[9px] text-[#9AA8BA] font-medium">This Week</span>
          </div>

          <div className="bg-[#0D1728] border border-[#1A2A42] p-3.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-bold text-[#9AA8BA]">Calories</span>
            </div>
            <div className="text-lg font-extrabold text-white">{burnedCalories} <span className="text-xs font-semibold text-[#9AA8BA]">kcal</span></div>
            <span className="text-[9px] text-[#9AA8BA] font-medium">Target {targetCalorieBurn} kcal</span>
          </div>

          <div className="bg-[#0D1728] border border-[#1A2A42] p-3.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-teal-300 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold text-[#9AA8BA]">Duration</span>
            </div>
            <div className="text-lg font-extrabold text-white">{totalDurationMin} <span className="text-xs font-semibold text-[#9AA8BA]">min</span></div>
            <span className="text-[9px] text-[#9AA8BA] font-medium">{weeklyWorkouts} Sessions</span>
          </div>
        </div>
      </div>

      {/* ACTIVITY RINGS Section */}
      <div className="bg-[#0D1728] border border-[#1A2A42] rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#00D084]" />
            <span>Daily Activity Rings</span>
          </h2>
          <span className="text-[11px] font-semibold text-[#00D084]">Goal {Math.round((stepsProgress + caloriesProgress + workoutsProgress) / 3)}%</span>
        </div>

        <div className="flex items-center justify-around py-1">
          {/* Steps Ring */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={stepsProgress} color="#00D084" radius={34} strokeWidth={5} />
              <Footprints className="w-4 h-4 text-[#00D084] absolute" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white">{currentSteps.toLocaleString()}</div>
              <div className="text-[9px] text-[#9AA8BA]">/ {targetSteps.toLocaleString()} steps</div>
            </div>
          </div>

          {/* Active Calories Ring */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={caloriesProgress} color="#F59E0B" radius={34} strokeWidth={5} />
              <Flame className="w-4 h-4 text-amber-400 absolute" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white">{burnedCalories}</div>
              <div className="text-[9px] text-[#9AA8BA]">/ {targetCalorieBurn} kcal</div>
            </div>
          </div>

          {/* Workouts Ring */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={workoutsProgress} color="#3B82F6" radius={34} strokeWidth={5} />
              <Award className="w-4 h-4 text-blue-400 absolute" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white">{weeklyWorkouts} / {weeklyTarget}</div>
              <div className="text-[9px] text-[#9AA8BA]">workouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK START Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Quick Start</h2>
          <button
            onClick={() => onNavigateToTab('library')}
            className="text-xs font-semibold text-[#00D084] hover:underline flex items-center space-x-1"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { title: 'Full Body', duration: 20, tag: 'Cardio + Strength', color: 'from-[#0D1728] to-[#15253D]' },
            { title: 'HIIT Cardio', duration: 15, tag: 'High Intensity', color: 'from-[#0D1728] to-[#1F2B3E]' },
            { title: 'Abs & Core', duration: 10, tag: 'Targeted Core', color: 'from-[#0D1728] to-[#142636]' },
            { title: 'Stretching', duration: 15, tag: 'Mobility & Recovery', color: 'from-[#0D1728] to-[#17283B]' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuickStart(item.title, item.duration)}
              className={`bg-gradient-to-br ${item.color} border border-[#1F2F4A] hover:border-[#00D084]/50 p-4 rounded-2xl text-left transition-all group flex flex-col justify-between space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#9AA8BA] bg-[#030B16]/60 px-2 py-0.5 rounded-lg border border-[#1E2E48]">
                  {item.duration} min
                </span>
                <Zap className="w-4 h-4 text-[#00D084] group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#00D084] transition-colors">{item.title}</h3>
                <p className="text-[10px] text-[#9AA8BA] mt-0.5">{item.tag}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
