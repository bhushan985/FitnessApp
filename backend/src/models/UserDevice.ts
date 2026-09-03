import { Schema, model, Document, Types } from 'mongoose';

export interface IUserDevice extends Document {
  userId: Types.ObjectId;
  deviceId: string;
  platform: 'web' | 'android' | 'ios' | 'pwa';
  browser?: string;
  pushToken?: string;
  subscriptionJson?: Record<string, any>;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserDeviceSchema = new Schema<IUserDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    platform: { type: String, enum: ['web', 'android', 'ios', 'pwa'], default: 'web' },
    browser: { type: String },
    pushToken: { type: String },
    subscriptionJson: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const UserDevice = model<IUserDevice>('UserDevice', UserDeviceSchema);
