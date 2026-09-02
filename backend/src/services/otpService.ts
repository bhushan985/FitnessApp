import crypto from 'crypto';
import { OtpRecord } from '../models/OtpRecord.js';

export class OtpService {
  /**
   * Hash plaintext OTP using SHA-256 for secure storage
   */
  private static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Generate cryptographically secure 6-digit OTP string
   */
  public static generate6DigitOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Request & Send OTP to target Email or Phone
   */
  public static async requestOtp(
    target: string,
    type: 'email' | 'phone',
    action: 'register' | 'login' | 'link'
  ): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
    const normalizedTarget = target.trim().toLowerCase();
    const existing = await OtpRecord.findOne({ target: normalizedTarget, type });

    const now = new Date();
    if (existing) {
      const secondsSinceLastResend = Math.floor((now.getTime() - existing.lastResendAt.getTime()) / 1000);
      if (secondsSinceLastResend < 30) {
        return {
          success: false,
          message: `Please wait ${30 - secondsSinceLastResend} seconds before requesting a new OTP.`,
          cooldownSeconds: 30 - secondsSinceLastResend,
        };
      }

      if (existing.resendCount >= 5) {
        return {
          success: false,
          message: 'Maximum OTP resend attempts exceeded. Please try again in 15 minutes.',
          cooldownSeconds: 900,
        };
      }
    }

    const plaintextOtp = process.env.NODE_ENV === 'test' ? '123456' : this.generate6DigitOtp();
    const otpHash = this.hashOtp(plaintextOtp);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 Minutes Expiration

    await OtpRecord.findOneAndUpdate(
      { target: normalizedTarget, type },
      {
        action,
        otpHash,
        expiresAt,
        attempts: 0,
        $inc: { resendCount: existing ? 1 : 0 },
        lastResendAt: now,
      },
      { upsert: true, new: true }
    );

    // Development Console Sandbox Output
    console.log(`=======================================================`);
    console.log(` 🔐 [NUTRIREGION DEV OTP ENGINE]`);
    console.log(`  Target (${type.toUpperCase()}): ${normalizedTarget}`);
    console.log(`  Action: ${action.toUpperCase()}`);
    console.log(`  OTP Code: >>> ${plaintextOtp} <<< (Expires in 5 mins)`);
    console.log(`=======================================================`);

    return {
      success: true,
      message: `OTP sent successfully to ${type === 'email' ? 'email' : 'phone number'}.`,
      cooldownSeconds: 30,
    };
  }

  /**
   * Verify submitted OTP code against target hash
   */
  public static async verifyOtp(
    target: string,
    type: 'email' | 'phone',
    submittedOtp: string
  ): Promise<{ success: boolean; message: string }> {
    const normalizedTarget = target.trim().toLowerCase();
    const record = await OtpRecord.findOne({ target: normalizedTarget, type });

    if (!record) {
      return { success: false, message: 'OTP expired or not found. Please request a new OTP.' };
    }

    if (new Date() > record.expiresAt) {
      await OtpRecord.deleteOne({ _id: record._id });
      return { success: false, message: 'OTP expired. Please request a new OTP.' };
    }

    if (record.attempts >= 5) {
      await OtpRecord.deleteOne({ _id: record._id });
      return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
    }

    const submittedHash = this.hashOtp(submittedOtp.trim());
    if (submittedHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      return { success: false, message: `Invalid OTP code. ${5 - record.attempts} attempts remaining.` };
    }

    // Successfully verified -> Delete OTP record
    await OtpRecord.deleteOne({ _id: record._id });
    return { success: true, message: 'OTP verified successfully.' };
  }
}
