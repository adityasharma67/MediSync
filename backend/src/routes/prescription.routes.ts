import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
} from '../controllers/prescription.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.route('/')
  .post(protect, restrictTo('doctor'), asyncHandler(createPrescription))
  .get(protect, asyncHandler(getPrescriptions));

router.route('/:id')
  .get(protect, asyncHandler(getPrescriptionById));

export default router;
