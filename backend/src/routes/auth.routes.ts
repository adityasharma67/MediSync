import express from 'express';
import { login, signup, refreshToken, logout } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Public routes
router.post('/signup', authLimiter, asyncHandler(signup));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));

// Protected routes
router.post('/logout', protect, asyncHandler(logout));

export default router;
