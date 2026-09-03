import cron from 'node-cron';
import { UserProfile } from '../models/UserProfile.js';
import { MedicineReminder } from '../models/MedicineReminder.js';
import { NotificationService } from './notificationService.js';
import { eventBus } from './eventEngine.js';

export class SchedulerService {
  /**
   * Initializes background cron jobs for scheduled notifications (Workout, Meals, Medicine, Trial)
   */
  public static init() {
    console.log('[SchedulerService] Starting background notification cron scheduler...');

    // 1. Morning Workout Reminder (Runs daily at 08:00 AM)
    cron.schedule('0 8 * * *', async () => {
      try {
        const profiles = await UserProfile.find({});
        const todayStr = new Date().toISOString().split('T')[0];

        for (const p of profiles) {
          await NotificationService.send({
            userId: p.userId,
            title: 'Time to Train 💪',
            message: 'Your workout for today is ready. 9 exercises planned for your session.',
            type: 'workout',
            category: 'workout',
            priority: 'high',
            soundType: 'REMINDER',
            link: '/workout/dashboard',
            idempotencyKey: `workout_remind_${p.userId}_${todayStr}`,
          });
        }
      } catch (err) {
        console.error('[Cron Error] Morning workout reminder:', err);
      }
    });

    // 2. Evening Dinner Meal Reminder (Runs daily at 20:30 PM)
    cron.schedule('30 20 * * *', async () => {
      try {
        const profiles = await UserProfile.find({});
        const todayStr = new Date().toISOString().split('T')[0];

        for (const p of profiles) {
          await NotificationService.send({
            userId: p.userId,
            title: "Don't Forget Dinner 🥗",
            message: 'Log your evening meal to complete today\'s calorie & protein targets.',
            type: 'meal',
            category: 'meal',
            priority: 'medium',
            soundType: 'REMINDER',
            link: '/meals/dashboard',
            idempotencyKey: `dinner_remind_${p.userId}_${todayStr}`,
          });
        }
      } catch (err) {
        console.error('[Cron Error] Dinner reminder:', err);
      }
    });

    // 3. Medicine Reminder Checker (Runs every 30 minutes)
    cron.schedule('*/30 * * * *', async () => {
      try {
        const activeMeds = await MedicineReminder.find({ isActive: true });
        const now = new Date();
        const hour = now.getHours();

        let timeSlot = '';
        if (hour >= 7 && hour <= 10) timeSlot = 'morning';
        else if (hour >= 12 && hour <= 15) timeSlot = 'afternoon';
        else if (hour >= 19 && hour <= 22) timeSlot = 'night';

        if (timeSlot) {
          for (const med of activeMeds) {
            const isDue = (med as any)[timeSlot] === true;
            if (isDue) {
              eventBus.emit('MEDICINE_DUE', {
                userId: med.userId.toString(),
                medicineName: med.name,
                timeOfDay: timeSlot,
              });
            }
          }
        }
      } catch (err) {
        console.error('[Cron Error] Medicine reminder check:', err);
      }
    });

    // 4. Sunday Weekly Progress Report (Runs every Sunday at 19:00 PM)
    cron.schedule('0 19 * * 0', async () => {
      try {
        const profiles = await UserProfile.find({});
        const weekStr = new Date().toISOString().split('T')[0];

        for (const p of profiles) {
          await NotificationService.send({
            userId: p.userId,
            title: 'Your Weekly Fitness Summary 📊',
            message: 'Check out your workout consistency, calorie intake, and progress highlights for this week.',
            type: 'progress',
            category: 'progress',
            priority: 'low',
            soundType: 'DEFAULT',
            link: '/progress/analytics',
            idempotencyKey: `weekly_report_${p.userId}_${weekStr}`,
          });
        }
      } catch (err) {
        console.error('[Cron Error] Weekly progress report:', err);
      }
    });
  }
}
