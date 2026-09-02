import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Utensils,
  Dumbbell,
  Scale,
  Droplets,
  Footprints,
  Moon,
  Pill,
  Sparkles,
  Camera,
  Plus,
  Minus,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Settings,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import { healthApi, foodLogApi } from '../services/api';
import { DailyHealthSummaryData, User, UserProfile } from '../types';
import { TrackFoodCard } from '../components/TrackFoodCard';
import { AddFoodModal } from '../components/AddFoodModal';
import { AddTrackerBottomSheet } from '../components/AddTrackerBottomSheet';

import { WaterTrackerModal } from '../components/WaterTrackerModal';
import { WeightTrackerModal } from '../components/WeightTrackerModal';
import { SleepTrackerModal } from '../components/SleepTrackerModal';
import { MedicineTrackerModal } from '../components/MedicineTrackerModal';
import { StepsTrackerModal } from '../components/StepsTrackerModal';
import { AIHealthAssistantModal } from '../components/AIHealthAssistantModal';
import { TrackerSettingsModal } from '../components/TrackerSettingsModal';

interface Props {
  user: User | null;
  profile: UserProfile | null;
  onNavigateToTab: (tab: string) => void;
  onOpenSnapCheck?: () => void;
  onOpenFoodSearch?: () => void;
}

export const HealthDashboardScreen: React.FC<Props> = ({
  user,
  profile,
  onNavigateToTab,
  onOpenSnapCheck,
  onOpenFoodSearch,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [data, setData] = useState<DailyHealthSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAddSheetOpen, setIsAddSheetOpen] = useState<boolean>(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState<boolean>(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState<boolean>(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState<boolean>(false);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Consumed Food Log State
  const [consumedSummary, setConsumedSummary] = useState({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  });
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadDashboard(selectedDate);
    loadFoodLogs(selectedDate);
  }, [selectedDate]);

  const loadFoodLogs = async (dateStr: string) => {
    try {
      const res = await foodLogApi.getTodayLogs(dateStr);
      if (res.success && res.data) {
        setConsumedSummary(res.data.totalConsumed || { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 });
        setTodayLogs(res.data.logs || []);
      }
      const recentsRes = await foodLogApi.getRecentFoods();
      if (recentsRes.success && recentsRes.data) {
        setRecentFoods(recentsRes.data || []);
      }
    } catch (err) {
      console.error('Failed loading food logs:', err);
    }
  };

  const handleDeleteFoodLog = async (logId: string) => {
    try {
      await foodLogApi.deleteLog(logId);
      loadFoodLogs(selectedDate);
    } catch (err) {
      console.error('Failed deleting log:', err);
    }
  };

  const handleQuickLogFood = async (foodName: string, grams: number, nutrition: any) => {
    try {
      await foodLogApi.logFood({
        foodName,
        grams,
        nutrition,
        quantity: 1,
        unit: 'grams',
        mealType: 'snack',
      });
      loadFoodLogs(selectedDate);
    } catch (err) {
      console.error('Failed quick logging food:', err);
    }
  };

  const loadDashboard = async (dateStr: string) => {

    try {
      setLoading(true);
      const res = await healthApi.getDashboard(dateStr);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWaterAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await healthApi.logWater({ action: 'add' });
      loadDashboard(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickWaterSub = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await healthApi.logWater({ action: 'subtract' });
      loadDashboard(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOptionFromSheet = (option: string) => {
    if (option === 'food') {
      if (onOpenFoodSearch) onOpenFoodSearch();
      else onNavigateToTab('meals');
    } else if (option === 'workout') {
      onNavigateToTab('workout');
    } else if (option === 'water') {
      setIsWaterModalOpen(true);
    } else if (option === 'weight') {
      setIsWeightModalOpen(true);
    } else if (option === 'steps') {
      setIsStepsModalOpen(true);
    } else if (option === 'sleep') {
      setIsSleepModalOpen(true);
    } else if (option === 'medicine') {
      setIsMedicineModalOpen(true);
    } else if (option === 'ai') {
      setIsAIModalOpen(true);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const dateLabel = isToday
    ? 'Today'
    : selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
    ? 'Yesterday'
    : selectedDate;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto pb-24 no-scrollbar">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            onClick={() => onNavigateToTab('profile')}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm cursor-pointer shadow-md shadow-emerald-500/20 overflow-hidden border border-emerald-400/40"
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'N'}</span>
            )}
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Health Tracking Hub</div>
            <div className="text-sm font-bold text-white flex items-center space-x-1">
              <span>{data?.user?.greeting || `Hello, ${user?.name || 'Friend'}`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Date Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-30 space-y-1">
                <button
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setShowDatePicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-800 text-slate-200"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    setSelectedDate(yest);
                    setShowDatePicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-800 text-slate-200"
                >
                  Yesterday
                </button>
                <div className="px-3 py-1 border-t border-slate-800 text-[10px] text-slate-500">Pick date:</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Zap className="w-8 h-8 text-emerald-400 animate-bounce" />
          <span className="text-xs text-slate-400 font-medium">Aggregating NutriRegion daily health dashboard...</span>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* PRIMARY TRACK FOOD HERO CARD */}
          <TrackFoodCard
            targetCalories={profile?.dailyCalorieTarget || 2200}
            consumedSummary={consumedSummary}
            targets={{
              protein: profile?.dailyProteinTarget || 120,
              carbs: profile?.dailyCarbsTarget || 250,
              fat: profile?.dailyFatTarget || 65,
              fiber: 30,
            }}
            recentFoods={recentFoods}
            favorites={[]}
            todayLogs={todayLogs}
            onOpenSnapCheck={() => {
              if (onOpenSnapCheck) onOpenSnapCheck();
            }}
            onOpenSearch={() => {
              if (onOpenFoodSearch) onOpenFoodSearch();
              else onNavigateToTab('meals');
            }}
            onOpenAddFood={() => setIsAddFoodModalOpen(true)}
            onQuickLogFood={handleQuickLogFood}
            onDeleteLog={handleDeleteFoodLog}
          />

          {/* Daily Compact Summary Bar */}
          {data?.summary && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-4 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white tracking-wide uppercase">Today's Progress</span>
                <span className="text-[11px] text-emerald-400 font-semibold">{data.summary.calories.percentage}% Calories</span>
              </div>

              {/* Calories Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4 p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${data.summary.calories.percentage}%` }}
                />
              </div>

              {/* Quick Macro & Metric Chips */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-400">Calories</div>
                  <div className="text-xs font-black text-white mt-0.5">{data.summary.calories.consumed}</div>
                  <div className="text-[9px] text-slate-500">/ {data.summary.calories.target}</div>
                </div>

                <div className="bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-400">Protein</div>
                  <div className="text-xs font-black text-emerald-400 mt-0.5">{data.summary.protein.consumed}g</div>
                  <div className="text-[9px] text-slate-500">/ {data.summary.protein.target}g</div>
                </div>

                <div className="bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-400">Water</div>
                  <div className="text-xs font-black text-sky-400 mt-0.5">{data.summary.water.glasses} gl</div>
                  <div className="text-[9px] text-slate-500">/ {data.summary.water.targetGlasses} gl</div>
                </div>

                <div className="bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-400">Steps</div>
                  <div className="text-xs font-black text-purple-400 mt-0.5">{data.summary.steps.current}</div>
                  <div className="text-[9px] text-slate-500">/ {data.summary.steps.target}</div>
                </div>
              </div>
            </div>
          )}

          {/* NutriRegion Health Score Card */}
          {data?.healthScore && (
            <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>NutriRegion Wellness Score</span>
                </div>
                <div className="text-2xl font-black text-white">{data.healthScore.total} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                <div className="text-[11px] text-slate-400 mt-0.5">{data.healthScore.label}</div>
              </div>

              <div className="flex space-x-1">
                {Object.entries(data.healthScore.breakdown).map(([k, v]) => (
                  <div key={k} className="flex flex-col items-center">
                    <div className="w-2 bg-slate-800 h-10 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className="bg-emerald-400 w-full rounded-full" style={{ height: `${(v / 30) * 100}%` }} />
                    </div>
                    <span className="text-[8px] text-slate-500 capitalize mt-1">{k.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automated Health Insights */}
          {data?.insights && data.insights.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200 leading-relaxed">
                {data.insights[0]}
              </div>
            </div>
          )}

          {/* Section: Your Trackers */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Your Trackers</h3>
              <button
                onClick={() => setIsAddSheetOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tracker</span>
              </button>
            </div>

            {/* Tracker Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Food Tracker Card */}
              {data?.summary?.calories && (
                <div
                  onClick={() => onNavigateToTab('meals')}
                  className="bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300">Food & Meals</div>
                        <div className="text-[10px] text-slate-400">{data.summary.calories.consumed} / {data.summary.calories.target} kcal</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {onOpenSnapCheck && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSnapCheck();
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                          title="Snap Check photo log"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Macro Progress Rings / Bars */}
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Protein ({data.summary.protein.consumed}g)</span>
                      <span className="text-emerald-400 font-semibold">{data.summary.protein.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${data.summary.protein.percentage}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Workout Tracker Card */}
              {data?.summary?.workout && (
                <div
                  onClick={() => onNavigateToTab('workout')}
                  className="bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300">Workout Tracker</div>
                        <div className="text-[10px] text-slate-400">
                          {data.summary.workout.completed
                            ? `${data.summary.workout.durationMinutes} min • ${data.summary.workout.caloriesBurned} kcal burned`
                            : 'No workout logged today'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{data.summary.workout.completed ? 'Session Completed' : 'Tap to start today\'s workout'}</span>
                  </div>
                </div>
              )}

              {/* 3. Weight Tracker Card */}
              {data?.summary?.weight && (
                <div
                  onClick={() => setIsWeightModalOpen(true)}
                  className="bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300">Body Weight</div>
                        <div className="text-[10px] text-slate-400">Goal: {data.summary.weight.targetKg} kg</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-black text-white">{data.summary.weight.currentKg} <span className="text-xs font-normal">kg</span></span>
                    <span className="text-xs font-bold text-cyan-400">{data.summary.weight.changeKg > 0 ? `+${data.summary.weight.changeKg}` : data.summary.weight.changeKg} kg</span>
                  </div>
                </div>
              )}

              {/* 4. Water Tracker Card */}
              {data?.summary?.water && (
                <div
                  onClick={() => setIsWaterModalOpen(true)}
                  className="bg-slate-900 border border-slate-800/80 hover:border-sky-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-sky-300">Water Intake</div>
                        <div className="text-[10px] text-slate-400">{data.summary.water.amountMl} / {data.summary.water.targetMl} ml</div>
                      </div>
                    </div>

                    {/* Quick +/- Increments directly on card */}
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={handleQuickWaterSub}
                        className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-sky-300 px-1">{data.summary.water.glasses}</span>
                      <button
                        onClick={handleQuickWaterAdd}
                        className="p-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${data.summary.water.percentage}%` }} />
                  </div>
                </div>
              )}

              {/* 5. Steps Tracker Card */}
              {data?.summary?.steps && (
                <div
                  onClick={() => setIsStepsModalOpen(true)}
                  className="bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">Steps & Activity</div>
                        <div className="text-[10px] text-slate-400">{data.summary.steps.distanceKm} km • {data.summary.steps.caloriesBurned} kcal</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-white">{data.summary.steps.current.toLocaleString()}</span>
                    <span className="text-xs text-purple-400 font-semibold">/ {data.summary.steps.target.toLocaleString()} steps</span>
                  </div>
                </div>
              )}

              {/* 6. Sleep Tracker Card */}
              {data?.summary?.sleep && (
                <div
                  onClick={() => setIsSleepModalOpen(true)}
                  className="bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 p-4 rounded-3xl cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300">Sleep Goal</div>
                        <div className="text-[10px] text-slate-400">{data.summary.sleep.bedtime} – {data.summary.sleep.wakeTime}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-white">{data.summary.sleep.hours} <span className="text-xs font-normal">hrs</span></span>
                    <span className="text-xs text-indigo-300 font-semibold">Goal: {data.summary.sleep.targetHours}h</span>
                  </div>
                </div>
              )}

              {/* 7. Medicine Tracker Card */}
              {data?.medicineReminders && (
                <div
                  onClick={() => setIsMedicineModalOpen(true)}
                  className="bg-slate-900 border border-slate-800/80 hover:border-rose-500/40 p-4 rounded-3xl cursor-pointer transition group col-span-1 sm:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rose-300">Medicine & Reminders</div>
                        <div className="text-[10px] text-slate-400">
                          {data.medicineReminders.length > 0
                            ? `${data.medicineReminders.filter((m) => m.status === 'taken').length} of ${data.medicineReminders.length} taken today`
                            : 'No medications set for today'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Health Assistant Trigger */}
      <button
        onClick={() => setIsAIModalOpen(true)}
        className="fixed bottom-20 right-5 z-30 p-3.5 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition"
        title="Ask NutriRegion AI"
      >
        <Sparkles className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Modals */}
      <AddTrackerBottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSelectOption={handleSelectOptionFromSheet}
      />

      <WaterTrackerModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        currentAmountMl={data?.summary?.water?.amountMl || 0}
        targetMl={data?.summary?.water?.targetMl || 2000}
        glasses={data?.summary?.water?.glasses || 0}
        targetGlasses={data?.summary?.water?.targetGlasses || 8}
        onUpdate={() => loadDashboard(selectedDate)}
      />

      <WeightTrackerModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        currentWeightKg={data?.summary?.weight?.currentKg || 70}
        targetWeightKg={data?.summary?.weight?.targetKg || 68}
        changeKg={data?.summary?.weight?.changeKg || 0}
        onUpdate={() => loadDashboard(selectedDate)}
      />

      <SleepTrackerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        sleepHours={data?.summary?.sleep?.hours || 0}
        targetHours={data?.summary?.sleep?.targetHours || 8}
        bedtime={data?.summary?.sleep?.bedtime || '23:30'}
        wakeTime={data?.summary?.sleep?.wakeTime || '07:30'}
        onUpdate={() => loadDashboard(selectedDate)}
      />

      <MedicineTrackerModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        medicineReminders={data?.medicineReminders || []}
        onUpdate={() => loadDashboard(selectedDate)}
      />

      <StepsTrackerModal
        isOpen={isStepsModalOpen}
        onClose={() => setIsStepsModalOpen(false)}
        steps={data?.summary?.steps?.current || 0}
        target={data?.summary?.steps?.target || 8000}
        distanceKm={data?.summary?.steps?.distanceKm || 0}
        caloriesBurned={data?.summary?.steps?.caloriesBurned || 0}
        activeMinutes={data?.summary?.steps?.activeMinutes || 0}
        appleHealthConnected={data?.healthIntegrationStatus?.appleHealthConnected || false}
        healthConnectConnected={data?.healthIntegrationStatus?.healthConnectConnected || false}
        onUpdate={() => loadDashboard(selectedDate)}
      />

      <AIHealthAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onLoggedSuccess={() => loadFoodLogs(selectedDate)}
      />

      <TrackerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdate={() => loadDashboard(selectedDate)}
      />
    </div>
  );
};

