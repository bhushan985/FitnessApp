import { Schema, model, Document, Types } from 'mongoose';

export interface IWaterLog extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  amountMl: number;
  glasses: number;
  glassSizeMl: number;
  logs: Array<{
    amountMl: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WaterLogSchema = new Schema<IWaterLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    amountMl: { type: Number, default: 0 },
    glasses: { type: Number, default: 0 },
    glassSizeMl: { type: Number, default: 250 },
    logs: [
      {
        amountMl: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

WaterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WaterLog = model<IWaterLog>('WaterLog', WaterLogSchema);
