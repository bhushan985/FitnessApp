import { Router } from 'express';
import { HealthController } from '../controllers/healthController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

// Health Dashboard & Unified Payload
router.get('/dashboard', HealthController.getDailyDashboard);

// Tracker Logs
router.post('/water', HealthController.logWater);
router.post('/weight', HealthController.logWeight);
router.post('/sleep', HealthController.logSleep);
router.post('/medicine/reminder', HealthController.addMedicineReminder);
router.post('/medicine/status', HealthController.updateMedicineStatus);

// Settings
router.get('/settings', HealthController.getSettings);
router.put('/settings', HealthController.updateSettings);

// Multi-day Analysis & Trends
router.get('/analysis', HealthController.getAnalysis);

// AI Assistance & Smart Recommendations
router.post('/ai-ask', HealthController.askAI);
router.get('/smart-recommendations', HealthController.getRecommendations);

// Existing Compatibility Endpoints
router.post('/sync', HealthController.syncHealthMetrics);
router.get('/today', HealthController.getTodayHealth);

export default router;
