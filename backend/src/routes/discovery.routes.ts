import express from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import { findNearbyDoctors, recommendDoctors } from '../controllers/discovery.controller';

const router = express.Router();

router.post('/recommendations', asyncHandler(recommendDoctors));
router.get('/nearby-doctors', asyncHandler(findNearbyDoctors));

export default router;
