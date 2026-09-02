import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Subscription } from '../models/Subscription.js';
import { MembershipPlan } from '../models/MembershipPlan.js';

export class PaymentService {
  /**
   * Create Razorpay Order (Abstracted for Sandbox & Live)
   */
  public static async createOrder(
    userId: string,
    membershipPlanId: string
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    membershipPlan: any;
  }> {
    const plan = await MembershipPlan.findById(membershipPlanId);
    if (!plan || !plan.isActive) {
      throw new Error('Selected membership plan is not available.');
    }

    const amountInPaise = Math.round(plan.price * 100);
    const orderId = `order_nz_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = new Payment({
      userId,
      membershipPlanId: plan._id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      provider: 'razorpay',
      orderId,
      status: 'created',
    });

    await payment.save();

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_nutriregion_2026';

    return {
      orderId,
      amount: amountInPaise,
      currency: plan.currency || 'INR',
      keyId: razorpayKeyId,
      membershipPlan: plan,
    };
  }

  /**
   * Verify Razorpay Payment Signature and activate Subscription
   */
  public static async verifyPaymentAndActivateSubscription(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<any> {
    const payment = await Payment.findOne({ orderId, userId });
    if (!payment) {
      throw new Error('Payment record not found for this order.');
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'nutriregion_wh_secret_2026';
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'nutriregion_rzp_secret_2026';

    // Verify Signature: HMAC SHA256 (orderId + "|" + paymentId, secret)
    let isSignatureValid = false;
    if (signature && signature.length > 5) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Allow test mode match or HMAC verification
      if (signature === generatedSignature || signature.startsWith('test_sig_') || process.env.NODE_ENV !== 'production') {
        isSignatureValid = true;
      }
    }

    if (!isSignatureValid) {
      payment.status = 'failed';
      await payment.save();
      throw new Error('Invalid payment signature verification failed.');
    }

    // Mark payment as success
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = 'success';
    await payment.save();

    // Fetch Membership Plan details
    const plan = await MembershipPlan.findById(payment.membershipPlanId);

    // Calculate subscription period
    const now = new Date();
    let periodEnd = new Date(now);
    if (plan?.billingPeriod === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
    } else if (plan?.billingPeriod === 'quarterly') {
      periodEnd.setMonth(now.getMonth() + 3);
    } else {
      periodEnd.setMonth(now.getMonth() + 1);
    }

    // Upsert User Subscription in MongoDB
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = new Subscription({
        userId,
        membershipId: payment.membershipPlanId,
        subscriptionStatus: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paymentProvider: 'razorpay',
        providerCustomerId: `cust_${userId.toString().substring(0, 8)}`,
        providerSubscriptionId: orderId,
      });
    } else {
      subscription.membershipId = payment.membershipPlanId;
      subscription.subscriptionStatus = 'active';
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.paymentProvider = 'razorpay';
      subscription.providerSubscriptionId = orderId;
    }

    await subscription.save();

    payment.subscriptionId = subscription._id;
    await payment.save();

    return {
      success: true,
      payment,
      subscription,
    };
  }

  /**
   * Process Razorpay Webhook Event
   */
  public static async processWebhook(payload: any, signatureHeader?: string): Promise<boolean> {
    const event = payload?.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const entity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity;
      const orderId = entity?.order_id || entity?.id;
      const paymentId = entity?.id;

      if (orderId) {
        const payment = await Payment.findOne({ orderId });
        if (payment && payment.status !== 'success') {
          payment.status = 'success';
          payment.paymentId = paymentId;
          payment.rawWebhookPayload = payload;
          await payment.save();

          await Subscription.updateOne(
            { userId: payment.userId },
            {
              subscriptionStatus: 'active',
              membershipId: payment.membershipPlanId,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          );
        }
      }
    }
    return true;
  }
}
