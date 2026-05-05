import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';

// Extend Express Request interface to include user
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    _id: string;
  };
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify access token
      const decoded = AuthService.verifyAccessToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Token expired or invalid' });
      }

      // Attach user data to request
      (req as AuthRequest).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as 'patient' | 'doctor' | 'admin',
        _id: decoded.id,
      };

      next();
    } catch (error) {
      logger.error(`Auth error: ${error}`);
      return res.status(401).json({ error: 'Not authorized' });
    }
  } else {
    logger.warn('No token provided in authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authRequest = req as AuthRequest;

    if (!authRequest.user || !roles.includes(authRequest.user.role)) {
      logger.warn(`Unauthorized access attempt. User role: ${authRequest.user?.role}, required: ${roles.join(', ')}`);
      return res.status(403).json({ error: 'Not authorized for this resource' });
    }
    next();
  };
};
