import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export class NotificationController {
  /**
   * Get user notifications
   */
  public static async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      res.json({ success: true, unreadCount, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark notification as read
   */
  public static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (id === 'all') {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      } else {
        await Notification.updateOne({ _id: id, userId }, { isRead: true });
      }

      res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
