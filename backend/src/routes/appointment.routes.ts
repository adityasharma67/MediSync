import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  updateAppointment,
} from '../controllers/appointment.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  bookAppointmentSchema,
  updateAppointmentSchema,
} from '../validators/appointment.validator';

const router = express.Router();

router.route('/')
  .post(protect, validate(bookAppointmentSchema), asyncHandler(bookAppointment))
  .get(protect, asyncHandler(getMyAppointments));

router.route('/:id')
  .put(protect, validate(updateAppointmentSchema), asyncHandler(updateAppointment));

export default router;
