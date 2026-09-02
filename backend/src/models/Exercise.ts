import { Schema, model, Document, Types } from 'mongoose';

export interface IMuscleTarget {
  muscleId?: string;
  muscle: string;
  percentage: number;
  isPrimary: boolean;
}

export interface IExerciseMedia {
  type: 'gif' | 'video' | 'image';
  url: string;
  thumbnailUrl?: string;
  source?: string;
  license?: string;
}

export interface IExercise extends Document {
  name: string;
  slug: string;
  aliases: string[];
  description: string;
  bodyPart: string; // e.g. "chest", "back", "arms", "legs", "shoulders", "waist"
  muscleGroups: string[];
  primaryMuscles: string[]; // Canonical IDs, e.g. ["MUSCLE_ANTERIOR_DELTOID", "MUSCLE_LATERAL_DELTOID"]
  primaryMuscle: string; // Human readable fallback string
  secondaryMuscles: string[];
  stabilizerMuscles: string[];
  muscleEngagement: IMuscleTarget[];
  equipment: string; // e.g. "Dumbbell", "Barbell", "Cable", "Machine", "Bodyweight", "EZ Bar", "Smith Machine", "Kettlebell", "Resistance Band"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movementType: 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'flexibility';
  category: 'strength' | 'hypertrophy' | 'conditioning' | 'core' | 'mobility';
  movementPattern: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  sets: number;
  reps: number;
  durationSec?: number;
  restSeconds: number;
  caloriesEstimate: number;
  media: IExerciseMedia;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  alternatives?: Types.ObjectId[];
  source: string;
  license: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MuscleTargetSchema = new Schema<IMuscleTarget>({
  muscleId: { type: String, default: '' },
  muscle: { type: String, required: true },
  percentage: { type: Number, required: true },
  isPrimary: { type: Boolean, default: true },
});

const ExerciseMediaSchema = new Schema<IExerciseMedia>({
  type: { type: String, enum: ['gif', 'video', 'image'], default: 'gif' },
  url: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  source: { type: String, default: 'NutriRegion Exercise Studio' },
  license: { type: String, default: 'Licensed Dataset / Open Fitness DB' },
});

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    aliases: [{ type: String, index: true }],
    description: { type: String, default: '' },
    bodyPart: { type: String, required: true, default: 'arms', index: true },
    muscleGroups: [{ type: String, index: true }],
    primaryMuscles: [{ type: String, required: true, index: true }],
    primaryMuscle: { type: String, required: true, index: true },
    secondaryMuscles: [{ type: String }],
    stabilizerMuscles: [{ type: String }],
    muscleEngagement: [MuscleTargetSchema],
    equipment: { type: String, default: 'Bodyweight', index: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', index: true },
    movementType: { type: String, enum: ['push', 'pull', 'legs', 'core', 'cardio', 'flexibility'], default: 'push', index: true },
    category: { type: String, enum: ['strength', 'hypertrophy', 'conditioning', 'core', 'mobility'], default: 'hypertrophy', index: true },
    movementPattern: { type: String, default: 'general', index: true },
    instructions: [{ type: String }],
    formTips: [{ type: String }],
    commonMistakes: [{ type: String }],
    sets: { type: Number, default: 3 },
    reps: { type: Number, default: 12 },
    durationSec: { type: Number, default: 0 },
    restSeconds: { type: Number, default: 60 },
    caloriesEstimate: { type: Number, default: 50 },
    media: { type: ExerciseMediaSchema, required: false },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    alternatives: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
    source: { type: String, default: 'NutriRegion Exercise Studio' },
    license: { type: String, default: 'Licensed Dataset' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ExerciseSchema.index({ name: 'text', aliases: 'text', primaryMuscles: 'text', bodyPart: 'text', equipment: 'text' });

export const Exercise = model<IExercise>('Exercise', ExerciseSchema);
