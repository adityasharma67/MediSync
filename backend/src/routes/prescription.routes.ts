import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
} from '../controllers/prescription.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

router.route('/')
  .post(protect, restrictTo('doctor'), asyncHandler(createPrescription))
  .get(protect, asyncHandler(getPrescriptions));

router.route('/:id')
  .get(protect, asyncHandler(getPrescriptionById));

export default router;
