import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { MealLog } from '../models/MealLog.js';
import { Food } from '../models/Food.js';

export class MealLogController {
  public static async logMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { foodId, mealType, quantityG, consumedAt, source } = req.body;

      const food = await Food.findById(foodId);
      if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

      const defaultG = food.defaultServingSize || 100;
      const scale = (Number(quantityG) || defaultG) / defaultG;

      const calories = Math.round(food.nutrition.calories * scale);
      const proteinG = Math.round(food.nutrition.proteinG * scale * 10) / 10;
      const carbsG = Math.round(food.nutrition.carbohydratesG * scale * 10) / 10;
      const fatG = Math.round(food.nutrition.fatG * scale * 10) / 10;

      const mealLog = new MealLog({
        userId,
        foodId,
        mealType: mealType || food.category || 'snack',
        quantityG: Number(quantityG) || defaultG,
        calories,
        proteinG,
        carbsG,
        fatG,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        source: source || 'manual',
      });

      await mealLog.save();
      const populated = await MealLog.findById(mealLog._id).populate('foodId');

      return res.status(201).json({
        success: true,
        message: 'Meal logged successfully',
        data: populated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getLogs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { date } = req.query;

      const start = date ? new Date(date as string) : new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const logs = await MealLog.find({
        userId,
        consumedAt: { $gte: start, $lte: end },
      }).populate('foodId').sort({ consumedAt: -1 });

      const totalCal = logs.reduce((acc, l) => acc + l.calories, 0);
      const totalProtein = logs.reduce((acc, l) => acc + l.proteinG, 0);
      const totalCarbs = logs.reduce((acc, l) => acc + l.carbsG, 0);
      const totalFat = logs.reduce((acc, l) => acc + l.fatG, 0);

      return res.json({
        success: true,
        data: {
          logs,
          summary: {
            totalCalories: Math.round(totalCal),
            totalProteinG: Math.round(totalProtein),
            totalCarbsG: Math.round(totalCarbs),
            totalFatG: Math.round(totalFat),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteLog(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await MealLog.deleteOne({ _id: id, userId: req.user!._id });
      return res.json({ success: true, message: 'Log deleted' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
