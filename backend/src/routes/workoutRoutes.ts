import { Router } from 'express';
import { WorkoutController } from '../controllers/workoutController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/today', WorkoutController.getTodayWorkout);
router.post('/generate', WorkoutController.generateWorkout);
router.post('/generate-abs', WorkoutController.generateAbsWorkout);
router.post('/ai-parse', WorkoutController.parseAIWorkout);
router.post('/complete', WorkoutController.completeWorkout);
router.put('/customize/:workoutPlanId', WorkoutController.customizeWorkout);

// Templates & Progress
router.get('/templates', WorkoutController.getTemplates);
router.post('/templates', WorkoutController.saveTemplate);
router.get('/progress/:exerciseName', WorkoutController.getExerciseProgressHistory);

export default router;
