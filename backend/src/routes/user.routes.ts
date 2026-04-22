import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getDoctors,
  getUsers,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.route('/profile')
  .get(protect, asyncHandler(getUserProfile))
  .put(protect, asyncHandler(updateUserProfile));

router.get('/doctors', asyncHandler(getDoctors));

// Admin only routes
router.get('/', protect, restrictTo('admin'), asyncHandler(getUsers));

export default router;
