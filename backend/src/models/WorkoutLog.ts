import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  workoutPlanId?: Types.ObjectId;
  workoutTitle: string;
  completedExercises: string[];
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
    workoutTitle: { type: String, required: true },
    completedExercises: [{ type: String }],
    durationMinutes: { type: Number, required: true, default: 45 },
    caloriesBurned: { type: Number, required: true, default: 320 },
    completedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

WorkoutLogSchema.index({ userId: 1, completedAt: 1 });

export const WorkoutLog = model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
