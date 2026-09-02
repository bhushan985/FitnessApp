import { Router } from 'express';
import { TrainerController } from '../controllers/trainerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, TrainerController.getTrainers);
router.get('/my-trainer', authenticateToken, TrainerController.getMyTrainer);
router.post('/assign', authenticateToken, TrainerController.requestTrainerAssignment);
router.get('/trainer-clients', authenticateToken, TrainerController.getTrainerClients);

export default router;
