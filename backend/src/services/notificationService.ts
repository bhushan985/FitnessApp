import { Notification } from '../models/Notification.js';

export class NotificationService {
  /**
   * Create an in-app notification for a user
   */
  public static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'system' | 'meal_plan' | 'workout' | 'trial' | 'subscription' | 'trainer' = 'system'
  ): Promise<any> {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      isRead: false,
    });
    await notification.save();
    return notification;
  }
}
