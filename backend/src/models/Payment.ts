import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  membershipPlanId?: Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'razorpay' | 'stripe' | 'test';
  orderId: string;
  paymentId?: string;
  signature?: string;
  status: 'created' | 'success' | 'failed';
  rawWebhookPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    membershipPlanId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, enum: ['razorpay', 'stripe', 'test'], default: 'razorpay' },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String },
    signature: { type: String },
    status: { type: String, enum: ['created', 'success', 'failed'], default: 'created', index: true },
    rawWebhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
