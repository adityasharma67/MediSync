import { Request, Response } from 'express';
import User from '../models/user.model';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
import { AppError } from '../middlewares/error.middleware';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = AuthService.generateAccessToken(user._id.toString(), user.email, user.role);
  const token = AuthService.generateRefreshToken(user._id.toString());

  user.refreshToken = AuthService.hashToken(token);
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  logger.info(`User ${user.email} logged in`);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    accessToken,
    refreshToken: token,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError(400, 'Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(400, 'User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'doctor' ? 'doctor' : 'patient',
  });

  const accessToken = AuthService.generateAccessToken(user._id.toString(), user.email, user.role);
  const token = AuthService.generateRefreshToken(user._id.toString());

  user.refreshToken = AuthService.hashToken(token);
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  logger.info(`User ${user.email} signed up`);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    accessToken,
    refreshToken: token,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError(400, 'Refresh token is required');
  }

  const decoded = AuthService.verifyRefreshToken(token);
  if (!decoded) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const hashedToken = AuthService.hashToken(token);
  if (user.refreshToken !== hashedToken) {
    throw new AppError(401, 'Refresh token mismatch');
  }

  if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
    throw new AppError(401, 'Refresh token expired');
  }

  const accessToken = AuthService.generateAccessToken(user._id.toString(), user.email, user.role);

  res.json({
    accessToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const logout = async (req: Request, res: Response) => {
  const authRequest = req as Request & { user?: { id?: string; _id?: string } };
  const userId = authRequest.user?.id || authRequest.user?._id;

  if (!userId) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  res.json({ message: 'Logged out successfully' });
};

export const authUser = login;
