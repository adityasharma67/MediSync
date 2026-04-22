import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'patient' | 'doctor' | 'admin';
  googleId?: string;
  avatar?: string;
  specialization?: string; // For doctors
  availableSlots?: { date: Date; time: string }[]; // For doctors
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  isEmailVerified?: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateResetToken(): string;
  generateRefreshToken(): string;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google OAuth users
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    googleId: { type: String },
    avatar: { type: String },
    specialization: { type: String },
    availableSlots: [{ date: Date, time: String }],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for reset token queries
userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });
userSchema.index({ email: 1 });

// Password hashing middleware
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return resetToken;
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  this.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  this.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return refreshToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
