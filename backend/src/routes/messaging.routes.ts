import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getConversations, sendMessage, startConversation } from '../controllers/messaging.controller';

const router = express.Router();

router.get('/', protect, asyncHandler(getConversations));
router.post('/', protect, asyncHandler(startConversation));
router.post('/:id/messages', protect, asyncHandler(sendMessage));

export default router;
