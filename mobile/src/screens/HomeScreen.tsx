import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Dumbbell, Zap, CheckCircle2, ChevronRight, MapPin, RefreshCw, PlusCircle, Camera, RotateCcw, Compass, Navigation, Heart, Footprints, Moon, Activity, ArrowRightLeft, Bell } from 'lucide-react';
import { UserProfile, MealPlanItem, MealPlan, Region, User } from '../types';
import { SnapCheckModal } from '../components/SnapCheckModal';
import { LocationSettingsModal } from '../components/LocationSettingsModal';
import { RegionChangePromptModal } from '../components/RegionChangePromptModal';
import { ModifyMealModal } from '../components/ModifyMealModal';
import { WhatCanIEatModal } from '../components/WhatCanIEatModal';
import { CookFromKitchenModal } from '../components/CookFromKitchenModal';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { NotificationToast, ToastNotification } from '../components/NotificationToast';
import { NotificationSettingsModal } from '../components/NotificationSettingsModal';
import { healthApi, notificationApi } from '../services/api';
import { HealthService, HealthMetricData } from '../services/healthService';
import { socketClient } from '../services/socketClient';

interface Props {
  user?: User | null;
  profile: UserProfile | null;
  mealPlan: MealPlan | null;
  mealItems: MealPlanItem[];
  onToggleItem: (itemId: string, currentStatus: boolean) => void;
  onSelectFood: (foodId: string) => void;
  onGenerateNewPlan: () => void;
  onNavigateToTab: (tab: string) => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const HomeScreen: React.FC<Props> = ({
  user,
  profile,
  mealPlan,
  mealItems,
  onToggleItem,
  onSelectFood,
  onGenerateNewPlan,
  onNavigateToTab,
  onProfileUpdated,
}) => {
  const [isSnapCheckOpen, setIsSnapCheckOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [newRegionPromptData, setNewRegionPromptData] = useState<Region | null>(null);
  
  // Real Health Data State
  const [healthData, setHealthData] = useState<HealthMetricData | null>(null);
  const [syncingHealth, setSyncingHealth] = useState<boolean>(false);

  // Feature Modals State
  const [modifyItem, setModifyItem] = useState<MealPlanItem | null>(null);
  const [isModifyOpen, setIsModifyOpen] = useState<boolean>(false);
  const [isEatNowOpen, setIsEatNowOpen] = useState<boolean>(false);
  const [isCookKitchenOpen, setIsCookKitchenOpen] = useState<boolean>(false);

  // Real-Time Notification System State
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  useEffect(() => {
    loadTodayHealth();
    loadUnreadCount();

    // Register Service Worker for FCM / Web Push background notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((e) => console.log('SW register error:', e));
    }

    // Connect Socket.IO for real-time in-app alerts
    const token = localStorage.getItem('token') || '';
    const userId = user?.id || (user as any)?._id || '';
    socketClient.connect(userId, token);

    const unsubNew = socketClient.onNewNotification((notif) => {
      setActiveToast({
        id: notif.id || Date.now().toString(),
        title: notif.title,
        message: notif.message,
        category: notif.category || notif.type,
        soundType: notif.soundType || 'DEFAULT',
        link: notif.link,
      });
      setUnreadCount((prev) => prev + 1);
    });

    const unsubCount = socketClient.onUnreadCountChange((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubNew();
      unsubCount();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.success && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // quiet catch
    }
  };

  const loadTodayHealth = async () => {
    try {
      const res = await healthApi.getTodayHealth();
      if (res.success && res.data) {
        setHealthData(res.data);
      } else {
        setHealthData(null);
      }
    } catch (err) {
      console.log('No health metrics record yet');
      setHealthData(null);
    }
  };

  const handleSyncHealth = async () => {
    try {
      setSyncingHealth(true);
      const synced = await HealthService.syncTodayMetrics();
      setHealthData(synced);
    } catch (err) {
      console.error('Health sync error:', err);
    } finally {
      setSyncingHealth(false);
    }
  };

  const caloriesTarget = profile?.dailyCalorieTarget || 2100;
  const proteinTarget = profile?.dailyProteinTarget || 130;

  // Calculate consumed totals from completed items
  const completedItems = mealItems.filter((item) => item.isCompleted);
  const consumedCal = completedItems.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = completedItems.reduce((sum, item) => sum + Math.round(item.proteinG), 0);

  const calPct = Math.min(100, Math.round((consumedCal / caloriesTarget) * 100));
  const proteinPct = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const handleLocationUpdated = (updatedProfile: UserProfile, isRegionChanged: boolean, newRegion: Region) => {
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
    if (isRegionChanged) {
      setNewRegionPromptData(newRegion);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="group flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mb-0.5 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 px-2.5 py-1 rounded-xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile?.regionId?.city || 'Pune'}, {profile?.regionId?.state || 'Maharashtra'}</span>
            <span className="text-[10px] text-emerald-300 opacity-80 group-hover:opacity-100 font-bold ml-1">📍 Settings</span>
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Hello, <span className="text-emerald-400">{user?.name ? user.name.split(' ')[0] : 'Member'}</span> 👋
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 p-2.5 rounded-2xl flex items-center justify-center transition-all shadow-md"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onGenerateNewPlan}
            className="bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 p-2.5 rounded-2xl flex items-center space-x-1.5 text-xs font-bold transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* CORE PRODUCT QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsEatNowOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 p-3.5 rounded-2xl flex items-center space-x-3 shadow-lg shadow-emerald-500/20 transition-all font-extrabold text-xs col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-slate-950 text-sm">What Can I Eat Now?</span>
            <span className="text-[10px] text-slate-950/80 font-medium">Scored Local Meal Match</span>
          </div>
        </button>

        <button
          onClick={() => setIsSnapCheckOpen(true)}
          className="bg-slate-800 hover:bg-slate-750 border border-slate-700/80 p-3.5 rounded-2xl flex items-center space-x-3 shadow-lg transition-all font-bold text-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <span className="block font-bold text-white text-sm truncate">Snap Check 2.0</span>
            <span className="text-[10px] text-slate-400 font-medium">Photo Meal Scanner</span>
          </div>
        </button>

        <button
          onClick={() => setIsCookKitchenOpen(true)}
          className="bg-slate-800 hover:bg-slate-750 border border-slate-700/80 p-3.5 rounded-2xl flex items-center space-x-3 shadow-lg transition-all font-bold text-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left min-w-0">
            <span className="block font-bold text-white text-sm truncate">Cook From Kitchen</span>
            <span className="text-[10px] text-slate-400 font-medium">Pantry Recipe Match</span>
          </div>
        </button>
      </div>

      {/* TODAY'S HEALTH DATA WIDGET (Apple Health / Health Connect) */}
      <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/80 to-slate-900 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Today's Health Data</span>
          </h3>
          {healthData ? (
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced ({healthData.source?.replace('_', ' ') || 'real data'})</span>
            </span>
          ) : (
            <button
              onClick={handleSyncHealth}
              disabled={syncingHealth}
              className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${syncingHealth ? 'animate-spin' : ''}`} />
              <span>{syncingHealth ? 'Syncing...' : 'Sync Health Data'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <Footprints className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-sm font-extrabold text-white block">
              {healthData?.steps ? healthData.steps.toLocaleString() : '--'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Steps</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-sm font-extrabold text-white block">
              {healthData?.sleepHours ? `${healthData.sleepHours}h` : '--'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Sleep</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1 animate-pulse" />
            <span className="text-sm font-extrabold text-white block">
              {healthData?.restingHeartRate ? `${healthData.restingHeartRate} BPM` : '--'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Resting HR</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-sm font-extrabold text-white block">
              {healthData?.activeCalories ? `${healthData.activeCalories} kcal` : '--'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Active Cal</span>
          </div>
        </div>
      </div>

      {/* Today's Summary Nutrition Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Summary</h3>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Goal: {profile?.fitnessGoal ? profile.fitnessGoal.replace('_', ' ') : 'Weight Loss'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Calorie Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Calories</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-white">{consumedCal}</span>
              <span className="text-xs text-slate-400 font-medium">/ {caloriesTarget} kcal</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all" style={{ width: `${calPct}%` }} />
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Protein</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-white">{consumedProtein}g</span>
              <span className="text-xs text-slate-400 font-medium">/ {proteinTarget}g</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S WORKOUT PREVIEW CARD */}
      <div
        onClick={() => onNavigateToTab('workout')}
        className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer hover:border-emerald-500/60 transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Today's Workout Target</span>
            <h4 className="text-sm font-bold text-white">Chest & Triceps Hypertrophy</h4>
            <p className="text-xs text-slate-400">45 mins • 340 kcal estimated burn</p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-800 to-slate-800 border border-emerald-500/30 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xl">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5 fill-slate-950" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white flex items-center space-x-1">
            <span>Regional AI Solver Active</span>
          </h4>
          <p className="text-[11px] text-slate-300 truncate">5 regional meals generated for your preferences</p>
        </div>
        <button
          onClick={() => onNavigateToTab('meals')}
          className="text-xs text-emerald-400 font-bold flex items-center space-x-1 shrink-0 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/30"
        >
          <span>View Plan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Today's Meals Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Meals</h3>
          <span className="text-xs text-emerald-400 font-bold">{completedItems.length} / {mealItems.length} Logged</span>
        </div>

        {mealItems.length === 0 ? (
          <div className="bg-slate-800/60 border border-dashed border-slate-700 p-8 rounded-2xl text-center space-y-3">
            <Zap className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No active meal plan for today</p>
            <button
              onClick={onGenerateNewPlan}
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Generate AI Meal Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mealItems.map((item) => {
              const food = item.food;
              const isDone = item.isCompleted;

              return (
                <div
                  key={item._id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center space-x-3 shadow-md ${
                    isDone
                      ? 'bg-slate-800/40 border-slate-800 opacity-75'
                      : 'bg-slate-800 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={food?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                    alt={food?.name}
                    onClick={() => food && onSelectFood(food._id)}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0" onClick={() => food && onSelectFood(food._id)}>
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {item.mealType.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">• {item.quantityG}g</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate cursor-pointer hover:text-emerald-400">
                      {food?.name || 'Regional Meal'}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>🔥 {item.calories} kcal</span>
                      <span>💪 {item.proteinG}g P</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setModifyItem(item);
                        setIsModifyOpen(true);
                      }}
                      className="px-2 py-1.5 bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Modify</span>
                    </button>

                    <button
                      onClick={() => onToggleItem(item._id, !!item.isCompleted)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : <PlusCircle className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What Can I Eat Right Now Modal */}
      <WhatCanIEatModal
        isOpen={isEatNowOpen}
        onClose={() => setIsEatNowOpen(false)}
        onSuccess={() => onGenerateNewPlan()}
      />

      {/* Cook From Kitchen Modal */}
      <CookFromKitchenModal
        isOpen={isCookKitchenOpen}
        onClose={() => setIsCookKitchenOpen(false)}
        onSuccess={() => onGenerateNewPlan()}
      />

      {/* Modify Meal Modal */}
      <ModifyMealModal
        isOpen={isModifyOpen}
        item={modifyItem}
        onClose={() => setIsModifyOpen(false)}
        onSuccess={() => onGenerateNewPlan()}
      />

      {/* Snap Check Interactive Camera/Gallery Modal */}
      <SnapCheckModal
        isOpen={isSnapCheckOpen}
        onClose={() => setIsSnapCheckOpen(false)}
        onSuccess={() => onNavigateToTab('meals')}
      />

      {/* Location Settings Modal */}
      <LocationSettingsModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        profile={profile}
        onProfileUpdated={handleLocationUpdated}
        onOpenManualRegionPicker={() => onNavigateToTab('region')}
      />

      {/* New Region Detected Prompt Modal */}
      <RegionChangePromptModal
        isOpen={Boolean(newRegionPromptData)}
        onClose={() => setNewRegionPromptData(null)}
        newRegion={newRegionPromptData}
        onConfirmRegenerate={() => {
          onGenerateNewPlan();
          setNewRegionPromptData(null);
        }}
        onKeepCurrentPlan={() => {
          setNewRegionPromptData(null);
        }}
      />

      {/* Real-Time Notification Toast */}
      <NotificationToast
        toast={activeToast}
        onClose={() => setActiveToast(null)}
        onNavigate={(link) => {
          if (link.includes('workout')) onNavigateToTab('workouts');
          else if (link.includes('meal')) onNavigateToTab('meals');
          else if (link.includes('progress')) onNavigateToTab('progress');
        }}
      />

      {/* Real-Time Notification Center Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onOpenSettings={() => {
          setIsNotificationCenterOpen(false);
          setIsNotificationSettingsOpen(true);
        }}
        onNavigateDeepLink={(link) => {
          if (link.includes('workout')) onNavigateToTab('workouts');
          else if (link.includes('meal')) onNavigateToTab('meals');
          else if (link.includes('progress')) onNavigateToTab('progress');
        }}
      />

      {/* Notification Preferences Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />
    </div>
  );
};
