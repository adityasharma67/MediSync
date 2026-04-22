import crypto from 'crypto';
import User from '../models/user.model';

class SecurityService {
  private generateOtpFromSecret(secret: string) {
    return secret.slice(-6).toUpperCase();
  }

  async setupTwoFactor(userId: string) {
    const secret = crypto.randomBytes(16).toString('hex');
    await User.findByIdAndUpdate(userId, {
      $set: {
        'security.twoFactorSecret': secret,
        'security.twoFactorEnabled': false,
      },
    });

    return {
      secret,
      otpPreview: this.generateOtpFromSecret(secret),
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await User.findById(userId).select('+security.twoFactorSecret');
    if (!user?.security?.twoFactorSecret) {
      throw new Error('Two-factor setup not initialized');
    }

    const expected = this.generateOtpFromSecret(user.security.twoFactorSecret);
    if (code.toUpperCase() !== expected) {
      throw new Error('Invalid verification code');
    }

    user.security = {
      ...user.security,
      twoFactorEnabled: true,
    };
    await user.save();
    return { enabled: true };
  }

  async recordLogin(userId: string, payload: { deviceId?: string; userAgent?: string; ip?: string }) {
    const deviceId = payload.deviceId || crypto.createHash('md5').update(payload.userAgent || 'unknown').digest('hex');

    const user = await User.findById(userId);
    if (!user) return;

    const trustedDevices = user.security?.trustedDevices || [];
    const existingDevice = trustedDevices.find((device) => device.deviceId === deviceId);

    if (existingDevice) {
      existingDevice.lastSeenAt = new Date();
      existingDevice.userAgent = payload.userAgent;
    } else {
      trustedDevices.push({
        deviceId,
        userAgent: payload.userAgent,
        createdAt: new Date(),
        lastSeenAt: new Date(),
      });
    }

    user.security = {
      ...user.security,
      trustedDevices,
      lastLoginAt: new Date(),
      lastLoginIp: payload.ip,
      lastLoginDevice: payload.userAgent,
    };

    await user.save();
  }

  async listSessions(userId: string) {
    const user = await User.findById(userId).lean();
    return user?.security?.trustedDevices || [];
  }
}

export default new SecurityService();
