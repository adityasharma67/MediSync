import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import type { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
  private static REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

  // Generate Access Token (short-lived)
  static generateAccessToken(id: string, email: string, role: string): string {
    return jwt.sign(
      { id, email, role, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );
  }

  // Generate Refresh Token (long-lived)
  static generateRefreshToken(id: string): string {
    return jwt.sign(
      { id, type: 'refresh' },
      this.REFRESH_SECRET,
      { expiresIn: this.REFRESH_EXPIRES_IN } as SignOptions
    );
  }

  // Verify Access Token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded: any = jwt.verify(token, this.JWT_SECRET);
      if (decoded.type !== 'access') return null;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Verify Refresh Token
  static verifyRefreshToken(token: string): { id: string } | null {
    try {
      const decoded: any = jwt.verify(token, this.REFRESH_SECRET);
      if (decoded.type !== 'refresh') return null;
      return { id: decoded.id };
    } catch (error) {
      return null;
    }
  }

  // Generate Password Reset Token
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash token (for storage)
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Send Password Reset Email
  static async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
    try {
      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@medisync.com',
        to: email,
        subject: 'MediSync - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p>
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Reset Password
              </a>
            </p>
            <p>This link will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">MediSync - Healthcare Made Simple</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email: ${error}`);
      return false;
    }
  }

  // Send Verification Email
  static async sendVerificationEmail(email: string, verificationUrl: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@medisync.com',
        to: email,
        subject: 'MediSync - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Welcome to MediSync! Please verify your email to complete your registration.</p>
            <p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Verify Email
              </a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 12px;">MediSync - Healthcare Made Simple</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email: ${error}`);
      return false;
    }
  }

  static async sendAppointmentReminderEmail(
    email: string,
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    appointmentTime: string
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@medisync.com',
        to: email,
        subject: 'MediSync - Appointment Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Appointment Reminder</h2>
            <p>Hi ${patientName},</p>
            <p>This is a reminder for your consultation with <strong>Dr. ${doctorName}</strong>.</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p>Please join a few minutes before your scheduled time.</p>
            <p style="color: #666; font-size: 12px;">MediSync - Healthcare Made Simple</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Appointment reminder sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send appointment reminder email: ${error}`);
      return false;
    }
  }
}

export default AuthService;
