import { Types } from 'mongoose';
import { UserProfile, IUserProfile } from '../models/UserProfile.js';
import { Food, IFood } from '../models/Food.js';
import { FoodRegion } from '../models/FoodRegion.js';
import { MealLog } from '../models/MealLog.js';
import { FoodLog } from '../models/FoodLog.js';
import { MealPlanItem } from '../models/MealPlanItem.js';
import { RecommendationService } from './recommendationService.js';

export interface EatNowRecommendation {
  food: IFood;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  estimatedCostRs: number;
  score: number;
  reasons: string[];
}

export interface KitchenCookResult {
  recipeName: string;
  food: IFood;
  matchedIngredients: string[];
  missingIngredients: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  estimatedCostRs: number;
  reasons: string[];
}

export class PersonalizationEngine {
  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  public static calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other'): number {
    if (gender === 'female') {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  /**
   * Calculate TDEE based on Activity Level
   */
  public static calculateTDEE(bmr: number, activityLevel: 'low' | 'moderate' | 'high'): number {
    const factors = { low: 1.2, moderate: 1.55, high: 1.725 };
    return Math.round(bmr * (factors[activityLevel] || 1.55));
  }

  /**
   * Get Remaining Daily Calories & Macros for Today
   */
  public static async getRemainingDailyMacros(userId: string | Types.ObjectId): Promise<{
    targetCalories: number;
    consumedCalories: number;
    remainingCalories: number;
    targetProtein: number;
    consumedProtein: number;
    remainingProtein: number;
    targetCarbs: number;
    consumedCarbs: number;
    targetFat: number;
    consumedFat: number;
  }> {
    const profile = await UserProfile.findOne({ userId });
    const targetCalories = profile?.dailyCalorieTarget || 2100;
    const targetProtein = profile?.dailyProteinTarget || 130;
    const targetCarbs = profile?.dailyCarbsTarget || 225;
    const targetFat = profile?.dailyFatTarget || 65;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await MealLog.find({ userId, consumedAt: { $gte: startOfDay } });
    const todayStr = startOfDay.toISOString().split('T')[0];
    const foodLogs = await FoodLog.find({ userId, $or: [{ date: todayStr }, { createdAt: { $gte: startOfDay } }] });

    let consumedCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    let consumedProtein = logs.reduce((sum, log) => sum + (log.proteinG || 0), 0);
    let consumedCarbs = logs.reduce((sum, log) => sum + (log.carbsG || 0), 0);
    let consumedFat = logs.reduce((sum, log) => sum + (log.fatG || 0), 0);

    if (logs.length === 0 && foodLogs.length > 0) {
      consumedCalories = foodLogs.reduce((sum, log) => sum + (log.nutrition?.calories || 0), 0);
      consumedProtein = foodLogs.reduce((sum, log) => sum + (log.nutrition?.protein || 0), 0);
      consumedCarbs = foodLogs.reduce((sum, log) => sum + (log.nutrition?.carbohydrates || 0), 0);
      consumedFat = foodLogs.reduce((sum, log) => sum + (log.nutrition?.fat || 0), 0);
    }

    const remainingCalories = Math.max(0, targetCalories - consumedCalories);
    const remainingProtein = Math.max(0, Math.round((targetProtein - consumedProtein) * 10) / 10);

    return {
      targetCalories,
      consumedCalories,
      remainingCalories,
      targetProtein,
      consumedProtein,
      remainingProtein,
      targetCarbs,
      consumedCarbs,
      targetFat,
      consumedFat,
    };
  }

  /**
   * Core Engine Feature: "What Can I Eat Right Now?"
   */
  public static async getEatNowRecommendations(
    userId: string | Types.ObjectId,
    mealTypeSlot?: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  ): Promise<{
    remaining: any;
    budget: string;
    regionName: string;
    dietTypeToday: string;
    recommendations: EatNowRecommendation[];
  }> {
    const profile = await UserProfile.findOne({ userId }).populate('regionId');
    if (!profile) {
      throw new Error('User profile not found');
    }

    const remaining = await this.getRemainingDailyMacros(userId);
    const regionName = (profile.regionId as any)?.name || 'Maharashtra';
    const dietTypeToday = profile.dietType || 'veg';
    const budget = profile.dailyFoodBudget || '150-250';

    const foods = await Food.find({ isActive: true });
    const foodRegionsList = await FoodRegion.find({ regionId: profile.regionId, isActive: true });
    const foodRegionMap = new Map<string, any>();
    foodRegionsList.forEach((fr) => foodRegionMap.set(fr.foodId.toString(), fr));

    const scoredCandidates = await RecommendationService.scoreCandidateFoods(
      foods,
      foodRegionMap,
      profile,
      dietTypeToday
    );

    const recommendations: EatNowRecommendation[] = scoredCandidates.slice(0, 5).map((candidate) => {
      const food = candidate.food;
      const targetSlotCal = Math.min(remaining.remainingCalories || 500, 650);
      const scaleFactor = Math.max(0.5, Math.min(2.0, targetSlotCal / (food.nutrition.calories || 150)));

      const quantityG = Math.round((food.defaultServingSize || 100) * scaleFactor);
      const calories = Math.round(food.nutrition.calories * scaleFactor);
      const proteinG = Math.round(food.nutrition.proteinG * scaleFactor * 10) / 10;
      const carbsG = Math.round(food.nutrition.carbohydratesG * scaleFactor * 10) / 10;
      const fatG = Math.round(food.nutrition.fatG * scaleFactor * 10) / 10;
      const estimatedCostRs = Math.round(40 * scaleFactor);

      const reasons = [
        `✓ Fits remaining ${remaining.remainingCalories} kcal target`,
        `✓ Provides ${proteinG}g protein (${remaining.remainingProtein}g needed today)`,
        `✓ ${dietTypeToday.toUpperCase()} choice available in ${regionName}`,
        `✓ Estimated cost ₹${estimatedCostRs} (within ₹${budget} budget)`,
      ];

      return {
        food,
        quantityG,
        calories,
        proteinG,
        carbsG,
        fatG,
        estimatedCostRs,
        score: candidate.totalScore,
        reasons,
      };
    });

    return {
      remaining,
      budget,
      regionName,
      dietTypeToday,
      recommendations,
    };
  }

  /**
   * Core Engine Feature: "Cook From My Kitchen"
   */
  public static async getKitchenCookRecipes(
    userId: string | Types.ObjectId,
    pantryIngredients: string[]
  ): Promise<{
    matchedRecipes: KitchenCookResult[];
  }> {
    const profile = await UserProfile.findOne({ userId }).populate('regionId');
    const remaining = await this.getRemainingDailyMacros(userId);
    const regionName = (profile?.regionId as any)?.name || 'Maharashtra';

    const normalizedPantry = pantryIngredients.map((i) => i.toLowerCase().trim());
    const foods = await Food.find({ isActive: true });

    const matchedRecipes: KitchenCookResult[] = [];

    for (const food of foods) {
      const foodNameLower = food.name.toLowerCase();
      const matched: string[] = [];

      normalizedPantry.forEach((ing) => {
        if (
          foodNameLower.includes(ing) ||
          food.ingredients?.some((t: string) => t.toLowerCase().includes(ing)) ||
          food.localNames?.some((ln: string) => ln.toLowerCase().includes(ing))
        ) {
          matched.push(ing);
        }
      });

      if (matched.length > 0) {
        const missing = normalizedPantry.filter((i) => !matched.includes(i));
        const estimatedCostRs = Math.round(30 + matched.length * 15);

        matchedRecipes.push({
          recipeName: food.name,
          food,
          matchedIngredients: matched,
          missingIngredients: missing,
          calories: food.nutrition.calories,
          proteinG: food.nutrition.proteinG,
          carbsG: food.nutrition.carbohydratesG,
          fatG: food.nutrition.fatG,
          estimatedCostRs,
          reasons: [
            `✓ Uses ${matched.length} ingredients from your kitchen (${matched.join(', ')})`,
            `✓ ${food.nutrition.calories} kcal fits remaining ${remaining.remainingCalories} kcal`,
            `✓ Authentic regional dish in ${regionName}`,
          ],
        });
      }
    }

    // Sort by matched ingredients count descending
    matchedRecipes.sort((a, b) => b.matchedIngredients.length - a.matchedIngredients.length);

    return {
      matchedRecipes: matchedRecipes.slice(0, 5),
    };
  }
}
