import { Response } from 'express';
import Appointment from '../models/appointment.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notificationQueue } from '../queues/notification.queue';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import queueService from '../services/queue.service';
import analyticsService from '../services/analytics.service';
import { emitToUser } from '../services/socket.service';

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
  const { doctorId, date, time, symptoms, joinWaitlist: allowWaitlist } = req.body;

  if (req.user.role !== 'patient') {
    throw new AppError(403, 'Only patients can book appointments');
  }

  try {
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      if (allowWaitlist) {
        const waitlistEntry = await queueService.joinQueue({
          patientId: req.user._id.toString(),
          doctorId,
          date,
          time,
          symptoms,
          priority: (symptoms || []).length,
        });
        const queueState = await queueService.getQueuePosition(waitlistEntry._id.toString());
        res.status(202).json({
          joinedWaitlist: true,
          message: 'Slot is full. You have been added to the waiting queue.',
          queue: queueState,
        });
        return;
      }

      throw new AppError(409, 'This slot is already booked');
    }

    const createdAppointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      time,
      status: 'scheduled',
      symptoms: symptoms || [],
    });

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

    await analyticsService.track('appointment.booked', {
      userId: req.user._id.toString(),
      doctorId,
      metadata: { date, time },
    });

    emitToUser(req.user._id.toString(), 'appointment:confirmed', createdAppointment);

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

    if (status === 'cancelled') {
      await queueService.assignFreedSlot(
        appointment.doctor.toString(),
        appointment.date,
        appointment.time
      );
      await analyticsService.track('appointment.cancelled', {
        userId: req.user._id.toString(),
        doctorId: appointment.doctor.toString(),
        metadata: { appointmentId: appointment._id.toString() },
      });
    }

    res.json(updatedAppointment);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('This slot is already booked');
    }
    throw error;
  }
};

export const createEmergencyBooking = async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'patient') {
    throw new AppError(403, 'Only patients can create emergency bookings');
  }

  const { symptoms = [], date, time } = req.body;
  const emergencyDoctor = await User.findOne({
    role: 'doctor',
    'doctorProfile.emergencyAvailable': true,
  }).sort({ 'doctorProfile.rating': -1, 'doctorProfile.reviewCount': -1 });

  if (!emergencyDoctor) {
    throw new AppError(404, 'No emergency doctors are available right now');
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: emergencyDoctor._id,
    date: new Date(date || Date.now()),
    time: time || new Date().toTimeString().slice(0, 5),
    status: 'emergency',
    symptoms,
    urgencyLevel: 'emergency',
    source: 'emergency',
  });

  await analyticsService.track('appointment.emergency', {
    userId: req.user._id.toString(),
    doctorId: emergencyDoctor._id.toString(),
    metadata: { symptoms },
  });

  emitToUser(emergencyDoctor._id.toString(), 'emergency:new-booking', {
    appointmentId: appointment._id,
    patientId: req.user._id,
    symptoms,
  });

  res.status(201).json({
    message: 'Emergency booking created and doctors notified',
    appointment,
  });
};
