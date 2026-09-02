import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { AuthRequest, JWT_SECRET, JWT_REFRESH_SECRET } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';
import { OtpService } from '../services/otpService.js';

export class AuthController {
  /**
   * Helper to format User object response
   */
  private static formatUserResponse(user: IUser) {
    return {
      id: user._id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      phoneNumber: user.phoneNumber || user.phone || '',
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneNumberVerified: user.phoneNumberVerified,
      profileImage: user.profileImage || '',
      authMethods: user.authMethods || {
        emailOtp: !!user.emailVerified,
        phoneOtp: !!user.phoneNumberVerified,
        password: !!user.passwordHash,
      },
    };
  }


  /**
   * Send OTP (Email or Mobile Phone)
   */
  public static async sendOtp(req: AuthRequest, res: Response) {
    try {
      const { target, type, action } = req.body;
      if (!target || !type) {
        return res.status(400).json({ success: false, message: 'Target email/phone and type are required.' });
      }

      const methodType = type === 'phone' ? 'phone' : 'email';
      const actionType = action || 'login';

      // Pre-checks for registration / duplicate prevention
      if (actionType === 'register') {
        if (methodType === 'email') {
          const existing = await User.findOne({ email: target.trim().toLowerCase(), emailVerified: true });
          if (existing) {
            return res.status(400).json({
              success: false,
              message: 'This email is already associated with an account. Please log in instead.',
            });
          }
        } else {
          const existing = await User.findOne({
            $or: [{ phoneNumber: target.trim() }, { phone: target.trim() }],
            phoneNumberVerified: true,
          });
          if (existing) {
            return res.status(400).json({
              success: false,
              message: 'This mobile number is already associated with an account. Please log in instead.',
            });
          }
        }
      }

      const result = await OtpService.requestOtp(target, methodType, actionType);
      if (!result.success) {
        return res.status(429).json({ success: false, message: result.message, cooldownSeconds: result.cooldownSeconds });
      }

      return res.json({
        success: true,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds,
      });
    } catch (error: any) {
      console.error('sendOtp error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
    }
  }

  /**
   * Verify OTP and Login / Register into a SINGLE MongoDB User Account
   */
  public static async verifyOtp(req: AuthRequest, res: Response) {
    try {
      const { target, type, otp, name, action } = req.body;
      if (!target || !type || !otp) {
        return res.status(400).json({ success: false, message: 'Target, type, and OTP code are required.' });
      }

      const methodType = type === 'phone' ? 'phone' : 'email';
      const verifyRes = await OtpService.verifyOtp(target, methodType, otp);

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, message: verifyRes.message });
      }

      const normalizedTarget = target.trim().toLowerCase();
      let user: IUser | null = null;

      if (methodType === 'email') {
        user = await User.findOne({ email: normalizedTarget });
      } else {
        user = await User.findOne({ $or: [{ phoneNumber: target.trim() }, { phone: target.trim() }] });
      }

      // If user does not exist yet -> Create new Unified MongoDB User Account
      if (!user) {
        const userName = name || (methodType === 'email' ? normalizedTarget.split('@')[0] : `User ${target.slice(-4)}`);
        
        user = new User({
          name: userName,
          email: methodType === 'email' ? normalizedTarget : undefined,
          emailVerified: methodType === 'email',
          phoneNumber: methodType === 'phone' ? target.trim() : undefined,
          phone: methodType === 'phone' ? target.trim() : undefined,
          phoneNumberVerified: methodType === 'phone',
          role: 'user',
          status: 'active',
          authMethods: {
            emailOtp: methodType === 'email',
            phoneOtp: methodType === 'phone',
            password: false,
          },
        });

        await user.save();

        // Assign 30-Day Free Trial
        const now = new Date();
        const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const SubscriptionModel = (await import('../models/Subscription.js')).Subscription;
        await SubscriptionModel.create({
          userId: user._id,
          subscriptionStatus: 'trial',
          trialStartDate: now,
          trialEndDate,
        });

        await logAudit('USER_CREATED_OTP', 'User', user.name, user._id, user._id.toString(), req.ip);
      } else {
        // User exists -> Update verification flags on SAME MongoDB User Account
        if (methodType === 'email') {
          user.emailVerified = true;
          user.authMethods = { ...(user.authMethods || {}), emailOtp: true };
        } else {
          user.phoneNumber = target.trim();
          user.phone = target.trim();
          user.phoneNumberVerified = true;
          user.authMethods = { ...(user.authMethods || {}), phoneOtp: true };
        }

        user.lastLoginAt = new Date();
        await user.save();

        await logAudit('USER_LOGIN_OTP', 'User', `OTP Login ${target}`, user._id, user._id.toString(), req.ip);
      }

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          refreshToken,
          user: AuthController.formatUserResponse(user),
        },
      });
    } catch (error: any) {
      console.error('verifyOtp error:', error);
      return res.status(500).json({ success: false, message: error.message || 'OTP verification failed' });
    }
  }

  /**
   * Link missing verification method (Email or Phone) to logged-in user _id
   */
  public static async linkAuthMethod(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { target, type, otp } = req.body;

      if (!target || !type || !otp) {
        return res.status(400).json({ success: false, message: 'Target, type, and OTP code are required.' });
      }

      const methodType = type === 'phone' ? 'phone' : 'email';
      const verifyRes = await OtpService.verifyOtp(target, methodType, otp);

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, message: verifyRes.message });
      }

      const currentUser = await User.findById(req.user._id);
      if (!currentUser) return res.status(404).json({ success: false, message: 'User account not found.' });

      if (methodType === 'email') {
        const normalized = target.trim().toLowerCase();
        const existingOther = await User.findOne({ email: normalized, _id: { $ne: currentUser._id } });
        if (existingOther) {
          return res.status(400).json({
            success: false,
            message: 'This email is already linked to another user account.',
          });
        }
        currentUser.email = normalized;
        currentUser.emailVerified = true;
        currentUser.authMethods = { ...(currentUser.authMethods || {}), emailOtp: true };
      } else {
        const existingOther = await User.findOne({
          $or: [{ phoneNumber: target.trim() }, { phone: target.trim() }],
          _id: { $ne: currentUser._id },
        });
        if (existingOther) {
          return res.status(400).json({
            success: false,
            message: 'This mobile number is already linked to another user account.',
          });
        }
        currentUser.phoneNumber = target.trim();
        currentUser.phone = target.trim();
        currentUser.phoneNumberVerified = true;
        currentUser.authMethods = { ...(currentUser.authMethods || {}), phoneOtp: true };
      }

      await currentUser.save();
      await logAudit('USER_LINKED_AUTH', 'User', `Linked ${methodType} ${target}`, currentUser._id, currentUser._id.toString(), req.ip);

      return res.json({
        success: true,
        message: `${methodType === 'email' ? 'Email' : 'Mobile number'} linked & verified successfully!`,
        data: {
          user: AuthController.formatUserResponse(currentUser),
        },
      });
    } catch (error: any) {
      console.error('linkAuthMethod error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to link account method.' });
    }
  }

  /**
   * Password Registration Fallback
   */
  public static async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, phone, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        email: email.toLowerCase(),
        phone,
        phoneNumber: phone,
        passwordHash,
        role: role && ['user', 'admin'].includes(role) ? role : 'user',
        status: 'active',
        emailVerified: true,
        authMethods: { emailOtp: false, phoneOtp: false, password: true },
      });

      await user.save();

      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const SubscriptionModel = (await import('../models/Subscription.js')).Subscription;
      await SubscriptionModel.create({
        userId: user._id,
        subscriptionStatus: 'trial',
        trialStartDate: now,
        trialEndDate,
      });

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          refreshToken,
          user: AuthController.formatUserResponse(user),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  /**
   * Password Login Fallback
   */
  public static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || '');
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          refreshToken,
          user: AuthController.formatUserResponse(user),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  public static async refreshToken(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required.' });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user || user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Invalid user or account blocked.' });
      }

      const newToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, data: { token: newToken } });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({
      success: true,
      data: AuthController.formatUserResponse(user),
    });
  }
}
