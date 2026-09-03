import { Schema, model, Document, Types } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: Types.ObjectId;
  masterEnabled: boolean;
  workoutReminders: boolean;
  restTimerSound: boolean;
  workoutCompletion: boolean;
  prNotifications: boolean;
  streakNotifications: boolean;
  tomorrowRecommendation: boolean;
  breakfastReminder: boolean;
  lunchReminder: boolean;
  dinnerReminder: boolean;
  proteinGoalAlerts: boolean;
  calorieAlerts: boolean;
  recipeSuggestions: boolean;
  waterReminders: boolean;
  activityReminders: boolean;
  weightReminders: boolean;
  medicineReminders: boolean;
  snapCheckNotifications: boolean;
  aiWorkoutNotifications: boolean;
  subscriptionAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  waterIntervalHours: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    masterEnabled: { type: Boolean, default: true },
    workoutReminders: { type: Boolean, default: true },
    restTimerSound: { type: Boolean, default: true },
    workoutCompletion: { type: Boolean, default: true },
    prNotifications: { type: Boolean, default: true },
    streakNotifications: { type: Boolean, default: true },
    tomorrowRecommendation: { type: Boolean, default: true },
    breakfastReminder: { type: Boolean, default: true },
    lunchReminder: { type: Boolean, default: true },
    dinnerReminder: { type: Boolean, default: true },
    proteinGoalAlerts: { type: Boolean, default: true },
    calorieAlerts: { type: Boolean, default: true },
    recipeSuggestions: { type: Boolean, default: true },
    waterReminders: { type: Boolean, default: true },
    activityReminders: { type: Boolean, default: true },
    weightReminders: { type: Boolean, default: true },
    medicineReminders: { type: Boolean, default: true },
    snapCheckNotifications: { type: Boolean, default: true },
    aiWorkoutNotifications: { type: Boolean, default: true },
    subscriptionAlerts: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    vibrationEnabled: { type: Boolean, default: true },
    quietHoursEnabled: { type: Boolean, default: true },
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    waterIntervalHours: { type: Number, default: 2 },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true }
);

export const NotificationPreferences = model<INotificationPreferences>(
  'NotificationPreferences',
  NotificationPreferencesSchema
);
