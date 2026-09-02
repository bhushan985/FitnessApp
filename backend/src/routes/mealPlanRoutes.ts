import { Router } from 'express';
import { MealPlanController } from '../controllers/mealPlanController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.post('/generate', MealPlanController.generateMealPlan);
router.get('/today', MealPlanController.getTodayMealPlan);
router.put('/today/diet-type', MealPlanController.updateTodayDietType);
router.get('/items/:itemId/alternatives', MealPlanController.getItemAlternatives);
router.post('/items/:itemId/replace', MealPlanController.replaceMealItem);
router.put('/items/:itemId', MealPlanController.updateItemStatus);

export default router;
