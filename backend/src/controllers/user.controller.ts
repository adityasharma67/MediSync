import { Request, Response } from 'express';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import redis from '../config/redis';
import logger from '../utils/logger';
import recommendationService from '../services/recommendation.service';
import geoService from '../services/geo.service';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    user.avatar = req.body.avatar || user.avatar;
    user.specialization = req.body.specialization || user.specialization;
    user.availableSlots = req.body.availableSlots || user.availableSlots;
    user.symptomsProfile = req.body.symptomsProfile || user.symptomsProfile;
    user.doctorProfile = {
      ...user.doctorProfile,
      ...(req.body.doctorProfile || {}),
      location: {
        ...user.doctorProfile?.location,
        ...(req.body.doctorProfile?.location || {}),
      },
    };

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      specialization: updatedUser.specialization,
      availableSlots: updatedUser.availableSlots,
      symptomsProfile: updatedUser.symptomsProfile,
      doctorProfile: updatedUser.doctorProfile,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
export const getDoctors = async (req: Request, res: Response) => {
  const cacheKey = 'users:doctors:list';
  const cachedDoctors = await redis.get(cacheKey);

  if (cachedDoctors) {
    res.json(JSON.parse(cachedDoctors));
    return;
  }

  const doctors = await User.find({ role: 'doctor' })
    .select('-password')
    .lean();

  await redis.set(cacheKey, JSON.stringify(doctors), 'EX', 300);
  logger.info('cache_set', { cacheKey, ttlSeconds: 300, size: doctors.length });
  res.json(doctors);
};

export const getDoctorRecommendations = async (req: Request, res: Response) => {
  const symptoms = String(req.query.symptoms || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const recommendations = await recommendationService.recommendDoctors({ symptoms });
  res.json(recommendations);
};

export const getNearbyDoctors = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const doctors = await geoService.findNearbyDoctors(lat, lng);
  res.json(doctors);
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};
