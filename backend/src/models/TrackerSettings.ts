import { Schema, model, Document, Types } from 'mongoose';

export interface ITrackerSettings extends Document {
  userId: Types.ObjectId;
  waterTargetMl: number;
  waterGlassSizeMl: number;
  waterRemindersEnabled: boolean;
  waterReminderIntervalMin: number;
  stepTarget: number;
  sleepTargetHours: number;
  bedtime: string;
  wakeTime: string;
  mealTargetDistribution: {
    breakfast: number;
    morning_snack: number;
    lunch: number;
    evening_snack: number;
    dinner: number;
  };
  notificationsEnabled: {
    water: boolean;
    meals: boolean;
    workout: boolean;
    sleep: boolean;
    medicine: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TrackerSettingsSchema = new Schema<ITrackerSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    waterTargetMl: { type: Number, default: 2000 },
    waterGlassSizeMl: { type: Number, default: 250 },
    waterRemindersEnabled: { type: Boolean, default: true },
    waterReminderIntervalMin: { type: Number, default: 60 },
    stepTarget: { type: Number, default: 8000 },
    sleepTargetHours: { type: Number, default: 8 },
    bedtime: { type: String, default: '23:30' },
    wakeTime: { type: String, default: '07:30' },
    mealTargetDistribution: {
      breakfast: { type: Number, default: 25 },
      morning_snack: { type: Number, default: 10 },
      lunch: { type: Number, default: 30 },
      evening_snack: { type: Number, default: 10 },
      dinner: { type: Number, default: 25 },
    },
    notificationsEnabled: {
      water: { type: Boolean, default: true },
      meals: { type: Boolean, default: true },
      workout: { type: Boolean, default: true },
      sleep: { type: Boolean, default: true },
      medicine: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const TrackerSettings = model<ITrackerSettings>('TrackerSettings', TrackerSettingsSchema);
