import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/search', RecipeController.searchRecipes);
router.get('/:id', RecipeController.getRecipeById);
router.post('/:id/log', RecipeController.logRecipe);

export default router;
