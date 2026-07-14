/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const REDIS_KEYS = {
  /**
   * Generates the key for storing a registration OTP
   */
  registrationOtp: (email: string) => `otp:register:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking registration OTP resend cooldown (1 minute)
   */
  registrationCooldown: (email: string) => `otp:register:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed registration OTP attempts
   */
  registrationAttempts: (email: string) => `otp:register:attempts:${email.toLowerCase()}`,

  /**
   * Generates the key for storing a forgot password OTP
   */
  forgotPasswordOtp: (email: string) => `otp:forgot-password:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking forgot password OTP resend cooldown (1 minute)
   */
  forgotPasswordCooldown: (email: string) => `otp:forgot-password:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed forgot password OTP attempts
   */
  forgotPasswordAttempts: (email: string) => `otp:forgot-password:attempts:${email.toLowerCase()}`,
};

export const CACHE_TTL = {
  OTP_EXPIRY_SECONDS: 600, // 10 minutes for OTP validity
  COOLDOWN_SECONDS: 60,    // 1 minute before user can request a new OTP
  MAX_ATTEMPTS: 5,         // Max 5 attempts before lock/blacklist
};
