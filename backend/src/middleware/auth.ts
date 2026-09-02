import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'fitness_app_super_secret_jwt_key_2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fitness_app_refresh_secret_key_2026';

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Missing token.', errorCode: 'AUTH_REQUIRED' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'User account is inactive or blocked.', errorCode: 'USER_BLOCKED' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.', errorCode: 'INVALID_TOKEN' });
  }
};

export const authenticateToken = authenticateJWT;

export const requireRole = (...roles: Array<'user' | 'trainer' | 'admin' | 'super_admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.', errorCode: 'FORBIDDEN' });
    }
    next();
  };
};
