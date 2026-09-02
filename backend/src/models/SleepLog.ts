import { Schema, model, Document, Types } from 'mongoose';

export interface ISleepLog extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  targetHours: number;
  bedtime: string; // e.g. "23:30"
  wakeTime: string; // e.g. "07:30"
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  source: 'healthkit' | 'healthconnect' | 'manual';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SleepLogSchema = new Schema<ISleepLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    sleepHours: { type: Number, default: 0 },
    targetHours: { type: Number, default: 8 },
    bedtime: { type: String, default: '23:30' },
    wakeTime: { type: String, default: '07:30' },
    quality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'], default: 'good' },
    source: { type: String, enum: ['healthkit', 'healthconnect', 'manual'], default: 'manual' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

SleepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const SleepLog = model<ISleepLog>('SleepLog', SleepLogSchema);
