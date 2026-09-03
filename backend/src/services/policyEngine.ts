import { NotificationPreferences, INotificationPreferences } from '../models/NotificationPreferences.js';
import { Notification } from '../models/Notification.js';

export interface IPolicyCheckParams {
  userId: string;
  type: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  idempotencyKey?: string;
}

export class PolicyEngine {
  /**
   * Evaluates anti-spam rules, quiet hours, cooldowns, and user preferences before dispatching a notification.
   */
  public static async shouldSendNotification(params: IPolicyCheckParams): Promise<{ allowed: boolean; reason?: string }> {
    const { userId, type, category, priority, idempotencyKey } = params;

    // 1. Idempotency Key Check (Duplicate Detection)
    if (idempotencyKey) {
      const existing = await Notification.findOne({ userId, idempotencyKey });
      if (existing) {
        return { allowed: false, reason: 'Duplicate notification prevented by idempotency key' };
      }
    }

    // 2. Fetch or initialize User Notification Preferences
    let prefs = await NotificationPreferences.findOne({ userId });
    if (!prefs) {
      prefs = await NotificationPreferences.create({ userId });
    }

    // 3. Master Enabled Check
    if (!prefs.masterEnabled) {
      return { allowed: false, reason: 'User master notification preference disabled' };
    }

    // 4. Category-Level Preference Checks
    if (category === 'workout' && !prefs.workoutReminders) return { allowed: false, reason: 'Workout reminders disabled' };
    if (category === 'meal' && !prefs.breakfastReminder && !prefs.lunchReminder && !prefs.dinnerReminder) return { allowed: false, reason: 'Meal reminders disabled' };
    if (category === 'hydration' && !prefs.waterReminders) return { allowed: false, reason: 'Water reminders disabled' };
    if (category === 'medicine' && !prefs.medicineReminders) return { allowed: false, reason: 'Medicine reminders disabled' };
    if (category === 'activity' && !prefs.activityReminders) return { allowed: false, reason: 'Activity reminders disabled' };
    if (category === 'snap_check' && !prefs.snapCheckNotifications) return { allowed: false, reason: 'Snap Check AI notifications disabled' };
    if (category === 'subscription' && !prefs.subscriptionAlerts) return { allowed: false, reason: 'Subscription alerts disabled' };

    // 5. Quiet Hours Check (Default 22:00 -> 07:00)
    // Critical priority (e.g., medicine alerts) can override Quiet Hours if configured
    if (prefs.quietHoursEnabled && priority !== 'critical') {
      const isQuiet = this.isInQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd, prefs.timezone);
      if (isQuiet) {
        return { allowed: false, reason: `Notification suppressed during quiet hours (${prefs.quietHoursStart} - ${prefs.quietHoursEnd})` };
      }
    }

    // 6. Cooldown Window Check (Prevents popping routine reminders within 15 minutes of each other)
    if (priority === 'low' || priority === 'medium') {
      const recentCount = await Notification.countDocuments({
        userId,
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
      });
      if (recentCount >= 3) {
        return { allowed: false, reason: 'Anti-spam cooldown active (max 3 notifications per 15 minutes)' };
      }
    }

    return { allowed: true };
  }

  /**
   * Helper to compute if current local time falls within Quiet Hours interval
   */
  private static isInQuietHours(startStr: string, endStr: string, timezone: string): boolean {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);

      const hourPart = parts.find((p) => p.type === 'hour')?.value || '0';
      const minutePart = parts.find((p) => p.type === 'minute')?.value || '0';

      const currentMins = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10);

      const [startH, startM] = startStr.split(':').map((s) => parseInt(s, 10));
      const [endH, endM] = endStr.split(':').map((s) => parseInt(s, 10));

      const startMins = startH * 60 + (startM || 0);
      const endMins = endH * 60 + (endM || 0);

      if (startMins < endMins) {
        return currentMins >= startMins && currentMins < endMins;
      } else {
        // Overnight interval e.g. 22:00 to 07:00
        return currentMins >= startMins || currentMins < endMins;
      }
    } catch (err) {
      return false;
    }
  }
}
