import { Schema, model, Document, Types } from 'mongoose';

export interface ISetRecord {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completedAt: Date;
}

export interface IExerciseProgress extends Document {
  userId: Types.ObjectId;
  exerciseName: string;
  exerciseId?: Types.ObjectId;
  personalRecordWeightKg: number;
  personalRecordReps: number;
  bestSetVolume: number; // weightKg * reps
  totalSessionsCompleted: number;
  lastPerformedAt: Date;
  history: Array<{
    date: string; // YYYY-MM-DD
    sets: ISetRecord[];
    maxWeightKg: number;
    totalVolumeKg: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SetRecordSchema = new Schema<ISetRecord>({
  setNumber: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  reps: { type: Number, required: true },
  rpe: { type: Number },
  completedAt: { type: Date, default: Date.now },
});

const ExerciseProgressSchema = new Schema<IExerciseProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseName: { type: String, required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    personalRecordWeightKg: { type: Number, default: 0 },
    personalRecordReps: { type: Number, default: 0 },
    bestSetVolume: { type: Number, default: 0 },
    totalSessionsCompleted: { type: Number, default: 0 },
    lastPerformedAt: { type: Date, default: Date.now },
    history: [
      {
        date: { type: String, required: true },
        sets: [SetRecordSchema],
        maxWeightKg: { type: Number, default: 0 },
        totalVolumeKg: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

ExerciseProgressSchema.index({ userId: 1, exerciseName: 1 }, { unique: true });

export const ExerciseProgress = model<IExerciseProgress>('ExerciseProgress', ExerciseProgressSchema);
