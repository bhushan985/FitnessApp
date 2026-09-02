import { Schema, model, Document, Types } from 'mongoose';

export interface IHealthMetric extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD format
  steps: number;
  sleepHours: number;
  restingHeartRate: number;
  averageHeartRate?: number;
  activeCalories: number;
  weightKg?: number;
  source: 'apple_health' | 'health_connect' | 'manual';
  syncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HealthMetricSchema = new Schema<IHealthMetric>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    restingHeartRate: { type: Number, default: 65 },
    averageHeartRate: { type: Number, default: 72 },
    activeCalories: { type: Number, default: 0 },
    weightKg: { type: Number },
    source: { type: String, enum: ['apple_health', 'health_connect', 'manual'], default: 'apple_health' },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound Unique Index: Prevents duplicate daily records for the same user on the same date
HealthMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

export const HealthMetric = model<IHealthMetric>('HealthMetric', HealthMetricSchema);
