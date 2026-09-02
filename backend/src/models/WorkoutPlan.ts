import { Schema, model, Document } from 'mongoose';

export interface IWorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  imageUrl?: string;
}

export interface IWorkoutPlan extends Document {
  title: string;
  targetDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  focusArea: string;
  estimatedDurationMin: number;
  totalCaloriesBurn: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: IWorkoutExercise[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  name: { type: String, required: true },
  sets: { type: Number, required: true, default: 3 },
  reps: { type: Number, required: true, default: 12 },
  durationSec: { type: Number },
  restSec: { type: Number, default: 60 },
  equipment: { type: String, default: 'Dumbbells / Bodyweight' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  instructions: { type: String },
  imageUrl: { type: String },
});

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    title: { type: String, required: true },
    targetDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
      index: true,
    },
    focusArea: { type: String, required: true },
    estimatedDurationMin: { type: Number, required: true, default: 45 },
    totalCaloriesBurn: { type: Number, required: true, default: 320 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    exercises: [WorkoutExerciseSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WorkoutPlan = model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
