import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);
router.post('/image', ProfileController.updateProfileImage);
router.delete('/image', ProfileController.removeProfileImage);
router.get('/diet-schedule', ProfileController.getDietSchedule);
router.put('/diet-schedule', ProfileController.updateDietSchedule);
router.put('/location', ProfileController.updateLocation);

export default router;
