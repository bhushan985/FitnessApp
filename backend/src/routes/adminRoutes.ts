import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT, requireRole('admin', 'super_admin'));
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/users', AdminController.getUsers);
router.put('/users/:id/status', AdminController.toggleUserStatus);
router.get('/audit-logs', AdminController.getAuditLogs);

// Admin Membership Management
router.get('/memberships', AdminController.getMembershipPlans);
router.post('/memberships', AdminController.createMembershipPlan);
router.put('/memberships/:id', AdminController.updateMembershipPlan);

// Admin Trainer Management
router.get('/trainers', AdminController.getTrainers);
router.post('/trainers', AdminController.createTrainer);
router.post('/trainers/assign', AdminController.assignTrainerToUser);

// Admin Exercise Management
router.post('/exercises', AdminController.createExercise);
router.put('/exercises/:id', AdminController.updateExercise);

export default router;
