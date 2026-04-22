import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { enableTwoFactor, getSessions, setupTwoFactor } from '../controllers/security.controller';

const router = express.Router();

router.post('/2fa/setup', protect, asyncHandler(setupTwoFactor));
router.post('/2fa/enable', protect, asyncHandler(enableTwoFactor));
router.get('/sessions', protect, asyncHandler(getSessions));

export default router;
