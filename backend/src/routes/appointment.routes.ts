import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} from '../controllers/appointment.controller';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// List and create appointments
router
  .route('/')
  .post(asyncHandler(bookAppointment))
  .get(asyncHandler(getMyAppointments));

// Get, update, delete single appointment
router
  .route('/:id')
  .get(asyncHandler(getAppointmentById))
  .patch(asyncHandler(updateAppointmentStatus))
  .delete(asyncHandler(deleteAppointment));

export default router;
