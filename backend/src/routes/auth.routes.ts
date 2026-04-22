import express from 'express';
import {
  authUser,
  registerUser,
  googleAuth,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Public routes
router.post('/signup', authLimiter, validate(registerSchema), asyncHandler(registerUser));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authUser));
router.post('/google', asyncHandler(googleAuth));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(refreshAccessToken));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(resetPassword));

// Protected routes
router.post('/logout', protect, asyncHandler(logout));

export default router;
