import { Response } from 'express';
import Prescription from '../models/prescription.model';
import { AuthRequest } from '../middlewares/auth.middleware';

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
export const createPrescription = async (req: AuthRequest, res: Response) => {
  const { appointmentId, patientId, diagnosis, medications, notes } = req.body;

  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can create prescriptions');
  }

  const prescription = await Prescription.create({
    appointment: appointmentId,
    patient: patientId,
    doctor: req.user._id,
    diagnosis,
    medications,
    notes,
  });

  res.status(201).json(prescription);
};

// @desc    Get prescriptions for a patient or doctor
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  let query = {};
  
  if (req.user.role === 'patient') {
    query = { patient: req.user._id };
  } else if (req.user.role === 'doctor') {
    query = { doctor: req.user._id };
  }

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'name email')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date time')
    .sort({ createdAt: -1 });

  res.json(prescriptions);
};

// @desc    Get a specific prescription
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name email')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date time');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  // Authorize
  if (
    prescription.patient._id.toString() !== req.user._id.toString() &&
    prescription.doctor._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this prescription');
  }

  res.json(prescription);
};
