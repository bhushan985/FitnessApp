import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.get('/', RecommendationController.getRecommendations);
router.get('/eat-now', RecommendationController.getEatNowRecommendations);
router.post('/kitchen-cook', RecommendationController.cookFromKitchen);
router.post('/feedback', RecommendationController.submitFeedback);

export default router;
