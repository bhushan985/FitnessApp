import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, NotificationController.getMyNotifications);
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);

export default router;
