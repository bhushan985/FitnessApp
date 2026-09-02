export interface User {
  id: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  role: 'user' | 'trainer' | 'admin' | 'super_admin';
  status: string;
  profileImage?: string;
  authMethods?: {
    emailOtp?: boolean;
    phoneOtp?: boolean;
    password?: boolean;
  };
}

export interface Region {
  _id: string;
  country: string;
  state: string;
  city: string;
  regionName: string;
  centerLocation?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface WeeklyDietSchedule {
  monday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  tuesday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  wednesday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  thursday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  friday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  saturday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  sunday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
}

export interface UserProfile {
  _id: string;
  userId: string;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'low' | 'moderate' | 'high';
  fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
  targetWeightKg: number;
  dietType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  weeklyDietSchedule?: WeeklyDietSchedule;
  bmi?: number;
  bmiCategory?: string;
  allergies: string[];
  foodPreferences: string[];
  foodDislikes: string[];
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  regionId: Region;
  currentLatitude?: number;
  currentLongitude?: number;
  locationAccuracy?: number;
  locationUpdatedAt?: string;
  locationPermissionStatus?: 'granted' | 'denied' | 'prompt';
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    city?: string;
    state?: string;
    country?: string;
    regionId?: string;
    source?: 'gps' | 'manual';
    updatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  trialDays: number;
  features: string[];
  limits?: {
    snapCheckLimitPerMonth: number;
    mealPlanGenerationsPerMonth: number;
    workoutAccessLevel: string;
  };
  trainerIncluded: boolean;
  trainerSessions?: number;
  AIAccess: boolean;
  prioritySupport?: boolean;
}

export interface Subscription {
  _id: string;
  userId: string;
  membershipId?: MembershipPlan;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartDate: string;
  trialEndDate: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  paymentProvider: string;
}

export interface Trainer {
  _id: string;
  userId: User;
  name: string;
  profileImage: string;
  bio: string;
  specialization: string[];
  certifications: string[];
  experienceYears: number;
  languages: string[];
  location: string;
  availability: string;
  hourlyRate: number;
  monthlyRate: number;
  rating: number;
  status: string;
}

export interface Exercise {
  _id: string;
  name: string;
  slug: string;
  description: string;
  muscleGroups: string[];
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movementType: 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'flexibility';
  instructions: string[];
  sets: number;
  reps: number;
  durationSec?: number;
  restSeconds: number;
  caloriesEstimate: number;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  source: string;
  license: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'system' | 'meal_plan' | 'workout' | 'trial' | 'subscription' | 'trainer';
  isRead: boolean;
  createdAt: string;
}

export interface Nutrition {
  calories: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
}

export interface Food {
  _id: string;
  name: string;
  localNames: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'dessert';
  dietaryType: 'veg' | 'non_veg' | 'egg' | 'vegan';
  servingUnit: string;
  defaultServingSize: number;
  nutrition: Nutrition;
  ingredients: string[];
  preparationMethod: string;
  imageUrl: string;
  regionalInfo?: {
    availabilityScore: number;
    popularityScore: number;
    localName: string;
    averagePrice: number;
  };
}

export interface MealPlanItem {
  _id: string;
  mealPlanId: string;
  mealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
  foodId: string;
  food: Food;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCompleted?: boolean;
  reasons?: string[];
  score?: number;
}

export interface MealPlan {
  _id: string;
  targetCalories: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  dietType?: string;
  status: string;
}

export interface MealReplacementAlternative {
  food: Food;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  score: number;
  reasons: string[];
  calorieDelta: number;
  proteinDelta: number;
  carbsDelta: number;
  fatDelta: number;
}

export interface DetectedFoodItem {
  foodId?: string;
  foodName: string;
  confidence: number;
  estimatedQuantityG: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export interface SnapCheckResult {
  _id: string;
  userId: string;
  imageUrl: string;
  detectedItems: DetectedFoodItem[];
  estimatedNutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  correctedItems?: DetectedFoodItem[];
  finalNutrition?: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  status: 'analyzed' | 'corrected' | 'logged';
  createdAt: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  imageUrl?: string;
}

export interface WorkoutPlan {
  _id: string;
  title: string;
  targetDay: string;
  focusArea: string;
  estimatedDurationMin: number;
  totalCaloriesBurn: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: WorkoutExercise[];
}

export interface WorkoutLog {
  _id: string;
  workoutTitle: string;
  completedExercises: string[];
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: string;
}

export interface MealLog {
  _id: string;
  foodId: Food;
  mealType: string;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  consumedAt: string;
}

export interface ProgressAnalytics {
  currentWeight: number;
  targetWeight: number;
  goalProgressPct: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  chartData: Array<{
    date: string;
    calories: number;
    proteinG: number;
    weightKg: number;
  }>;
}

export interface DailyHealthSummaryData {
  date: string;
  user: {
    name: string;
    greeting: string;
  };
  summary: {
    calories: { consumed: number; target: number; remaining: number; percentage: number };
    protein: { consumed: number; target: number; percentage: number };
    carbs: { consumed: number; target: number; percentage: number };
    fat: { consumed: number; target: number; percentage: number };
    fiber: { consumed: number; target: number; percentage: number };
    water: { glasses: number; targetGlasses: number; amountMl: number; targetMl: number; percentage: number };
    steps: { current: number; target: number; distanceKm: number; caloriesBurned: number; activeMinutes: number; percentage: number };
    sleep: { hours: number; targetHours: number; bedtime: string; wakeTime: string; percentage: number };
    workout: { completed: boolean; count: number; durationMinutes: number; caloriesBurned: number };
    weight: { currentKg: number; targetKg: number; changeKg: number };
  };
  mealDistribution: {
    breakfast: { consumed: number; target: number; percentage: number };
    morning_snack: { consumed: number; target: number; percentage: number };
    lunch: { consumed: number; target: number; percentage: number };
    evening_snack: { consumed: number; target: number; percentage: number };
    dinner: { consumed: number; target: number; percentage: number };
  };
  healthScore: {
    total: number;
    breakdown: {
      nutrition: number;
      hydration: number;
      activity: number;
      sleep: number;
      workout: number;
    };
    label: string;
  };
  streaks: {
    nutrition: number;
    water: number;
    steps: number;
    workout: number;
    sleep: number;
  };
  insights: string[];
  medicineReminders: Array<{
    id: string;
    name: string;
    dosage: string;
    time: string;
    frequency: string;
    status: 'taken' | 'skipped' | 'pending';
  }>;
  healthIntegrationStatus: {
    appleHealthConnected: boolean;
    healthConnectConnected: boolean;
    lastSyncedAt?: string;
  };
}

