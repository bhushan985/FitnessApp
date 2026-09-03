import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, NotificationController.getMyNotifications);
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);
router.patch('/:id/read', authenticateToken, NotificationController.markAsRead);
router.patch('/read-all', authenticateToken, NotificationController.markAsRead);
router.delete('/:id', authenticateToken, NotificationController.deleteNotification);

router.get('/preferences', authenticateToken, NotificationController.getPreferences);
router.put('/preferences', authenticateToken, NotificationController.updatePreferences);

router.post('/device', authenticateToken, NotificationController.registerDevice);
router.delete('/device/:id', authenticateToken, NotificationController.deleteDevice);

router.post('/test', authenticateToken, NotificationController.sendTestNotification);

export default router;
