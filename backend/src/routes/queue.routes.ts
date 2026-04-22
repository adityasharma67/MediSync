import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getQueueStatus, joinWaitlist } from '../controllers/queue.controller';

const router = express.Router();

router.post('/', protect, asyncHandler(joinWaitlist));
router.get('/:id', protect, asyncHandler(getQueueStatus));

export default router;
