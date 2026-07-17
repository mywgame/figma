/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { adminService } from '../services/adminService.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { sendSuccess } from '../utils/response.ts';
import { ApiError } from '../middlewares/errorHandler.ts';

export class AdminController {
  /**
   * Fetch compiled admin dashboard overview aggregation and statistics
   */
  async getDashboardOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const overviewData = await adminService.getAdminDashboardOverview();
      return sendSuccess(res, overviewData, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin list of users with search, sort, filter, pagination
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const search = req.query.search as string || '';
      const filter = req.query.filter as string || 'All';
      const sortBy = req.query.sortBy as string || 'Newest';
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.getAdminUsersPaginated({
        search,
        filter,
        sortBy,
        limit,
        offset,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Detailed profile of a single user
   */
  async getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserProfileDetail(targetUid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update user's profile info
   */
  async updateUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { name, email, mobile, status } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.updateAdminUserProfile(
        req.user.uid,
        targetUid,
        { name, email, phone: mobile, status },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Adjust a user's wallet
   */
  async adjustWalletBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { amount, memo } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
      }

      const result = await adminService.adjustWalletBalance(
        user.id,
        { availableBalance: amount.toString() },
        memo || 'Manual wallet adjustment by administrator',
        req.user.uid
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Send notification to a user
   */
  async sendNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { message, priority } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
      }

      await notificationRepository.createNotification({
        userId: user.id,
        message,
        priority: priority || 'MEDIUM',
      });

      return sendSuccess(res, { success: true, message: 'Notification sent successfully.' }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's transaction history
   */
  async getUserTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserTransactions(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's deposit history
   */
  async getUserDeposits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserDeposits(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's withdrawal history
   */
  async getUserWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserWithdrawals(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's audit logs
   */
  async getUserAudits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserAudits(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's referral team network
   */
  async getUserTeamNetwork(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserTeamNetwork(targetUid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
export default adminController;
