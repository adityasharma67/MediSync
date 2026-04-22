import { Request, Response } from 'express';
import User from '../models/user.model';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
import crypto from 'crypto';
import securityService from '../services/security.service';
import Notification from '../models/notification.model';
import { AppError } from '../middlewares/error.middleware';

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response) => {
  const { email, password, twoFactorCode, deviceId } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password +security.twoFactorSecret');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.security?.twoFactorEnabled) {
      const expectedCode = user.security.twoFactorSecret?.slice(-6).toUpperCase();
      if (!twoFactorCode || twoFactorCode.toUpperCase() !== expectedCode) {
        throw new AppError(401, 'Two-factor authentication code is required');
      }
    }

    // Generate tokens
    const accessToken = AuthService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = AuthService.generateRefreshToken(user._id.toString());

    // Store refresh token (hashed) in database with expiry
    const hashedRefreshToken = AuthService.hashToken(refreshToken);
    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    await securityService.recordLogin(user._id.toString(), {
      deviceId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    if (user.security?.loginAlertsEnabled) {
      await Notification.create({
        user: user._id,
        title: 'New login detected',
        message: `A login was recorded from ${req.headers['user-agent'] || 'an unknown device'}.`,
        type: 'system',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    throw error;
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, deviceId } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      isEmailVerified: false,
    });

    // Generate tokens
    const accessToken = AuthService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = AuthService.generateRefreshToken(user._id.toString());

    // Store refresh token
    const hashedRefreshToken = AuthService.hashToken(refreshToken);
    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    await securityService.recordLogin(user._id.toString(), {
      deviceId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (error) {
    logger.error(`Signup error: ${error}`);
    throw error;
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const decoded = AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(401);
      throw new Error('Invalid or expired refresh token');
    }

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpires');
    if (!user || !user.refreshToken) {
      res.status(401);
      throw new Error('User not found or refresh token revoked');
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      res.status(401);
      throw new Error('Refresh token has expired');
    }

    // Verify the hashed refresh token matches
    const hashedToken = AuthService.hashToken(refreshToken);
    if (hashedToken !== user.refreshToken) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = AuthService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    res.json({
      accessToken: newAccessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error}`);
    throw error;
  }
};

// @desc    Forgot password - send reset token to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      res.json({ message: 'If an account exists, a password reset link has been sent' });
      return;
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const emailSent = await AuthService.sendPasswordResetEmail(email, resetToken, resetUrl);

    if (emailSent) {
      res.json({ message: 'Password reset email sent successfully' });
      logger.info(`Password reset email sent to ${email}`);
    } else {
      res.status(500);
      throw new Error('Failed to send password reset email');
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error}`);
    throw error;
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    if (!token || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error('Token, new password, and confirmation are required');
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    // Hash the token to match with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isEmailVerified = true;
    await user.save();

    logger.info(`Password reset successful for user ${user.email}`);
    res.json({ message: 'Password has been reset successfully. Please login with your new password.' });
  } catch (error) {
    logger.error(`Reset password error: ${error}`);
    throw error;
  }
};

// @desc    Google OAuth mock/placeholder
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  const { email, name, googleId, avatar, deviceId } = req.body;

  try {
    if (!email || !name) {
      res.status(400);
      throw new Error('Email and name are required');
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: 'patient',
        isEmailVerified: true,
      });
    }

    // Generate tokens
    const accessToken = AuthService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = AuthService.generateRefreshToken(user._id.toString());

    // Store refresh token
    const hashedRefreshToken = AuthService.hashToken(refreshToken);
    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    await securityService.recordLogin(user._id.toString(), {
      deviceId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (error) {
    logger.error(`Google auth error: ${error}`);
    throw error;
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;
    if (userId) {
      // Invalidate refresh token in database
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1, refreshTokenExpires: 1 },
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    throw error;
  }
};
