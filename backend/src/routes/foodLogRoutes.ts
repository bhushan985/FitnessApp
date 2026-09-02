import { Router } from 'express';
import { FoodLogController } from '../controllers/foodLogController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', FoodLogController.logFood);
router.get('/today', FoodLogController.getTodayLogs);
router.get('/recent', FoodLogController.getRecentFoods);
router.get('/favorites', FoodLogController.getFavorites);
router.post('/favorites', FoodLogController.toggleFavorite);
router.put('/:id', FoodLogController.updateLog);
router.delete('/:id', FoodLogController.deleteLog);

export default router;
