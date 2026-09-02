import { Schema, model, Document, Types } from 'mongoose';

export interface ITemplateExercise {
  exerciseId?: Types.ObjectId;
  name: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12"
  equipment: string;
  restSeconds: number;
  instructions?: string;
  mediaUrl?: string;
}

export interface IWorkoutTemplate extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  focusArea: string;
  muscleGroups: string[];
  equipmentRequired: string[];
  estimatedDurationMin: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: ITemplateExercise[];
  isSystemPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateExerciseSchema = new Schema<ITemplateExercise>({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  name: { type: String, required: true },
  targetSets: { type: Number, default: 3 },
  targetReps: { type: String, default: '8-12' },
  equipment: { type: String, default: 'Dumbbell' },
  restSeconds: { type: Number, default: 60 },
  instructions: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
});

const WorkoutTemplateSchema = new Schema<IWorkoutTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    focusArea: { type: String, required: true },
    muscleGroups: [{ type: String }],
    equipmentRequired: [{ type: String }],
    estimatedDurationMin: { type: Number, default: 45 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    exercises: [TemplateExerciseSchema],
    isSystemPreset: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WorkoutTemplateSchema.index({ userId: 1, title: 1 });

export const WorkoutTemplate = model<IWorkoutTemplate>('WorkoutTemplate', WorkoutTemplateSchema);
