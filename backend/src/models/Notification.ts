import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'workout'
  | 'meal'
  | 'hydration'
  | 'medicine'
  | 'activity'
  | 'progress'
  | 'streak'
  | 'ai'
  | 'subscription'
  | 'system';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationSoundType = 'DEFAULT' | 'REMINDER' | 'SUCCESS' | 'ALERT' | 'TIMER' | 'SILENT';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  category: string;
  priority: NotificationPriority;
  soundType: NotificationSoundType;
  link?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  expiresAt?: Date;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['workout', 'meal', 'hydration', 'medicine', 'activity', 'progress', 'streak', 'ai', 'subscription', 'system'],
      default: 'system',
      index: true,
    },
    category: { type: String, default: 'general', index: true },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    soundType: {
      type: String,
      enum: ['DEFAULT', 'REMINDER', 'SUCCESS', 'ALERT', 'TIMER', 'SILENT'],
      default: 'DEFAULT',
    },
    link: { type: String },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    deliveredAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    idempotencyKey: { type: String, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
