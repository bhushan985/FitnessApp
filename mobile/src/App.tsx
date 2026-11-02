import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { RegionScreen } from './screens/RegionScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';
import { GoalScreen } from './screens/GoalScreen';
import { HealthDashboardScreen } from './screens/HealthDashboardScreen';
import { MealPlanScreen } from './screens/MealPlanScreen';
import { SearchMealsScreen } from './screens/SearchMealsScreen';
import { WorkoutStudioScreen } from './screens/WorkoutStudioScreen';


import { FoodDetailsScreen } from './screens/FoodDetailsScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { TrainerScreen } from './screens/TrainerScreen';
import { TrialBanner } from './components/TrialBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { Navigation } from './components/Navigation';
import { SnapCheckModal } from './components/SnapCheckModal';
import { AddTrackerBottomSheet } from './components/AddTrackerBottomSheet';
import { authApi, profileApi, mealPlanApi, subscriptionApi } from './services/api';
import { UserProfile, Region, MealPlanItem, MealPlan, User } from './types';

export const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>('onboarding');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [isSnapCheckOpen, setIsSnapCheckOpen] = useState<boolean>(false);
  const [isAddTrackerSheetOpen, setIsAddTrackerSheetOpen] = useState<boolean>(false);


  // App Data State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [dietType, setDietType] = useState<'veg' | 'non_veg' | 'eggetarian' | 'vegan'>('veg');
  const [foodPreferences, setFoodPreferences] = useState<string[]>(['Rice', 'Dal', 'Poha', 'Sprouts', 'Paneer']);
  const [allergies, setAllergies] = useState<string[]>(['Peanuts']);

  const [fitnessGoal, setFitnessGoal] = useState<'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance'>('weight_loss');
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([]);
  const [mealsSubTab, setMealsSubTab] = useState<'search' | 'plans'>('search');
  const [loadingGoalSubmit, setLoadingGoalSubmit] = useState(false);


  // Subscription & Trial State
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(30);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(true);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState<boolean>(false);

  useEffect(() => {
    initAuthAndData();
  }, []);

  const initAuthAndData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const meRes = await authApi.getMe();
        if (meRes.success && meRes.data) {
          setUser(meRes.data);
          loadUserProfile();
          loadSubscriptionInfo();
          setCurrentScreen('main');
          return;
        }
      }
      // If no valid session, land on account creation / login
      setCurrentScreen('auth');
    } catch (err) {
      console.error('Failed init auth:', err);
      setCurrentScreen('auth');
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      const res = await subscriptionApi.getMySubscription();
      if (res.success && res.data) {
        setTrialDaysRemaining(res.data.trialDaysRemaining || 0);
        setIsTrialActive(res.data.isTrialActive);
        setIsSubscriptionExpired(res.data.isExpired);
      }
    } catch (err) {
      console.error('Subscription info fetch error:', err);
    }
  };

  const loadUserProfile = async () => {
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        if (res.data.regionId) setSelectedRegion(res.data.regionId);
        if (res.data.dietType) setDietType(res.data.dietType);
        if (res.data.foodPreferences) setFoodPreferences(res.data.foodPreferences);
        if (res.data.allergies) setAllergies(res.data.allergies);
        if (res.data.weightKg) setWeightKg(res.data.weightKg);
        if (res.data.heightCm) setHeightCm(res.data.heightCm);
        if (res.data.targetWeightKg) setTargetWeightKg(res.data.targetWeightKg);
        if (res.data.fitnessGoal) setFitnessGoal(res.data.fitnessGoal);

        loadTodayMealPlan();
      }
    } catch (err) {
      console.log('Profile setup required');
    }
  };

  const handleAuthSuccess = async (authUser: User) => {
    setUser(authUser);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        loadTodayMealPlan();
        loadSubscriptionInfo();
        setCurrentScreen('main');
        setActiveTab('home');
      } else {
        setCurrentScreen('onboarding');
      }
    } catch (err) {
      setCurrentScreen('onboarding');
    }
  };

  const loadTodayMealPlan = async () => {
    try {
      const res = await mealPlanApi.getTodayPlan();
      if (res.success && res.data) {
        setMealPlan(res.data.mealPlan);
        setMealItems(res.data.items || []);
        if (res.data.mealPlan?.dietType) {
          setDietType(res.data.mealPlan.dietType as any);
        }
      }
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      const res = await mealPlanApi.generatePlan(dietType);
      if (res.success && res.data) {
        setMealPlan(res.data.mealPlan);
        setMealItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
    }
  };

  const handleGoalSubmit = async () => {
    try {
      setLoadingGoalSubmit(true);
      await profileApi.updateProfile({
        gender: 'male',
        heightCm,
        weightKg,
        activityLevel,
        fitnessGoal,
        targetWeightKg,
        dietType,
        allergies,
        foodPreferences,
        regionId: selectedRegion?._id,
      });

      await handleGeneratePlan();
      setCurrentScreen('main');
      setActiveTab('home');
    } catch (err) {
      console.error('Goal submission error:', err);
    } finally {
      setLoadingGoalSubmit(false);
    }
  };

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setMealItems((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, isCompleted: newStatus } : i))
      );
      await mealPlanApi.updateItemStatus(itemId, newStatus);
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleSelectFood = (foodId: string) => {
    setSelectedFoodId(foodId);
    setCurrentScreen('food-details');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen('main');
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Offline & Trial Status Banners */}
      <OfflineBanner />

      {currentScreen === 'main' && (
        <TrialBanner
          trialDaysRemaining={trialDaysRemaining}
          isTrialActive={isTrialActive}
          isExpired={isSubscriptionExpired}
          onUpgrade={() => setCurrentScreen('subscription')}
        />
      )}

      {/* Screen Render Router */}
      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          onGetStarted={() => {
            loadUserProfile();
            setCurrentScreen('region');
          }}
        />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onSkipDemo={() => setCurrentScreen('onboarding')}
        />
      )}

      {currentScreen === 'region' && (
        <RegionScreen
          selectedRegion={selectedRegion}
          onSelectRegion={(reg) => setSelectedRegion(reg)}
          onNext={() => setCurrentScreen('preferences')}
        />
      )}

      {currentScreen === 'preferences' && (
        <PreferencesScreen
          dietType={dietType}
          onChangeDietType={(dt) => setDietType(dt)}
          foodPreferences={foodPreferences}
          onChangeFoodPreferences={(prefs) => setFoodPreferences(prefs)}
          allergies={allergies}
          onChangeAllergies={(all) => setAllergies(all)}
          onNext={() => setCurrentScreen('goals')}
        />
      )}

      {currentScreen === 'goals' && (
        <GoalScreen
          fitnessGoal={fitnessGoal}
          onChangeFitnessGoal={(goal) => setFitnessGoal(goal)}
          weightKg={weightKg}
          onChangeWeightKg={(w) => setWeightKg(w)}
          heightCm={heightCm}
          onChangeHeightCm={(h) => setHeightCm(h)}
          targetWeightKg={targetWeightKg}
          onChangeTargetWeightKg={(tw) => setTargetWeightKg(tw)}
          activityLevel={activityLevel}
          onChangeActivityLevel={(lvl) => setActivityLevel(lvl)}
          onSubmit={handleGoalSubmit}
          loading={loadingGoalSubmit}
        />
      )}

      {currentScreen === 'main' && activeTab === 'home' && (
        <HealthDashboardScreen
          user={user}
          profile={profile}
          onNavigateToTab={(tab) => {
            if (tab === 'region') {
              setCurrentScreen('region');
            } else {
              handleTabChange(tab);
            }
          }}
          onOpenSnapCheck={() => setIsSnapCheckOpen(true)}
          onOpenFoodSearch={() => handleTabChange('meals')}
        />
      )}

      {currentScreen === 'main' && activeTab === 'meals' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-slate-950 border-b border-slate-800 px-5 pt-3 pb-2 flex space-x-2">
            <button
              onClick={() => setMealsSubTab('search')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
                mealsSubTab === 'search'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              🔍 Search Meals & Recipes
            </button>
            <button
              onClick={() => setMealsSubTab('plans')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
                mealsSubTab === 'plans'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              📋 Meal Plans (Optional)
            </button>
          </div>

          {mealsSubTab === 'search' ? (
            <SearchMealsScreen
              onLoggedSuccess={() => {
                setActiveTab('home');
              }}
            />
          ) : (
            <MealPlanScreen
              mealPlan={mealPlan}
              mealItems={mealItems}
              currentDietType={dietType}
              onDietTypeChange={(dt) => setDietType(dt)}
              onToggleItem={handleToggleItem}
              onSelectFood={handleSelectFood}
              onRegenerate={handleGeneratePlan}
              onRefreshPlan={loadTodayMealPlan}
            />
          )}
        </div>
      )}


      {currentScreen === 'main' && activeTab === 'workout' && (
        <WorkoutStudioScreen user={user} profile={profile} onLogSuccess={loadTodayMealPlan} />
      )}


      {currentScreen === 'main' && activeTab === 'trainers' && <TrainerScreen />}

      {currentScreen === 'main' && activeTab === 'progress' && <ProgressScreen />}

      {currentScreen === 'main' && activeTab === 'profile' && (
        <ProfileScreen
          user={user}
          profile={profile}
          onEditPreferences={() => setCurrentScreen('preferences')}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          onLogout={() => {
            localStorage.removeItem('token');
            setUser(null);
            setProfile(null);
            setMealPlan(null);
            setMealItems([]);
            setCurrentScreen('auth');
          }}
        />
      )}


      {currentScreen === 'subscription' && (
        <SubscriptionScreen
          onBack={() => setCurrentScreen('main')}
          onSuccess={() => {
            loadSubscriptionInfo();
            setCurrentScreen('main');
          }}
        />
      )}

      {currentScreen === 'food-details' && selectedFoodId && (
        <FoodDetailsScreen
          foodId={selectedFoodId}
          onBack={() => setCurrentScreen('main')}
          onLogSuccess={loadTodayMealPlan}
        />
      )}

      {/* Snap Check Modal */}
      <SnapCheckModal
        isOpen={isSnapCheckOpen}
        onClose={() => setIsSnapCheckOpen(false)}
        onSuccess={() => {
          setIsSnapCheckOpen(false);
          loadTodayMealPlan();
        }}
      />


      {/* Add Tracker Bottom Sheet triggered by Central + */}
      <AddTrackerBottomSheet
        isOpen={isAddTrackerSheetOpen}
        onClose={() => setIsAddTrackerSheetOpen(false)}
        onSelectOption={(option) => {
          setIsAddTrackerSheetOpen(false);
          if (option === 'food') handleTabChange('meals');
          else if (option === 'workout') handleTabChange('workout');
          else handleTabChange('home');
        }}
      />

      {/* Persistent Bottom Tab Bar on Main Screen Views */}
      {currentScreen === 'main' && (
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddTracker={() => setIsAddTrackerSheetOpen(true)}
        />
      )}
    </div>
  );
};

