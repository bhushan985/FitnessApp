/// <reference types="vite/client" />
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return '/api';
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data;
  },
  sendOtp: async (target: string, type: 'email' | 'phone', action?: 'register' | 'login' | 'link') => {
    const res = await api.post('/auth/otp/send', { target, type, action });
    return res.data;
  },
  verifyOtp: async (target: string, type: 'email' | 'phone', otp: string, name?: string) => {
    const res = await api.post('/auth/otp/verify', { target, type, otp, name });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data;
  },
  linkAuthMethod: async (target: string, type: 'email' | 'phone', otp: string) => {
    const res = await api.post('/auth/link-method', { target, type, otp });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const profileApi = {
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/profile', data);
    return res.data;
  },
  updateProfileImage: async (profileImage: string) => {
    const res = await api.post('/profile/image', { profileImage });
    return res.data;
  },
  removeProfileImage: async () => {
    const res = await api.delete('/profile/image');
    return res.data;
  },
  getDietSchedule: async () => {
    const res = await api.get('/profile/diet-schedule');
    return res.data;
  },
  updateDietSchedule: async (weeklyDietSchedule: any, defaultDietType?: string) => {

    const res = await api.put('/profile/diet-schedule', { weeklyDietSchedule, defaultDietType });
    return res.data;
  },
  updateLocation: async (params: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    permissionStatus?: string;
    source?: 'gps' | 'manual';
    manualRegionId?: string;
  }) => {
    const res = await api.put('/profile/location', params);
    return res.data;
  },
};

export const foodLogApi = {
  logFood: async (data: any) => {
    const res = await api.post('/food-log', data);
    return res.data;
  },
  getTodayLogs: async (date?: string) => {
    const res = await api.get('/food-log/today', { params: { date } });
    return res.data;
  },
  getRecentFoods: async () => {
    const res = await api.get('/food-log/recent');
    return res.data;
  },
  getFavorites: async () => {
    const res = await api.get('/food-log/favorites');
    return res.data;
  },
  toggleFavorite: async (data: any) => {
    const res = await api.post('/food-log/favorites', data);
    return res.data;
  },
  updateLog: async (id: string, updates: any) => {
    const res = await api.put(`/food-log/${id}`, updates);
    return res.data;
  },
  deleteLog: async (id: string) => {
    const res = await api.delete(`/food-log/${id}`);
    return res.data;
  },
};

export const recipeApi = {
  searchRecipes: async (params?: any) => {
    const res = await api.get('/recipes/search', { params });
    return res.data;
  },
  getRecipeById: async (id: string) => {
    const res = await api.get(`/recipes/${id}`);
    return res.data;
  },
  logRecipe: async (id: string, data: { servings?: number; mealType?: string; date?: string }) => {
    const res = await api.post(`/recipes/${id}/log`, data);
    return res.data;
  },
};


export const regionApi = {
  getRegions: async () => {
    const res = await api.get('/regions');
    return res.data;
  },
};

export const foodApi = {
  getFoods: async (params?: any) => {
    const res = await api.get('/foods', { params });
    return res.data;
  },
  getFoodById: async (id: string) => {
    const res = await api.get(`/foods/${id}`);
    return res.data;
  },
};

export const mealPlanApi = {
  getTodayPlan: async () => {
    const res = await api.get('/meal-plans/today');
    return res.data;
  },
  generatePlan: async (dietType?: string) => {
    const res = await api.post('/meal-plans/generate', { dietType });
    return res.data;
  },
  updateTodayDietType: async (dietType: string) => {
    const res = await api.put('/meal-plans/today/diet-type', { dietType });
    return res.data;
  },
  getAlternatives: async (itemId: string, dietFilter?: string) => {
    const res = await api.get(`/meal-plans/items/${itemId}/alternatives`, { params: { dietFilter } });
    return res.data;
  },
  replaceItem: async (itemId: string, replacementFoodId: string, quantityG?: number) => {
    const res = await api.post(`/meal-plans/items/${itemId}/replace`, { replacementFoodId, quantityG });
    return res.data;
  },
  updateItemStatus: async (itemId: string, isCompleted: boolean) => {
    const res = await api.put(`/meal-plans/items/${itemId}`, { isCompleted });
    return res.data;
  },
};

export const healthApi = {
  syncHealthData: async (data: any) => {
    const res = await api.post('/health-metrics/sync', data);
    return res.data;
  },
  getTodayHealth: async () => {
    const res = await api.get('/health-metrics/today');
    return res.data;
  },
  getDashboard: async (date?: string) => {
    const res = await api.get('/health-metrics/dashboard', { params: { date } });
    return res.data;
  },
  logWater: async (data: { date?: string; amountMl?: number; glassSizeMl?: number; action?: 'add' | 'subtract' | 'reset' }) => {
    const res = await api.post('/health-metrics/water', data);
    return res.data;
  },
  logWeight: async (weightKg: number, date?: string, note?: string) => {
    const res = await api.post('/health-metrics/weight', { weightKg, date, note });
    return res.data;
  },
  logSleep: async (data: { sleepHours?: number; targetHours?: number; bedtime?: string; wakeTime?: string; quality?: string; date?: string }) => {
    const res = await api.post('/health-metrics/sleep', data);
    return res.data;
  },
  addMedicineReminder: async (data: { name: string; dosage: string; time: string; frequency?: string; notes?: string; startDate?: string; endDate?: string }) => {
    const res = await api.post('/health-metrics/medicine/reminder', data);
    return res.data;
  },
  updateMedicineStatus: async (reminderId: string, status: 'taken' | 'skipped' | 'pending', date?: string) => {
    const res = await api.post('/health-metrics/medicine/status', { reminderId, status, date });
    return res.data;
  },
  getSettings: async () => {
    const res = await api.get('/health-metrics/settings');
    return res.data;
  },
  updateSettings: async (settingsData: any) => {
    const res = await api.put('/health-metrics/settings', settingsData);
    return res.data;
  },
  getAnalysis: async (days: number = 7) => {
    const res = await api.get('/health-metrics/analysis', { params: { days } });
    return res.data;
  },
  askAI: async (question: string) => {
    const res = await api.post('/health-metrics/ai-ask', { question });
    return res.data;
  },
  getSmartRecommendations: async () => {
    const res = await api.get('/health-metrics/smart-recommendations');
    return res.data;
  },
};


export const snapCheckApi = {
  analyzeImage: async (imageUrl?: string) => {
    const res = await api.post('/snap-check', { imageUrl });
    return res.data;
  },
  getSnapCheck: async (id: string) => {
    const res = await api.get(`/snap-check/${id}`);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/snap-check/history');
    return res.data;
  },
  correctAnalysis: async (id: string, correctedItems: any[]) => {
    const res = await api.put(`/snap-check/${id}/correct`, { correctedItems });
    return res.data;
  },
  confirmAndLog: async (id: string, mealType?: string) => {
    const res = await api.post(`/snap-check/${id}/log`, { mealType });
    return res.data;
  },
};


export const workoutApi = {
  getTodayWorkout: async (day?: string) => {
    const res = await api.get('/workouts/today', { params: { day } });
    return res.data;
  },
  getRoutine: async () => {
    const res = await api.get('/workouts/routine');
    return res.data;
  },
  generateWorkout: async (params: {
    muscleGroups?: string[];
    goal?: string;
    experienceLevel?: string;
    availableEquipment?: string[];
    durationMin?: number;
    includeAbs?: boolean;
  }) => {
    const res = await api.post('/workouts/generate', params);
    return res.data;
  },
  generateAbsWorkout: async (durationMin?: number) => {
    const res = await api.post('/workouts/generate-abs', { durationMin });
    return res.data;
  },
  parseAIWorkout: async (prompt: string) => {
    const res = await api.post('/workouts/ai-parse', { prompt });
    return res.data;
  },
  completeWorkout: async (data: {
    workoutPlanId?: string;
    workoutTitle: string;
    completedExercises: string[];
    durationMinutes?: number;
    caloriesBurned?: number;
    setsData?: any[];
  }) => {
    const res = await api.post('/workouts/complete', data);
    return res.data;
  },
  customizeWorkout: async (workoutPlanId: string, exercises: any[], title?: string) => {
    const res = await api.put(`/workouts/customize/${workoutPlanId}`, { exercises, title });
    return res.data;
  },
  logActivity: async (data: {
    type: 'walking' | 'running' | 'cycling' | 'swimming';
    intensity?: 'low' | 'moderate' | 'high';
    durationMinutes: number;
    distanceKm: number;
    caloriesBurned: number;
  }) => {
    const res = await api.post('/workouts/activity', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/workouts/history');
    return res.data;
  },
  getTemplates: async () => {
    const res = await api.get('/workouts/templates');
    return res.data;
  },
  saveTemplate: async (data: any) => {
    const res = await api.post('/workouts/templates', data);
    return res.data;
  },
  getExerciseProgress: async (exerciseName: string) => {
    const res = await api.get(`/workouts/progress/${encodeURIComponent(exerciseName)}`);
    return res.data;
  },
};

export const subscriptionApi = {
  getMySubscription: async () => {
    const res = await api.get('/subscriptions/me');
    return res.data;
  },
  getMembershipPlans: async () => {
    const res = await api.get('/subscriptions/plans');
    return res.data;
  },
  createOrder: async (membershipPlanId: string) => {
    const res = await api.post('/subscriptions/create-order', { membershipPlanId });
    return res.data;
  },
  verifyPayment: async (orderId: string, paymentId: string, signature: string) => {
    const res = await api.post('/subscriptions/verify-payment', { orderId, paymentId, signature });
    return res.data;
  },
  simulateTrialDay: async (simulatedDay: number) => {
    const res = await api.post('/subscriptions/dev-simulate-trial', { simulatedDay });
    return res.data;
  },
};

export const trainerApi = {
  getTrainers: async () => {
    const res = await api.get('/trainers');
    return res.data;
  },
  getMyTrainer: async () => {
    const res = await api.get('/trainers/my-trainer');
    return res.data;
  },
  assignTrainer: async (trainerId: string) => {
    const res = await api.post('/trainers/assign', { trainerId });
    return res.data;
  },
  getTrainerClients: async () => {
    const res = await api.get('/trainers/trainer-clients');
    return res.data;
  },
};

export const exerciseApi = {
  getExercises: async (params?: any) => {
    const res = await api.get('/exercises/search', { params });
    return res.data;
  },
  searchExercises: async (params?: { q?: string; muscle?: string; equipment?: string; difficulty?: string; category?: string }) => {
    const res = await api.get('/exercises/search', { params });
    return res.data;
  },
  getExerciseById: async (id: string) => {
    const res = await api.get(`/exercises/${id}`);
    return res.data;
  },
  getReplacements: async (id: string, equipment?: string) => {
    const res = await api.get(`/exercises/${id}/replacements`, { params: { equipment } });
    return res.data;
  },
};


export const notificationApi = {
  getNotifications: async (params?: { category?: string; type?: string; isRead?: boolean }) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
  getPreferences: async () => {
    const res = await api.get('/notifications/preferences');
    return res.data;
  },
  updatePreferences: async (data: any) => {
    const res = await api.put('/notifications/preferences', data);
    return res.data;
  },
  registerDevice: async (deviceData: { deviceId: string; platform?: string; browser?: string; pushToken?: string; subscriptionJson?: any }) => {
    const res = await api.post('/notifications/device', deviceData);
    return res.data;
  },
  sendTestNotification: async (payload?: { type?: string; title?: string; message?: string }) => {
    const res = await api.post('/notifications/test', payload || {});
    return res.data;
  },
};

export const mealLogApi = {
  logMeal: async (data: any) => {
    const res = await api.post('/meal-logs', data);
    return res.data;
  },
  getLogs: async (date?: string) => {
    const res = await api.get('/meal-logs', { params: { date } });
    return res.data;
  },
};

export const recommendationApi = {
  getEatNowRecommendations: async (timeSlot?: string) => {
    const res = await api.get('/recommendations/eat-now', { params: { timeSlot } });
    return res.data;
  },
  cookFromKitchen: async (ingredients: string[]) => {
    const res = await api.post('/recommendations/kitchen-cook', { ingredients });
    return res.data;
  },
  submitFeedback: async (foodId: string, feedbackType: string, rating?: number, reason?: string) => {
    const res = await api.post('/recommendations/feedback', { foodId, feedbackType, rating, reason });
    return res.data;
  },
};

export const progressApi = {
  getAnalytics: async (days: number = 7) => {
    const res = await api.get('/progress/analytics', { params: { days } });
    return res.data;
  },
  logWeight: async (weightKg: number) => {
    const res = await api.post('/progress/weight', { weightKg });
    return res.data;
  },
};
