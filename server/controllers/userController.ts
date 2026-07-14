/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { userService } from '../services/userService.ts';
import { dashboardService } from '../services/dashboardService.ts';
import { claimService } from '../services/claimService.ts';
import { sendSuccess } from '../utils/response.ts';
import { ApiError } from '../middlewares/errorHandler.ts';
import { UserRole } from '../../shared/types/index.ts';
import { db } from '../../src/db/index.ts';
import { wallets, vipStatus } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';

export class UserController {
  /**
   * Sync authenticated User credentials to local PostgreSQL database
   */
  async syncUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { uid, email } = req.user;

      const syncedUser = await userService.syncUserAuthentication(uid, email);
      return sendSuccess(res, syncedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch details of currently authenticated user profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const walletRecord = await db.select().from(wallets).where(eq(wallets.userId, user.id));
      const vipRecord = await db.select().from(vipStatus).where(eq(vipStatus.userId, user.id));

      const profile = {
        ...user,
        walletBalance: walletRecord[0] ? parseFloat(walletRecord[0].availableBalance) : 0,
        vipTier: vipRecord[0] ? vipRecord[0].tier : 'VIP_0',
      };

      return sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch compiled dashboard aggregation metrics for currently authenticated user
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const userProfile = await userService.getUserProfile(req.user.uid);
      const dashboardData = await dashboardService.getDashboardData(userProfile.id);
      
      return sendSuccess(res, dashboardData, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute manual Daily DPY yield claim
   */
  async claimYield(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { claimId } = req.body;
      if (!claimId) {
        throw new ApiError(400, 'Claim ID is required to process yield.', 'BAD_REQUEST');
      }

      const userProfile = await userService.getUserProfile(req.user.uid);
      const result = await claimService.claimDailyYield(claimId, userProfile.id);

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile info (Name and Phone)
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { name, phone } = req.body;
      const result = await userService.updateProfile(req.user.uid, { name, phone }, req.ip, req.headers['user-agent']);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password securely
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, 'All password fields are required.', 'BAD_REQUEST');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'Passwords do not match.', 'BAD_REQUEST');
      }

      const result = await userService.changePassword(
        req.user.uid,
        { currentPlain: currentPassword, newPlain: newPassword },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change email address
   */
  async changeEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { currentPassword, newEmail } = req.body;
      if (!currentPassword || !newEmail) {
        throw new ApiError(400, 'Current password and new email are required.', 'BAD_REQUEST');
      }

      const result = await userService.changeEmail(
        req.user.uid,
        { currentPlain: currentPassword, newEmail },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch active sessions for currently authenticated user
   */
  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const sessionsList = await userService.getSessions(req.user.uid);
      return sendSuccess(res, sessionsList, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Terminate all other sessions except current
   */
  async logoutAllOthers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      // Read refreshToken from signed/unsigned cookies or request body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(400, 'No active refresh token found. Unable to authenticate session to keep.', 'BAD_REQUEST');
      }

      const result = await userService.logoutAllOthers(
        req.user.uid,
        refreshToken,
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin level users list
   */
  async getAdminUserList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const userList = await userService.getAdminUserList();
      return sendSuccess(res, userList, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin actions on users
   */
  async adminActionUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { action, password, value } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const updatedUser = await userService.adminActionUser(
        req.user.uid,
        targetUid,
        { action, password, value },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current security summary profile metrics
   */
  async getSecuritySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const summary = await userService.getSecuritySummary(req.user.uid);
      return sendSuccess(res, summary, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Legacy Admin update user role (backwards compatible)
   */
  async adminUpdateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetUid } = req.params;
      const { role } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const updatedUser = await userService.updateProfileByAdmin(
        targetUid,
        role as UserRole
      );
      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
export default userController;
