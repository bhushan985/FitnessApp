import { Types } from 'mongoose';
import { WorkoutPlan, IWorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutLog, IWorkoutLog } from '../models/WorkoutLog.js';
import { AuditLog } from '../models/AuditLog.js';

export class WorkoutService {
  /**
   * Fetch workout routine for today or given day of week
   */
  public static async getTodayWorkout(dayName?: string): Promise<{
    workoutPlan: IWorkoutPlan | null;
    isCompletedToday: boolean;
    todayLog: IWorkoutLog | null;
  }> {
    const days: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const todayIndex = new Date().getDay();
    const targetDay = (dayName?.toLowerCase() as any) || days[todayIndex];

    let workoutPlan = await WorkoutPlan.findOne({ targetDay, isActive: true });

    // Fallback: pick any active workout plan if specific day isn't seeded
    if (!workoutPlan) {
      workoutPlan = await WorkoutPlan.findOne({ isActive: true });
    }

    return {
      workoutPlan,
      isCompletedToday: false,
      todayLog: null,
    };
  }

  /**
   * Log completed workout session for user
   */
  public static async logWorkoutCompletion(
    userId: string | Types.ObjectId,
    data: {
      workoutPlanId?: string;
      workoutTitle: string;
      completedExercises: string[];
      durationMinutes?: number;
      caloriesBurned?: number;
    }
  ): Promise<IWorkoutLog> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingLog = await WorkoutLog.findOne({
      userId,
      workoutTitle: data.workoutTitle,
      completedAt: { $gte: todayStart },
    });

    if (existingLog) {
      existingLog.completedExercises = data.completedExercises;
      if (data.durationMinutes) existingLog.durationMinutes = data.durationMinutes;
      if (data.caloriesBurned) existingLog.caloriesBurned = data.caloriesBurned;
      await existingLog.save();
      return existingLog;
    }

    const log = new WorkoutLog({
      userId,
      workoutPlanId: data.workoutPlanId ? new Types.ObjectId(data.workoutPlanId) : undefined,
      workoutTitle: data.workoutTitle,
      completedExercises: data.completedExercises,
      durationMinutes: data.durationMinutes || 45,
      caloriesBurned: data.caloriesBurned || 320,
      completedAt: new Date(),
    });

    await log.save();

    await AuditLog.create({
      userId,
      action: 'WORKOUT_COMPLETED',
      resource: 'WorkoutLog',
      resourceId: log._id,
      details: { workoutTitle: data.workoutTitle, count: data.completedExercises.length },
    });

    return log;
  }

  /**
   * Customize and update workout plan exercises in MongoDB
   */
  public static async updateWorkoutPlan(
    workoutPlanId: string,
    exercises: any[],
    title?: string
  ): Promise<IWorkoutPlan> {
    const plan = await WorkoutPlan.findById(workoutPlanId);
    if (!plan) {
      throw new Error('Workout plan not found.');
    }

    if (title) plan.title = title;
    if (Array.isArray(exercises)) {
      plan.exercises = exercises;
      plan.estimatedDurationMin = Math.max(15, exercises.length * 10);
      plan.totalCaloriesBurn = Math.max(100, exercises.length * 75);
    }

    await plan.save();
    return plan;
  }
}
