import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Trainer } from '../models/Trainer.js';
import { TrainerAssignment } from '../models/TrainerAssignment.js';
import { UserProfile } from '../models/UserProfile.js';
import { MealPlan } from '../models/MealPlan.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { NotificationService } from '../services/notificationService.js';

export class TrainerController {
  /**
   * List available certified personal trainers
   */
  public static async getTrainers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const trainers = await Trainer.find({ status: { $ne: 'inactive' } }).populate('userId', 'name email phone profileImage');
      res.json({ success: true, data: trainers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's assigned personal trainer
   */
  public static async getMyTrainer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const assignment = await TrainerAssignment.findOne({ userId, status: 'active' }).populate({
        path: 'trainerId',
        populate: { path: 'userId', select: 'name email phone profileImage' },
      });

      res.json({ success: true, data: assignment });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Request / Assign personal trainer to user
   */
  public static async requestTrainerAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { trainerId } = req.body;

      if (!userId || !trainerId) {
        res.status(400).json({ success: false, message: 'Trainer ID required' });
        return;
      }

      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        res.status(404).json({ success: false, message: 'Trainer not found' });
        return;
      }

      // Deactivate prior assignments
      await TrainerAssignment.updateMany({ userId, status: 'active' }, { status: 'expired' });

      const assignment = new TrainerAssignment({
        userId,
        trainerId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      });

      await assignment.save();

      await NotificationService.sendNotification(
        userId,
        'Personal Trainer Assigned!',
        `Coach ${trainer.name} has been assigned as your personal trainer.`,
        'trainer'
      );

      res.json({ success: true, message: 'Trainer assigned successfully', data: assignment });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Trainer Portal: Get clients assigned to the logged-in trainer
   */
  public static async getTrainerClients(req: AuthRequest, res: Response): Promise<void> {
    try {
      const trainerUser = req.user;
      if (trainerUser?.role !== 'trainer' && trainerUser?.role !== 'admin' && trainerUser?.role !== 'super_admin') {
        res.status(403).json({ success: false, message: 'Trainer authorization required' });
        return;
      }

      const trainerDoc = await Trainer.findOne({ userId: trainerUser.id });
      if (!trainerDoc && trainerUser?.role === 'trainer') {
        res.status(404).json({ success: false, message: 'Trainer profile not found' });
        return;
      }

      const filter: any = { status: 'active' };
      if (trainerDoc) filter.trainerId = trainerDoc._id;

      const assignments = await TrainerAssignment.find(filter)
        .populate('userId', 'name email phone profileImage')
        .sort({ createdAt: -1 });

      // Fetch client details, profiles, and recent progress
      const clients = [];
      for (const assign of assignments) {
        const profile = await UserProfile.findOne({ userId: assign.userId._id }).populate('regionId');
        const recentMealPlan = await MealPlan.findOne({ userId: assign.userId._id }).sort({ date: -1 });
        const workoutLogs = await WorkoutLog.find({ userId: assign.userId._id }).sort({ completedAt: -1 }).limit(5);

        clients.push({
          assignmentId: assign._id,
          user: assign.userId,
          startDate: assign.startDate,
          status: assign.status,
          profile,
          recentMealPlan,
          recentWorkouts: workoutLogs,
        });
      }

      res.json({ success: true, data: clients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
