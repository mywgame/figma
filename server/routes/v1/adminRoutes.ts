/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { adminController } from '../../controllers/adminController.ts';
import { requireAuth, requireRole } from '../../middlewares/auth.ts';
import { UserRole } from '../../../shared/types/index.ts';

const router = Router();

/**
 * @route GET /api/v1/admin/dashboard/overview
 * @desc Retrieve platform-wide operational statistics and charts for Super Admin & Admin
 * @access Private (Admin and Superadmin only)
 */
router.get(
  '/dashboard/overview',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getDashboardOverview
);

/**
 * @route GET /api/v1/admin/users
 * @desc Retrieve paginated list of users with search, sort, and filters
 */
router.get(
  '/users',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUsers
);

/**
 * @route GET /api/v1/admin/users/:targetUid/profile
 * @desc Get complete details of a single user
 */
router.get(
  '/users/:targetUid/profile',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserProfile
);

/**
 * @route PATCH /api/v1/admin/users/:targetUid/profile
 * @desc Update editable fields of user's profile
 */
router.patch(
  '/users/:targetUid/profile',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateUserProfile
);

/**
 * @route POST /api/v1/admin/users/:targetUid/wallet-adjustment
 * @desc Adjust user wallet balances atomically
 */
router.post(
  '/users/:targetUid/wallet-adjustment',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.adjustWalletBalance
);

/**
 * @route POST /api/v1/admin/users/:targetUid/send-notification
 * @desc Send custom notification to user
 */
router.post(
  '/users/:targetUid/send-notification',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sendNotification
);

/**
 * @route GET /api/v1/admin/users/:targetUid/transactions
 * @desc Retrieve user's transaction history
 */
router.get(
  '/users/:targetUid/transactions',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserTransactions
);

/**
 * @route GET /api/v1/admin/users/:targetUid/deposits
 * @desc Retrieve user's deposit history
 */
router.get(
  '/users/:targetUid/deposits',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserDeposits
);

/**
 * @route GET /api/v1/admin/users/:targetUid/withdrawals
 * @desc Retrieve user's withdrawal history
 */
router.get(
  '/users/:targetUid/withdrawals',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserWithdrawals
);

/**
 * @route GET /api/v1/admin/users/:targetUid/audits
 * @desc Retrieve user's administrative audit trail
 */
router.get(
  '/users/:targetUid/audits',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserAudits
);

/**
 * @route GET /api/v1/admin/users/:targetUid/team
 * @desc Retrieve user's referral team network downlines
 */
router.get(
  '/users/:targetUid/team',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserTeamNetwork
);

/**
 * @route GET /api/v1/admin/support/tickets
 * @desc Retrieve all support tickets in system with filters
 */
router.get(
  '/support/tickets',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminTickets
);

/**
 * @route GET /api/v1/admin/support/tickets/:ticketId/messages
 * @desc Get complete conversation history of a specific ticket
 */
router.get(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminTicketMessages
);

/**
 * @route POST /api/v1/admin/support/tickets/:ticketId/messages
 * @desc Submit admin reply under ticket thread
 */
router.post(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.replyToTicketAsAdmin
);

/**
 * @route PATCH /api/v1/admin/support/tickets/:ticketId
 * @desc Update support ticket state/properties (status, priority, assignment)
 */
router.patch(
  '/support/tickets/:ticketId',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateTicketProperties
);

/**
 * @route GET /api/v1/admin/treasury/:network
 * @desc Retrieve treasury wallet configurations, balances, and deposit addresses for a network
 */
router.get(
  '/treasury/:network',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getTreasuryOverview
);

/**
 * @route POST /api/v1/admin/treasury/sweep/address
 * @desc Sweep a specific user deposit address to Hot Wallet
 */
router.post(
  '/treasury/sweep/address',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepUserDepositAddress
);

/**
 * @route POST /api/v1/admin/treasury/sweep/all
 * @desc Sweep all positive-balance deposit addresses on a network
 */
router.post(
  '/treasury/sweep/all',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepAllEligibleAddresses
);

/**
 * @route POST /api/v1/admin/treasury/sweep/hot-to-cold
 * @desc Sweep funds from Hot Wallet to Cold Wallet
 */
router.post(
  '/treasury/sweep/hot-to-cold',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepHotToCold
);

/**
 * @route POST /api/v1/admin/treasury/sweep/retry
 * @desc Retry a failed sweep job
 */
router.post(
  '/treasury/sweep/retry',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepRetryJob
);

/**
 * @route POST /api/v1/admin/treasury/config
 * @desc Update auto-sweep configuration (enabled/threshold) for a network
 */
router.post(
  '/treasury/config',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateAutoSweepConfig
);

/**
 * @route GET /api/v1/admin/treasury/jobs
 * @desc Get list of all sweep jobs
 */
router.get(
  '/treasury-jobs',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSweepJobs
);

/**
 * @route GET /api/v1/admin/treasury/sweep-queue
 * @desc Retrieve current sweep queue items with real-time native gas balances
 */
router.get(
  '/treasury/sweep-queue',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSweepQueue
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/fund-gas
 * @desc Fund native gas manually for a specific queue item
 */
router.post(
  '/treasury/sweep-queue/fund-gas',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.fundGasQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/sweep
 * @desc Sweep a specific queue item manually
 */
router.post(
  '/treasury/sweep-queue/sweep',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/cancel
 * @desc Cancel a sweep queue item
 */
router.post(
  '/treasury/sweep-queue/cancel',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.cancelQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/bulk-action
 * @desc Execute bulk actions on selected queue items
 */
router.post(
  '/treasury/sweep-queue/bulk-action',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.bulkActionQueue
);

/**
 * @route POST /api/v1/admin/treasury/sweep-mode
 * @desc Update comprehensive sweep modes, delay configuration, and emergency pausing
 */
router.post(
  '/treasury/sweep-mode',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateSweepModeConfig
);

export default router;
