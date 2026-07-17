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

export default router;
