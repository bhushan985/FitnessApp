import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/otp/send', AuthController.sendOtp);
router.post('/otp/verify', AuthController.verifyOtp);
router.post('/link-method', authenticateJWT, AuthController.linkAuthMethod);
router.get('/me', authenticateJWT, AuthController.me);

export default router;
