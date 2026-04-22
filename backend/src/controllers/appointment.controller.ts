import { Response } from 'express';
import Appointment from '../models/appointment.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notificationQueue } from '../queues/notification.queue';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

const combineDateTime = (dateValue: string | Date, time: string): Date => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, 'Invalid date format');
  }

  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new AppError(400, 'Invalid time format');
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req: AuthRequest, res: Response) => {
  const { doctorId, date, time } = req.body;

  if (req.user.role !== 'patient') {
    throw new AppError(403, 'Only patients can book appointments');
  }

  try {
    // Atomic upsert prevents race conditions when multiple users target same slot.
    const appointment = await Appointment.findOneAndUpdate(
      { doctor: doctorId, date: new Date(date), time },
      {
        $setOnInsert: {
          patient: req.user._id,
          doctor: doctorId,
          date: new Date(date),
          time,
          status: 'scheduled',
        },
      },
      {
        upsert: true,
        new: true,
        rawResult: true,
      }
    );

    if (!appointment.lastErrorObject?.upserted) {
      throw new AppError(409, 'This slot is already booked');
    }

    const createdAppointment = appointment.value;
    if (!createdAppointment) {
      throw new AppError(500, 'Failed to create appointment');
    }

    const [patient, doctor] = await Promise.all([
      User.findById(req.user._id).select('name email'),
      User.findById(doctorId).select('name'),
    ]);

    const appointmentDateTime = combineDateTime(date, time);
    const reminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);

    if (patient?.email) {
      await notificationQueue.add(
        'appointmentReminder',
        {
          email: patient.email,
          appointmentDate: appointmentDateTime.toDateString(),
          appointmentTime: time,
          patientName: patient.name,
          doctorName: doctor?.name || 'Doctor',
        },
        {
          delay: Math.max(reminderTime.getTime() - Date.now(), 0),
          jobId: `appointment-reminder-${createdAppointment._id}`,
        }
      );
    }

    res.status(201).json(createdAppointment);
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(409, 'This slot is already booked');
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
