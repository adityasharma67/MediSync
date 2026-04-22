import express from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

router.get('/', protect, asyncHandler(getNotifications));
router.put('/:id', protect, asyncHandler(markAsRead));
router.delete('/', protect, asyncHandler(clearNotifications));

export default router;
