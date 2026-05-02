import express from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getDoctors,
  getDoctorProfile,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

// Current user routes (protected)
router.use('/me', protect);
router
  .route('/me')
  .get(asyncHandler(getCurrentUser))
  .put(asyncHandler(updateCurrentUser));

// Public doctor routes
router.get('/doctors', asyncHandler(getDoctors));
router.get('/doctors/:id', asyncHandler(getDoctorProfile));

export default router;
