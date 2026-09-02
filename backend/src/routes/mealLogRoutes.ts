import { Router } from 'express';
import { MealLogController } from '../controllers/mealLogController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.post('/', MealLogController.logMeal);
router.get('/', MealLogController.getLogs);
router.delete('/:id', MealLogController.deleteLog);

export default router;
