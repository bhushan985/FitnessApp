import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { Subscription } from '../models/Subscription.js';

export const requireActiveSubscriptionOrTrial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Admins and Super Admins bypass subscription requirements
    if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
      next();
      return;
    }

    let subscription = await Subscription.findOne({ userId });

    // Auto-grant 30 day trial if no subscription record exists yet
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

    if (subscription.subscriptionStatus === 'trial') {
      if (now > subscription.trialEndDate) {
        subscription.subscriptionStatus = 'expired';
        await subscription.save();

        res.status(402).json({
          success: false,
          code: 'TRIAL_EXPIRED',
          message: 'Your 30-day free trial has ended. Please subscribe to continue accessing premium features.',
          trialExpiredAt: subscription.trialEndDate,
        });
        return;
      }
    } else if (subscription.subscriptionStatus === 'active') {
      if (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd) {
        subscription.subscriptionStatus = 'expired';
        await subscription.save();

        res.status(402).json({
          success: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: 'Your subscription period has expired. Please renew your membership to continue.',
        });
        return;
      }
    } else if (subscription.subscriptionStatus === 'expired' || subscription.subscriptionStatus === 'cancelled') {
      res.status(402).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Active membership plan required to access this feature.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription verification middleware error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify subscription status' });
  }
};
