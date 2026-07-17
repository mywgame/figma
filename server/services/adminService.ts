/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { userRepository } from '../repositories/userRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { supportRepository } from '../repositories/supportRepository.ts';
import { depositRepository } from '../repositories/depositRepository.ts';
import { withdrawalRepository } from '../repositories/withdrawalRepository.ts';
import { withdrawalService } from './withdrawalService.ts';
import { vipService } from './vipService.ts';
import { referralService } from './referralService.ts';
import { db } from '../../src/db/index.ts';
import { users, wallets, deposits, withdrawals, supportTickets, activityLogs, vipStatus } from '../../src/db/schema.ts';
import { eq, like, or, and, desc, asc, sql } from 'drizzle-orm';

/**
 * BUSINESS RULE — Single Source of Truth:
 * AdminService NEVER re-implements Withdrawal or VIP business logic.
 * - Withdrawal approve/reject is owned EXCLUSIVELY by WithdrawalService.
 * - VIP recalculation is owned EXCLUSIVELY by VipService.
 * AdminService only adds the admin-specific authorization/audit wrapper around them.
 */

export class AdminService {
  /**
   * Fetch paginated, filtered and sorted list of admin users
   */
  async getAdminUsersPaginated(options: {
    search?: string;
    filter?: string;
    sortBy?: string;
    limit: number;
    offset: number;
  }) {
    const conditions = [];

    if (options.search) {
      const pattern = `%${options.search}%`;
      conditions.push(
        or(
          like(users.name, pattern),
          like(users.email, pattern),
          like(users.phone, pattern),
          like(users.userId, pattern),
          like(users.uid, pattern)
        )
      );
    }

    if (options.filter && options.filter !== 'All') {
      if (options.filter === 'Active') {
        conditions.push(eq(users.status, 'ACTIVE'));
      } else if (options.filter === 'Suspended') {
        conditions.push(eq(users.status, 'SUSPENDED'));
      } else if (options.filter.startsWith('VIP')) {
        conditions.push(eq(vipStatus.tier, options.filter));
      }
    }

    let orderByClause;
    switch (options.sortBy) {
      case 'HighestBalance':
        orderByClause = desc(wallets.availableBalance);
        break;
      case 'LowestBalance':
        orderByClause = asc(wallets.availableBalance);
        break;
      case 'HighestReferrals':
        orderByClause = desc(vipStatus.levelAValidCount);
        break;
      case 'HighestTeamSize':
        orderByClause = desc(vipStatus.teamTotalCount);
        break;
      case 'Newest':
        orderByClause = desc(users.createdAt);
        break;
      case 'Oldest':
        orderByClause = asc(users.createdAt);
        break;
      default:
        orderByClause = desc(users.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total Count query
    const countResult = await db
      .select({ count: sql<number>`count(${users.id})::int` })
      .from(users)
      .leftJoin(vipStatus, eq(vipStatus.userId, users.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;

    // Paginated list query
    const results = await db
      .select({
        user: users,
        wallet: wallets,
        vip: vipStatus,
      })
      .from(users)
      .leftJoin(wallets, eq(wallets.userId, users.id))
      .leftJoin(vipStatus, eq(vipStatus.userId, users.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(options.limit)
      .offset(options.offset);

    const mappedUsers = [];
    for (const r of results) {
      const u = r.user;
      const wallet = r.wallet;
      const vip = r.vip;

      const descendants = await referralService.getDownlineDescendants(u.id);
      const levelA = descendants.filter(d => d.referralLevel === 1).length;
      const levelB = descendants.filter(d => d.referralLevel === 2).length;
      const levelC = descendants.filter(d => d.referralLevel === 3).length;
      const levelD = descendants.filter(d => d.referralLevel === 4).length;

      mappedUsers.push({
        id: u.uid, // mapped to uid so frontend actions target uid
        userId: u.userId,
        name: u.name || '',
        email: u.email,
        mobile: u.phone || '',
        rank: vip?.tier || 'VIP1',
        balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : '$0.00',
        levelA,
        levelB,
        levelC,
        levelD,
        status: u.status === 'ACTIVE' ? 'Active' : 'Suspended',
        joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        adminNotes: u.name ? `Administrative profile for ${u.name}.` : 'No administrative notes.',
      });
    }

    return {
      users: mappedUsers,
      pagination: {
        total: totalCount,
        page: Math.floor(options.offset / options.limit) + 1,
        limit: options.limit,
      },
    };
  }

  /**
   * Get complete details of a single user
   */
  async getUserProfileDetail(targetUid: string) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }

    const wallet = await walletRepository.findByUserId(user.id);
    const vip = await db.select().from(vipStatus).where(eq(vipStatus.userId, user.id));
    const descendants = await referralService.getDownlineDescendants(user.id);

    return {
      id: user.uid,
      userId: user.userId,
      name: user.name || '',
      email: user.email,
      mobile: user.phone || '',
      rank: vip[0]?.tier || 'VIP1',
      balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : '$0.00',
      status: user.status === 'ACTIVE' ? 'Active' : 'Suspended',
      joined: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      walletDetails: wallet ? {
        availableBalance: parseFloat(wallet.availableBalance),
        lockedBalance: parseFloat(wallet.lockedBalance),
        principalBalance: parseFloat(wallet.principalBalance),
        trialBalance: parseFloat(wallet.trialBalance),
        referralIncome: parseFloat(wallet.referralIncome),
        dailyYield: parseFloat(wallet.dailyYield),
        teamIncome: parseFloat(wallet.teamIncome),
        incentiveIncome: parseFloat(wallet.incentiveIncome),
      } : null,
      teamCounts: {
        levelA: descendants.filter(d => d.referralLevel === 1).length,
        levelB: descendants.filter(d => d.referralLevel === 2).length,
        levelC: descendants.filter(d => d.referralLevel === 3).length,
        levelD: descendants.filter(d => d.referralLevel === 4).length,
        total: descendants.length,
      },
    };
  }

  /**
   * Update editable fields of user's profile
   */
  async updateAdminUserProfile(
    adminUid: string,
    targetUid: string,
    fields: {
      name?: string;
      email?: string;
      phone?: string;
      status?: string;
    },
    ipAddress?: string | null,
    userAgent?: string | null
  ) {
    const targetUser = await userRepository.findByUid(targetUid);
    if (!targetUser) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }

    const updates: any = { updatedAt: new Date() };
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.status !== undefined) {
      updates.status = fields.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE';
    }

    const updatedUser = await userRepository.updateUserProfile(targetUid, updates);

    // Write audit record
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: targetUser.id,
      action: 'ADMIN_PROFILE_UPDATE',
      resource: `users/${targetUid}`,
      oldValue: JSON.stringify({
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        status: targetUser.status,
      }),
      newValue: JSON.stringify(updates),
    });

    return updatedUser;
  }

  /**
   * Get user transactions history
   */
  async getUserTransactions(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const txs = await transactionRepository.findByUserId(user.id, options);
    return txs.map(t => ({
      id: t.id,
      type: t.type,
      amount: `$${parseFloat(t.amount).toFixed(2)}`,
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      description: t.description,
    }));
  }

  /**
   * Get user deposit history
   */
  async getUserDeposits(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const deps = await depositRepository.findByUserId(user.id, options);
    return deps.map(d => ({
      id: d.id,
      amount: `$${parseFloat(d.amount).toFixed(2)}`,
      method: d.network || 'USDT',
      txHash: d.txHash || 'N/A',
      date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: d.status === 'COMPLETED' ? 'Completed' : d.status === 'PENDING' ? 'Pending' : 'Rejected',
    }));
  }

  /**
   * Get user withdrawal history
   */
  async getUserWithdrawals(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const withs = await withdrawalRepository.findByUserId(user.id, options);
    return withs.map(w => ({
      id: w.id,
      amount: `$${parseFloat(w.amount).toFixed(2)}`,
      wallet: w.walletAddress,
      date: new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: w.status === 'COMPLETED' ? 'Approved' : w.status === 'PENDING' ? 'Pending' : 'Rejected',
    }));
  }

  /**
   * Get user audit history
   */
  async getUserAudits(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const audits = await auditRepository.findByUserId(user.id, options);
    return audits.map(a => ({
      action: a.action,
      admin: a.actorUid === 'SYSTEM' ? 'System' : 'Admin',
      ip: '127.0.0.1', // Standard fallback IP
      time: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      module: a.resource,
    }));
  }

  /**
   * Get user team network list of Level A, B, C, D descendants
   */
  async getUserTeamNetwork(targetUid: string) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const descendants = await referralService.getDownlineDescendants(user.id);
    const list = [];
    for (const d of descendants) {
      const u = await userRepository.findById(d.childId);
      if (u) {
        const wallet = await walletRepository.findByUserId(u.id);
        const vip = await db.select().from(vipStatus).where(eq(vipStatus.userId, u.id));
        list.push({
          id: u.uid,
          userId: u.userId,
          name: u.name || 'Anonymous',
          email: u.email,
          level: d.referralLevel === 1 ? 'A' : d.referralLevel === 2 ? 'B' : d.referralLevel === 3 ? 'C' : 'D',
          vipTier: vip[0]?.tier || 'VIP1',
          walletBalance: wallet ? parseFloat(wallet.availableBalance) : 0,
          joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
      }
    }
    return list;
  }

  /**
   * Adjust user wallet balances atomically (Manual Admin Ledger Adjustment)
   */
  async adjustWalletBalance(
    userId: string,
    deltas: {
      availableBalance?: string;
      lockedBalance?: string;
      principalBalance?: string;
      trialBalance?: string;
      referralIncome?: string;
      dailyYield?: string;
      teamIncome?: string;
      incentiveIncome?: string;
    },
    memo: string,
    adminUid: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const beforeBalance = parseFloat(wallet.availableBalance);
    const availableDelta = parseFloat(deltas.availableBalance || '0.0');
    const afterBalance = beforeBalance + availableDelta;

    // Apply atomic adjustments
    const updatedWallet = await walletRepository.incrementBalances(wallet.id, deltas);

    // Save adjustment inside transaction ledger
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'ADMIN_ADJUST',
      referenceId: wallet.id,
      status: 'COMPLETED',
      description: memo || 'Administrative manual account balance adjustment.',
      amount: availableDelta.toFixed(8),
      balanceBefore: beforeBalance.toFixed(8),
      balanceAfter: afterBalance.toFixed(8),
      createdBy: adminUid,
    });

    // Write audit record
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'WALLET_MANUAL_ADJUSTMENT',
      resource: `wallets/${wallet.id}`,
      oldValue: JSON.stringify(wallet),
      newValue: JSON.stringify(updatedWallet),
    });

    // Send notification
    await notificationRepository.createNotification({
      userId,
      message: `Your account balance was adjusted by our support team: "${memo}"`,
      priority: 'MEDIUM',
    });

    // Recalculate VIP tier — VipService is the single source of truth for VIP logic.
    // Business Logic Spec Section 6: VIP recalculates after Wallet Balance Change.
    await vipService.recalculateVip(userId);

    return updatedWallet;
  }

  /**
   * Update a user's account active status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)
   */
  async updateUserStatus(userId: string, status: string, adminUid: string, reason: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Since UserRepository.updateUserProfile only types Partial<{ role: string }> but updates the table,
    // we safely cast parameters to update the status field of the users table.
    const updatedUser = await userRepository.updateUserProfile(user.uid, { status } as any);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'USER_STATUS_CHANGE',
      resource: `users/${userId}`,
      oldValue: user.status,
      newValue: status,
    });

    await notificationRepository.createNotification({
      userId,
      message: `Your account status has been updated to ${status}. Reason: ${reason}`,
      priority: 'HIGH',
    });

    return updatedUser;
  }

  /**
   * Administrative Approval of pending Withdrawals.
   * Delegates ALL ledger/wallet/VIP logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async approveWithdrawal(withdrawalId: string, adminUid: string, txHash: string, notes?: string) {
    const updatedW = await withdrawalService.approveWithdrawal(withdrawalId, txHash, adminUid);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_APPROVAL',
      resource: `withdrawals/${updatedW.id}`,
      newValue: notes ? `APPROVED — ${notes}` : 'APPROVED',
    });

    return updatedW;
  }

  /**
   * Administrative Rejection of pending Withdrawals.
   * Delegates ALL ledger/wallet logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async rejectWithdrawal(withdrawalId: string, adminUid: string, notes: string) {
    const updatedW = await withdrawalService.rejectWithdrawal(withdrawalId, notes, adminUid);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_REJECTION',
      resource: `withdrawals/${updatedW.id}`,
      newValue: 'REJECTED',
    });

    return updatedW;
  }

  /**
   * Retrieve platform system wide audit logs
   */
  async getSystemAuditLogs(options?: { limit?: number; offset?: number; action?: string }) {
    return auditRepository.findAll(options);
  }

  /**
   * Fetch all registered users in the platform (paginated, newest first).
   */
  async getAllUsers(options?: { limit?: number; offset?: number }) {
    return userRepository.findAll(options);
  }

  /**
   * Retrieve all platform support tickets
   */
  async getAllSupportTickets(options?: { status?: string; priority?: string; limit?: number; offset?: number }) {
    return supportRepository.findAll(options);
  }

  /**
   * Retrieve aggregated admin dashboard statistics and trends (Single Source of Truth)
   */
  async getAdminDashboardOverview() {
    // 1. Fetch total registered users
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    // 2. Fetch active users (status = 'ACTIVE')
    const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;

    // 3. Fetch suspended users
    const suspendedUsers = allUsers.filter(u => u.status === 'SUSPENDED').length;

    // 4. Calculate Platform Liquidity Pool (sum of available + locked + principal balances)
    const allWallets = await db.select().from(wallets);
    let totalLiquidity = 0;
    for (const w of allWallets) {
      totalLiquidity += parseFloat(w.availableBalance) + parseFloat(w.lockedBalance) + parseFloat(w.principalBalance);
    }

    // 5. Calculate Total Inbound Deposits (sum of amount for status = 'COMPLETED')
    const allDeposits = await db.select().from(deposits);
    let totalInboundDeposits = 0;
    for (const d of allDeposits) {
      if (d.status === 'COMPLETED') {
        totalInboundDeposits += parseFloat(d.amount);
      }
    }

    // 6. Counts for operational highlight queues
    const allWithdrawals = await db.select().from(withdrawals);
    const pendingWithdrawalsCount = allWithdrawals.filter(w => w.status === 'PENDING').length;
    const pendingDepositsCount = allDeposits.filter(d => d.status === 'PENDING').length;

    const allTickets = await db.select().from(supportTickets);
    const activeSupportTicketsCount = allTickets.filter(t => t.status === 'OPEN').length;

    const allActivityLogs = await db.select().from(activityLogs);
    const securityThreatsCount = allActivityLogs.filter(
      l => l.event === 'SECURITY_EVENT' || l.status === 'FAILED'
    ).length;

    // 7. Dynamic aggregations for charts (User Growth, Deposits vs Withdrawals, Revenue Trends)
    // We can generate monthly trends for the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Let's find the last 6 months' start dates
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        usersCount: 0,
        depositsSum: 0,
        withdrawalsSum: 0,
        revenueSum: 0,
      });
    }

    // Allocate user registrations to months
    for (const u of allUsers) {
      const uDate = new Date(u.createdAt);
      for (const m of last6Months) {
        if (uDate.getFullYear() === m.year && uDate.getMonth() === m.month) {
          m.usersCount++;
        }
      }
    }

    // Cumulative registered user growth trend
    // Find the number of users registered BEFORE the start of our 6-month window
    const firstMonthDate = new Date(last6Months[0].year, last6Months[0].month, 1);
    let cumulativeUsers = allUsers.filter(u => new Date(u.createdAt) < firstMonthDate).length;

    const userGrowthTrend = last6Months.map(m => {
      cumulativeUsers += m.usersCount;
      return {
        month: m.label,
        users: cumulativeUsers,
      };
    });

    // Allocate completed deposits and withdrawals
    for (const d of allDeposits) {
      if (d.status === 'COMPLETED') {
        const dDate = new Date(d.createdAt);
        for (const m of last6Months) {
          if (dDate.getFullYear() === m.year && dDate.getMonth() === m.month) {
            m.depositsSum += parseFloat(d.amount);
          }
        }
      }
    }

    for (const w of allWithdrawals) {
      if (w.status === 'COMPLETED') {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.withdrawalsSum += parseFloat(w.amount);
          }
        }
      }
    }

    const txFlowTrend = last6Months.map(m => ({
      month: m.label,
      deposits: m.depositsSum,
      withdrawals: m.withdrawalsSum,
    }));

    // Revenue trend / Platform margins
    for (const w of allWithdrawals) {
      if (w.status === 'COMPLETED') {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.revenueSum += parseFloat(w.fee || '0');
          }
        }
      }
    }

    const revenueTrend = last6Months.map(m => ({
      month: m.label,
      revenue: m.revenueSum,
    }));

    return {
      stats: {
        totalUsers,
        activeUsers,
        liquidityPool: totalLiquidity,
        totalInboundDeposits,
      },
      queues: {
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingDeposits: pendingDepositsCount,
        activeSupportTickets: activeSupportTicketsCount,
        securityThreats: securityThreatsCount,
        suspendedUsers: suspendedUsers,
      },
      charts: {
        userGrowth: userGrowthTrend,
        txFlow: txFlowTrend,
        revenue: revenueTrend,
      }
    };
  }
}

export const adminService = new AdminService();
export default adminService;
