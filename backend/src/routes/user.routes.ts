import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getDoctors,
  getUsers,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

router.route('/profile')
  .get(protect, asyncHandler(getUserProfile))
  .put(protect, asyncHandler(updateUserProfile));

router.get('/doctors', asyncHandler(getDoctors));

// Admin only routes
router.get('/', protect, restrictTo('admin'), asyncHandler(getUsers));

export default router;
