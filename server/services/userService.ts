/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { userRepository } from '../repositories/userRepository.ts';
import { authRepository } from '../repositories/authRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { activityRepository } from '../repositories/activityRepository.ts';
import { sessionRepository } from '../repositories/sessionRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { depositAddressRepository } from '../repositories/depositAddressRepository.ts';
import { notificationService } from './notificationService.ts';
import { blockchainProvider } from './blockchainProvider.ts';
import { UserRole } from '../../shared/types/index.ts';
import { hashPassword, comparePassword } from '../utils/password.ts';
import { SecurityLogger } from '../utils/securityLogger.ts';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class UserService {
  /**
   * Synchronize or register authenticated user state.
   */
  async syncUserAuthentication(uid: string, email: string) {
    const existingUser = await userRepository.findByUid(uid);
    if (existingUser) {
      // Lazy initialize wallet and vipStatus if missing
      await this.ensureUserResources(existingUser.id);
      return existingUser;
    }

    const createdUser = await userRepository.upsertUser({
      uid,
      email: email.toLowerCase().trim(),
    });

    await this.ensureUserResources(createdUser.id);
    return createdUser;
  }

  /**
   * Initialize user resources like wallets and vipStatus
   */
  public async ensureUserResources(userId: string) {
    try {
      const user = await userRepository.findById(userId);
      const userCreatedAt = user ? new Date(user.createdAt).getTime() : Date.now();

      const trialAmountSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_AMOUNT');
      const trialDurationSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_DURATION_DAYS');
      const trialEnabledSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_ENABLED');

      const isEnabled = trialEnabledSetting ? trialEnabledSetting.value !== 'false' : true;
      const rawAmount = trialAmountSetting ? trialAmountSetting.value : '100.00000000';
      const durationDays = trialDurationSetting ? parseInt(trialDurationSetting.value) || 3 : 3;

      const parsedAmt = parseFloat(rawAmount);
      const trialAmount = isEnabled && !isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt.toFixed(8) : '0.00000000';

      const expiryTime = userCreatedAt + durationDays * 86400 * 1000;
      const isExpired = Date.now() > expiryTime;

      const existingWallet = await walletRepository.findByUserId(userId);
      if (!existingWallet) {
        const initialTrialBalance = isExpired ? '0.00000000' : trialAmount;

        const createdWallet = await walletRepository.createWallet({
          userId,
          availableBalance: '0.00000000',
          lockedBalance: '0.00000000',
          trialBalance: initialTrialBalance,
        });

        if (isEnabled && parseFloat(initialTrialBalance) > 0 && createdWallet) {
          try {
            await transactionRepository.createTransaction({
              userId,
              walletId: createdWallet.id,
              type: 'TRIAL_FUND',
              referenceId: `TRIAL-${userId}`,
              status: 'COMPLETED',
              description: `Trial Fund credited automatically on registration (${initialTrialBalance} USDT for ${durationDays} days)`,
              amount: initialTrialBalance,
              balanceBefore: '0.00000000',
              balanceAfter: initialTrialBalance,
            });

            await notificationRepository.createNotification({
              userId,
              priority: 'HIGH',
              message: JSON.stringify({
                title: 'Trial Fund Credited',
                description: `Welcome! A Trial Fund of $${parseFloat(initialTrialBalance).toFixed(2)} USDT (${durationDays}-day trial) has been credited to your account.`,
                icon: 'Sparkles',
                type: 'trial_fund',
              }),
            });
          } catch (logErr) {
            console.error('Failed to log trial fund transaction/notification:', logErr);
          }
        }
      } else {
        const currentTrial = parseFloat(existingWallet.trialBalance || '0');
        if (currentTrial > 0 && isExpired) {
          // Expire trial principal
          await walletRepository.updateBalances(existingWallet.id, { trialBalance: '0.00000000' });
          try {
            await transactionRepository.createTransaction({
              userId,
              walletId: existingWallet.id,
              type: 'TRIAL_EXPIRY',
              referenceId: `EXPIRY-${userId}`,
              status: 'COMPLETED',
              description: `Trial Fund principal expired after ${durationDays} days`,
              amount: existingWallet.trialBalance,
              balanceBefore: existingWallet.trialBalance,
              balanceAfter: '0.00000000',
            });
          } catch (e) {}
        } else if (currentTrial === 0 && isEnabled && !isExpired && parseFloat(trialAmount) > 0) {
          const existingTxs = await transactionRepository.findByUserId(userId, { type: 'TRIAL_FUND' });
          if (existingTxs.length === 0) {
            await walletRepository.updateBalances(existingWallet.id, { trialBalance: trialAmount });
            try {
              await transactionRepository.createTransaction({
                userId,
                walletId: existingWallet.id,
                type: 'TRIAL_FUND',
                referenceId: `TRIAL-${userId}`,
                status: 'COMPLETED',
                description: `Trial Fund credited automatically (${trialAmount} USDT for ${durationDays} days)`,
                amount: trialAmount,
                balanceBefore: '0.00000000',
                balanceAfter: trialAmount,
              });

              await notificationRepository.createNotification({
                userId,
                priority: 'HIGH',
                message: JSON.stringify({
                  title: 'Trial Fund Credited',
                  description: `A Trial Fund of $${parseFloat(trialAmount).toFixed(2)} USDT (${durationDays}-day trial) has been credited to your account.`,
                  icon: 'Sparkles',
                  type: 'trial_fund',
                }),
              });
            } catch (logErr) {
              console.error('Failed to log trial fund transaction/notification:', logErr);
            }
          }
        }
      }

      const existingVip = await vipRepository.findByUserId(userId);
      if (!existingVip) {
        await vipRepository.createVipStatus({
          userId,
          tier: 'VIP1',
          points: '0.00000000',
        });
      }
    } catch (err) {
      console.error(`Failed to ensure resources for user ${userId}:`, err);
    }
  }

  /**
   * Fetch authenticated user details by UID
   */
  async getUserProfile(uid: string) {
    const user = await userRepository.findByUid(uid);
    if (!user) {
      throw new Error(`Profile not found for user ${uid}`);
    }
    await this.ensureUserResources(user.id);
    return user;
  }

  /**
   * Change user password with security validation
   */
  async changePassword(uid: string, data: { currentPlain: string; newPlain: string }, ipAddress?: string | null, userAgent?: string | null) {
    const user = await this.getUserProfile(uid);

    // 1. Password verification
    if (!user.passwordHash) {
      throw new Error('No password hash established for this account. Cannot verify current password.');
    }

    const isMatch = await comparePassword(data.currentPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    // 2. Validate password requirements
    if (data.newPlain.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(data.newPlain)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(data.newPlain)) {
      throw new Error('Password must contain at least one lowercase letter.');
    }
    if (!/\d/.test(data.newPlain)) {
      throw new Error('Password must contain at least one number.');
    }
    if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(data.newPlain)) {
      throw new Error('Password must contain at least one special character.');
    }

    // 3. Hash and update
    const hashed = await hashPassword(data.newPlain);
    await userRepository.updateUserProfile(uid, {
      passwordHash: hashed,
      passwordChangedAt: new Date(),
    } as any);

    // 4. Log actions
    await SecurityLogger.logActivity({
      userId: user.id,
      event: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      ipAddress,
      device: userAgent,
      details: 'Password changed by user in Account Security Center.',
    });

    await SecurityLogger.logAudit({
      actorUid: uid,
      action: 'PASSWORD_CHANGE',
      resource: `users/${uid}`,
      ipAddress,
      device: userAgent,
      newValue: 'Password successfully updated',
    });

    await notificationService.createStructuredNotification(user.id, {
      title: 'Password Changed Successfully',
      description: 'Your account password has been changed successfully. If you did not make this change, please contact support immediately.',
      icon: 'Key',
      type: 'security',
      priority: 'HIGH',
    });

    return { message: 'Password updated successfully.' };
  }

  /**
   * Change user email address
   */
  async changeEmail(uid: string, data: { currentPlain: string; newEmail: string }, ipAddress?: string | null, userAgent?: string | null) {
    const user = await this.getUserProfile(uid);

    // 1. Verify current password
    if (!user.passwordHash) {
      throw new Error('No password hash established for this account. Cannot verify current password.');
    }

    const isMatch = await comparePassword(data.currentPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const newEmailLower = data.newEmail.trim().toLowerCase();

    // 2. Verify duplicate email
    const duplicate = await authRepository.findByEmail(newEmailLower);
    if (duplicate) {
      throw new Error('This email address is already registered.');
    }

    // 3. Update
    await userRepository.updateUserProfile(uid, {
      email: newEmailLower,
    } as any);

    // 4. Log actions
    await SecurityLogger.logActivity({
      userId: user.id,
      event: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      ipAddress,
      device: userAgent,
      details: `Email updated from ${user.email} to ${newEmailLower}`,
    });

    await SecurityLogger.logAudit({
      actorUid: uid,
      action: 'EMAIL_CHANGE',
      resource: `users/${uid}`,
      ipAddress,
      device: userAgent,
      oldValue: user.email,
      newValue: newEmailLower,
    });

    await notificationService.createStructuredNotification(user.id, {
      title: 'Email Address Updated',
      description: `Your account email address has been successfully updated to ${newEmailLower}.`,
      icon: 'ShieldAlert',
      type: 'security',
      priority: 'HIGH',
    });

    return { message: 'Email address updated successfully.' };
  }

  /**
   * Update Profile info (Name & Phone)
   */
  async updateProfile(uid: string, data: { name?: string; phone?: string }, ipAddress?: string | null, userAgent?: string | null) {
    const user = await this.getUserProfile(uid);

    await userRepository.updateUserProfile(uid, {
      name: data.name !== undefined ? data.name.trim() : user.name,
      phone: data.phone !== undefined ? data.phone.trim() : user.phone,
    } as any);

    // Log activity
    await SecurityLogger.logActivity({
      userId: user.id,
      event: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      ipAddress,
      device: userAgent,
      details: `Profile info updated: ${data.name ? 'name ' : ''}${data.phone ? 'phone' : ''}`,
    });

    return { message: 'Profile information updated successfully.' };
  }

  /**
   * Retrieve active, valid sessions for current user
   */
  async getSessions(uid: string) {
    const user = await this.getUserProfile(uid);
    return sessionRepository.findActiveSessionsByUserId(user.id);
  }

  /**
   * Logout all other sessions
   */
  async logoutAllOthers(uid: string, currentRefreshToken: string, ipAddress?: string | null, userAgent?: string | null) {
    const user = await this.getUserProfile(uid);
    const tokenHash = hashToken(currentRefreshToken);

    await sessionRepository.revokeAllExcept(user.id, tokenHash);

    // Log Audit
    await SecurityLogger.logAudit({
      actorUid: uid,
      action: 'LOGOUT_ALL_SESSIONS',
      resource: `users/${uid}/sessions`,
      ipAddress,
      device: userAgent,
      newValue: 'All other active sessions terminated by the user.',
    });

    return { message: 'All other active sessions have been terminated successfully.' };
  }

  /**
   * Admin-level user listing with aggregated resources (wallets, VIP tiers)
   */
  async getAdminUserList() {
    const allUsers = await userRepository.findAll({ limit: 1000, offset: 0 });
    const list = [];

    for (const u of allUsers) {
      await this.ensureUserResources(u.id);

      // Get wallet available balance
      const walletRecord = await walletRepository.findByUserId(u.id);
      const balance = walletRecord ? walletRecord.availableBalance : '0.00000000';

      // Get VIP tier
      const vipRecord = await vipRepository.findByUserId(u.id);
      const vipTier = vipRecord ? vipRecord.tier : 'VIP1';

      // Get Last Login activity time and IP
      const lastLoginRecord = await activityRepository.findByUserId(u.id, {
        event: 'LOGIN',
        status: 'SUCCESS',
        limit: 1,
      });

      const lastLoginTime = lastLoginRecord[0] ? lastLoginRecord[0].createdAt : null;
      const lastLoginIp = lastLoginRecord[0] ? lastLoginRecord[0].ipAddress : null;

      list.push({
        id: u.id,
        uid: u.uid,
        name: u.name || '',
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        status: u.status,
        vipTier,
        walletBalance: parseFloat(balance),
        registrationDate: u.createdAt,
        lastLogin: lastLoginTime,
        lastLoginIp,
        failedLoginAttempts: u.failedLoginAttempts,
        lockUntil: u.lockUntil,
        passwordChangedAt: u.passwordChangedAt,
      });
    }

    return list;
  }

  /**
   * Admin updates user profile / configuration
   */
  async updateProfileByAdmin(uid: string, role?: UserRole) {
    const fieldsToUpdate: Partial<{ role: string }> = {};
    if (role) fieldsToUpdate.role = role;

    const updatedUser = await userRepository.updateUserProfile(uid, fieldsToUpdate);
    if (!updatedUser) {
      throw new Error(`Failed to update user. Profile for ${uid} does not exist.`);
    }
    return updatedUser;
  }

  /**
   * Admin operations: Reset Password, Suspend/Unlock User, Force Password Change, Change Role/VIP
   */
  async adminActionUser(
    adminUid: string,
    targetUid: string,
    payload: {
      action: 'RESET_PASSWORD' | 'FORCE_PASSWORD_CHANGE' | 'SUSPEND' | 'UNLOCK' | 'CHANGE_ROLE' | 'CHANGE_VIP';
      password?: string;
      value?: any;
    },
    ipAddress?: string | null,
    userAgent?: string | null
  ) {
    const targetUser = await this.getUserProfile(targetUid);
    const updates: any = { updatedAt: new Date() };

    switch (payload.action) {
      case 'RESET_PASSWORD': {
        if (!payload.password || payload.password.trim().length < 8) {
          throw new Error('A secure password of at least 8 characters is required for reset.');
        }
        const hash = await hashPassword(payload.password);
        updates.passwordHash = hash;
        updates.passwordChangedAt = new Date();

        // Revoke target user's active sessions for security!
        await sessionRepository.revokeAllUserSessions(targetUser.id);

        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: 'PASSWORD_RESET',
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          newValue: 'Password manually reset by Administrator.',
        });
        break;
      }

      case 'SUSPEND': {
        updates.status = 'SUSPENDED';
        // Terminate all sessions upon suspension
        await sessionRepository.revokeAllUserSessions(targetUser.id);

        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: 'USER_SUSPEND',
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.status,
          newValue: 'SUSPENDED',
        });
        break;
      }

      case 'UNLOCK': {
        updates.status = 'ACTIVE';
        updates.failedLoginAttempts = 0;
        updates.lockUntil = null;

        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: 'USER_UNLOCK',
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.status,
          newValue: 'ACTIVE',
        });
        break;
      }

      case 'CHANGE_ROLE': {
        const allowedRoles = Object.values(UserRole);
        if (!payload.value || !allowedRoles.includes(payload.value)) {
          throw new Error('Invalid security role specified.');
        }
        updates.role = payload.value;

        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: 'ROLE_CHANGE',
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.role,
          newValue: payload.value,
        });
        break;
      }

      case 'CHANGE_VIP': {
        if (!payload.value) {
          throw new Error('VIP tier is required.');
        }
        // Update vip_status table
        const vipRecord = await vipRepository.findByUserId(targetUser.id);
        if (vipRecord) {
          await vipRepository.updateVipStatus(vipRecord.id, {
            tier: payload.value,
          });
        }

        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: 'CHANGE_VIP',
          resource: `users/${targetUid}/vip`,
          ipAddress,
          device: userAgent,
          newValue: payload.value,
        });
        break;
      }

      default:
        throw new Error(`Unsupported administrative security operation: ${payload.action}`);
    }

    // Apply main user table updates
    const result = await userRepository.updateUserProfile(targetUid, updates as any);
    if (!result) {
      throw new Error(`Failed to apply updates to target user ${targetUid}`);
    }
    return result;
  }

  /**
   * SECURITY DASHBOARD: Returns a high-level security audit profile summary for a user
   */
  async getSecuritySummary(uid: string) {
    const user = await this.getUserProfile(uid);

    // Get current login details from active session
    const currentSession = await sessionRepository.findLatestActiveSession(user.id);

    // Get last login log
    const lastLoginLogs = await activityRepository.findByUserId(user.id, {
      event: 'LOGIN',
      limit: 2,
    });

    const prevLogin = lastLoginLogs[1] || lastLoginLogs[0] || null;

    const userSettingsRecord = await settingsRepository.findUserSettingsByUserId(user.id);
    const mfaEnabled = userSettingsRecord ? userSettingsRecord.mfaEnabled : false;

    return {
      passwordChangedAt: user.passwordChangedAt,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockStatus: user.lockUntil && user.lockUntil > new Date() ? 'LOCKED' : 'UNLOCKED',
      lockUntil: user.lockUntil,
      currentLoginDevice: currentSession ? `${currentSession.browser || ''} on ${currentSession.device || ''}` : null,
      lastLoginTime: prevLogin ? prevLogin.createdAt : null,
      lastLoginIp: prevLogin ? prevLogin.ipAddress : null,
      mfaEnabled,
    };
  }
}

export const userService = new UserService();
export default userService;
