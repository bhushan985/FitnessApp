import { Schema, model, Document } from 'mongoose';

export interface IMembershipPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  trialDays: number;
  features: string[];
  limits: {
    snapCheckLimitPerMonth: number;
    mealPlanGenerationsPerMonth: number;
    workoutAccessLevel: 'basic' | 'pro' | 'unlimited';
  };
  trainerIncluded: boolean;
  trainerSessions: number;
  AIAccess: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    billingPeriod: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'one_time'], default: 'monthly' },
    trialDays: { type: Number, default: 30 },
    features: [{ type: String }],
    limits: {
      snapCheckLimitPerMonth: { type: Number, default: 30 },
      mealPlanGenerationsPerMonth: { type: Number, default: 60 },
      workoutAccessLevel: { type: String, enum: ['basic', 'pro', 'unlimited'], default: 'unlimited' },
    },
    trainerIncluded: { type: Boolean, default: false },
    trainerSessions: { type: Number, default: 0 },
    AIAccess: { type: Boolean, default: true },
    prioritySupport: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const MembershipPlan = model<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);
