import { Router } from 'express';
import { ProgressController } from '../controllers/progressController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.post('/weight', ProgressController.logWeight);
router.get('/analytics', ProgressController.getProgressAnalytics);

export default router;
