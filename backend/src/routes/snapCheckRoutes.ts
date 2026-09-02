import { Router } from 'express';
import { SnapCheckController } from '../controllers/snapCheckController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.get('/history', SnapCheckController.getHistory);
router.post('/', SnapCheckController.analyzeImage);
router.get('/:id', SnapCheckController.getSnapCheckById);
router.put('/:id/correct', SnapCheckController.correctAnalysis);
router.post('/:id/log', SnapCheckController.confirmAndLog);

export default router;

