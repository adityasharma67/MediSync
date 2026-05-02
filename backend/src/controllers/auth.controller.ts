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
  const refreshToken = AuthService.generateRefreshToken(user._id.toString());

  user.refreshToken = AuthService.hashToken(refreshToken);
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
    refreshToken,
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
  const refreshToken = AuthService.generateRefreshToken(user._id.toString());

  user.refreshToken = AuthService.hashToken(refreshToken);
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
    refreshToken,
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
  const authRequest = req as Request & { user?: { id: string } };

  if (!authRequest.user?.id) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await User.findById(authRequest.user.id);
  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  res.json({ message: 'Logged out successfully' });
};
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
<<<<<<< HEAD
=======
      res.status(401);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(401, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) {
<<<<<<< HEAD
=======
      res.status(401);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpires');
    if (!user || !user.refreshToken) {
<<<<<<< HEAD
=======
      res.status(401);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(401, 'User not found or refresh token revoked');
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
<<<<<<< HEAD
=======
      res.status(401);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(401, 'Refresh token has expired');
    }

    // Verify the hashed refresh token matches
    const hashedToken = AuthService.hashToken(refreshToken);
    if (hashedToken !== user.refreshToken) {
<<<<<<< HEAD
=======
      res.status(401);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(401, 'Invalid refresh token');
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
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Email is required');
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
      throw new AppError(500, 'Failed to send password reset email');
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
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Token, new password, and confirmation are required');
    }

    if (newPassword !== confirmPassword) {
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Passwords do not match');
    }

    if (newPassword.length < 8) {
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Password must be at least 8 characters');
    }

    // Hash the token to match with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Invalid or expired reset token');
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
<<<<<<< HEAD
=======
      res.status(400);
>>>>>>> 7a965c6 (Fix auth flow and protected route handling)
      throw new AppError(400, 'Email and name are required');
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
=======
  res.json({ message: 'Logged out successfully' });
};
>>>>>>> c2eb2e3 (Simplify MediSync backend and WebRTC flow)
