import { FoodLog, IFoodLog } from '../models/FoodLog.js';
import { MealLog } from '../models/MealLog.js';
import { FavoriteFood } from '../models/FavoriteFood.js';
import { Food } from '../models/Food.js';
import mongoose from 'mongoose';

export interface ILogFoodDTO {
  userId: string;
  date?: string; // YYYY-MM-DD
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other';
  foodId?: string;
  foodName: string;
  quantity: number;
  unit: string;
  grams: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  source?: {
    type: 'search' | 'barcode' | 'voice' | 'camera' | 'recipe' | 'manual' | 'snap_check' | 'snap';
    rawInput?: string;
    referenceId?: string;
  };
  imageUrl?: string;
  confidence?: any;
}

export class FoodLogService {
  public static getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  public static calculateNutrition(
    basePer100g: { calories: number; protein: number; carbs: number; fat: number; fiber?: number },
    grams: number
  ) {
    const factor = grams / 100;
    return {
      calories: Math.round(basePer100g.calories * factor),
      protein: Math.round(basePer100g.protein * factor * 10) / 10,
      carbohydrates: Math.round(basePer100g.carbs * factor * 10) / 10,
      fat: Math.round(basePer100g.fat * factor * 10) / 10,
      fiber: Math.round((basePer100g.fiber || 0) * factor * 10) / 10,
    };
  }

  public static async logFood(dto: ILogFoodDTO): Promise<IFoodLog> {
    const dateStr = dto.date || FoodLogService.getTodayDateString();
    let finalNutrition = dto.nutrition;

    // If nutrition wasn't explicitly passed, pull from Food model in database
    if (!finalNutrition && dto.foodId) {
      const foodDoc = await Food.findById(dto.foodId);
      if (foodDoc) {
        finalNutrition = FoodLogService.calculateNutrition(
          {
            calories: foodDoc.nutrition?.calories || 150,
            protein: foodDoc.nutrition?.proteinG || 8,
            carbs: foodDoc.nutrition?.carbohydratesG || 25,
            fat: foodDoc.nutrition?.fatG || 5,
            fiber: foodDoc.nutrition?.fiberG || 3,
          },
          dto.grams
        );
      }
    }

    if (!finalNutrition) {
      finalNutrition = { calories: 200, protein: 5, carbohydrates: 30, fat: 5, fiber: 2 };
    }

    const foodLog = new FoodLog({
      userId: dto.userId,
      date: dateStr,
      mealType: dto.mealType || 'lunch',
      foodId: dto.foodId,
      foodName: dto.foodName,
      quantity: dto.quantity,
      unit: dto.unit,
      grams: dto.grams,
      nutrition: finalNutrition,
      source: dto.source || { type: 'manual' },
      imageUrl: dto.imageUrl || '',
      confidence: dto.confidence,
    });

    await foodLog.save();

    // Also sync entry to MealLog model so HealthDashboard, Progress & Personalization pick it up
    try {
      let mappedMealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner' = 'lunch';
      if (dto.mealType === 'breakfast') mappedMealType = 'breakfast';
      else if (dto.mealType === 'snack') mappedMealType = 'evening_snack';
      else if (dto.mealType === 'dinner') mappedMealType = 'dinner';
      else if (dto.mealType === 'lunch') mappedMealType = 'lunch';
      else mappedMealType = 'mid_morning';

      const validFoodId = dto.foodId && mongoose.Types.ObjectId.isValid(dto.foodId)
        ? new mongoose.Types.ObjectId(dto.foodId)
        : new mongoose.Types.ObjectId();

      const mealLog = new MealLog({
        userId: new mongoose.Types.ObjectId(dto.userId),
        foodId: validFoodId,
        mealType: mappedMealType,
        quantityG: dto.grams || 100,
        calories: finalNutrition.calories || 0,
        proteinG: finalNutrition.protein || 0,
        carbsG: finalNutrition.carbohydrates || 0,
        fatG: finalNutrition.fat || 0,
        consumedAt: dto.date ? new Date(dto.date) : new Date(),
        source: dto.source?.type === 'snap_check' ? 'snap_check' : 'manual',
      });
      await mealLog.save();
    } catch (err) {
      console.error('Error syncing to MealLog:', err);
    }

    return foodLog;
  }

  public static async getTodayConsumedSummary(userId: string, dateStr?: string) {
    const targetDate = dateStr || FoodLogService.getTodayDateString();
    const logs = await FoodLog.find({ userId, date: targetDate }).sort({ createdAt: -1 });

    const totalConsumed = logs.reduce(
      (acc, item) => {
        acc.calories += item.nutrition.calories || 0;
        acc.protein += item.nutrition.protein || 0;
        acc.carbohydrates += item.nutrition.carbohydrates || 0;
        acc.fat += item.nutrition.fat || 0;
        acc.fiber += item.nutrition.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );

    // Group logs by mealType
    const mealsGrouped = {
      breakfast: logs.filter((l) => l.mealType === 'breakfast'),
      lunch: logs.filter((l) => l.mealType === 'lunch'),
      dinner: logs.filter((l) => l.mealType === 'dinner'),
      snack: logs.filter((l) => l.mealType === 'snack'),
      pre_workout: logs.filter((l) => l.mealType === 'pre_workout'),
      post_workout: logs.filter((l) => l.mealType === 'post_workout'),
      other: logs.filter((l) => l.mealType === 'other'),
    };

    return {
      date: targetDate,
      logs,
      totalConsumed: {
        calories: Math.round(totalConsumed.calories),
        protein: Math.round(totalConsumed.protein * 10) / 10,
        carbohydrates: Math.round(totalConsumed.carbohydrates * 10) / 10,
        fat: Math.round(totalConsumed.fat * 10) / 10,
        fiber: Math.round(totalConsumed.fiber * 10) / 10,
      },
      mealsGrouped,
    };
  }

  public static async getRecentFoods(userId: string, limit: number = 10) {
    const logs = await FoodLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const recentMap = new Map<string, IFoodLog>();
    for (const log of logs) {
      if (!recentMap.has(log.foodName.toLowerCase())) {
        recentMap.set(log.foodName.toLowerCase(), log);
      }
      if (recentMap.size >= limit) break;
    }

    return Array.from(recentMap.values());
  }

  public static async updateFoodLog(
    logId: string,
    userId: string,
    updates: { quantity?: number; grams?: number; mealType?: any; foodName?: string }
  ) {
    const log = await FoodLog.findOne({ _id: logId, userId });
    if (!log) throw new Error('Food log entry not found');

    if (updates.quantity !== undefined && updates.quantity > 0) {
      const oldGrams = log.grams;
      const newGrams = updates.grams || Math.round((log.grams / log.quantity) * updates.quantity);
      const ratio = newGrams / oldGrams;

      log.quantity = updates.quantity;
      log.grams = newGrams;
      log.nutrition = {
        calories: Math.round(log.nutrition.calories * ratio),
        protein: Math.round(log.nutrition.protein * ratio * 10) / 10,
        carbohydrates: Math.round(log.nutrition.carbohydrates * ratio * 10) / 10,
        fat: Math.round(log.nutrition.fat * ratio * 10) / 10,
        fiber: Math.round(log.nutrition.fiber * ratio * 10) / 10,
      };
    } else if (updates.grams !== undefined && updates.grams > 0) {
      const ratio = updates.grams / log.grams;
      log.grams = updates.grams;
      log.nutrition = {
        calories: Math.round(log.nutrition.calories * ratio),
        protein: Math.round(log.nutrition.protein * ratio * 10) / 10,
        carbohydrates: Math.round(log.nutrition.carbohydrates * ratio * 10) / 10,
        fat: Math.round(log.nutrition.fat * ratio * 10) / 10,
        fiber: Math.round(log.nutrition.fiber * ratio * 10) / 10,
      };
    }

    if (updates.mealType) log.mealType = updates.mealType;
    if (updates.foodName) log.foodName = updates.foodName;

    await log.save();
    return log;
  }

  public static async deleteFoodLog(logId: string, userId: string) {
    const deleted = await FoodLog.findOneAndDelete({ _id: logId, userId });
    if (!deleted) throw new Error('Food log entry not found');
    return deleted;
  }

  // Favorites management
  public static async getFavorites(userId: string) {
    return await FavoriteFood.find({ userId }).sort({ createdAt: -1 });
  }

  public static async toggleFavorite(userId: string, foodData: { foodId?: string; foodName: string; grams?: number; nutrition: any }) {
    const existing = await FavoriteFood.findOne({ userId, foodName: foodData.foodName });
    if (existing) {
      await FavoriteFood.findByIdAndDelete(existing._id);
      return { isFavorite: false };
    } else {
      const fav = new FavoriteFood({
        userId,
        foodId: foodData.foodId,
        foodName: foodData.foodName,
        defaultGrams: foodData.grams || 100,
        nutrition: foodData.nutrition,
      });
      await fav.save();
      return { isFavorite: true, favorite: fav };
    }
  }
}
