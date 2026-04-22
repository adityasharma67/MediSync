import { Response } from 'express';
import Appointment from '../models/appointment.model';
import { AuthRequest } from '../middlewares/auth.middleware';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req: AuthRequest, res: Response) => {
  const { doctorId, date, time } = req.body;

  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      status: 'scheduled',
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    // Check for duplicate key error (double booking)
    if (error.code === 11000) {
      res.status(400);
      throw new Error('This slot is already booked');
    }
    throw error;
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  let query = {};
  
  if (req.user.role === 'patient') {
    query = { patient: req.user._id };
  } else if (req.user.role === 'doctor') {
    query = { doctor: req.user._id };
  } else if (req.user.role === 'admin') {
    // Admins see all
    query = {};
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email avatar')
    .populate('doctor', 'name specialization')
    .sort({ date: 1, time: 1 });

  res.json(appointments);
};

// @desc    Update appointment status (Cancel, Reschedule)
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  const { status, date, time, meetLink } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Ensure only the involved patient, doctor, or an admin can update
  if (
    appointment.patient.toString() !== req.user._id.toString() &&
    appointment.doctor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.status = status || appointment.status;
  appointment.date = date || appointment.date;
  appointment.time = time || appointment.time;
  appointment.meetLink = meetLink || appointment.meetLink;

  try {
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('This slot is already booked');
    }
    throw error;
  }
};
