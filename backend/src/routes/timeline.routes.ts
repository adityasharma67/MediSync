import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getMyTimeline } from '../controllers/timeline.controller';

const router = express.Router();

router.get('/', protect, asyncHandler(getMyTimeline));

export default router;
