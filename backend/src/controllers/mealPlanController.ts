import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { MealPlanGenerator } from '../services/mealPlanGenerator.js';
import { RecommendationService } from '../services/recommendationService.js';
import { MealPlan } from '../models/MealPlan.js';
import { MealPlanItem } from '../models/MealPlanItem.js';
import { Recommendation } from '../models/Recommendation.js';
import { Food } from '../models/Food.js';
import { FoodRegion } from '../models/FoodRegion.js';
import { UserProfile } from '../models/UserProfile.js';
import { AuditLog } from '../models/AuditLog.js';

export class MealPlanController {
  public static async generateMealPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { dietType } = req.body || {};
      const result = await MealPlanGenerator.generatePlanForUser(userId, undefined, dietType);
      return res.status(201).json({
        success: true,
        message: 'Personalized meal plan generated successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to generate meal plan' });
    }
  }

  public static async getTodayMealPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let mealPlan = await MealPlan.findOne({ userId, date: today });
      
      if (!mealPlan) {
        try {
          const generated = await MealPlanGenerator.generatePlanForUser(userId, today);
          return res.json({ success: true, data: generated });
        } catch (err: any) {
          return res.status(404).json({ success: false, message: 'No meal plan found for today. Please generate one.' });
        }
      }

      const items = await MealPlanItem.find({ mealPlanId: mealPlan._id }).populate('foodId');
      
      const itemsWithReasons = await Promise.all(
        items.map(async (item) => {
          const rec = await Recommendation.findOne({ userId, foodId: item.foodId }).sort({ createdAt: -1 });
          return {
            ...item.toObject(),
            food: item.foodId,
            reasons: rec ? rec.reasons : ['✓ Balanced nutrition choice matching your region'],
            score: rec ? rec.score : 85,
          };
        })
      );

      return res.json({
        success: true,
        data: {
          mealPlan,
          items: itemsWithReasons,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateTodayDietType(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { dietType } = req.body;
      if (!dietType || !['veg', 'non_veg', 'eggetarian'].includes(dietType)) {
        return res.status(400).json({ success: false, message: 'Invalid diet type specified' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await MealPlanGenerator.generatePlanForUser(userId, today, dietType);
      
      await AuditLog.create({
        userId,
        action: 'DIET_TYPE_CHANGED',
        resource: 'MealPlan',
        details: { newDietType: dietType },
      });

      return res.json({
        success: true,
        message: `Today's meal plan updated to ${dietType.replace('_', ' ')} diet`,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getItemAlternatives(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { itemId } = req.params;
      const { dietFilter } = req.query;

      const currentItem = await MealPlanItem.findById(itemId).populate('foodId');
      if (!currentItem) {
        return res.status(404).json({ success: false, message: 'Meal plan item not found' });
      }

      const profile = await UserProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      const activeDietFilter = (dietFilter as any) || profile.dietType;

      const foods = await Food.find({ isActive: true });
      const foodRegionsList = await FoodRegion.find({ regionId: profile.regionId, isActive: true });
      const foodRegionMap = new Map<string, any>();
      foodRegionsList.forEach((fr) => foodRegionMap.set(fr.foodId.toString(), fr));

      const scoredCandidates = await RecommendationService.scoreCandidateFoods(
        foods,
        foodRegionMap,
        profile,
        activeDietFilter
      );

      const currentFood = currentItem.foodId as any;
      const alternatives = scoredCandidates
        .filter((c) => c.food._id.toString() !== currentFood?._id?.toString())
        .slice(0, 8)
        .map((candidate) => {
          const food = candidate.food;
          const targetSlotCal = currentItem.calories;
          const scaleFactor = targetSlotCal / (food.nutrition.calories || 150);
          const quantityG = Math.round((food.defaultServingSize || 100) * scaleFactor);

          const altCalories = Math.round(food.nutrition.calories * scaleFactor);
          const altProtein = Math.round(food.nutrition.proteinG * scaleFactor * 10) / 10;
          const altCarbs = Math.round(food.nutrition.carbohydratesG * scaleFactor * 10) / 10;
          const altFat = Math.round(food.nutrition.fatG * scaleFactor * 10) / 10;

          return {
            food,
            quantityG,
            calories: altCalories,
            proteinG: altProtein,
            carbsG: altCarbs,
            fatG: altFat,
            score: candidate.totalScore,
            reasons: candidate.reasons,
            calorieDelta: altCalories - currentItem.calories,
            proteinDelta: Math.round((altProtein - currentItem.proteinG) * 10) / 10,
            carbsDelta: Math.round((altCarbs - currentItem.carbsG) * 10) / 10,
            fatDelta: Math.round((altFat - currentItem.fatG) * 10) / 10,
          };
        });

      return res.json({
        success: true,
        data: {
          currentItem,
          alternatives,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async replaceMealItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { itemId } = req.params;
      const { replacementFoodId, quantityG } = req.body;

      const item = await MealPlanItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Meal item not found' });
      }

      const replacementFood = await Food.findById(replacementFoodId);
      if (!replacementFood) {
        return res.status(404).json({ success: false, message: 'Replacement food item not found' });
      }

      const qtyG = Number(quantityG) || replacementFood.defaultServingSize || 100;
      const scale = qtyG / (replacementFood.defaultServingSize || 100);

      const calories = Math.round(replacementFood.nutrition.calories * scale);
      const proteinG = Math.round(replacementFood.nutrition.proteinG * scale * 10) / 10;
      const carbsG = Math.round(replacementFood.nutrition.carbohydratesG * scale * 10) / 10;
      const fatG = Math.round(replacementFood.nutrition.fatG * scale * 10) / 10;

      item.foodId = replacementFood._id;
      item.quantityG = qtyG;
      item.calories = calories;
      item.proteinG = proteinG;
      item.carbsG = carbsG;
      item.fatG = fatG;
      item.isCompleted = false;

      await item.save();

      const updatedPlan = await MealPlanGenerator.recalculatePlanTotals(item.mealPlanId);

      await AuditLog.create({
        userId,
        action: 'MEAL_REPLACED',
        entity: 'MealPlanItem',
        entityId: item._id.toString(),
        description: `Replaced meal item with ${replacementFood.name} (${calories} kcal, ${proteinG}g protein)`,
      });

      return res.json({
        success: true,
        message: 'Meal replaced successfully',
        data: {
          item: {
            ...item.toObject(),
            food: replacementFood,
          },
          mealPlan: updatedPlan,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateItemStatus(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const { isCompleted } = req.body;
      const item = await MealPlanItem.findByIdAndUpdate(itemId, { isCompleted: !!isCompleted }, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Meal plan item not found' });
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
