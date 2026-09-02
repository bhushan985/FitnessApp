import { Schema, model, Document } from 'mongoose';

export interface IOtpRecord extends Document {
  target: string; // Email or Phone number
  type: 'email' | 'phone';
  action: 'register' | 'login' | 'link';
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  resendCount: number;
  lastResendAt: Date;
  createdAt: Date;
}

const OtpRecordSchema = new Schema<IOtpRecord>(
  {
    target: { type: String, required: true, lowercase: true, trim: true, index: true },
    type: { type: String, enum: ['email', 'phone'], required: true },
    action: { type: String, enum: ['register', 'login', 'link'], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '1m' } },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 1 },
    lastResendAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OtpRecord = model<IOtpRecord>('OtpRecord', OtpRecordSchema);
