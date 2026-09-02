import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { PaymentService } from '../services/paymentService.js';
import { AuditLog } from '../models/AuditLog.js';

export class SubscriptionController {
  /**
   * Get current user subscription status and trial progress
   */
  public static async getMySubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      let subscription = await Subscription.findOne({ userId }).populate('membershipId');

      if (!subscription) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        subscription = await Subscription.create({
          userId,
          subscriptionStatus: 'trial',
          trialStartDate: now,
          trialEndDate: trialEnd,
        });
      }

      const now = new Date();
      let trialDaysRemaining = 0;

      if (subscription.subscriptionStatus === 'trial') {
        const diffMs = subscription.trialEndDate.getTime() - now.getTime();
        trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        if (trialDaysRemaining === 0) {
          subscription.subscriptionStatus = 'expired';
          await subscription.save();
        }
      }

      res.json({
        success: true,
        data: {
          subscription,
          trialDaysRemaining,
          isTrialActive: subscription.subscriptionStatus === 'trial' && trialDaysRemaining > 0,
          isPaidActive: subscription.subscriptionStatus === 'active',
          isExpired: subscription.subscriptionStatus === 'expired',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * List active membership plans for frontend selection
   */
  public static async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      let plans: any[] = await MembershipPlan.find({ isActive: true }).sort({ price: 1 });

      // Fallback seed plans if database holds no plans yet
      if (plans.length === 0) {
        const defaultPlans = [
          {
            name: 'Basic Access',
            description: 'Essential regional nutrition tracking and 5-slot daily meal plans',
            price: 299,
            currency: 'INR',
            billingPeriod: 'monthly',
            trialDays: 30,
            features: ['5-Slot Regional Meal Plans', 'Basic Workout Routines', '10 Snap Checks / Month', 'Progress Analytics'],
            limits: { snapCheckLimitPerMonth: 10, mealPlanGenerationsPerMonth: 30, workoutAccessLevel: 'basic' },
            trainerIncluded: false,
            AIAccess: true,
            isActive: true,
          },
          {
            name: 'Pro Fitness',
            description: 'Full AI meal customizer, Snap Check meal scanner & complete workout library',
            price: 599,
            currency: 'INR',
            billingPeriod: 'monthly',
            trialDays: 30,
            features: [
              'Unlimited Regional Meal Plans',
              'Unlimited Snap Check Scans',
              'Full Workout Media Library',
              'Macro Goal Customizer',
              'Daily Veg / Non-Veg Switcher',
            ],
            limits: { snapCheckLimitPerMonth: 100, mealPlanGenerationsPerMonth: 100, workoutAccessLevel: 'pro' },
            trainerIncluded: false,
            AIAccess: true,
            isActive: true,
          },
          {
            name: 'Personal Trainer VIP',
            description: 'Dedicated personal trainer, custom workout & diet programming with priority support',
            price: 2499,
            currency: 'INR',
            billingPeriod: 'monthly',
            trialDays: 30,
            features: [
              'Assigned Certified Personal Trainer',
              'Custom Trainer Workout & Meal Plans',
              'Direct Trainer Notes & Guidance',
              'All Pro Features Included',
              'Priority 24/7 AI Support',
            ],
            limits: { snapCheckLimitPerMonth: 999, mealPlanGenerationsPerMonth: 999, workoutAccessLevel: 'unlimited' },
            trainerIncluded: true,
            trainerSessions: 4,
            AIAccess: true,
            prioritySupport: true,
            isActive: true,
          },
        ];
        plans = await MembershipPlan.insertMany(defaultPlans as any[]);
      }

      res.json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create Razorpay Payment Order
   */
  public static async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { membershipPlanId } = req.body;

      if (!userId || !membershipPlanId) {
        res.status(400).json({ success: false, message: 'Membership plan ID required' });
        return;
      }

      const orderData = await PaymentService.createOrder(userId, membershipPlanId);
      res.json({ success: true, data: orderData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  public static async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { orderId, paymentId, signature } = req.body;

      if (!userId || !orderId || !paymentId) {
        res.status(400).json({ success: false, message: 'Order ID and Payment ID required' });
        return;
      }

      const result = await PaymentService.verifyPaymentAndActivateSubscription(userId, orderId, paymentId, signature);

      await AuditLog.create({
        userId,
        action: 'MEMBERSHIP_SUBSCRIBED',
        resource: 'Subscription',
        resourceId: result.subscription._id,
        details: { orderId, paymentId, status: 'active' },
      });

      res.json({ success: true, message: 'Payment verified and subscription activated successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Process Razorpay Webhook Callback
   */
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signatureHeader = req.headers['x-razorpay-signature'] as string;
      await PaymentService.processWebhook(req.body, signatureHeader);
      res.json({ status: 'ok' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * DEV ONLY: Simulate Trial Days Remaining for Testing (Day 1, Day 29, Day 30, Day 31)
   */
  public static async simulateTrialDay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { simulatedDay } = req.body; // 1, 29, 30, 31

      let subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        subscription = new Subscription({ userId });
      }

      const now = new Date();

      if (simulatedDay === 1) {
        subscription.subscriptionStatus = 'trial';
        subscription.trialStartDate = now;
        subscription.trialEndDate = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);
      } else if (simulatedDay === 29) {
        subscription.subscriptionStatus = 'trial';
        subscription.trialStartDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        subscription.trialEndDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      } else if (simulatedDay === 30) {
        subscription.subscriptionStatus = 'trial';
        subscription.trialStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        subscription.trialEndDate = new Date(now.getTime() - 1000);
      } else if (simulatedDay === 31) {
        subscription.subscriptionStatus = 'expired';
        subscription.trialStartDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
        subscription.trialEndDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      await subscription.save();

      res.json({
        success: true,
        message: `Simulated Trial Day ${simulatedDay} set successfully`,
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
