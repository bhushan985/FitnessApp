import { EventEmitter } from 'events';
import { NotificationService } from './notificationService.js';

class ApplicationEventBus extends EventEmitter {}

export const eventBus = new ApplicationEventBus();

// EVENT SUBSCRIBERS
eventBus.on('WORKOUT_COMPLETED', async (data: { userId: string; workoutTitle: string; exercisesCount: number; durationMin: number; caloriesBurned: number }) => {
  await NotificationService.send({
    userId: data.userId,
    title: 'Workout Crushed! 🔥',
    message: `You completed ${data.workoutTitle} (${data.exercisesCount || 9} exercises, ~${data.caloriesBurned} kcal burned).`,
    type: 'workout',
    category: 'workout',
    priority: 'medium',
    soundType: 'SUCCESS',
    link: '/workout/completion',
    data: { workoutTitle: data.workoutTitle, calories: data.caloriesBurned },
    idempotencyKey: `workout_completed_${data.userId}_${Date.now()}`,
  });
});

eventBus.on('PR_ACHIEVED', async (data: { userId: string; exerciseName: string; weightKg: number; reps: number }) => {
  await NotificationService.send({
    userId: data.userId,
    title: 'New Personal Record! 🏆',
    message: `New PR on ${data.exerciseName}: ${data.weightKg} kg × ${data.reps} reps!`,
    type: 'streak',
    category: 'workout',
    priority: 'high',
    soundType: 'SUCCESS',
    link: '/workout/progress',
    data: { exerciseName: data.exerciseName, weightKg: data.weightKg, reps: data.reps },
    idempotencyKey: `pr_${data.userId}_${data.exerciseName}_${data.weightKg}`,
  });
});

eventBus.on('PROTEIN_TARGET_MET', async (data: { userId: string; proteinG: number }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  await NotificationService.send({
    userId: data.userId,
    title: 'Protein Goal Met! 🥩',
    message: `You reached your daily protein target (${data.proteinG}g achieved). Great job fueling your muscles!`,
    type: 'meal',
    category: 'meal',
    priority: 'medium',
    soundType: 'SUCCESS',
    link: '/meals/dashboard',
    data: { proteinG: data.proteinG },
    idempotencyKey: `protein_target_${data.userId}_${todayStr}`,
  });
});

eventBus.on('SNAP_CHECK_COMPLETED', async (data: { userId: string; foodName: string; calories: number; proteinG: number }) => {
  await NotificationService.send({
    userId: data.userId,
    title: 'Food Analysis Ready 📸',
    message: `Recognized ${data.foodName}: ~${data.calories} kcal, ${data.proteinG}g Protein. Tap to review nutrition log.`,
    type: 'ai',
    category: 'snap_check',
    priority: 'high',
    soundType: 'DEFAULT',
    link: '/snap-check/result',
    data: { foodName: data.foodName, calories: data.calories },
  });
});

eventBus.on('WATER_GOAL_MET', async (data: { userId: string; totalMl: number }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  await NotificationService.send({
    userId: data.userId,
    title: 'Hydration Goal Achieved! 💧',
    message: `Awesome! You hit your daily hydration target of ${data.totalMl} ml.`,
    type: 'hydration',
    category: 'hydration',
    priority: 'medium',
    soundType: 'SUCCESS',
    link: '/trackers/water',
    idempotencyKey: `water_goal_${data.userId}_${todayStr}`,
  });
});

eventBus.on('MEDICINE_DUE', async (data: { userId: string; medicineName: string; timeOfDay: string }) => {
  await NotificationService.send({
    userId: data.userId,
    title: 'Medicine Reminder 💊',
    message: `Time to take your scheduled ${data.timeOfDay} dose: ${data.medicineName}.`,
    type: 'medicine',
    category: 'medicine',
    priority: 'critical',
    soundType: 'ALERT',
    link: '/trackers/medicine',
    data: { medicineName: data.medicineName, timeOfDay: data.timeOfDay },
    idempotencyKey: `medicine_${data.userId}_${data.medicineName}_${Date.now()}`,
  });
});

eventBus.on('TRIAL_EXPIRING', async (data: { userId: string; daysRemaining: number }) => {
  await NotificationService.send({
    userId: data.userId,
    title: 'Free Trial Expiring Soon ⏳',
    message: `Your 30-day NutriRegion trial ends in ${data.daysRemaining} days. Upgrade to retain AI features.`,
    type: 'subscription',
    category: 'subscription',
    priority: 'high',
    soundType: 'ALERT',
    link: '/subscription',
    idempotencyKey: `trial_expiry_${data.userId}_${data.daysRemaining}`,
  });
});
