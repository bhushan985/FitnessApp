import { Router } from 'express';
import { ExerciseController } from '../controllers/exerciseController.js';

const router = Router();

router.get('/search', ExerciseController.searchExercises);
router.get('/:id/replacements', ExerciseController.getExerciseReplacements);
router.get('/:id', ExerciseController.getExerciseById);
router.get('/', ExerciseController.searchExercises);

export default router;
