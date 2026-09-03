import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { SnapCheckService } from '../services/snapCheckService.js';
import { SnapCheckResult } from '../models/SnapCheckResult.js';
import { eventBus } from '../services/eventEngine.js';

export class SnapCheckController {
  public static async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const history = await SnapCheckResult.find({ userId }).sort({ createdAt: -1 }).limit(20);
      return res.json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async analyzeImage(req: AuthRequest, res: Response) {

    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User authentication required. Please log in.' });
      }

      const userId = req.user._id;
      const { imageUrl } = req.body || {};
      const fileUrl = imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

      const snapResult = await SnapCheckService.analyzeMealImage(userId, fileUrl);

      // Emit SNAP_CHECK_COMPLETED Event
      eventBus.emit('SNAP_CHECK_COMPLETED', {
        userId: userId.toString(),
        foodName: snapResult.detectedItems?.[0]?.foodName || 'Regional Meal',
        calories: snapResult.estimatedNutrition?.calories || 350,
        proteinG: snapResult.estimatedNutrition?.proteinG || 18,
      });

      return res.status(201).json({
        success: true,
        message: 'Meal image analyzed successfully',
        data: snapResult,
      });
    } catch (error: any) {
      console.error('Snap Check Analyze error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to analyze meal image' });
    }
  }

  public static async getSnapCheckById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const snapResult = await SnapCheckResult.findOne({ _id: id, userId });
      if (!snapResult) {
        return res.status(404).json({ success: false, message: 'Snap Check record not found' });
      }

      return res.json({ success: true, data: snapResult });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async correctAnalysis(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { id } = req.params;
      const { correctedItems } = req.body;

      if (!Array.isArray(correctedItems)) {
        return res.status(400).json({ success: false, message: 'correctedItems array is required' });
      }

      const snapResult = await SnapCheckService.correctSnapCheck(userId, id, correctedItems);
      return res.json({
        success: true,
        message: 'Snap Check corrected successfully',
        data: snapResult,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async confirmAndLog(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { id } = req.params;
      const { mealType } = req.body || {};

      const result = await SnapCheckService.confirmAndLogSnapCheck(userId, id, mealType || 'lunch');
      return res.json({
        success: true,
        message: 'Meal confirmed and logged to daily nutrition tracker',
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
