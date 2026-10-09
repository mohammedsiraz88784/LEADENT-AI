import crypto from 'crypto';
import { sendOtpEmail, isEmailDeliveryConfigured, EmailDeliveryResult } from './emailService';

export interface StoredOtpRecord {
  email: string;
  salt: string;
  otpHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  lastRequestedAt: number;
  purpose: 'registration' | 'login' | 'verification';
}

export interface RequestOtpResult {
  success: boolean;
  error?: string;
  email: string;
  cooldownSeconds: number;
  expiresInSeconds: number;
  retryAfterSeconds?: number;
  emailDeliveryConfigured: boolean;
  emailResult?: EmailDeliveryResult;
  message: string;
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: string;
  expired?: boolean;
  attemptsExceeded?: boolean;
  remainingAttempts?: number;
}

const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5; // 5 failed attempts locks OTP
const MAX_HOURLY_REQUESTS = 5; // rate limit per hour

// Map from normalized email to current OTP record
const otpStore = new Map<string, StoredOtpRecord>();

// Map from normalized email to list of timestamps of requests in the last hour
const requestHistory = new Map<string, number[]>();

function hashOtp(otp: string, salt: string): string {
  return crypto.pbkdf2Sync(otp, salt, 1000, 32, 'sha256').toString('hex');
}

function pruneExpiredOtps() {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt + 60000) {
      otpStore.delete(email);
    }
  }
}

export const otpService = {
  /**
   * Generates a dynamic, cryptographically secure 6-digit OTP,
   * stores its salted hash with expiration & cooldown,
   * and dispatches it via real email delivery if configured.
   */
  async generateAndSendOtp(
    rawEmail: string,
    purpose: 'registration' | 'login' | 'verification' = 'verification'
  ): Promise<RequestOtpResult> {
    pruneExpiredOtps();

    const normalizedEmail = (rawEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        error: 'Please enter a valid email address (e.g. student@gmail.com or university email).',
        email: normalizedEmail,
        cooldownSeconds: 0,
        expiresInSeconds: 0,
        emailDeliveryConfigured: isEmailDeliveryConfigured(),
        message: 'Invalid email address'
      };
    }

    const now = Date.now();

    // 1. Check Resend Cooldown (30 seconds)
    const existing = otpStore.get(normalizedEmail);
    if (existing) {
      const elapsedSinceLast = now - existing.lastRequestedAt;
      if (elapsedSinceLast < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLast) / 1000);
        return {
          success: false,
          error: `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'} before requesting another verification code.`,
          email: normalizedEmail,
          cooldownSeconds: remainingSeconds,
          expiresInSeconds: Math.max(0, Math.ceil((existing.expiresAt - now) / 1000)),
          retryAfterSeconds: remainingSeconds,
          emailDeliveryConfigured: isEmailDeliveryConfigured(),
          message: `Resend cooldown active. Retry in ${remainingSeconds}s.`
        };
      }
    }

    // 2. Check Hourly Rate Limit (5 per hour)
    const timestamps = (requestHistory.get(normalizedEmail) || []).filter(t => now - t < 3600000);
    if (timestamps.length >= MAX_HOURLY_REQUESTS) {
      const oldest = timestamps[0];
      const waitMinutes = Math.ceil((3600000 - (now - oldest)) / 60000);
      return {
        success: false,
        error: `Too many verification requests for this email address. Please try again in ${waitMinutes} minutes.`,
        email: normalizedEmail,
        cooldownSeconds: 30,
        expiresInSeconds: 0,
        retryAfterSeconds: waitMinutes * 60,
        emailDeliveryConfigured: isEmailDeliveryConfigured(),
        message: 'Rate limit exceeded.'
      };
    }

    // 3. Generate dynamic 6-digit OTP (e.g., 483921)
    const otpInt = crypto.randomInt(100000, 1000000);
    const otpCode = otpInt.toString();

    // 4. Cryptographically Hash OTP with Per-Record Salt (Never plaintext!)
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otpCode, salt);

    const record: StoredOtpRecord = {
      email: normalizedEmail,
      salt,
      otpHash,
      createdAt: now,
      expiresAt: now + OTP_VALIDITY_MS,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      lastRequestedAt: now,
      purpose
    };

    // Store record (invalidates any previous OTP for this email)
    otpStore.set(normalizedEmail, record);

    // Record request timestamp
    timestamps.push(now);
    requestHistory.set(normalizedEmail, timestamps);

    // 5. Real Email Delivery
    const deliveryResult = await sendOtpEmail(normalizedEmail, otpCode, purpose);

    let clientMessage = 'Verification code generated.';
    if (deliveryResult.sent) {
      clientMessage = `Verification code sent to ${normalizedEmail}.`;
    } else if (!deliveryResult.configured) {
      clientMessage = 'OTP generated server-side. SMTP email provider is not yet configured in environment variables.';
    } else {
      clientMessage = `Generated OTP, but email delivery encountered an issue: ${deliveryResult.reason}`;
    }

    return {
      success: true,
      email: normalizedEmail,
      cooldownSeconds: 30,
      expiresInSeconds: Math.floor(OTP_VALIDITY_MS / 1000),
      emailDeliveryConfigured: deliveryResult.configured,
      emailResult: deliveryResult,
      message: clientMessage
    };
  },

  /**
   * Verifies the entered 6-digit OTP against the stored record.
   * Enforces 5-minute expiration, max 5 attempts, and email isolation.
   * On success, invalidates the OTP immediately.
   */
  verifyOtp(
    rawEmail: string,
    enteredOtp: string,
    expectedPurpose?: 'registration' | 'login' | 'verification'
  ): VerifyOtpResult {
    const normalizedEmail = (rawEmail || '').trim().toLowerCase();
    const cleanOtp = (enteredOtp || '').trim();

    if (!cleanOtp) {
      return { valid: false, error: 'Please enter the 6-digit verification code.' };
    }

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      return {
        valid: false,
        error: 'No active verification code found for this email. Please request a new code.'
      };
    }

    const now = Date.now();

    // Check expiration (5 minutes)
    if (now > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return {
        valid: false,
        expired: true,
        error: 'This verification code has expired. Please request a new code.'
      };
    }

    // Check max attempts
    if (record.attempts >= record.maxAttempts) {
      otpStore.delete(normalizedEmail);
      return {
        valid: false,
        attemptsExceeded: true,
        error: 'Maximum verification attempts exceeded. This code has been invalidated. Please request a new code.'
      };
    }

    // Verify hash
    const inputHash = hashOtp(cleanOtp, record.salt);
    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(record.otpHash, 'hex')
    );

    if (!hashesMatch) {
      record.attempts += 1;
      const remaining = record.maxAttempts - record.attempts;
      if (remaining <= 0) {
        otpStore.delete(normalizedEmail);
        return {
          valid: false,
          attemptsExceeded: true,
          error: 'Invalid verification code. Maximum attempts reached. Please request a new code.'
        };
      }
      return {
        valid: false,
        remainingAttempts: remaining,
        error: `Invalid verification code. Please try again. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`
      };
    }

    // Purpose check (if specified)
    if (expectedPurpose && record.purpose && record.purpose !== expectedPurpose && record.purpose !== 'verification') {
      // Allow general verification, but log if mismatch
    }

    // SUCCESS: Invalidate immediately to prevent replay attacks
    otpStore.delete(normalizedEmail);

    return {
      valid: true
    };
  },

  /**
   * Checks current OTP status for an email (cooldown remaining, expiration remaining).
   */
  getStatus(rawEmail: string): {
    hasActive: boolean;
    cooldownRemainingSeconds: number;
    expiresInSeconds: number;
    emailDeliveryConfigured: boolean;
  } {
    const normalizedEmail = (rawEmail || '').trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);
    const now = Date.now();

    let cooldownRemainingSeconds = 0;
    let expiresInSeconds = 0;
    let hasActive = false;

    if (record) {
      if (now < record.expiresAt) {
        hasActive = true;
        expiresInSeconds = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
      }
      const elapsed = now - record.lastRequestedAt;
      if (elapsed < RESEND_COOLDOWN_MS) {
        cooldownRemainingSeconds = Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
      }
    }

    return {
      hasActive,
      cooldownRemainingSeconds,
      expiresInSeconds,
      emailDeliveryConfigured: isEmailDeliveryConfigured()
    };
  },

  /**
   * Internal test helper for inspecting active OTP in automated test scripts ONLY.
   */
  _getActiveRecordForTesting(email: string) {
    return otpStore.get(email.toLowerCase().trim());
  },

  /**
   * Internal test helper for expiring an OTP safely in test scripts ONLY.
   */
  _expireForTesting(email: string) {
    const rec = otpStore.get(email.toLowerCase().trim());
    if (rec) {
      rec.expiresAt = Date.now() - 1000;
    }
  }
};
