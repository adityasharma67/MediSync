import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { analyzeReport, getMyReports } from '../controllers/report.controller';

const router = express.Router();

router.route('/')
  .post(protect, asyncHandler(analyzeReport))
  .get(protect, asyncHandler(getMyReports));

export default router;
