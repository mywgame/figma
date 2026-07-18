/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { userController } from '../../controllers/userController.ts';
import { requireAuth, requireRole } from '../../middlewares/auth.ts';
import { validateRequest } from '../../middlewares/validate.ts';
import { RegisterUserSchema, UpdateUserAdminSchema } from '../../../shared/validators/index.ts';
import { UserRole } from '../../../shared/types/index.ts';

const router = Router();

/**
 * @route POST /api/v1/users/sync
 * @desc Sync authenticated user credentials
 * @access Private (JWT Auth token required)
 */
router.post(
  '/sync',
  requireAuth,
  validateRequest(RegisterUserSchema),
  userController.syncUser
);

/**
 * @route GET /api/v1/users/profile
 * @desc Get currently authenticated user profile info
 * @access Private
 */
router.get(
  '/profile',
  requireAuth,
  userController.getProfile
);

/**
 * @route GET /api/v1/users/dashboard
 * @desc Get currently authenticated user dashboard metrics
 * @access Private
 */
router.get(
  '/dashboard',
  requireAuth,
  userController.getDashboard
);

/**
 * @route GET /api/v1/users/vip-matrix
 * @desc Get official VIP qualification requirements matrix
 * @access Private
 */
router.get(
  '/vip-matrix',
  requireAuth,
  userController.getVipMatrix
);

/**
 * @route POST /api/v1/users/claim-yield
 * @desc Claim daily yield DPY reward manually
 * @access Private
 */
router.post(
  '/claim-yield',
  requireAuth,
  userController.claimYield
);

/**
 * @route PATCH /api/v1/users/profile
 * @desc Update user profile display info (Name & Phone)
 * @access Private
 */
router.patch(
  '/profile',
  requireAuth,
  userController.updateProfile
);

/**
 * @route POST /api/v1/users/security/change-password
 * @desc Update password securely
 * @access Private
 */
router.post(
  '/security/change-password',
  requireAuth,
  userController.changePassword
);

/**
 * @route POST /api/v1/users/security/change-email
 * @desc Update email address securely
 * @access Private
 */
router.post(
  '/security/change-email',
  requireAuth,
  userController.changeEmail
);

/**
 * @route GET /api/v1/users/security/sessions
 * @desc Fetch active user sessions list
 * @access Private
 */
router.get(
  '/security/sessions',
  requireAuth,
  userController.getSessions
);

/**
 * @route POST /api/v1/users/security/sessions/logout-all-others
 * @desc Terminate other sessions
 * @access Private
 */
router.post(
  '/security/sessions/logout-all-others',
  requireAuth,
  userController.logoutAllOthers
);

/**
 * @route GET /api/v1/users/security/summary
 * @desc Get security audit profile metrics
 * @access Private
 */
router.get(
  '/security/summary',
  requireAuth,
  userController.getSecuritySummary
);

/**
 * @route GET /api/v1/users/admin/list
 * @desc Fetch list of users with details (Admin only)
 * @access Private (Admin and Superadmin only)
 */
router.get(
  '/admin/list',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  userController.getAdminUserList
);

/**
 * @route POST /api/v1/users/admin/action/:targetUid
 * @desc Perform admin action on user account (Admin only)
 * @access Private (Admin and Superadmin only)
 */
router.post(
  '/admin/action/:targetUid',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  userController.adminActionUser
);

/**
 * @route PATCH /api/v1/users/admin/update/:targetUid
 * @desc Modify user role (Admin only - legacy support)
 * @access Private (Admin and Superadmin only)
 */
router.patch(
  '/admin/update/:targetUid',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  validateRequest(UpdateUserAdminSchema),
  userController.adminUpdateUser
);

export default router;
