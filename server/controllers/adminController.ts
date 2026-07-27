/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { adminService } from '../services/adminService.ts';
import { supportService } from '../services/supportService.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { sendSuccess } from '../utils/response.ts';
import { ApiError } from '../middlewares/errorHandler.ts';
import { treasuryService } from '../blockchain/services/TreasuryService.ts';
import { db } from '../../src/db/index.ts';
import { sweepQueue, treasuryWallets, users } from '../../src/db/schema.ts';
import { sweepQueueProcessor } from '../blockchain/services/SweepQueueProcessor.ts';
import { activeBlockchainProvider } from '../blockchain/providers/index.ts';
import { eq, and, desc } from 'drizzle-orm';

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

  /**
   * GET Retrieve all support tickets with query filters and search (Admin Oversight)
   */
  async getAdminTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const limit = parseInt(req.query.limit as string || '100', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const tickets = await supportService.getAdminTickets({
        status,
        priority,
        category,
        search,
        limit,
        offset,
      });

      return sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve conversation history under a specific ticket (Admin view)
   */
  async getAdminTicketMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const messages = await supportService.getTicketMessages(ticketId, '', true);
      return sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Submit an admin reply to a ticket thread
   */
  async replyToTicketAsAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      const { message } = req.body;

      if (!ticketId || !message) {
        throw new ApiError(400, 'Ticket ID and message content are required', 'BAD_REQUEST');
      }

      const adminUser = await userRepository.findByUid(req.user.uid);
      if (!adminUser) {
        throw new ApiError(404, 'Admin user profile not found', 'NOT_FOUND');
      }

      const messageRecord = await supportService.addTicketReply({
        ticketId,
        senderId: adminUser.id,
        senderType: 'ADMIN',
        message,
      });

      return sendSuccess(res, messageRecord, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update properties of a support ticket (status, priority, assignment)
   */
  async updateTicketProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      const { status, priority, assignedAdminUid } = req.body;

      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const updatedTicket = await supportService.updateTicketProperties(ticketId, {
        status,
        priority,
        assignedAdminUid,
      });

      return sendSuccess(res, updatedTicket, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve treasury wallet configurations, balances, and deposit addresses for a network
   */
  async getTreasuryOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.params;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const overview = await treasuryService.getTreasuryOverview(network);
      const jobs = await treasuryService.getSweepJobs(network);

      return sendSuccess(res, { ...overview, jobs }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep a specific user deposit address to Hot Wallet
   */
  async sweepUserDepositAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { addressId } = req.body;
      if (!addressId) {
        throw new ApiError(400, 'Address ID is required.', 'BAD_REQUEST');
      }

      const result = await treasuryService.sweepUserDepositAddress(addressId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to execute sweep operation.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep all positive-balance deposit addresses on a network
   */
  async sweepAllEligibleAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const results = await treasuryService.sweepAllEligibleAddresses(network, req.user.uid);
      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep funds from Hot Wallet to Cold Wallet
   */
  async sweepHotToCold(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network, amount } = req.body;
      if (!network || !amount) {
        throw new ApiError(400, 'Network and amount are required parameters.', 'BAD_REQUEST');
      }

      const result = await treasuryService.sweepHotToCold(network, amount, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to transfer to cold wallet.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Retry a failed sweep job
   */
  async sweepRetryJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { jobId } = req.body;
      if (!jobId) {
        throw new ApiError(400, 'Job ID is required.', 'BAD_REQUEST');
      }

      const result = await treasuryService.retrySweepJob(jobId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to retry sweep job.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Update auto-sweep configurations
   */
  async updateAutoSweepConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network, autoSweepEnabled, autoSweepThreshold } = req.body;
      if (!network || autoSweepEnabled === undefined || !autoSweepThreshold) {
        throw new ApiError(400, 'All parameters are required.', 'BAD_REQUEST');
      }

      const updated = await treasuryService.updateAutoSweepConfig(
        network,
        autoSweepEnabled,
        autoSweepThreshold,
        req.user.uid
      );

      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve all sweep jobs
   */
  async getSweepJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const network = req.query.network as string;
      const jobs = await treasuryService.getSweepJobs(network);

      return sendSuccess(res, jobs, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve sweep queue items with real-time native gas balances
   */
  async getSweepQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const network = req.query.network as string;
      const status = req.query.status as string;

      let q = db
        .select({
          id: sweepQueue.id,
          depositId: sweepQueue.depositId,
          userId: sweepQueue.userId,
          depositAddress: sweepQueue.depositAddress,
          network: sweepQueue.network,
          amount: sweepQueue.amount,
          status: sweepQueue.status,
          gasStatus: sweepQueue.gasStatus,
          gasTxHash: sweepQueue.gasTxHash,
          sweepTxHash: sweepQueue.sweepTxHash,
          errorMessage: sweepQueue.errorMessage,
          attempts: sweepQueue.attempts,
          eligibleAt: sweepQueue.eligibleAt,
          createdAt: sweepQueue.createdAt,
          updatedAt: sweepQueue.updatedAt,
          userEmail: users.email,
        })
        .from(sweepQueue)
        .innerJoin(users, eq(sweepQueue.userId, users.id));

      const conditions = [];
      if (network) {
        conditions.push(eq(sweepQueue.network, network.toUpperCase()));
      }
      if (status) {
        conditions.push(eq(sweepQueue.status, status));
      }

      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const items = await q.orderBy(desc(sweepQueue.createdAt));

      // Inject live native balance for each item
      const itemsWithGas = await Promise.all(
        items.map(async (item) => {
          let nativeGasBalance = '0.00000000';
          try {
            nativeGasBalance = await activeBlockchainProvider.getNativeBalance(item.network, item.depositAddress);
          } catch (e) {
            // ignore
          }
          return {
            ...item,
            nativeGasBalance,
          };
        })
      );

      return sendSuccess(res, itemsWithGas, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Fund gas manually for a specific queue item
   */
  async fundGasQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      const txHash = await sweepQueueProcessor.fundGasForQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true, txHash }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep a specific queue item manually
   */
  async sweepQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      const txHash = await sweepQueueProcessor.sweepQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true, txHash }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Cancel a sweep queue item
   */
  async cancelQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      await sweepQueueProcessor.cancelQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Bulk sweep queue actions
   */
  async bulkActionQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemIds, action } = req.body;
      if (!itemIds || !Array.isArray(itemIds) || !action) {
        throw new ApiError(400, 'itemIds (array) and action are required parameters.', 'BAD_REQUEST');
      }

      let results;
      if (action === 'FUND_GAS') {
        results = await sweepQueueProcessor.bulkFundGas(itemIds, req.user.uid);
      } else if (action === 'SWEEP') {
        results = await sweepQueueProcessor.bulkSweep(itemIds, req.user.uid);
      } else if (action === 'FUND_AND_SWEEP') {
        results = await sweepQueueProcessor.bulkFundAndSweep(itemIds, req.user.uid);
      } else {
        throw new ApiError(400, `Unsupported bulk action: ${action}`, 'BAD_REQUEST');
      }

      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Update sweep mode and delay configuration
   */
  async updateSweepModeConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { network, sweepMode, sweepDelay, customDelayMinutes, autoSweepThreshold, paused } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const cleanNetwork = network.toUpperCase();
      await treasuryService.getOrCreateTreasuryWallet(cleanNetwork);

      const updateFields: any = { updatedAt: new Date() };
      if (sweepMode !== undefined) updateFields.sweepMode = sweepMode;
      if (sweepDelay !== undefined) updateFields.sweepDelay = sweepDelay;
      if (customDelayMinutes !== undefined) updateFields.customDelayMinutes = parseInt(customDelayMinutes, 10);
      if (autoSweepThreshold !== undefined) updateFields.autoSweepThreshold = autoSweepThreshold;
      if (paused !== undefined) updateFields.paused = paused;

      const updated = await db
        .update(treasuryWallets)
        .set(updateFields)
        .where(eq(treasuryWallets.network, cleanNetwork))
        .returning();

      await auditRepository.createAuditLog({
        actorUid: req.user.uid,
        userId: null as any,
        action: 'TREASURY_SWEEP_CONFIG_COMPREHENSIVE_UPDATE',
        resource: `treasury/config/${cleanNetwork}`,
        oldValue: 'STALE',
        newValue: JSON.stringify(updateFields),
      });

      return sendSuccess(res, updated[0], 200);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
export default adminController;
