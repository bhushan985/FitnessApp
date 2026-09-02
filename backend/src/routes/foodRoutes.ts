import { Router } from 'express';
import { FoodController } from '../controllers/foodController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', FoodController.getFoods);
router.get('/:id', FoodController.getFoodById);
router.post('/', authenticateJWT, requireRole('admin', 'super_admin'), FoodController.createFood);
router.put('/:id', authenticateJWT, requireRole('admin', 'super_admin'), FoodController.updateFood);
router.delete('/:id', authenticateJWT, requireRole('admin', 'super_admin'), FoodController.deleteFood);

export default router;
