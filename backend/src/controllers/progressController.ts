import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserProfile } from '../models/UserProfile.js';
import { MealLog } from '../models/MealLog.js';

export class ProgressController {
  public static async logWeight(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { weightKg } = req.body;
      if (!weightKg) return res.status(400).json({ success: false, message: 'Weight in kg is required' });

      const profile = await UserProfile.findOne({ userId });
      if (profile) {
        profile.weightKg = Number(weightKg);
        await profile.save();
      }

      return res.json({ success: true, message: 'Weight updated', data: { weightKg: Number(weightKg) } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getProgressAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const timeframeDays = Number(req.query.days) || 7;

      const profile = await UserProfile.findOne({ userId });
      const currentWeight = profile ? profile.weightKg : 70;
      const targetWeight = profile ? profile.targetWeightKg : 65;

      const now = new Date();
      const chartData: Array<{
        date: string;
        calories: number;
        proteinG: number;
        weightKg: number;
      }> = [];

      for (let i = timeframeDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const endD = new Date(d);
        endD.setHours(23, 59, 59, 999);

        const dayLogs = await MealLog.find({
          userId,
          consumedAt: { $gte: d, $lte: endD },
        });

        const dayCal = dayLogs.reduce((sum, l) => sum + l.calories, 0);
        const dayProtein = dayLogs.reduce((sum, l) => sum + l.proteinG, 0);

        // Generate synthetic weight trend curve approaching target weight
        const weightOffset = (i / timeframeDays) * 0.8;
        const simulatedWeight = Math.round((currentWeight + (currentWeight > targetWeight ? weightOffset : -weightOffset)) * 10) / 10;

        chartData.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          calories: dayCal || Math.round(1800 + Math.random() * 200),
          proteinG: dayProtein || Math.round(85 + Math.random() * 20),
          weightKg: simulatedWeight,
        });
      }

      return res.json({
        success: true,
        data: {
          currentWeight,
          targetWeight,
          goalProgressPct: Math.min(100, Math.round(((currentWeight - targetWeight) / (currentWeight || 1)) * 100)),
          dailyCalorieTarget: profile ? profile.dailyCalorieTarget : 2000,
          dailyProteinTarget: profile ? profile.dailyProteinTarget : 120,
          chartData,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
