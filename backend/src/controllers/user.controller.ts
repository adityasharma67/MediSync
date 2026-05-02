import { Request, Response } from 'express';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import logger from '../utils/logger';
import { AppError } from '../middlewares/error.middleware';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json(user);
};

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { name, avatar, specialization, consultationFee } = req.body;

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (user.role === 'doctor') {
    if (specialization) user.specialization = specialization;
    if (consultationFee !== undefined) {
      if (!user.doctorProfile) {
        user.doctorProfile = {};
      }
      user.doctorProfile.consultationFee = consultationFee;
    }
  }

  await user.save();
  logger.info(`User ${user._id} profile updated`);

  res.json(user);
};

export const getDoctors = async (req: Request, res: Response) => {
  const doctors = await User.find({ role: 'doctor' })
    .select('name email avatar specialization doctorProfile')
    .lean();

  res.json(doctors);
};

export const getDoctorProfile = async (req: Request, res: Response) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');

  if (!doctor) {
    throw new AppError(404, 'Doctor not found');
  }

  res.json(doctor);
};