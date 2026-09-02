import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { WorkoutService } from '../services/workoutService.js';
import { WorkoutGeneratorService } from '../services/workoutGeneratorService.js';
import { WorkoutAIQueryService } from '../services/workoutAIQueryService.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { ExerciseProgress } from '../models/ExerciseProgress.js';

export class WorkoutController {
  /**
   * Get Today's Recommended Workout
   */
  public static async getTodayWorkout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { day } = req.query;

      const workoutData = await WorkoutService.getTodayWorkout(day as string);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayLog = await WorkoutLog.findOne({
        userId,
        completedAt: { $gte: todayStart },
      });

      return res.json({
        success: true,
        data: {
          workoutPlan: workoutData.workoutPlan,
          isCompletedToday: !!todayLog,
          todayLog,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Generate Custom Workout via Deterministic Rules Engine
   */
  public static async generateWorkout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { muscleGroups, goal, experienceLevel, availableEquipment, durationMin, includeAbs, excludedExercises } = req.body;

      const workout = await WorkoutGeneratorService.generateWorkout({
        userId,
        muscleGroups,
        goal,
        experienceLevel,
        availableEquipment,
        durationMin: Number(durationMin) || 45,
        includeAbs: Boolean(includeAbs),
        excludedExercises,
      });

      return res.json({
        success: true,
        data: workout,
      });
    } catch (error: any) {
      console.error('generateWorkout error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to generate workout' });
    }
  }

  /**
   * Dedicated Abs / Core Generator
   */
  public static async generateAbsWorkout(req: AuthRequest, res: Response) {
    try {
      const durationMin = Number(req.body.durationMin) || 15;
      const workout = await WorkoutGeneratorService.generateAbsWorkout(durationMin);

      return res.json({
        success: true,
        data: workout,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Natural Language AI Workout Prompt Parser
   */
  public static async parseAIWorkout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Workout prompt text required' });
      }

      const workout = await WorkoutAIQueryService.parseAndGenerate(userId, prompt);

      return res.json({
        success: true,
        data: workout,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Complete Workout Session Log
   */
  public static async completeWorkout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { workoutPlanId, workoutTitle, completedExercises, durationMinutes, caloriesBurned, setsData } = req.body;

      if (!workoutTitle) {
        return res.status(400).json({ success: false, message: 'workoutTitle is required' });
      }

      const log = await WorkoutService.logWorkoutCompletion(userId, {
        workoutPlanId,
        workoutTitle,
        completedExercises: Array.isArray(completedExercises) ? completedExercises : [],
        durationMinutes: Number(durationMinutes) || 45,
        caloriesBurned: Number(caloriesBurned) || 320,
      });

      // Log set-level progressive overload metrics
      if (Array.isArray(setsData) && setsData.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        for (const item of setsData) {
          const { exerciseName, sets } = item;
          if (exerciseName && Array.isArray(sets)) {
            let maxW = 0;
            let vol = 0;
            sets.forEach((s: any) => {
              if (s.weightKg > maxW) maxW = s.weightKg;
              vol += (s.weightKg || 0) * (s.reps || 0);
            });

            await ExerciseProgress.findOneAndUpdate(
              { userId, exerciseName },
              {
                $set: {
                  lastPerformedAt: new Date(),
                },
                $max: {
                  personalRecordWeightKg: maxW,
                  bestSetVolume: vol,
                },
                $inc: { totalSessionsCompleted: 1 },
                $push: {
                  history: {
                    date: todayStr,
                    sets,
                    maxWeightKg: maxW,
                    totalVolumeKg: vol,
                  },
                },
              },
              { upsert: true, new: true }
            );
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Workout session logged & progressive overload updated',
        data: log,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch Exercise Progression Curve & Personal Records
   */
  public static async getExerciseProgressHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { exerciseName } = req.params;

      const progress = await ExerciseProgress.findOne({ userId, exerciseName });

      return res.json({
        success: true,
        data: progress || null,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch Saved Templates
   */
  public static async getTemplates(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const templates = await WorkoutTemplate.find({
        $or: [{ userId }, { isSystemPreset: true }],
      });

      return res.json({ success: true, data: templates });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Save Custom Template
   */
  public static async saveTemplate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { title, focusArea, exercises, estimatedDurationMin, difficulty } = req.body;

      const template = await WorkoutTemplate.create({
        userId,
        title,
        focusArea: focusArea || 'Custom Routine',
        exercises: exercises || [],
        estimatedDurationMin: Number(estimatedDurationMin) || 45,
        difficulty: difficulty || 'intermediate',
        isSystemPreset: false,
      });

      return res.status(201).json({ success: true, message: 'Workout template saved', data: template });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async customizeWorkout(req: AuthRequest, res: Response) {
    try {
      const { workoutPlanId } = req.params;
      const { exercises, title } = req.body;

      if (!exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ success: false, message: 'Exercises array required' });
      }

      const updatedPlan = await WorkoutService.updateWorkoutPlan(workoutPlanId, exercises, title);

      return res.json({
        success: true,
        message: 'Workout plan customized successfully',
        data: updatedPlan,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
