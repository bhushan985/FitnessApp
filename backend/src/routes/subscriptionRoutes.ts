import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public / User Routes
router.get('/plans', SubscriptionController.getMembershipPlans);
router.get('/me', authenticateToken, SubscriptionController.getMySubscription);
router.post('/create-order', authenticateToken, SubscriptionController.createOrder);
router.post('/verify-payment', authenticateToken, SubscriptionController.verifyPayment);

// Webhook
router.post('/webhook', SubscriptionController.handleWebhook);

// Dev Simulation for 30-Day Trial Testing (Day 1, 29, 30, 31)
router.post('/dev-simulate-trial', authenticateToken, SubscriptionController.simulateTrialDay);

export default router;
