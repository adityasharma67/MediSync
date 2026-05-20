import { Response } from 'express';
import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  const { doctorId, scheduledAt, notes } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!userId || req.user?.role !== 'patient') {
    throw new AppError(403, 'Only patients can book appointments');
  }

  if (!doctorId || !scheduledAt) {
    throw new AppError(400, 'Doctor ID and scheduled time are required');
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new AppError(404, 'Doctor not found');
  }

  const appointmentDate = new Date(scheduledAt);
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    scheduledAt: appointmentDate,
    status: { $in: ['pending', 'confirmed'] },
  });

  if (existingAppointment) {
    throw new AppError(409, 'This slot is already booked');
  }

  const appointment = await Appointment.create({
    patient: userId,
    doctor: doctorId,
    scheduledAt: appointmentDate,
    status: 'pending',
    notes: notes || '',
  });

  await appointment.populate('patient', 'name email avatar');
  await appointment.populate('doctor', 'name email avatar specialization');

  logger.info(`Appointment created: ${appointment._id}`);
  res.status(201).json(appointment);
};

export const bookEmergencyAppointment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || req.user?._id;
  const symptoms = Array.isArray(req.body.symptoms)
    ? req.body.symptoms.join(', ')
    : req.body.symptoms || req.body.notes || 'Emergency consultation requested';

  if (!userId || req.user?.role !== 'patient') {
    throw new AppError(403, 'Only patients can request emergency appointments');
  }

  const doctor = await User.findOne({
    role: 'doctor',
    $or: [
      { 'doctorProfile.emergencyAvailable': true },
      { availableSlots: { $exists: true, $ne: [] } },
    ],
  }).sort({ 'doctorProfile.rating': -1, createdAt: 1 });

  if (!doctor) {
    throw new AppError(404, 'No emergency doctor is available right now');
  }

  const appointment = await Appointment.create({
    patient: userId,
    doctor: doctor._id,
    scheduledAt: new Date(Date.now() + 15 * 60 * 1000),
    status: 'confirmed',
    source: 'emergency',
    notes: `Emergency request: ${symptoms}`,
  });

  await appointment.populate('patient', 'name email avatar');
  await appointment.populate('doctor', 'name email avatar specialization');

  logger.info(`Emergency appointment created: ${appointment._id}`);
  res.status(201).json(appointment);
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const query =
    req.user.role === 'patient'
      ? { patient: req.user.id }
      : req.user.role === 'doctor'
        ? { doctor: req.user.id }
        : {};

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email avatar')
    .populate('doctor', 'name email avatar specialization')
    .sort({ scheduledAt: -1 });

  res.json(appointments);
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const appointment = (await Appointment.findById(req.params.id)
    .populate('patient', 'name email avatar')
    .populate('doctor', 'name email avatar specialization')) as any;

  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  const patientId = appointment.patient?._id?.toString?.() || appointment.patient?.toString?.();
  const doctorId = appointment.doctor?._id?.toString?.() || appointment.doctor?.toString?.();

  if (patientId !== req.user.id && doctorId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError(403, 'Not authorized to view this appointment');
  }

  res.json(appointment);
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body;

  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    throw new AppError(400, 'Valid status is required');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  const appointmentPatientId = appointment.patient.toString();
  const appointmentDoctorId = appointment.doctor.toString();

  if (
    appointmentPatientId !== req.user.id &&
    appointmentDoctorId !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError(403, 'Not authorized to update this appointment');
  }

  appointment.status = status;
  if (notes !== undefined) {
    appointment.notes = notes;
  }

  await appointment.save();
  await appointment.populate('patient', 'name email avatar');
  await appointment.populate('doctor', 'name email avatar specialization');

  res.json(appointment);
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  if (
    appointment.patient.toString() !== req.user.id &&
    appointment.doctor.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError(403, 'Not authorized to delete this appointment');
  }

  await Appointment.findByIdAndDelete(req.params.id);
  logger.info(`Appointment ${req.params.id} deleted`);

  res.json({ message: 'Appointment cancelled successfully' });
};
