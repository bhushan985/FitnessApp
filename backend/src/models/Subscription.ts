import { Schema, model, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  membershipId?: Types.ObjectId;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartDate: Date;
  trialEndDate: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  paymentProvider: 'razorpay' | 'stripe' | 'manual' | 'trial';
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    membershipId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan' },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'trial',
      index: true,
    },
    trialStartDate: { type: Date, default: Date.now },
    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      index: true,
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    paymentProvider: { type: String, enum: ['razorpay', 'stripe', 'manual', 'trial'], default: 'trial' },
    providerCustomerId: { type: String },
    providerSubscriptionId: { type: String },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>('Subscription', SubscriptionSchema);
