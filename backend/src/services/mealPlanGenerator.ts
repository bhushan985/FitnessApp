import { Types } from 'mongoose';
import { Food, IFood } from '../models/Food.js';
import { FoodRegion, IFoodRegion } from '../models/FoodRegion.js';
import { MealPlan, IMealPlan } from '../models/MealPlan.js';
import { MealPlanItem } from '../models/MealPlanItem.js';
import { Recommendation } from '../models/Recommendation.js';
import { UserProfile, IUserProfile } from '../models/UserProfile.js';
import { RecommendationService, IScoredFood } from './recommendationService.js';

export class MealPlanGenerator {
  public static async generatePlanForUser(
    userId: string | Types.ObjectId,
    targetDate?: Date,
    dietTypeOverride?: 'veg' | 'non_veg' | 'eggetarian' | 'vegan'
  ): Promise<{
    mealPlan: IMealPlan;
    items: any[];
  }> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new Error('User profile not found. Please complete profile setup first.');
    }

    const date = targetDate || new Date();
    date.setHours(0, 0, 0, 0);

    const activeDietType = dietTypeOverride || profile.dietType;

    // Fetch all active foods
    const foods = await Food.find({ isActive: true });
    const foodRegionsList = await FoodRegion.find({ regionId: profile.regionId, isActive: true });
    
    const foodRegionMap = new Map<string, IFoodRegion>();
    foodRegionsList.forEach((fr) => foodRegionMap.set(fr.foodId.toString(), fr));

    // Score candidates with diet override
    const scoredCandidates = await RecommendationService.scoreCandidateFoods(foods, foodRegionMap, profile, activeDietType);

    if (scoredCandidates.length === 0) {
      throw new Error(`No compatible foods available for ${activeDietType} diet in your region.`);
    }

    // Group candidates by meal category
    const categoryMap: Record<string, IScoredFood[]> = {
      breakfast: scoredCandidates.filter((c) => c.food.category === 'breakfast' || c.food.category === 'snack'),
      mid_morning: scoredCandidates.filter((c) => c.food.category === 'snack' || c.food.category === 'beverage' || c.food.category === 'breakfast'),
      lunch: scoredCandidates.filter((c) => c.food.category === 'lunch' || c.food.category === 'dinner'),
      evening_snack: scoredCandidates.filter((c) => c.food.category === 'snack' || c.food.category === 'beverage'),
      dinner: scoredCandidates.filter((c) => c.food.category === 'dinner' || c.food.category === 'lunch'),
    };

    // Target Calorie Allocations per Slot
    const slotAllocations: Array<{
      mealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
      caloriePct: number;
    }> = [
      { mealType: 'breakfast', caloriePct: 0.25 },
      { mealType: 'mid_morning', caloriePct: 0.10 },
      { mealType: 'lunch', caloriePct: 0.35 },
      { mealType: 'evening_snack', caloriePct: 0.10 },
      { mealType: 'dinner', caloriePct: 0.20 },
    ];

    const targetCal = profile.dailyCalorieTarget || 2000;

    // Delete previous meal plan for today if generated
    const existingPlan = await MealPlan.findOne({ userId, date });
    if (existingPlan) {
      await MealPlanItem.deleteMany({ mealPlanId: existingPlan._id });
      await MealPlan.deleteOne({ _id: existingPlan._id });
    }

    const createdItems: any[] = [];
    let accumCal = 0;
    let accumProtein = 0;
    let accumCarbs = 0;
    let accumFat = 0;

    // Create Meal Plan Document first
    const mealPlan = new MealPlan({
      userId: profile.userId,
      date,
      regionId: profile.regionId,
      dietType: activeDietType,
      fitnessGoal: profile.fitnessGoal,
      targetCalories: targetCal,
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
      status: 'generated',
    });

    for (const slot of slotAllocations) {
      const candidates = categoryMap[slot.mealType];
      const candidate = candidates.length > 0 ? candidates[0] : scoredCandidates[0];
      const food = candidate.food;

      const slotCalorieTarget = targetCal * slot.caloriePct;
      const defaultServingCal = food.nutrition.calories || 150;

      const scaleFactor = slotCalorieTarget / defaultServingCal;
      const quantityG = Math.round((food.defaultServingSize || 100) * scaleFactor);

      const calories = Math.round(food.nutrition.calories * scaleFactor);
      const proteinG = Math.round((food.nutrition.proteinG * scaleFactor) * 10) / 10;
      const carbsG = Math.round((food.nutrition.carbohydratesG * scaleFactor) * 10) / 10;
      const fatG = Math.round((food.nutrition.fatG * scaleFactor) * 10) / 10;

      accumCal += calories;
      accumProtein += proteinG;
      accumCarbs += carbsG;
      accumFat += fatG;

      const item = new MealPlanItem({
        mealPlanId: mealPlan._id,
        mealType: slot.mealType,
        foodId: food._id,
        quantityG,
        calories,
        proteinG,
        carbsG,
        fatG,
        isCompleted: false,
      });

      await item.save();
      createdItems.push({
        ...item.toObject(),
        food,
        reasons: candidate.reasons,
        score: candidate.totalScore,
      });

      await Recommendation.create({
        userId: profile.userId,
        foodId: food._id,
        mealType: slot.mealType,
        score: candidate.totalScore,
        reasons: candidate.reasons,
        regionMatch: candidate.regionMatch,
        nutritionMatch: candidate.nutritionMatch,
        preferenceMatch: candidate.preferenceMatch,
        goalMatch: candidate.goalMatch,
        availabilityMatch: candidate.availabilityMatch,
      });
    }

    mealPlan.totalCalories = Math.round(accumCal);
    mealPlan.totalProteinG = Math.round(accumProtein);
    mealPlan.totalCarbsG = Math.round(accumCarbs);
    mealPlan.totalFatG = Math.round(accumFat);

    await mealPlan.save();

    return {
      mealPlan,
      items: createdItems,
    };
  }

  public static async recalculatePlanTotals(mealPlanId: string | Types.ObjectId): Promise<IMealPlan | null> {
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) return null;

    const items = await MealPlanItem.find({ mealPlanId });
    let totalCalories = 0;
    let totalProteinG = 0;
    let totalCarbsG = 0;
    let totalFatG = 0;

    items.forEach((item) => {
      totalCalories += item.calories || 0;
      totalProteinG += item.proteinG || 0;
      totalCarbsG += item.carbsG || 0;
      totalFatG += item.fatG || 0;
    });

    mealPlan.totalCalories = Math.round(totalCalories);
    mealPlan.totalProteinG = Math.round(totalProteinG);
    mealPlan.totalCarbsG = Math.round(totalCarbsG);
    mealPlan.totalFatG = Math.round(totalFatG);

    await mealPlan.save();
    return mealPlan;
  }
}
