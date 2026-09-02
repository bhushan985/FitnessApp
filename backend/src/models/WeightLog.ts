import { Schema, model, Document, Types } from 'mongoose';

export interface IWeightLog extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WeightLogSchema = new Schema<IWeightLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    weightKg: { type: Number, required: true },
    note: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WeightLogSchema.index({ userId: 1, date: 1 });

export const WeightLog = model<IWeightLog>('WeightLog', WeightLogSchema);
