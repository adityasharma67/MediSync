import express from 'express';
import {
  getDoctorRecommendations,
  getUserProfile,
  getNearbyDoctors,
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
router.get('/doctors/recommendations', asyncHandler(getDoctorRecommendations));
router.get('/doctors/nearby', asyncHandler(getNearbyDoctors));

// Admin only routes
router.get('/', protect, restrictTo('admin'), asyncHandler(getUsers));

export default router;
