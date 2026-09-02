import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { FoodLogService } from '../services/foodLogService.js';

export class FoodLogController {
  public static async logFood(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { date, mealType, foodId, foodName, quantity, unit, grams, nutrition, source, imageUrl, confidence } = req.body;

      if (!foodName) {
        return res.status(400).json({ success: false, message: 'foodName is required' });
      }

      const log = await FoodLogService.logFood({
        userId,
        date,
        mealType,
        foodId,
        foodName,
        quantity: Number(quantity) || 1,
        unit: unit || 'grams',
        grams: Number(grams) || 100,
        nutrition,
        source,
        imageUrl,
        confidence,
      });

      return res.status(201).json({
        success: true,
        message: 'Food logged successfully to consumed daily nutrition',
        data: log,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getTodayLogs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const dateStr = (req.query.date as string) || undefined;
      const summary = await FoodLogService.getTodayConsumedSummary(userId, dateStr);

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getRecentFoods(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const limit = Number(req.query.limit) || 10;
      const recents = await FoodLogService.getRecentFoods(userId, limit);

      return res.json({
        success: true,
        data: recents,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateLog(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { id } = req.params;
      const { quantity, grams, mealType, foodName } = req.body;

      const updated = await FoodLogService.updateFoodLog(id, userId, {
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        grams: grams !== undefined ? Number(grams) : undefined,
        mealType,
        foodName,
      });

      return res.json({
        success: true,
        message: 'Food log updated successfully',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteLog(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { id } = req.params;

      await FoodLogService.deleteFoodLog(id, userId);

      return res.json({
        success: true,
        message: 'Food log deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getFavorites(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const favorites = await FoodLogService.getFavorites(userId);

      return res.json({
        success: true,
        data: favorites,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async toggleFavorite(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { foodId, foodName, grams, nutrition } = req.body;

      if (!foodName || !nutrition) {
        return res.status(400).json({ success: false, message: 'foodName and nutrition required' });
      }

      const result = await FoodLogService.toggleFavorite(userId, { foodId, foodName, grams, nutrition });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
