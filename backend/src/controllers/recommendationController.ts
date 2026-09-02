import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Recommendation } from '../models/Recommendation.js';
import { RecommendationFeedback } from '../models/RecommendationFeedback.js';
import { PersonalizationEngine } from '../services/personalizationEngine.js';

export class RecommendationController {
  public static async getRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const recommendations = await Recommendation.find({ userId })
        .populate('foodId')
        .sort({ createdAt: -1 })
        .limit(10);

      return res.json({ success: true, data: recommendations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async submitFeedback(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { foodId, recommendationId, rating, feedbackType, reason } = req.body;

      if (!foodId || !feedbackType) {
        return res.status(400).json({ success: false, message: 'foodId and feedbackType are required.' });
      }

      const feedback = new RecommendationFeedback({
        userId,
        foodId,
        recommendationId,
        rating: Number(rating) || 4,
        feedbackType,
        reason: reason || '',
      });

      await feedback.save();

      return res.status(201).json({
        success: true,
        message: 'Feedback recorded successfully. Future recommendations updated!',
        data: feedback,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getEatNowRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { timeSlot } = req.query;
      const result = await PersonalizationEngine.getEatNowRecommendations(userId, timeSlot as any);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async cookFromKitchen(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ success: false, message: 'Please select at least one ingredient from your kitchen.' });
      }

      const result = await PersonalizationEngine.getKitchenCookRecipes(userId, ingredients);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
