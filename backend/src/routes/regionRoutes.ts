import { Router } from 'express';
import { RegionController } from '../controllers/regionController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', RegionController.getRegions);
router.get('/:id', RegionController.getRegionById);
router.post('/', authenticateJWT, requireRole('admin', 'super_admin'), RegionController.createRegion);

export default router;
