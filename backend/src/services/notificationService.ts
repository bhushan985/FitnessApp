import { Types } from 'mongoose';
import { Notification, INotification, NotificationType, NotificationPriority, NotificationSoundType } from '../models/Notification.js';
import { SocketService } from './socketService.js';
import { FCMService } from './fcmService.js';
import { PolicyEngine } from './policyEngine.js';

export interface ICreateNotificationInput {
  userId: string | Types.ObjectId;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  priority?: NotificationPriority;
  soundType?: NotificationSoundType;
  link?: string;
  data?: Record<string, any>;
  idempotencyKey?: string;
}

export class NotificationService {
  /**
   * High-level notification creation and dispatch pipeline:
   * Policy Check -> MongoDB Persist -> Socket.IO Real-time Emit -> FCM Background Push
   */
  public static async send(input: ICreateNotificationInput): Promise<{ success: boolean; notification?: INotification; reason?: string }> {
    try {
      const uId = input.userId.toString();
      const type = input.type || 'system';
      const category = input.category || 'general';
      const priority = input.priority || 'medium';
      const soundType = input.soundType || (priority === 'high' || priority === 'critical' ? 'ALERT' : 'DEFAULT');

      // 1. Anti-spam & Policy Check
      const policy = await PolicyEngine.shouldSendNotification({
        userId: uId,
        type,
        category,
        priority,
        idempotencyKey: input.idempotencyKey,
      });

      if (!policy.allowed) {
        console.log(`[Notification Suppressed]: User ${uId} - Reason: ${policy.reason}`);
        return { success: false, reason: policy.reason };
      }

      // 2. Persist Notification to MongoDB
      const notification = await Notification.create({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type,
        category,
        priority,
        soundType,
        link: input.link || '/notifications',
        data: input.data || {},
        idempotencyKey: input.idempotencyKey,
        isRead: false,
        deliveredAt: new Date(),
      });

      // 3. Socket.IO Real-time In-App Dispatch
      const payload = {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        soundType: notification.soundType,
        link: notification.link,
        data: notification.data,
        isRead: false,
        createdAt: notification.createdAt,
      };

      SocketService.emitToUser(uId, 'notification:new', payload);

      // Emit updated unread counter
      const unreadCount = await Notification.countDocuments({ userId: input.userId, isRead: false });
      SocketService.emitUnreadCount(uId, unreadCount);

      // 4. Background Push Dispatch (FCM / Web Push)
      await FCMService.sendPushToUser(uId, {
        title: notification.title,
        body: notification.message,
        link: notification.link,
        data: notification.data,
      });

      return { success: true, notification };
    } catch (err: any) {
      console.error('[NotificationService.send Error]:', err);
      return { success: false, reason: err.message };
    }
  }

  /**
   * Fetch unread notification count
   */
  public static async getUnreadCount(userId: string | Types.ObjectId): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Mark single notification as read
   */
  public static async markAsRead(userId: string | Types.ObjectId, notificationId: string): Promise<boolean> {
    const res = await Notification.updateOne(
      { _id: notificationId, userId },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read for user
   */
  public static async markAllAsRead(userId: string | Types.ObjectId): Promise<number> {
    const res = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.modifiedCount;
  }
}
