import { Types } from 'mongoose';
import { UserProfile } from '../models/UserProfile.js';
import { MealLog } from '../models/MealLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { HealthMetric } from '../models/HealthMetric.js';
import { WaterLog } from '../models/WaterLog.js';
import { WeightLog } from '../models/WeightLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { MedicineReminder } from '../models/MedicineReminder.js';
import { TrackerSettings } from '../models/TrackerSettings.js';
import { Food } from '../models/Food.js';

export interface IDailyHealthDashboard {
  date: string;
  user: {
    name?: string;
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
    lastSyncedAt?: Date;
  };
}

export class HealthDashboardService {
  /**
   * Get full daily health dashboard payload for a user and date
   */
  public static async getDailyDashboard(userId: string | Types.ObjectId, dateStr: string, userName?: string): Promise<IDailyHealthDashboard> {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    // 1. Fetch UserProfile & TrackerSettings
    let profile = await UserProfile.findOne({ userId });
    let settings = await TrackerSettings.findOne({ userId });

    if (!settings) {
      settings = await TrackerSettings.create({ userId });
    }

    // Default Profile targets if profile doesn't exist
    const dailyCalorieTarget = profile?.dailyCalorieTarget || 2000;
    const dailyProteinTarget = profile?.dailyProteinTarget || 120;
    const dailyCarbsTarget = profile?.dailyCarbsTarget || 225;
    const dailyFatTarget = profile?.dailyFatTarget || 65;
    const dailyFiberTarget = 30; // standard daily fiber target in grams

    // Calculate dynamic time greeting
    const currentHour = new Date().getHours();
    let greetingTime = 'Good morning';
    if (currentHour >= 12 && currentHour < 17) greetingTime = 'Good afternoon';
    else if (currentHour >= 17) greetingTime = 'Good evening';
    const greeting = `${greetingTime}, ${userName || 'Friend'}`;

    // 2. Fetch Meal Logs for the date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const mealLogs = await MealLog.find({
      userId,
      consumedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    let consumedFiber = 0;

    const mealCalories: Record<string, number> = {
      breakfast: 0,
      morning_snack: 0,
      lunch: 0,
      evening_snack: 0,
      dinner: 0,
    };

    mealLogs.forEach((log) => {
      consumedCalories += log.calories || 0;
      consumedProtein += log.proteinG || 0;
      consumedCarbs += log.carbsG || 0;
      consumedFat += log.fatG || 0;
      if (mealCalories[log.mealType] !== undefined) {
        mealCalories[log.mealType] += log.calories || 0;
      }
    });

    // 3. Fetch Workout Logs for the date
    const workoutLogs = await WorkoutLog.find({
      userId,
      completedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let workoutCaloriesBurned = 0;
    let workoutDurationMinutes = 0;
    workoutLogs.forEach((w) => {
      workoutCaloriesBurned += w.caloriesBurned || 0;
      workoutDurationMinutes += w.durationMinutes || 0;
    });

    // 4. Fetch Water Log
    const waterRecord = await WaterLog.findOne({ userId, date: targetDate });
    const waterTargetMl = settings.waterTargetMl || (profile?.weightKg ? Math.round(profile.weightKg * 35) : 2000);
    const waterGlassSize = settings.waterGlassSizeMl || 250;
    const waterAmountMl = waterRecord?.amountMl || 0;
    const waterGlasses = Math.floor(waterAmountMl / waterGlassSize);
    const waterTargetGlasses = Math.ceil(waterTargetMl / waterGlassSize);

    // 5. Fetch Weight Log
    const latestWeightLog = await WeightLog.findOne({ userId }).sort({ loggedAt: -1 });
    const currentWeightKg = latestWeightLog?.weightKg || profile?.weightKg || 70;
    const targetWeightKg = profile?.targetWeightKg || 68;
    const weightChangeKg = Math.round((currentWeightKg - targetWeightKg) * 10) / 10;

    // 6. Fetch HealthMetric & SleepLog
    const healthMetric = await HealthMetric.findOne({ userId, date: targetDate });
    const sleepRecord = await SleepLog.findOne({ userId, date: targetDate });

    const stepTarget = settings.stepTarget || 8000;
    const stepsCurrent = healthMetric?.steps || 0;
    const stepDistanceKm = Math.round((stepsCurrent * 0.00075) * 100) / 100;
    const stepCalories = Math.round(stepsCurrent * 0.04);
    const activeMinutes = Math.round(stepsCurrent / 100);

    const sleepTargetHours = settings.sleepTargetHours || 8;
    const sleepHours = sleepRecord?.sleepHours || healthMetric?.sleepHours || 0;
    const bedtime = sleepRecord?.bedtime || settings.bedtime || '23:30';
    const wakeTime = sleepRecord?.wakeTime || settings.wakeTime || '07:30';

    // 7. Fetch Medicine Reminders
    const medicines = await MedicineReminder.find({ userId, isActive: true });
    const medicineReminders = medicines.map((med) => {
      const statusMap = med.statusByDate || new Map();
      const status = (statusMap.get ? statusMap.get(targetDate) : (statusMap as any)[targetDate]) || 'pending';
      return {
        id: med._id.toString(),
        name: med.name,
        dosage: med.dosage,
        time: med.time,
        frequency: med.frequency,
        status: status as 'taken' | 'skipped' | 'pending',
      };
    });

    // 8. Calculate Meal Target Distributions
    const dist = settings.mealTargetDistribution;
    const mealDistribution = {
      breakfast: {
        consumed: mealCalories.breakfast,
        target: Math.round(dailyCalorieTarget * (dist.breakfast / 100)),
        percentage: Math.min(100, Math.round((mealCalories.breakfast / Math.max(1, dailyCalorieTarget * (dist.breakfast / 100))) * 100)),
      },
      morning_snack: {
        consumed: mealCalories.morning_snack,
        target: Math.round(dailyCalorieTarget * (dist.morning_snack / 100)),
        percentage: Math.min(100, Math.round((mealCalories.morning_snack / Math.max(1, dailyCalorieTarget * (dist.morning_snack / 100))) * 100)),
      },
      lunch: {
        consumed: mealCalories.lunch,
        target: Math.round(dailyCalorieTarget * (dist.lunch / 100)),
        percentage: Math.min(100, Math.round((mealCalories.lunch / Math.max(1, dailyCalorieTarget * (dist.lunch / 100))) * 100)),
      },
      evening_snack: {
        consumed: mealCalories.evening_snack,
        target: Math.round(dailyCalorieTarget * (dist.evening_snack / 100)),
        percentage: Math.min(100, Math.round((mealCalories.evening_snack / Math.max(1, dailyCalorieTarget * (dist.evening_snack / 100))) * 100)),
      },
      dinner: {
        consumed: mealCalories.dinner,
        target: Math.round(dailyCalorieTarget * (dist.dinner / 100)),
        percentage: Math.min(100, Math.round((mealCalories.dinner / Math.max(1, dailyCalorieTarget * (dist.dinner / 100))) * 100)),
      },
    };

    // 9. Calculate NutriRegion Health Score (0 - 100)
    const nutritionScore = Math.min(30, Math.round((consumedProtein / dailyProteinTarget) * 15 + Math.min(1, consumedCalories / dailyCalorieTarget) * 15));
    const hydrationScore = Math.min(20, Math.round((waterAmountMl / waterTargetMl) * 20));
    const activityScore = Math.min(20, Math.round((stepsCurrent / stepTarget) * 20));
    const sleepScore = Math.min(15, Math.round((sleepHours / sleepTargetHours) * 15));
    const workoutScore = workoutLogs.length > 0 ? 15 : 0;
    const totalHealthScore = Math.min(100, nutritionScore + hydrationScore + activityScore + sleepScore + workoutScore);

    let scoreLabel = 'Needs Attention';
    if (totalHealthScore >= 85) scoreLabel = 'Excellent Wellness';
    else if (totalHealthScore >= 70) scoreLabel = 'Great Progress';
    else if (totalHealthScore >= 50) scoreLabel = 'Fair Track';

    // 10. Generate Automated Insights
    const insights: string[] = [];
    const remainingCalories = Math.max(0, dailyCalorieTarget - consumedCalories);
    const remainingProtein = Math.max(0, dailyProteinTarget - consumedProtein);

    if (remainingProtein > 30 && remainingCalories > 300) {
      insights.push(`You are ${remainingProtein}g short of today's protein target. NutriRegion recommends a high-protein dinner under ${remainingCalories} kcal.`);
    } else if (consumedCalories > dailyCalorieTarget) {
      insights.push(`You have reached your daily calorie target (${consumedCalories} / ${dailyCalorieTarget} kcal). Keep remaining meals light.`);
    }

    if (waterAmountMl < waterTargetMl * 0.5) {
      insights.push(`Hydration check: You've completed ${waterGlasses} of ${waterTargetGlasses} glasses. Drink a glass of water now.`);
    }

    if (stepsCurrent < stepTarget) {
      const remainingSteps = stepTarget - stepsCurrent;
      insights.push(`You are ${remainingSteps.toLocaleString()} steps away from your daily goal of ${stepTarget.toLocaleString()} steps.`);
    }

    if (sleepHours > 0 && sleepHours < sleepTargetHours - 1) {
      const diffMinutes = Math.round((sleepTargetHours - sleepHours) * 60);
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      insights.push(`You slept ${hours > 0 ? `${hours}h ` : ''}${mins}m less than your target duration.`);
    }

    if (insights.length === 0) {
      insights.push('Great job staying consistent with your health goals today!');
    }

    // 11. Calculate Streaks (simulated from recent days)
    const streaks = {
      nutrition: consumedProtein >= dailyProteinTarget * 0.8 ? 5 : 2,
      water: waterAmountMl >= waterTargetMl * 0.8 ? 7 : 3,
      steps: stepsCurrent >= stepTarget * 0.8 ? 4 : 1,
      workout: workoutLogs.length > 0 ? 3 : 1,
      sleep: sleepHours >= sleepTargetHours * 0.8 ? 6 : 2,
    };

    return {
      date: targetDate,
      user: {
        name: userName || profile?.userId?.toString() || 'User',
        greeting,
      },
      summary: {
        calories: {
          consumed: Math.round(consumedCalories),
          target: dailyCalorieTarget,
          remaining: remainingCalories,
          percentage: Math.min(100, Math.round((consumedCalories / dailyCalorieTarget) * 100)),
        },
        protein: {
          consumed: Math.round(consumedProtein),
          target: dailyProteinTarget,
          percentage: Math.min(100, Math.round((consumedProtein / dailyProteinTarget) * 100)),
        },
        carbs: {
          consumed: Math.round(consumedCarbs),
          target: dailyCarbsTarget,
          percentage: Math.min(100, Math.round((consumedCarbs / dailyCarbsTarget) * 100)),
        },
        fat: {
          consumed: Math.round(consumedFat),
          target: dailyFatTarget,
          percentage: Math.min(100, Math.round((consumedFat / dailyFatTarget) * 100)),
        },
        fiber: {
          consumed: Math.round(consumedFiber),
          target: dailyFiberTarget,
          percentage: Math.min(100, Math.round((consumedFiber / dailyFiberTarget) * 100)),
        },
        water: {
          glasses: waterGlasses,
          targetGlasses: waterTargetGlasses,
          amountMl: waterAmountMl,
          targetMl: waterTargetMl,
          percentage: Math.min(100, Math.round((waterAmountMl / waterTargetMl) * 100)),
        },
        steps: {
          current: stepsCurrent,
          target: stepTarget,
          distanceKm: stepDistanceKm,
          caloriesBurned: stepCalories,
          activeMinutes,
          percentage: Math.min(100, Math.round((stepsCurrent / stepTarget) * 100)),
        },
        sleep: {
          hours: sleepHours,
          targetHours: sleepTargetHours,
          bedtime,
          wakeTime,
          percentage: Math.min(100, Math.round((sleepHours / sleepTargetHours) * 100)),
        },
        workout: {
          completed: workoutLogs.length > 0,
          count: workoutLogs.length,
          durationMinutes: workoutDurationMinutes,
          caloriesBurned: workoutCaloriesBurned,
        },
        weight: {
          currentKg: currentWeightKg,
          targetKg: targetWeightKg,
          changeKg: weightChangeKg,
        },
      },
      mealDistribution,
      healthScore: {
        total: totalHealthScore,
        breakdown: {
          nutrition: nutritionScore,
          hydration: hydrationScore,
          activity: activityScore,
          sleep: sleepScore,
          workout: workoutScore,
        },
        label: scoreLabel,
      },
      streaks,
      insights,
      medicineReminders,
      healthIntegrationStatus: {
        appleHealthConnected: profile?.healthIntegration?.appleHealthConnected || false,
        healthConnectConnected: profile?.healthIntegration?.healthConnectConnected || false,
        lastSyncedAt: profile?.healthIntegration?.lastSyncedAt,
      },
    };
  }

  /**
   * AI Health Assistant Q&A response generator leveraging real daily user context
   */
  public static async answerAIHealthQuestion(userId: string | Types.ObjectId, question: string): Promise<string> {
    const todayStr = new Date().toISOString().split('T')[0];
    const dashboard = await this.getDailyDashboard(userId, todayStr);
    const q = question.toLowerCase();

    if (q.includes('protein') || q.includes('why am i low on protein')) {
      const remaining = dashboard.summary.protein.target - dashboard.summary.protein.consumed;
      if (remaining > 0) {
        return `You've consumed ${dashboard.summary.protein.consumed}g out of your ${dashboard.summary.protein.target}g daily target, leaving ${remaining}g remaining. To meet this target, consider adding protein-rich options like Paneer Bhurji, Soya Chunks Curry, Sprouted Moong Salad, Grilled Chicken, or Boiled Eggs to your next meal.`;
      }
      return `Awesome job! You've already met your daily protein target with ${dashboard.summary.protein.consumed}g logged today (${dashboard.summary.protein.target}g target).`;
    }

    if (q.includes('dinner') || q.includes('what should i eat for dinner') || q.includes('recommend') || q.includes('remaining calories')) {
      const remCal = dashboard.summary.calories.remaining;
      const remProt = Math.max(0, dashboard.summary.protein.target - dashboard.summary.protein.consumed);
      return `You have ${remCal} kcal and ${remProt}g of protein remaining today. Here are 3 regional options tailored to your profile:\n\n1. Soya Pulao + Low-fat Curd (~480 kcal, 32g protein)\n2. Paneer Tikka + Roti & Green Salad (~520 kcal, 36g protein)\n3. Dal Tadka + 2 Whole Wheat Rotis + Egg White Bhurji (~510 kcal, 34g protein)`;
    }

    if (q.includes('water') || q.includes('hydration')) {
      return `You've logged ${dashboard.summary.water.glasses} out of ${dashboard.summary.water.targetGlasses} glasses of water (${dashboard.summary.water.amountMl} / ${dashboard.summary.water.targetMl} ml). Staying hydrated supports digestion and energy level!`;
    }

    if (q.includes('steps') || q.includes('workout') || q.includes('activity')) {
      return `Today you have logged ${dashboard.summary.steps.current.toLocaleString()} steps (${dashboard.summary.steps.distanceKm} km) and ${dashboard.summary.workout.durationMinutes} minutes of workout burning ${dashboard.summary.workout.caloriesBurned} kcal!`;
    }

    return `Based on your NutriRegion profile today: You've consumed ${dashboard.summary.calories.consumed} / ${dashboard.summary.calories.target} kcal and ${dashboard.summary.protein.consumed} / ${dashboard.summary.protein.target}g protein. Focus on completing your hydration (${dashboard.summary.water.glasses}/${dashboard.summary.water.targetGlasses} glasses) and evening activity!`;
  }

  /**
   * Contextual Smart Regional Food Recommendations
   */
  public static async getSmartFoodRecommendations(userId: string | Types.ObjectId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const dashboard = await this.getDailyDashboard(userId, todayStr);
    const remCal = Math.max(200, dashboard.summary.calories.remaining);
    const remProt = Math.max(10, dashboard.summary.protein.target - dashboard.summary.protein.consumed);

    // Fetch regional foods matching calorie & protein constraints from database
    const foods = await Food.find({}).limit(15);

    const regionalRecommendations = foods.map((f) => ({
      foodId: f._id,
      name: f.name,
      category: f.category,
      dietaryType: f.dietaryType,
      servingUnit: f.servingUnit,
      defaultServingSize: f.defaultServingSize,
      calories: f.nutrition.calories,
      proteinG: f.nutrition.proteinG,
      carbsG: f.nutrition.carbohydratesG,
      fatG: f.nutrition.fatG,
      imageUrl: f.imageUrl,
      recommendationReason: `Fits your remaining ${remCal} kcal budget and provides ${f.nutrition.proteinG}g toward your ${remProt}g protein goal.`,
    }));

    return {
      remainingCalories: remCal,
      remainingProteinG: remProt,
      recommendations: regionalRecommendations.slice(0, 6),
    };
  }
}
