import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  passwordHash?: string;
  role: 'user' | 'trainer' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'blocked' | 'suspended';
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  firebaseUid?: string;
  authMethods?: {
    emailOtp?: boolean;
    phoneOtp?: boolean;
    password?: boolean;
  };
  profileImage?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    phoneNumber: { type: String, unique: true, sparse: true, trim: true, index: true },
    passwordHash: { type: String, default: '' },
    role: { type: String, enum: ['user', 'trainer', 'admin', 'super_admin'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'inactive', 'blocked', 'suspended'], default: 'active', index: true },
    emailVerified: { type: Boolean, default: false },
    phoneNumberVerified: { type: Boolean, default: false },
    firebaseUid: { type: String, sparse: true, index: true },
    authMethods: {
      emailOtp: { type: Boolean, default: false },
      phoneOtp: { type: Boolean, default: false },
      password: { type: Boolean, default: false },
    },
    profileImage: { type: String, default: '' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
