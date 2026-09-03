import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  type: 'walking' | 'running' | 'cycling' | 'swimming';
  intensity: 'low' | 'moderate' | 'high';
  durationMinutes: number;
  distanceKm: number;
  caloriesBurned: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['walking', 'running', 'cycling', 'swimming'],
      required: true,
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate',
    },
    durationMinutes: { type: Number, required: true, default: 0 },
    distanceKm: { type: Number, required: true, default: 0 },
    caloriesBurned: { type: Number, required: true, default: 0 },
    completedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ userId: 1, completedAt: 1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
