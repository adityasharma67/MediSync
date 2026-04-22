import { Request, Response } from 'express';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import redis from '../config/redis';
import logger from '../utils/logger';

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

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};
