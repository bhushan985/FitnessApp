import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { HealthMetric } from '../models/HealthMetric.js';
import { UserProfile } from '../models/UserProfile.js';
import { WaterLog } from '../models/WaterLog.js';
import { WeightLog } from '../models/WeightLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { MedicineReminder } from '../models/MedicineReminder.js';
import { TrackerSettings } from '../models/TrackerSettings.js';
import { HealthDashboardService } from '../services/healthDashboardService.js';
import { User } from '../models/User.js';

export class HealthController {
  /**
   * Get Unified Daily Health Dashboard Payload
   */
  public static async getDailyDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const userRecord = await User.findById(userId);
      const dashboard = await HealthDashboardService.getDailyDashboard(userId, dateStr, userRecord?.name);

      return res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      console.error('getDailyDashboard error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch health dashboard' });
    }
  }

  /**
   * Log Water Intake
   */
  public static async logWater(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { date, amountMl, glassSizeMl, action } = req.body;
      const dateStr = date || new Date().toISOString().split('T')[0];

      let waterRecord = await WaterLog.findOne({ userId, date: dateStr });
      const size = Number(glassSizeMl) || 250;

      if (!waterRecord) {
        waterRecord = new WaterLog({
          userId,
          date: dateStr,
          amountMl: 0,
          glasses: 0,
          glassSizeMl: size,
          logs: [],
        });
      }

      if (action === 'add') {
        const delta = Number(amountMl) || size;
        waterRecord.amountMl += delta;
        waterRecord.glasses = Math.floor(waterRecord.amountMl / size);
        waterRecord.logs.push({ amountMl: delta, timestamp: new Date() });
      } else if (action === 'subtract') {
        const delta = Number(amountMl) || size;
        waterRecord.amountMl = Math.max(0, waterRecord.amountMl - delta);
        waterRecord.glasses = Math.floor(waterRecord.amountMl / size);
      } else if (action === 'reset') {
        waterRecord.amountMl = 0;
        waterRecord.glasses = 0;
        waterRecord.logs = [];
      } else if (amountMl !== undefined) {
        waterRecord.amountMl = Number(amountMl);
        waterRecord.glasses = Math.floor(waterRecord.amountMl / size);
      }

      await waterRecord.save();

      return res.json({
        success: true,
        message: 'Water log updated successfully',
        data: waterRecord,
      });
    } catch (error: any) {
      console.error('logWater error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to log water' });
    }
  }

  /**
   * Log Weight Record
   */
  public static async logWeight(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { weightKg, date, note } = req.body;

      if (!weightKg) {
        return res.status(400).json({ success: false, message: 'weightKg is required' });
      }

      const dateStr = date || new Date().toISOString().split('T')[0];

      const weightLog = await WeightLog.create({
        userId,
        date: dateStr,
        weightKg: Number(weightKg),
        note: note || '',
        loggedAt: new Date(),
      });

      // Synchronize weight to UserProfile
      await UserProfile.findOneAndUpdate({ userId }, { weightKg: Number(weightKg) });

      return res.json({
        success: true,
        message: 'Weight logged successfully',
        data: weightLog,
      });
    } catch (error: any) {
      console.error('logWeight error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to log weight' });
    }
  }

  /**
   * Log Sleep Record & Goal Setup
   */
  public static async logSleep(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { sleepHours, targetHours, bedtime, wakeTime, quality, date, source } = req.body;
      const dateStr = date || new Date().toISOString().split('T')[0];

      const sleepRecord = await SleepLog.findOneAndUpdate(
        { userId, date: dateStr },
        {
          sleepHours: sleepHours !== undefined ? Number(sleepHours) : undefined,
          targetHours: targetHours !== undefined ? Number(targetHours) : undefined,
          bedtime: bedtime || undefined,
          wakeTime: wakeTime || undefined,
          quality: quality || undefined,
          source: source || 'manual',
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Synchronize sleepHours to HealthMetric
      if (sleepHours !== undefined) {
        await HealthMetric.findOneAndUpdate(
          { userId, date: dateStr },
          { sleepHours: Number(sleepHours) },
          { upsert: true }
        );
      }

      return res.json({
        success: true,
        message: 'Sleep record saved successfully',
        data: sleepRecord,
      });
    } catch (error: any) {
      console.error('logSleep error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to log sleep' });
    }
  }

  /**
   * Add New Medicine Reminder
   */
  public static async addMedicineReminder(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { name, dosage, time, frequency, notes, startDate, endDate } = req.body;

      if (!name || !dosage || !time) {
        return res.status(400).json({ success: false, message: 'Name, dosage, and time are required' });
      }

      const reminder = await MedicineReminder.create({
        userId,
        name,
        dosage,
        time,
        frequency: frequency || 'daily',
        notes: notes || '',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate,
        isActive: true,
        statusByDate: new Map(),
      });

      return res.json({
        success: true,
        message: 'Medicine reminder created successfully',
        data: reminder,
      });
    } catch (error: any) {
      console.error('addMedicineReminder error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to create medicine reminder' });
    }
  }

  /**
   * Update Medicine Reminder Status (taken / skipped / pending)
   */
  public static async updateMedicineStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { reminderId, status, date } = req.body;
      const dateStr = date || new Date().toISOString().split('T')[0];

      const reminder = await MedicineReminder.findOne({ _id: reminderId, userId });
      if (!reminder) {
        return res.status(404).json({ success: false, message: 'Medicine reminder not found' });
      }

      if (!reminder.statusByDate) {
        reminder.statusByDate = new Map();
      }

      reminder.statusByDate.set(dateStr, status);
      await reminder.save();

      return res.json({
        success: true,
        message: `Medicine marked as ${status}`,
        data: reminder,
      });
    } catch (error: any) {
      console.error('updateMedicineStatus error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to update medicine status' });
    }
  }

  /**
   * Fetch Tracker Settings
   */
  public static async getSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      let settings = await TrackerSettings.findOne({ userId });
      if (!settings) {
        settings = await TrackerSettings.create({ userId });
      }

      return res.json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update Tracker Settings
   */
  public static async updateSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const updateData = req.body;

      const settings = await TrackerSettings.findOneAndUpdate({ userId }, updateData, {
        upsert: true,
        new: true,
        runValidators: true,
      });

      return res.json({ success: true, message: 'Tracker settings updated', data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch Multi-Day Health Analysis & Trends
   */
  public static async getAnalysis(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const days = Number(req.query.days) || 7;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Gather daily historical data
      const history = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        const dash = await HealthDashboardService.getDailyDashboard(userId, dateStr);
        history.push({
          date: dateStr,
          calories: dash.summary.calories.consumed,
          proteinG: dash.summary.protein.consumed,
          waterMl: dash.summary.water.amountMl,
          steps: dash.summary.steps.current,
          sleepHours: dash.summary.sleep.hours,
          weightKg: dash.summary.weight.currentKg,
          healthScore: dash.healthScore.total,
        });
      }

      return res.json({
        success: true,
        data: {
          days,
          history,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Ask NutriRegion AI Assistant
   */
  public static async askAI(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ success: false, message: 'Question prompt is required' });
      }

      const aiResponse = await HealthDashboardService.answerAIHealthQuestion(userId, question);

      return res.json({
        success: true,
        data: {
          question,
          answer: aiResponse,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Smart Regional Food Recommendations
   */
  public static async getRecommendations(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const recs = await HealthDashboardService.getSmartFoodRecommendations(userId);

      return res.json({
        success: true,
        data: recs,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Synchronize Health Metrics from Apple Health / Health Connect / Manual Sync
   */
  public static async syncHealthMetrics(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const { date, steps, sleepHours, restingHeartRate, averageHeartRate, activeCalories, weightKg, source } = req.body;

      const dateStr = date || new Date().toISOString().split('T')[0];

      const healthRecord = await HealthMetric.findOneAndUpdate(
        { userId, date: dateStr },
        {
          steps: steps !== undefined ? Number(steps) : undefined,
          sleepHours: sleepHours !== undefined ? Number(sleepHours) : undefined,
          restingHeartRate: restingHeartRate !== undefined ? Number(restingHeartRate) : undefined,
          averageHeartRate: averageHeartRate !== undefined ? Number(averageHeartRate) : undefined,
          activeCalories: activeCalories !== undefined ? Number(activeCalories) : undefined,
          weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
          source: source || 'apple_health',
          syncedAt: new Date(),
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Update Health Integration status in UserProfile
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          'healthIntegration.appleHealthConnected': source === 'apple_health' ? true : undefined,
          'healthIntegration.healthConnectConnected': source === 'health_connect' ? true : undefined,
          'healthIntegration.lastSyncedAt': new Date(),
          weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        }
      );

      return res.json({
        success: true,
        message: 'Health metrics synchronized successfully',
        data: healthRecord,
      });
    } catch (error: any) {
      console.error('syncHealthMetrics error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to sync health metrics' });
    }
  }

  /**
   * Get Today's Health Metrics
   */
  public static async getTodayHealth(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = req.user._id;
      const dateStr = new Date().toISOString().split('T')[0];

      const record = await HealthMetric.findOne({ userId, date: dateStr });
      return res.json({
        success: true,
        data: record || null,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
