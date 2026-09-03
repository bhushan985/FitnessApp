import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';
import { NotificationPreferences } from '../models/NotificationPreferences.js';
import { UserDevice } from '../models/UserDevice.js';
import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  /**
   * Get user notifications list with category filter & unread count
   */
  public static async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { category, type, isRead } = req.query;

      const query: any = { userId };
      if (category && category !== 'all') query.category = category;
      if (type && type !== 'all') query.type = type;
      if (isRead !== undefined) query.isRead = isRead === 'true';

      const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
      const unreadCount = await NotificationService.getUnreadCount(userId);

      res.json({ success: true, unreadCount, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get unread notification count
   */
  public static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const unreadCount = await NotificationService.getUnreadCount(userId);
      res.json({ success: true, unreadCount });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark notification(s) as read
   */
  public static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      if (id === 'all') {
        await NotificationService.markAllAsRead(userId);
      } else {
        await NotificationService.markAsRead(userId, id);
      }

      const unreadCount = await NotificationService.getUnreadCount(userId);
      res.json({ success: true, message: 'Notification marked as read', unreadCount });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete single notification
   */
  public static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      await Notification.deleteOne({ _id: id, userId });
      const unreadCount = await NotificationService.getUnreadCount(userId);

      res.json({ success: true, message: 'Notification deleted', unreadCount });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch User Notification Preferences
   */
  public static async getPreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      let prefs = await NotificationPreferences.findOne({ userId });
      if (!prefs) {
        prefs = await NotificationPreferences.create({ userId });
      }
      res.json({ success: true, data: prefs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update User Notification Preferences
   */
  public static async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const updates = req.body;

      const prefs = await NotificationPreferences.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      );

      res.json({ success: true, data: prefs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Register User Device for FCM Push Notifications
   */
  public static async registerDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { deviceId, platform, browser, pushToken, subscriptionJson } = req.body;

      if (!deviceId) {
        res.status(400).json({ success: false, message: 'deviceId is required' });
        return;
      }

      const device = await UserDevice.findOneAndUpdate(
        { userId, deviceId },
        {
          userId,
          deviceId,
          platform: platform || 'web',
          browser,
          pushToken,
          subscriptionJson,
          isActive: true,
          lastSeenAt: new Date(),
        },
        { new: true, upsert: true }
      );

      res.json({ success: true, data: device });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Unregister Device Token
   */
  public static async deleteDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      await UserDevice.updateOne({ _id: id, userId }, { $set: { isActive: false } });
      res.json({ success: true, message: 'Device unregistered' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Trigger Test Notification for Authenticated User
   */
  public static async sendTestNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { type = 'workout', title = 'Test Real-Time Notification 🔔', message = 'NutriRegion notification system is fully operational!' } = req.body;

      const result = await NotificationService.send({
        userId,
        title,
        message,
        type,
        category: 'system',
        priority: 'high',
        soundType: 'SUCCESS',
        link: '/workout/dashboard',
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
