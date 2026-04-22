import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getAnalyticsDashboard } from '../controllers/analytics.controller';

const router = express.Router();

router.get('/', protect, restrictTo('admin', 'doctor'), asyncHandler(getAnalyticsDashboard));

export default router;
