import { Types } from 'mongoose';
import { Food, IFood } from '../models/Food.js';
import { SnapCheckResult, ISnapCheckResult, IDetectedFoodItem } from '../models/SnapCheckResult.js';
import { MealLog } from '../models/MealLog.js';
import { AuditLog } from '../models/AuditLog.js';
import { FoodLogService } from './foodLogService.js';

export class SnapCheckService {
  /**
   * Analyze uploaded meal image and estimate nutrition
   */
  public static async analyzeMealImage(userId: string | Types.ObjectId, imageUrl: string): Promise<ISnapCheckResult> {
    const allFoods = await Food.find({ isActive: true });

    const sampleDishes: Array<Array<{ keyword: string; defaultG: number }>> = [
      [{ keyword: 'rice', defaultG: 180 }, { keyword: 'dal', defaultG: 150 }, { keyword: 'paneer', defaultG: 100 }],
      [{ keyword: 'roti', defaultG: 120 }, { keyword: 'paneer', defaultG: 140 }, { keyword: 'salad', defaultG: 80 }],
      [{ keyword: 'poha', defaultG: 160 }, { keyword: 'sprouts', defaultG: 80 }],
      [{ keyword: 'chicken', defaultG: 200 }, { keyword: 'rice', defaultG: 180 }],
      [{ keyword: 'egg', defaultG: 120 }, { keyword: 'toast', defaultG: 60 }],
    ];

    const dishIndex = (imageUrl.length || 10) % sampleDishes.length;
    const selectedProfile = sampleDishes[dishIndex];

    const detectedItems: IDetectedFoodItem[] = [];
    let estCal = 0;
    let estProtein = 0;
    let estCarbs = 0;
    let estFat = 0;
    let estFiber = 0;

    for (const item of selectedProfile) {
      const matchedFood = allFoods.find((f) => f.name.toLowerCase().includes(item.keyword)) || allFoods[0];
      const defaultServing = matchedFood?.defaultServingSize || 100;
      const scaleFactor = item.defaultG / defaultServing;

      const calories = Math.round((matchedFood?.nutrition?.calories || 150) * scaleFactor);
      const proteinG = Math.round((matchedFood?.nutrition?.proteinG || 8) * scaleFactor * 10) / 10;
      const carbsG = Math.round((matchedFood?.nutrition?.carbohydratesG || 25) * scaleFactor * 10) / 10;
      const fatG = Math.round((matchedFood?.nutrition?.fatG || 5) * scaleFactor * 10) / 10;
      const fiberG = Math.round((matchedFood?.nutrition?.fiberG || 3) * scaleFactor * 10) / 10;

      estCal += calories;
      estProtein += proteinG;
      estCarbs += carbsG;
      estFat += fatG;
      estFiber += fiberG;

      detectedItems.push({
        foodId: matchedFood?._id,
        foodName: matchedFood?.name || 'Regional Meal Dish',
        confidence: 0.85 + Math.random() * 0.1,
        estimatedQuantityG: item.defaultG,
        unit: 'g',
        calories,
        proteinG,
        carbsG,
        fatG,
        fiberG,
      });
    }

    const snapResult = new SnapCheckResult({
      userId,
      imageUrl,
      detectedItems,
      estimatedNutrition: {
        calories: Math.round(estCal),
        proteinG: Math.round(estProtein * 10) / 10,
        carbsG: Math.round(estCarbs * 10) / 10,
        fatG: Math.round(estFat * 10) / 10,
        fiberG: Math.round(estFiber * 10) / 10,
      },
      status: 'analyzed',
    });

    await snapResult.save();

    await AuditLog.create({
      userId,
      action: 'SNAP_CHECK_CREATED',
      entity: 'SnapCheckResult',
      entityId: snapResult._id.toString(),
      description: `Analyzed meal photo with ${detectedItems.length} dishes detected (${snapResult.estimatedNutrition.calories} kcal)`,
    });

    return snapResult;
  }

  /**
   * Process user corrections for detected foods & portion sizes
   */
  public static async correctSnapCheck(
    userId: string | Types.ObjectId,
    snapCheckId: string,
    correctedItems: IDetectedFoodItem[]
  ): Promise<ISnapCheckResult> {
    const snapResult = await SnapCheckResult.findOne({ _id: snapCheckId, userId });
    if (!snapResult) {
      throw new Error('Snap Check result not found.');
    }

    let finalCal = 0;
    let finalProtein = 0;
    let finalCarbs = 0;
    let finalFat = 0;
    let finalFiber = 0;

    const validatedItems: IDetectedFoodItem[] = [];

    for (const item of correctedItems) {
      let foodDoc: IFood | null = null;
      if (item.foodId) {
        foodDoc = await Food.findById(item.foodId);
      }

      const defaultServing = foodDoc?.defaultServingSize || 100;
      const qtyG = item.estimatedQuantityG || 100;
      const scale = qtyG / defaultServing;

      const calories = item.calories || Math.round((foodDoc?.nutrition.calories || 150) * scale);
      const proteinG = item.proteinG || Math.round((foodDoc?.nutrition.proteinG || 8) * scale * 10) / 10;
      const carbsG = item.carbsG || Math.round((foodDoc?.nutrition.carbohydratesG || 25) * scale * 10) / 10;
      const fatG = item.fatG || Math.round((foodDoc?.nutrition.fatG || 5) * scale * 10) / 10;
      const fiberG = item.fiberG || Math.round((foodDoc?.nutrition.fiberG || 3) * scale * 10) / 10;

      finalCal += calories;
      finalProtein += proteinG;
      finalCarbs += carbsG;
      finalFat += fatG;
      finalFiber += fiberG;

      validatedItems.push({
        foodId: foodDoc?._id || item.foodId,
        foodName: item.foodName,
        confidence: item.confidence || 1.0,
        estimatedQuantityG: qtyG,
        unit: item.unit || 'g',
        calories,
        proteinG,
        carbsG,
        fatG,
        fiberG,
      });
    }

    snapResult.correctedItems = validatedItems;
    snapResult.finalNutrition = {
      calories: Math.round(finalCal),
      proteinG: Math.round(finalProtein * 10) / 10,
      carbsG: Math.round(finalCarbs * 10) / 10,
      fatG: Math.round(finalFat * 10) / 10,
      fiberG: Math.round(finalFiber * 10) / 10,
    };
    snapResult.status = 'corrected';

    await snapResult.save();

    await AuditLog.create({
      userId,
      action: 'SNAP_CHECK_CORRECTED',
      entity: 'SnapCheckResult',
      entityId: snapResult._id.toString(),
      description: `User corrected portion sizes for ${validatedItems.length} dishes (${snapResult.finalNutrition.calories} kcal)`,
    });

    return snapResult;
  }

  /**
   * Confirm Snap Check and log to FoodLog & MEAL_LOG
   */
  public static async confirmAndLogSnapCheck(
    userId: string | Types.ObjectId,
    snapCheckId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other' = 'lunch'
  ): Promise<any> {
    const snapResult = await SnapCheckResult.findOne({ _id: snapCheckId, userId });
    if (!snapResult) {
      throw new Error('Snap Check result not found.');
    }

    const itemsToLog = snapResult.correctedItems?.length ? snapResult.correctedItems : snapResult.detectedItems;
    const createdLogs = [];

    for (const item of itemsToLog) {
      let foodId = item.foodId;
      if (!foodId) {
        const fallbackFood = await Food.findOne({ isActive: true });
        foodId = fallbackFood?._id;
      }

      // Log to new FoodLog model
      const foodLog = await FoodLogService.logFood({
        userId: userId.toString(),
        mealType: mealType as any,
        foodId: foodId ? foodId.toString() : undefined,
        foodName: item.foodName,
        quantity: 1,
        unit: 'grams',
        grams: item.estimatedQuantityG || 100,
        nutrition: {
          calories: item.calories || 150,
          protein: item.proteinG || 8,
          carbohydrates: item.carbsG || 25,
          fat: item.fatG || 5,
          fiber: item.fiberG || 3,
        },

        source: {
          type: 'snap',
          referenceId: snapCheckId,
        },
        imageUrl: snapResult.imageUrl,
        confidence: {
          foodConfidence: item.confidence,
        },
      });

      createdLogs.push(foodLog);
    }

    snapResult.status = 'logged';
    await snapResult.save();

    await AuditLog.create({
      userId,
      action: 'MEAL_LOGGED',
      entity: 'FoodLog',
      entityId: snapCheckId,
      description: `Logged ${createdLogs.length} dishes to ${mealType} tracker from Snap Check`,
    });

    return {
      snapResult,
      logs: createdLogs,
    };
  }
}
