import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  updateAppointment,
} from '../controllers/appointment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.route('/')
  .post(protect, asyncHandler(bookAppointment))
  .get(protect, asyncHandler(getMyAppointments));

router.route('/:id')
  .put(protect, asyncHandler(updateAppointment));

export default router;
