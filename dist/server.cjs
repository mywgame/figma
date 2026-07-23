var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc19) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc19 = __getOwnPropDesc(from, key)) || desc19.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/db/users.ts
var import_pg_core, users;
var init_users = __esm({
  "src/db/users.ts"() {
    import_pg_core = require("drizzle-orm/pg-core");
    users = (0, import_pg_core.pgTable)(
      "users",
      {
        id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
        uid: (0, import_pg_core.text)("uid").notNull().unique(),
        // Unique identity mapping from Auth (e.g. Firebase/Custom JWT sub)
        email: (0, import_pg_core.text)("email").notNull().unique(),
        // User email address
        username: (0, import_pg_core.text)("username").unique(),
        // Unique username
        passwordHash: (0, import_pg_core.text)("password_hash"),
        // Optional secure hash for credentials backup
        status: (0, import_pg_core.text)("status").default("ACTIVE").notNull(),
        // ACTIVE, SUSPENDED, PENDING_VERIFICATION
        role: (0, import_pg_core.text)("role").default("USER").notNull(),
        // USER, VIP, ADMIN, SUPERADMIN
        userId: (0, import_pg_core.text)("user_id").notNull().unique(),
        // Formatted visible ID (e.g., DS322256)
        referralCode: (0, import_pg_core.text)("referral_code").notNull().unique(),
        // Shareable referral code
        parentReferralId: (0, import_pg_core.uuid)("parent_referral_id").references(() => users.id),
        // Self-referencing foreign key for referral tracking
        failedLoginAttempts: (0, import_pg_core.integer)("failed_login_attempts").default(0).notNull(),
        // Lockout tracking
        lockUntil: (0, import_pg_core.timestamp)("lock_until"),
        // Account temporary lockout expiration
        name: (0, import_pg_core.text)("name"),
        // Profile display name
        phone: (0, import_pg_core.text)("phone"),
        // Profile phone number
        country: (0, import_pg_core.text)("country"),
        // Country of residence
        passwordChangedAt: (0, import_pg_core.timestamp)("password_changed_at"),
        // Tracking for password updates
        createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core.uniqueIndex)("users_email_idx").on(table.email),
        (0, import_pg_core.uniqueIndex)("users_username_idx").on(table.username),
        (0, import_pg_core.uniqueIndex)("users_user_id_idx").on(table.userId),
        (0, import_pg_core.uniqueIndex)("users_referral_code_idx").on(table.referralCode),
        (0, import_pg_core.index)("users_status_idx").on(table.status),
        (0, import_pg_core.index)("users_created_at_idx").on(table.createdAt),
        (0, import_pg_core.index)("users_parent_referral_idx").on(table.parentReferralId)
      ]
    );
  }
});

// src/db/wallets.ts
var import_pg_core2, import_drizzle_orm, wallets;
var init_wallets = __esm({
  "src/db/wallets.ts"() {
    import_pg_core2 = require("drizzle-orm/pg-core");
    import_drizzle_orm = require("drizzle-orm");
    init_users();
    wallets = (0, import_pg_core2.pgTable)(
      "wallets",
      {
        id: (0, import_pg_core2.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core2.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        // 1-to-1 User relation
        availableBalance: (0, import_pg_core2.numeric)("available_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Liquid spendable balance
        lockedBalance: (0, import_pg_core2.numeric)("locked_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Balances locked for staking or pending claims
        principalBalance: (0, import_pg_core2.numeric)("principal_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Principal balance (real deposited capital)
        trialBalance: (0, import_pg_core2.numeric)("trial_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Trial Fund balance (non-withdrawable, generates interest)
        referralIncome: (0, import_pg_core2.numeric)("referral_income", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Referral income
        dailyYield: (0, import_pg_core2.numeric)("daily_yield", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Daily DPY yield income
        teamIncome: (0, import_pg_core2.numeric)("team_income", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Team commission income
        incentiveIncome: (0, import_pg_core2.numeric)("incentive_income", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Combined category for other incomes (Weekly Salary, Airdrops, Bonuses, etc.)
        totalDeposited: (0, import_pg_core2.numeric)("total_deposited", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Historical cumulative deposit counter
        totalWithdrawn: (0, import_pg_core2.numeric)("total_withdrawn", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Historical cumulative withdrawal counter
        totalEarned: (0, import_pg_core2.numeric)("total_earned", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Historical cumulative rewards and interest earned
        createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core2.index)("wallets_user_id_idx").on(table.userId),
        // Business rules: Balances must always remain non-negative
        (0, import_pg_core2.check)("available_balance_non_negative", import_drizzle_orm.sql`${table.availableBalance} >= 0`),
        (0, import_pg_core2.check)("locked_balance_non_negative", import_drizzle_orm.sql`${table.lockedBalance} >= 0`),
        (0, import_pg_core2.check)("principal_balance_non_negative", import_drizzle_orm.sql`${table.principalBalance} >= 0`),
        (0, import_pg_core2.check)("trial_balance_non_negative", import_drizzle_orm.sql`${table.trialBalance} >= 0`),
        (0, import_pg_core2.check)("referral_income_non_negative", import_drizzle_orm.sql`${table.referralIncome} >= 0`),
        (0, import_pg_core2.check)("daily_yield_non_negative", import_drizzle_orm.sql`${table.dailyYield} >= 0`),
        (0, import_pg_core2.check)("team_income_non_negative", import_drizzle_orm.sql`${table.teamIncome} >= 0`),
        (0, import_pg_core2.check)("incentive_income_non_negative", import_drizzle_orm.sql`${table.incentiveIncome} >= 0`),
        (0, import_pg_core2.check)("total_deposited_non_negative", import_drizzle_orm.sql`${table.totalDeposited} >= 0`),
        (0, import_pg_core2.check)("total_withdrawn_non_negative", import_drizzle_orm.sql`${table.totalWithdrawn} >= 0`),
        (0, import_pg_core2.check)("total_earned_non_negative", import_drizzle_orm.sql`${table.totalEarned} >= 0`)
      ]
    );
  }
});

// src/db/deposit_addresses.ts
var import_pg_core3, depositAddresses;
var init_deposit_addresses = __esm({
  "src/db/deposit_addresses.ts"() {
    import_pg_core3 = require("drizzle-orm/pg-core");
    init_users();
    depositAddresses = (0, import_pg_core3.pgTable)(
      "deposit_addresses",
      {
        id: (0, import_pg_core3.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core3.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        network: (0, import_pg_core3.text)("network").notNull(),
        // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20', etc.
        address: (0, import_pg_core3.text)("address").notNull(),
        // Unique generated blockchain wallet address
        derivationIndex: (0, import_pg_core3.integer)("derivation_index"),
        // Sequential HD Wallet index
        qrPath: (0, import_pg_core3.text)("qr_path"),
        // Locally generated QR code path/URL reference
        onChainBalance: (0, import_pg_core3.decimal)("on_chain_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        nativeBalance: (0, import_pg_core3.decimal)("native_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        createdAt: (0, import_pg_core3.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core3.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core3.uniqueIndex)("deposit_addresses_user_network_idx").on(table.userId, table.network),
        (0, import_pg_core3.uniqueIndex)("deposit_addresses_address_idx").on(table.address),
        (0, import_pg_core3.index)("deposit_addresses_user_idx").on(table.userId)
      ]
    );
  }
});

// src/db/deposits.ts
var import_pg_core4, import_drizzle_orm2, deposits;
var init_deposits = __esm({
  "src/db/deposits.ts"() {
    import_pg_core4 = require("drizzle-orm/pg-core");
    import_drizzle_orm2 = require("drizzle-orm");
    init_users();
    init_wallets();
    deposits = (0, import_pg_core4.pgTable)(
      "deposits",
      {
        id: (0, import_pg_core4.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core4.uuid)("user_id").notNull().references(() => users.id),
        walletId: (0, import_pg_core4.uuid)("wallet_id").notNull().references(() => wallets.id),
        referenceNumber: (0, import_pg_core4.text)("reference_number").notNull().unique(),
        // Human-readable unique trace code (e.g. DEP-20260627-XXXX)
        amount: (0, import_pg_core4.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Exact deposited funds
        status: (0, import_pg_core4.text)("status").default("PENDING").notNull(),
        // PENDING, COMPLETED, FAILED
        txHash: (0, import_pg_core4.text)("tx_hash").unique(),
        // Blockchain transaction hash (unique to prevent double deposit/replay attacks)
        network: (0, import_pg_core4.text)("network").notNull(),
        // USDT BEP20, USDT Polygon, USDT TRC20, etc.
        depositAddress: (0, import_pg_core4.text)("deposit_address").notNull(),
        // The permanent deposit address where user sent funds
        adminNotes: (0, import_pg_core4.text)("admin_notes"),
        // Optional explanation for support or internal audits
        createdAt: (0, import_pg_core4.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core4.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core4.uniqueIndex)("deposits_ref_idx").on(table.referenceNumber),
        (0, import_pg_core4.index)("deposits_user_id_idx").on(table.userId),
        (0, import_pg_core4.index)("deposits_status_idx").on(table.status),
        (0, import_pg_core4.index)("deposits_created_at_idx").on(table.createdAt),
        (0, import_pg_core4.index)("deposits_tx_hash_idx").on(table.txHash),
        (0, import_pg_core4.check)("deposit_amount_positive", import_drizzle_orm2.sql`${table.amount} > 0`)
      ]
    );
  }
});

// src/db/withdrawals.ts
var import_pg_core5, import_drizzle_orm3, withdrawals;
var init_withdrawals = __esm({
  "src/db/withdrawals.ts"() {
    import_pg_core5 = require("drizzle-orm/pg-core");
    import_drizzle_orm3 = require("drizzle-orm");
    init_users();
    init_wallets();
    withdrawals = (0, import_pg_core5.pgTable)(
      "withdrawals",
      {
        id: (0, import_pg_core5.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core5.uuid)("user_id").notNull().references(() => users.id),
        walletId: (0, import_pg_core5.uuid)("wallet_id").notNull().references(() => wallets.id),
        amount: (0, import_pg_core5.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Gross amount to withdraw
        fee: (0, import_pg_core5.numeric)("fee", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Withdrawal fee (e.g., 10%)
        netAmount: (0, import_pg_core5.numeric)("net_amount", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Amount disbursed to user (amount - fee)
        status: (0, import_pg_core5.text)("status").default("PENDING").notNull(),
        // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
        walletAddress: (0, import_pg_core5.text)("wallet_address").notNull(),
        // Destination crypto address
        network: (0, import_pg_core5.text)("network").notNull(),
        // USDT BEP20, USDT Polygon, USDT TRC20, etc.
        txHash: (0, import_pg_core5.text)("tx_hash"),
        // Optional blockchain transaction hash populated once executed
        reference: (0, import_pg_core5.text)("reference").notNull().unique(),
        // Unique human-readable trace code (e.g. WD-20260627-XXXX)
        adminApprovalStatus: (0, import_pg_core5.text)("admin_approval_status").default("PENDING").notNull(),
        // PENDING, APPROVED, REJECTED
        adminNotes: (0, import_pg_core5.text)("admin_notes"),
        // Auditable explanation for approval or rejection
        createdAt: (0, import_pg_core5.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core5.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core5.uniqueIndex)("withdrawals_ref_idx").on(table.reference),
        (0, import_pg_core5.index)("withdrawals_user_id_idx").on(table.userId),
        (0, import_pg_core5.index)("withdrawals_status_idx").on(table.status),
        (0, import_pg_core5.index)("withdrawals_created_at_idx").on(table.createdAt),
        (0, import_pg_core5.index)("withdrawals_tx_hash_idx").on(table.txHash),
        (0, import_pg_core5.check)("withdrawal_amount_positive", import_drizzle_orm3.sql`${table.amount} > 0`),
        (0, import_pg_core5.check)("withdrawal_fee_non_negative", import_drizzle_orm3.sql`${table.fee} >= 0`),
        (0, import_pg_core5.check)("withdrawal_net_amount_non_negative", import_drizzle_orm3.sql`${table.netAmount} >= 0`)
      ]
    );
  }
});

// src/db/transactions.ts
var import_pg_core6, import_drizzle_orm4, transactions;
var init_transactions = __esm({
  "src/db/transactions.ts"() {
    import_pg_core6 = require("drizzle-orm/pg-core");
    import_drizzle_orm4 = require("drizzle-orm");
    init_users();
    init_wallets();
    transactions = (0, import_pg_core6.pgTable)(
      "transactions",
      {
        id: (0, import_pg_core6.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core6.uuid)("user_id").notNull().references(() => users.id),
        walletId: (0, import_pg_core6.uuid)("wallet_id").notNull().references(() => wallets.id),
        type: (0, import_pg_core6.text)("type").notNull(),
        // DEPOSIT, WITHDRAWAL, DAILY_YIELD, REFERRAL_INCOME, TEAM_INCOME, INCENTIVE_INCOME, TRIAL_FUND, TRIAL_EXPIRY, ADJUSTMENT
        referenceId: (0, import_pg_core6.text)("reference_id").notNull(),
        // References the source entity uuid or receipt code
        status: (0, import_pg_core6.text)("status").default("COMPLETED").notNull(),
        // PENDING, COMPLETED, FAILED
        description: (0, import_pg_core6.text)("description").notNull(),
        // Human readable description (e.g., "Staking Claim Reward for Period X")
        amount: (0, import_pg_core6.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Signed delta: positive for credit, negative for debit
        balanceBefore: (0, import_pg_core6.numeric)("balance_before", { precision: 20, scale: 8 }).notNull(),
        // Audit trace: balance of wallet before execution
        balanceAfter: (0, import_pg_core6.numeric)("balance_after", { precision: 20, scale: 8 }).notNull(),
        // Audit trace: balance of wallet after execution
        createdBy: (0, import_pg_core6.text)("created_by").default("SYSTEM").notNull(),
        // Initiating identity reference ("SYSTEM" or Admin/User UID)
        createdAt: (0, import_pg_core6.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core6.index)("transactions_user_id_idx").on(table.userId),
        (0, import_pg_core6.index)("transactions_wallet_id_idx").on(table.walletId),
        (0, import_pg_core6.index)("transactions_type_idx").on(table.type),
        (0, import_pg_core6.index)("transactions_ref_id_idx").on(table.referenceId),
        (0, import_pg_core6.index)("transactions_created_at_idx").on(table.createdAt),
        (0, import_pg_core6.index)("transactions_status_idx").on(table.status),
        // Balances before and after must always be non-negative
        (0, import_pg_core6.check)("balance_before_non_negative", import_drizzle_orm4.sql`${table.balanceBefore} >= 0`),
        (0, import_pg_core6.check)("balance_after_non_negative", import_drizzle_orm4.sql`${table.balanceAfter} >= 0`)
      ]
    );
  }
});

// src/db/vip.ts
var import_pg_core7, import_drizzle_orm5, vipStatus, vipHistory;
var init_vip = __esm({
  "src/db/vip.ts"() {
    import_pg_core7 = require("drizzle-orm/pg-core");
    import_drizzle_orm5 = require("drizzle-orm");
    init_users();
    vipStatus = (0, import_pg_core7.pgTable)(
      "vip_status",
      {
        id: (0, import_pg_core7.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core7.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
        // Ensure strict 1-to-1 current VIP status per user
        tier: (0, import_pg_core7.text)("tier").default("VIP1").notNull(),
        // Default to VIP1 per Business Logic, e.g. VIP1, VIP2, VIP3...
        points: (0, import_pg_core7.numeric)("points", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Tier qualification points or volume metrics
        levelAValidCount: (0, import_pg_core7.integer)("level_a_valid_count").default(0).notNull(),
        // Current count of Level A valid users (upline wallet balance >= 50)
        levelBcdValidCount: (0, import_pg_core7.integer)("level_bcd_valid_count").default(0).notNull(),
        // Current count of Level B+C+D valid users (wallet balance >= 50)
        teamTotalCount: (0, import_pg_core7.integer)("team_total_count").default(0).notNull(),
        // Combined Level A+B+C+D valid users count
        assignedAt: (0, import_pg_core7.timestamp)("assigned_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core7.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core7.index)("vip_status_user_idx").on(table.userId),
        (0, import_pg_core7.index)("vip_status_tier_idx").on(table.tier),
        (0, import_pg_core7.check)("level_a_valid_count_non_negative", import_drizzle_orm5.sql`${table.levelAValidCount} >= 0`),
        (0, import_pg_core7.check)("level_bcd_valid_count_non_negative", import_drizzle_orm5.sql`${table.levelBcdValidCount} >= 0`),
        (0, import_pg_core7.check)("team_total_count_non_negative", import_drizzle_orm5.sql`${table.teamTotalCount} >= 0`)
      ]
    );
    vipHistory = (0, import_pg_core7.pgTable)(
      "vip_history",
      {
        id: (0, import_pg_core7.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core7.uuid)("user_id").notNull().references(() => users.id),
        previousTier: (0, import_pg_core7.text)("previous_tier").notNull(),
        newTier: (0, import_pg_core7.text)("new_tier").notNull(),
        reason: (0, import_pg_core7.text)("reason").notNull(),
        // e.g., "Deposited over $10k", "Admin manual upgrade"
        updatedBy: (0, import_pg_core7.text)("updated_by").default("SYSTEM").notNull(),
        // Admin UID or SYSTEM
        createdAt: (0, import_pg_core7.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core7.index)("vip_history_user_idx").on(table.userId),
        (0, import_pg_core7.index)("vip_history_created_idx").on(table.createdAt)
      ]
    );
  }
});

// src/db/referrals.ts
var import_pg_core8, import_drizzle_orm6, referralRelationships, referralIncomeHistory;
var init_referrals = __esm({
  "src/db/referrals.ts"() {
    import_pg_core8 = require("drizzle-orm/pg-core");
    import_drizzle_orm6 = require("drizzle-orm");
    init_users();
    init_deposits();
    referralRelationships = (0, import_pg_core8.pgTable)(
      "referral_relationships",
      {
        id: (0, import_pg_core8.uuid)("id").defaultRandom().primaryKey(),
        parentId: (0, import_pg_core8.uuid)("parent_id").notNull().references(() => users.id),
        // Parent/Upline referrer
        childId: (0, import_pg_core8.uuid)("child_id").notNull().references(() => users.id).unique(),
        // Child/Downline referee. Standard 1 parent per node rule.
        referralLevel: (0, import_pg_core8.integer)("referral_level").notNull(),
        // Level relative to parent (1 = Direct, 2 = Indirect Level 2, etc.)
        createdAt: (0, import_pg_core8.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core8.index)("referral_relationships_parent_idx").on(table.parentId),
        (0, import_pg_core8.index)("referral_relationships_child_idx").on(table.childId),
        (0, import_pg_core8.index)("referral_relationships_level_idx").on(table.referralLevel),
        (0, import_pg_core8.check)("referral_level_positive", import_drizzle_orm6.sql`${table.referralLevel} > 0`)
      ]
    );
    referralIncomeHistory = (0, import_pg_core8.pgTable)(
      "referral_income_history",
      {
        id: (0, import_pg_core8.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core8.uuid)("user_id").notNull().references(() => users.id),
        // Beneficiary who receives the income
        sourceUserId: (0, import_pg_core8.uuid)("source_user_id").notNull().references(() => users.id),
        // Downline user whose activity triggered this reward
        depositId: (0, import_pg_core8.uuid)("deposit_id").references(() => deposits.id),
        // The specific first successful deposit that triggered this reward
        amount: (0, import_pg_core8.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Exact commission amount
        level: (0, import_pg_core8.integer)("level").notNull(),
        // Level of the downline user relative to the beneficiary
        transactionId: (0, import_pg_core8.uuid)("transaction_id").notNull(),
        // Direct link to master transactions ledger
        createdAt: (0, import_pg_core8.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core8.index)("referral_income_user_idx").on(table.userId),
        (0, import_pg_core8.index)("referral_income_source_idx").on(table.sourceUserId),
        (0, import_pg_core8.index)("referral_income_created_idx").on(table.createdAt),
        (0, import_pg_core8.check)("referral_income_amount_positive", import_drizzle_orm6.sql`${table.amount} > 0`),
        (0, import_pg_core8.check)("referral_income_level_positive", import_drizzle_orm6.sql`${table.level} > 0`)
      ]
    );
  }
});

// src/db/claims.ts
var import_pg_core9, import_drizzle_orm7, claims;
var init_claims = __esm({
  "src/db/claims.ts"() {
    import_pg_core9 = require("drizzle-orm/pg-core");
    import_drizzle_orm7 = require("drizzle-orm");
    init_users();
    claims = (0, import_pg_core9.pgTable)(
      "claims",
      {
        id: (0, import_pg_core9.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core9.uuid)("user_id").notNull().references(() => users.id),
        claimDate: (0, import_pg_core9.timestamp)("claim_date").notNull(),
        // The targeted operational day or slot for this claim
        claimStatus: (0, import_pg_core9.text)("claim_status").default("PENDING").notNull(),
        // PENDING, CLAIMED, EXPIRED, FORFEITED
        rewardAmount: (0, import_pg_core9.numeric)("reward_amount", { precision: 20, scale: 8 }).notNull(),
        // Pre-set claimable reward (Total Assets * VIP Rate)
        totalAssets: (0, import_pg_core9.numeric)("total_assets", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // User's total assets at the time of calculation
        vipTier: (0, import_pg_core9.text)("vip_tier").default("VIP1").notNull(),
        // User's VIP tier at the time of calculation
        vipRate: (0, import_pg_core9.numeric)("vip_rate", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        // Current VIP DPY % used (e.g., 0.00600000)
        claimedAt: (0, import_pg_core9.timestamp)("claimed_at"),
        // Instant when user successfully clicked/claimed
        expired: (0, import_pg_core9.boolean)("expired").default(false).notNull(),
        // Soft flag indicating if window has passed unclaimed
        claimWindowOpenTime: (0, import_pg_core9.timestamp)("claim_window_open_time").notNull(),
        // Active claim window start
        claimWindowCloseTime: (0, import_pg_core9.timestamp)("claim_window_close_time").notNull(),
        // Active claim window end (deadline)
        transactionId: (0, import_pg_core9.uuid)("transaction_id"),
        // Link to transaction table upon successful claim
        createdAt: (0, import_pg_core9.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core9.index)("claims_user_idx").on(table.userId),
        (0, import_pg_core9.index)("claims_date_idx").on(table.claimDate),
        (0, import_pg_core9.index)("claims_status_idx").on(table.claimStatus),
        (0, import_pg_core9.check)("claim_reward_amount_non_negative", import_drizzle_orm7.sql`${table.rewardAmount} >= 0`),
        (0, import_pg_core9.check)("claim_total_assets_non_negative", import_drizzle_orm7.sql`${table.totalAssets} >= 0`),
        (0, import_pg_core9.check)("claim_vip_rate_non_negative", import_drizzle_orm7.sql`${table.vipRate} >= 0`)
      ]
    );
  }
});

// src/db/income.ts
var import_pg_core10, import_drizzle_orm8, incomeHistory;
var init_income = __esm({
  "src/db/income.ts"() {
    import_pg_core10 = require("drizzle-orm/pg-core");
    import_drizzle_orm8 = require("drizzle-orm");
    init_users();
    init_wallets();
    incomeHistory = (0, import_pg_core10.pgTable)(
      "income_history",
      {
        id: (0, import_pg_core10.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core10.uuid)("user_id").notNull().references(() => users.id),
        walletId: (0, import_pg_core10.uuid)("wallet_id").notNull().references(() => wallets.id),
        type: (0, import_pg_core10.text)("type").notNull(),
        // e.g., DAILY_YIELD, REFERRAL_INCOME, TEAM_INCOME, INCENTIVE_INCOME
        amount: (0, import_pg_core10.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Exact yield/income amount generated
        description: (0, import_pg_core10.text)("description").notNull(),
        // Clarifying description (e.g. "Level 1 commission from direct downline deposition")
        transactionId: (0, import_pg_core10.uuid)("transaction_id").notNull(),
        // Linked transaction tracing code
        createdAt: (0, import_pg_core10.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core10.index)("income_history_user_idx").on(table.userId),
        (0, import_pg_core10.index)("income_history_type_idx").on(table.type),
        (0, import_pg_core10.index)("income_history_created_idx").on(table.createdAt),
        (0, import_pg_core10.check)("income_amount_positive", import_drizzle_orm8.sql`${table.amount} > 0`)
      ]
    );
  }
});

// src/db/salary.ts
var import_pg_core11, import_drizzle_orm9, salaryHistory;
var init_salary = __esm({
  "src/db/salary.ts"() {
    import_pg_core11 = require("drizzle-orm/pg-core");
    import_drizzle_orm9 = require("drizzle-orm");
    init_users();
    init_wallets();
    salaryHistory = (0, import_pg_core11.pgTable)(
      "salary_history",
      {
        id: (0, import_pg_core11.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core11.uuid)("user_id").notNull().references(() => users.id),
        walletId: (0, import_pg_core11.uuid)("wallet_id").notNull().references(() => wallets.id),
        amount: (0, import_pg_core11.numeric)("amount", { precision: 20, scale: 8 }).notNull(),
        // Amount paid as Weekly Leadership Incentive
        starTitle: (0, import_pg_core11.text)("star_title"),
        // Bronze Star, Silver Star, Gold Star, Platinum Star, Diamond Star
        qualifiedVip2Count: (0, import_pg_core11.integer)("qualified_vip2_count").default(0).notNull(),
        // Count of VIP2 members across Level A, B, C, D
        payPeriodStart: (0, import_pg_core11.timestamp)("pay_period_start").notNull(),
        // Operational start timestamp for work cycle audit
        payPeriodEnd: (0, import_pg_core11.timestamp)("pay_period_end").notNull(),
        // Operational end timestamp for work cycle audit
        status: (0, import_pg_core11.text)("status").default("PAID").notNull(),
        // PAID, PENDING, REJECTED
        transactionId: (0, import_pg_core11.uuid)("transaction_id").notNull(),
        // Linked ledger transaction UUID
        paidAt: (0, import_pg_core11.timestamp)("paid_at").defaultNow().notNull(),
        // Actual disbursement instant
        createdAt: (0, import_pg_core11.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core11.index)("salary_history_user_idx").on(table.userId),
        (0, import_pg_core11.index)("salary_history_paid_idx").on(table.paidAt),
        (0, import_pg_core11.check)("salary_amount_positive", import_drizzle_orm9.sql`${table.amount} > 0`),
        (0, import_pg_core11.check)("salary_qualified_vip2_count_non_negative", import_drizzle_orm9.sql`${table.qualifiedVip2Count} >= 0`)
      ]
    );
  }
});

// src/db/achievements.ts
var import_pg_core12, import_drizzle_orm10, achievements;
var init_achievements = __esm({
  "src/db/achievements.ts"() {
    import_pg_core12 = require("drizzle-orm/pg-core");
    import_drizzle_orm10 = require("drizzle-orm");
    init_users();
    achievements = (0, import_pg_core12.pgTable)(
      "achievements",
      {
        id: (0, import_pg_core12.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core12.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        achievementName: (0, import_pg_core12.text)("achievement_name").notNull(),
        // Code identifier or title (e.g., "STAKING_MAVEN")
        star: (0, import_pg_core12.integer)("star").default(1).notNull(),
        // Star level or difficulty tier (e.g., 1-star, 2-star, etc.)
        unlockedDate: (0, import_pg_core12.timestamp)("unlocked_date").defaultNow().notNull(),
        // Exact unlocking timestamp
        status: (0, import_pg_core12.text)("status").default("UNLOCKED").notNull(),
        // UNLOCKED, CLAIMED (if rewards are attached)
        createdAt: (0, import_pg_core12.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core12.index)("achievements_user_idx").on(table.userId),
        (0, import_pg_core12.index)("achievements_name_idx").on(table.achievementName),
        (0, import_pg_core12.check)("star_rating_non_negative", import_drizzle_orm10.sql`${table.star} >= 0`)
      ]
    );
  }
});

// src/db/notifications.ts
var import_pg_core13, notifications;
var init_notifications = __esm({
  "src/db/notifications.ts"() {
    import_pg_core13 = require("drizzle-orm/pg-core");
    init_users();
    notifications = (0, import_pg_core13.pgTable)(
      "notifications",
      {
        id: (0, import_pg_core13.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core13.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        priority: (0, import_pg_core13.text)("priority").default("LOW").notNull(),
        // LOW, MEDIUM, HIGH, URGENT
        read: (0, import_pg_core13.boolean)("read").default(false).notNull(),
        // Read status flag
        message: (0, import_pg_core13.text)("message").notNull(),
        // Rich text or raw message payload
        createdAt: (0, import_pg_core13.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core13.index)("notifications_user_idx").on(table.userId),
        (0, import_pg_core13.index)("notifications_read_idx").on(table.read),
        (0, import_pg_core13.index)("notifications_created_idx").on(table.createdAt)
      ]
    );
  }
});

// src/db/support.ts
var import_pg_core14, supportTickets, supportMessages;
var init_support = __esm({
  "src/db/support.ts"() {
    import_pg_core14 = require("drizzle-orm/pg-core");
    init_users();
    supportTickets = (0, import_pg_core14.pgTable)(
      "support_tickets",
      {
        id: (0, import_pg_core14.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core14.uuid)("user_id").notNull().references(() => users.id),
        // Creator of the ticket
        ticketNumber: (0, import_pg_core14.text)("ticket_number").notNull().unique(),
        // e.g., TKT-20260627-XXXX
        status: (0, import_pg_core14.text)("status").default("OPEN").notNull(),
        // OPEN, IN_PROGRESS, RESOLVED, CLOSED
        priority: (0, import_pg_core14.text)("priority").default("LOW").notNull(),
        // LOW, MEDIUM, HIGH, CRITICAL
        assignedAdminUid: (0, import_pg_core14.text)("assigned_admin_uid"),
        // Admin user UID assigned to the ticket
        category: (0, import_pg_core14.text)("category").notNull(),
        // DEPOSIT, WITHDRAWAL, SECURITY, ACCOUNT, OTHER
        subject: (0, import_pg_core14.text)("subject").notNull(),
        // Headline summary of the support ticket
        description: (0, import_pg_core14.text)("description").notNull(),
        // Detail text submitted by user
        attachmentName: (0, import_pg_core14.text)("attachment_name"),
        // Name of the uploaded attachment
        attachmentData: (0, import_pg_core14.text)("attachment_data"),
        // Base64 data of the uploaded attachment
        createdAt: (0, import_pg_core14.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core14.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core14.uniqueIndex)("support_tickets_num_idx").on(table.ticketNumber),
        (0, import_pg_core14.index)("support_tickets_user_idx").on(table.userId),
        (0, import_pg_core14.index)("support_tickets_status_idx").on(table.status),
        (0, import_pg_core14.index)("support_tickets_priority_idx").on(table.priority)
      ]
    );
    supportMessages = (0, import_pg_core14.pgTable)(
      "support_messages",
      {
        id: (0, import_pg_core14.uuid)("id").defaultRandom().primaryKey(),
        ticketId: (0, import_pg_core14.uuid)("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
        senderId: (0, import_pg_core14.uuid)("sender_id").references(() => users.id, { onDelete: "set null" }),
        // Left null if sender is external system
        senderType: (0, import_pg_core14.text)("sender_type").notNull(),
        // USER, ADMIN, SYSTEM
        message: (0, import_pg_core14.text)("message").notNull(),
        createdAt: (0, import_pg_core14.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core14.index)("support_messages_ticket_idx").on(table.ticketId),
        (0, import_pg_core14.index)("support_messages_sender_idx").on(table.senderId),
        (0, import_pg_core14.index)("support_messages_created_idx").on(table.createdAt)
      ]
    );
  }
});

// src/db/audit.ts
var import_pg_core15, auditLogs;
var init_audit = __esm({
  "src/db/audit.ts"() {
    import_pg_core15 = require("drizzle-orm/pg-core");
    init_users();
    auditLogs = (0, import_pg_core15.pgTable)(
      "audit_logs",
      {
        id: (0, import_pg_core15.uuid)("id").defaultRandom().primaryKey(),
        actorUid: (0, import_pg_core15.text)("actor_uid").notNull(),
        // "Who": UID of the admin or system agent triggering changes
        userId: (0, import_pg_core15.uuid)("user_id").references(() => users.id, { onDelete: "set null" }),
        // Optional direct reference to the affected user account
        action: (0, import_pg_core15.text)("action").notNull(),
        // "Action": e.g., UPDATE_ROLE, ADJUST_BALANCE, UPDATE_SETTING
        resource: (0, import_pg_core15.text)("resource").notNull(),
        // "Resource": e.g., "users/usr_123", "wallets/wl_abc"
        ipAddress: (0, import_pg_core15.text)("ip_address"),
        // Network IP address origin of request
        device: (0, import_pg_core15.text)("device"),
        // User agent string or device metadata
        oldValue: (0, import_pg_core15.text)("old_value"),
        // Stringified JSON snapshot before modification
        newValue: (0, import_pg_core15.text)("new_value"),
        // Stringified JSON snapshot after modification
        createdAt: (0, import_pg_core15.timestamp)("created_at").defaultNow().notNull()
        // "Timestamp"
      },
      (table) => [
        (0, import_pg_core15.index)("audit_logs_actor_idx").on(table.actorUid),
        (0, import_pg_core15.index)("audit_logs_user_idx").on(table.userId),
        (0, import_pg_core15.index)("audit_logs_action_idx").on(table.action),
        (0, import_pg_core15.index)("audit_logs_resource_idx").on(table.resource),
        (0, import_pg_core15.index)("audit_logs_created_idx").on(table.createdAt)
      ]
    );
  }
});

// src/db/activities.ts
var import_pg_core16, activityLogs;
var init_activities = __esm({
  "src/db/activities.ts"() {
    import_pg_core16 = require("drizzle-orm/pg-core");
    init_users();
    activityLogs = (0, import_pg_core16.pgTable)(
      "activity_logs",
      {
        id: (0, import_pg_core16.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core16.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        event: (0, import_pg_core16.text)("event").notNull(),
        // LOGIN, LOGOUT, PASSWORD_CHANGE, PROFILE_UPDATE, SECURITY_EVENT, MFA_ENABLE
        status: (0, import_pg_core16.text)("status").default("SUCCESS").notNull(),
        // SUCCESS, FAILED
        ipAddress: (0, import_pg_core16.text)("ip_address"),
        // Network IP of user connection
        device: (0, import_pg_core16.text)("device"),
        // Client user agent
        details: (0, import_pg_core16.text)("details"),
        // Optional context messages (e.g., "Failed login attempt: incorrect credentials")
        createdAt: (0, import_pg_core16.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core16.index)("activity_logs_user_idx").on(table.userId),
        (0, import_pg_core16.index)("activity_logs_event_idx").on(table.event),
        (0, import_pg_core16.index)("activity_logs_created_idx").on(table.createdAt)
      ]
    );
  }
});

// src/db/settings.ts
var import_pg_core17, systemSettings, userSettings;
var init_settings = __esm({
  "src/db/settings.ts"() {
    import_pg_core17 = require("drizzle-orm/pg-core");
    init_users();
    systemSettings = (0, import_pg_core17.pgTable)(
      "system_settings",
      {
        id: (0, import_pg_core17.integer)("id").primaryKey(),
        // Numeric identifier (usually 1, 2, or standard IDs)
        key: (0, import_pg_core17.text)("key").notNull().unique(),
        // Configuration key (e.g., "DAILY_CLAIM_REWARD_PERCENTAGE", "MIN_WITHDRAWAL_LIMIT")
        value: (0, import_pg_core17.text)("value").notNull(),
        // Stringified value, JSON object, or decimal scale rule
        description: (0, import_pg_core17.text)("description"),
        // Clarifying detail about which business logic is modified by this parameter
        updatedBy: (0, import_pg_core17.text)("updated_by").default("SYSTEM").notNull(),
        // Administrator UID modifying the setting
        updatedAt: (0, import_pg_core17.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core17.uniqueIndex)("system_settings_key_idx").on(table.key)
      ]
    );
    userSettings = (0, import_pg_core17.pgTable)(
      "user_settings",
      {
        id: (0, import_pg_core17.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core17.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
        // 1-to-1 User configuration alignment
        mfaEnabled: (0, import_pg_core17.boolean)("mfa_enabled").default(false).notNull(),
        // Multi-Factor Auth status
        mfaSecret: (0, import_pg_core17.text)("mfa_secret"),
        // Google Authenticator Base32 secret key
        withdrawalAddresses: (0, import_pg_core17.text)("withdrawal_addresses"),
        // JSON string of verified withdrawal addresses per network
        emailNotifications: (0, import_pg_core17.boolean)("email_notifications").default(true).notNull(),
        // Transactional and general alerts
        marketingConsent: (0, import_pg_core17.boolean)("marketing_consent").default(false).notNull(),
        // Promotional newsletter Opt-In status
        language: (0, import_pg_core17.text)("language").default("en").notNull(),
        // Standard locale preference (e.g. "en", "es", "zh")
        theme: (0, import_pg_core17.text)("theme").default("light").notNull(),
        // Dark/Light default visual frame
        updatedAt: (0, import_pg_core17.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core17.index)("user_settings_user_idx").on(table.userId)
      ]
    );
  }
});

// src/db/sessions.ts
var import_pg_core18, sessions;
var init_sessions = __esm({
  "src/db/sessions.ts"() {
    import_pg_core18 = require("drizzle-orm/pg-core");
    init_users();
    sessions = (0, import_pg_core18.pgTable)(
      "sessions",
      {
        id: (0, import_pg_core18.uuid)("id").defaultRandom().primaryKey(),
        userId: (0, import_pg_core18.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        tokenHash: (0, import_pg_core18.text)("token_hash").notNull(),
        device: (0, import_pg_core18.text)("device"),
        browser: (0, import_pg_core18.text)("browser"),
        ipAddress: (0, import_pg_core18.text)("ip_address"),
        createdAt: (0, import_pg_core18.timestamp)("created_at").defaultNow().notNull(),
        lastActivity: (0, import_pg_core18.timestamp)("last_activity").defaultNow().notNull(),
        expiresAt: (0, import_pg_core18.timestamp)("expires_at").notNull(),
        revoked: (0, import_pg_core18.boolean)("revoked").default(false).notNull()
      },
      (table) => [
        (0, import_pg_core18.index)("sessions_user_idx").on(table.userId),
        (0, import_pg_core18.index)("sessions_token_hash_idx").on(table.tokenHash)
      ]
    );
  }
});

// src/db/team_commission_history.ts
var import_pg_core19, import_drizzle_orm11, teamCommissionHistory;
var init_team_commission_history = __esm({
  "src/db/team_commission_history.ts"() {
    import_pg_core19 = require("drizzle-orm/pg-core");
    import_drizzle_orm11 = require("drizzle-orm");
    init_users();
    init_claims();
    teamCommissionHistory = (0, import_pg_core19.pgTable)(
      "team_commission_history",
      {
        id: (0, import_pg_core19.uuid)("id").defaultRandom().primaryKey(),
        receiverUserId: (0, import_pg_core19.uuid)("receiver_user_id").notNull().references(() => users.id),
        // Upline who receives the Team Commission
        sourceUserId: (0, import_pg_core19.uuid)("source_user_id").notNull().references(() => users.id),
        // Downline whose DPY claim generated this commission
        claimId: (0, import_pg_core19.uuid)("claim_id").notNull().references(() => claims.id),
        // The specific Daily DPY claim that triggered this commission
        level: (0, import_pg_core19.integer)("level").notNull(),
        // 1 = Level A, 2 = Level B, 3 = Level C, 4 = Level D
        sourceDpyAmount: (0, import_pg_core19.numeric)("source_dpy_amount", { precision: 20, scale: 8 }).notNull(),
        // DPY amount claimed by source user
        commissionAmount: (0, import_pg_core19.numeric)("commission_amount", { precision: 20, scale: 8 }).notNull(),
        // Amount credited to receiver
        createdAt: (0, import_pg_core19.timestamp)("created_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core19.index)("team_commission_history_receiver_idx").on(table.receiverUserId),
        (0, import_pg_core19.index)("team_commission_history_source_idx").on(table.sourceUserId),
        (0, import_pg_core19.index)("team_commission_history_created_idx").on(table.createdAt),
        (0, import_pg_core19.check)("team_commission_level_range", import_drizzle_orm11.sql`${table.level} >= 1 AND ${table.level} <= 4`),
        (0, import_pg_core19.check)("team_commission_source_dpy_positive", import_drizzle_orm11.sql`${table.sourceDpyAmount} > 0`),
        (0, import_pg_core19.check)("team_commission_amount_positive", import_drizzle_orm11.sql`${table.commissionAmount} > 0`)
      ]
    );
  }
});

// src/db/treasury.ts
var import_pg_core20, treasuryWallets, treasurySweepJobs, sweepQueue;
var init_treasury = __esm({
  "src/db/treasury.ts"() {
    import_pg_core20 = require("drizzle-orm/pg-core");
    init_deposits();
    init_users();
    treasuryWallets = (0, import_pg_core20.pgTable)(
      "treasury_wallets",
      {
        id: (0, import_pg_core20.uuid)("id").defaultRandom().primaryKey(),
        network: (0, import_pg_core20.text)("network").notNull().unique(),
        // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'
        hotAddress: (0, import_pg_core20.text)("hot_address").notNull(),
        coldAddress: (0, import_pg_core20.text)("cold_address").notNull(),
        hotBalance: (0, import_pg_core20.decimal)("hot_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        coldBalance: (0, import_pg_core20.decimal)("cold_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
        autoSweepEnabled: (0, import_pg_core20.boolean)("auto_sweep_enabled").default(true).notNull(),
        autoSweepThreshold: (0, import_pg_core20.decimal)("auto_sweep_threshold", { precision: 20, scale: 8 }).default("50.00000000").notNull(),
        sweepMode: (0, import_pg_core20.text)("sweep_mode").default("AUTOMATIC").notNull(),
        // 'AUTOMATIC', 'MANUAL', 'HYBRID'
        sweepDelay: (0, import_pg_core20.text)("sweep_delay").default("IMMEDIATE").notNull(),
        // 'IMMEDIATE', '1_HOUR', '6_HOURS', '24_HOURS', '3_DAYS', '7_DAYS', 'CUSTOM', 'MANUAL_ONLY'
        customDelayMinutes: (0, import_pg_core20.integer)("custom_delay_minutes").default(0).notNull(),
        paused: (0, import_pg_core20.boolean)("paused").default(false).notNull(),
        createdAt: (0, import_pg_core20.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core20.timestamp)("updated_at").defaultNow().notNull()
      }
    );
    treasurySweepJobs = (0, import_pg_core20.pgTable)(
      "treasury_sweep_jobs",
      {
        id: (0, import_pg_core20.uuid)("id").defaultRandom().primaryKey(),
        network: (0, import_pg_core20.text)("network").notNull(),
        // e.g. 'USDT_BEP20'
        sourceAddress: (0, import_pg_core20.text)("source_address").notNull(),
        destinationAddress: (0, import_pg_core20.text)("destination_address").notNull(),
        sweepType: (0, import_pg_core20.text)("sweep_type").notNull(),
        // 'USER_TO_HOT' or 'HOT_TO_COLD'
        amount: (0, import_pg_core20.decimal)("amount", { precision: 20, scale: 8 }).notNull(),
        txHash: (0, import_pg_core20.text)("tx_hash"),
        status: (0, import_pg_core20.text)("status").notNull(),
        // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
        errorMessage: (0, import_pg_core20.text)("error_message"),
        attempts: (0, import_pg_core20.integer)("attempts").default(0).notNull(),
        createdAt: (0, import_pg_core20.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core20.timestamp)("updated_at").defaultNow().notNull()
      }
    );
    sweepQueue = (0, import_pg_core20.pgTable)(
      "sweep_queue",
      {
        id: (0, import_pg_core20.uuid)("id").defaultRandom().primaryKey(),
        depositId: (0, import_pg_core20.uuid)("deposit_id").references(() => deposits.id, { onDelete: "cascade" }),
        userId: (0, import_pg_core20.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        depositAddress: (0, import_pg_core20.text)("deposit_address").notNull(),
        network: (0, import_pg_core20.text)("network").notNull(),
        amount: (0, import_pg_core20.decimal)("amount", { precision: 20, scale: 8 }).notNull(),
        status: (0, import_pg_core20.text)("status").default("PENDING").notNull(),
        // PENDING, WAITING_DELAY, WAITING_GAS, GAS_FUNDING, READY_TO_SWEEP, SWEEPING, COMPLETED, FAILED, CANCELLED
        gasStatus: (0, import_pg_core20.text)("gas_status").default("LOW").notNull(),
        // OK, LOW, FUNDING_SENT, FAILED
        gasTxHash: (0, import_pg_core20.text)("gas_tx_hash"),
        sweepTxHash: (0, import_pg_core20.text)("sweep_tx_hash"),
        errorMessage: (0, import_pg_core20.text)("error_message"),
        attempts: (0, import_pg_core20.integer)("attempts").default(0).notNull(),
        eligibleAt: (0, import_pg_core20.timestamp)("eligible_at").notNull(),
        createdAt: (0, import_pg_core20.timestamp)("created_at").defaultNow().notNull(),
        updatedAt: (0, import_pg_core20.timestamp)("updated_at").defaultNow().notNull()
      },
      (table) => [
        (0, import_pg_core20.index)("sweep_queue_status_idx").on(table.status),
        (0, import_pg_core20.index)("sweep_queue_deposit_id_idx").on(table.depositId)
      ]
    );
  }
});

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  activityLogs: () => activityLogs,
  auditLogs: () => auditLogs,
  claims: () => claims,
  depositAddresses: () => depositAddresses,
  deposits: () => deposits,
  incomeHistory: () => incomeHistory,
  notifications: () => notifications,
  referralIncomeHistory: () => referralIncomeHistory,
  referralRelationships: () => referralRelationships,
  salaryHistory: () => salaryHistory,
  sessions: () => sessions,
  supportMessages: () => supportMessages,
  supportTickets: () => supportTickets,
  sweepQueue: () => sweepQueue,
  systemSettings: () => systemSettings,
  teamCommissionHistory: () => teamCommissionHistory,
  transactions: () => transactions,
  treasurySweepJobs: () => treasurySweepJobs,
  treasuryWallets: () => treasuryWallets,
  userSettings: () => userSettings,
  users: () => users,
  vipHistory: () => vipHistory,
  vipStatus: () => vipStatus,
  wallets: () => wallets,
  withdrawals: () => withdrawals
});
var init_schema = __esm({
  "src/db/schema.ts"() {
    init_users();
    init_wallets();
    init_deposit_addresses();
    init_deposits();
    init_withdrawals();
    init_transactions();
    init_vip();
    init_referrals();
    init_claims();
    init_income();
    init_salary();
    init_achievements();
    init_notifications();
    init_support();
    init_audit();
    init_activities();
    init_settings();
    init_sessions();
    init_team_commission_history();
    init_treasury();
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  createPool: () => createPool,
  db: () => db,
  pool: () => pool
});
var dotenv2, import_node_postgres, import_pg, Pool, createPool, pool, db;
var init_db = __esm({
  "src/db/index.ts"() {
    dotenv2 = __toESM(require("dotenv"), 1);
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"), 1);
    init_schema();
    dotenv2.config();
    ({ Pool } = import_pg.default);
    createPool = () => {
      if (process.env.DATABASE_URL) {
        return new Pool({
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 15e3
        });
      }
      return new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionTimeoutMillis: 15e3
      });
    };
    pool = createPool();
    pool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// shared/types/index.ts
var UserRole;
var init_types = __esm({
  "shared/types/index.ts"() {
    UserRole = /* @__PURE__ */ ((UserRole2) => {
      UserRole2["USER"] = "USER";
      UserRole2["VIP"] = "VIP";
      UserRole2["ADMIN"] = "ADMIN";
      UserRole2["SUPERADMIN"] = "SUPERADMIN";
      return UserRole2;
    })(UserRole || {});
  }
});

// server/repositories/userRepository.ts
var import_drizzle_orm12, UserRepository, userRepository;
var init_userRepository = __esm({
  "server/repositories/userRepository.ts"() {
    import_drizzle_orm12 = require("drizzle-orm");
    init_db();
    init_schema();
    init_types();
    UserRepository = class {
      /**
       * Find user by database sequential ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(users).where((0, import_drizzle_orm12.eq)(users.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve user from database.", { cause: error });
        }
      }
      /**
       * Find user by unique auth UID
       */
      async findByUid(uid) {
        try {
          const result = await db.select().from(users).where((0, import_drizzle_orm12.eq)(users.uid, uid));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findByUid) failed:", error);
          throw new Error("Failed to retrieve user from database.", { cause: error });
        }
      }
      /**
       * Upsert user: safely inserts or updates email upon logins.
       * Leverages Drizzle's onConflictDoUpdate for transactional safety.
       */
      async upsertUser(data) {
        try {
          const randomDigits = Math.floor(1e5 + Math.random() * 9e5).toString();
          const generatedUserId = `DS${randomDigits}`;
          const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          const result = await db.insert(users).values({
            uid: data.uid,
            email: data.email,
            role: "USER" /* USER */,
            userId: generatedUserId,
            referralCode: generatedReferralCode
          }).onConflictDoUpdate({
            target: users.uid,
            set: {
              email: data.email,
              updatedAt: /* @__PURE__ */ new Date()
            }
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database mutation (upsertUser) failed:", error);
          throw new Error("Failed to synchronize user state in database.", { cause: error });
        }
      }
      /**
       * Retrieve all registered users, paginated, newest first.
       * Added so Services never need to query Drizzle/users directly (Blueprint Rule #2).
       */
      async findAll(options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(users).orderBy((0, import_drizzle_orm12.desc)(users.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findAll) failed:", error);
          throw new Error("Failed to retrieve registered users from database.");
        }
      }
      /**
       * Update user roles (Admin or system upgrades)
       */
      async updateUserProfile(uid, fields) {
        try {
          const result = await db.update(users).set({
            ...fields,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm12.eq)(users.uid, uid)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database mutation (updateUserProfile) failed:", error);
          throw new Error("Failed to apply updates to the user profile.", { cause: error });
        }
      }
    };
    userRepository = new UserRepository();
  }
});

// server/repositories/walletRepository.ts
var import_drizzle_orm14, WalletRepository, walletRepository;
var init_walletRepository = __esm({
  "server/repositories/walletRepository.ts"() {
    import_drizzle_orm14 = require("drizzle-orm");
    init_db();
    init_schema();
    WalletRepository = class {
      /**
       * Find wallet by user ID
       */
      async findByUserId(userId) {
        try {
          const result = await db.select().from(wallets).where((0, import_drizzle_orm14.eq)(wallets.userId, userId));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to retrieve wallet from database.");
        }
      }
      /**
       * Find wallet by wallet ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(wallets).where((0, import_drizzle_orm14.eq)(wallets.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve wallet from database.");
        }
      }
      /**
       * Create a new wallet for a user
       */
      async createWallet(data) {
        try {
          const result = await db.insert(wallets).values({
            userId: data.userId,
            availableBalance: data.availableBalance || "0.00000000",
            lockedBalance: data.lockedBalance || "0.00000000",
            principalBalance: data.principalBalance || "0.00000000",
            trialBalance: data.trialBalance || "0.00000000",
            referralIncome: data.referralIncome || "0.00000000",
            dailyYield: data.dailyYield || "0.00000000",
            teamIncome: data.teamIncome || "0.00000000",
            incentiveIncome: data.incentiveIncome || "0.00000000"
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createWallet) failed:", error);
          throw new Error("Failed to initialize wallet in database.");
        }
      }
      /**
       * Update wallet balances directly (non-atomic overwriting, e.g., for admin adjustments or resets)
       */
      async updateBalances(id, balances) {
        try {
          const result = await db.update(wallets).set({
            ...balances,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm14.eq)(wallets.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database update (updateBalances) failed:", error);
          throw new Error("Failed to update wallet balances in database.");
        }
      }
      /**
       * Increment/Decrement wallet balances atomically to protect against race conditions.
       * Provide string representation of decimal increments (e.g. "10.00000000" or "-5.50000000").
       */
      async incrementBalances(id, deltas) {
        try {
          const updateFields = { updatedAt: /* @__PURE__ */ new Date() };
          for (const [key, val] of Object.entries(deltas)) {
            if (val !== void 0 && val !== null) {
              updateFields[key] = import_drizzle_orm14.sql`${wallets[key]} + ${val}`;
            }
          }
          const result = await db.update(wallets).set(updateFields).where((0, import_drizzle_orm14.eq)(wallets.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database update (incrementBalances) failed:", error);
          throw new Error("Failed to atomically update wallet balances.");
        }
      }
    };
    walletRepository = new WalletRepository();
  }
});

// server/repositories/vipRepository.ts
var import_drizzle_orm15, VipRepository, vipRepository;
var init_vipRepository = __esm({
  "server/repositories/vipRepository.ts"() {
    import_drizzle_orm15 = require("drizzle-orm");
    init_db();
    init_schema();
    VipRepository = class {
      /**
       * Find a user's active VIP status
       */
      async findByUserId(userId) {
        try {
          const result = await db.select().from(vipStatus).where((0, import_drizzle_orm15.eq)(vipStatus.userId, userId));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to retrieve VIP status from database.");
        }
      }
      /**
       * Create active VIP status for a user
       */
      async createVipStatus(data) {
        try {
          const result = await db.insert(vipStatus).values({
            userId: data.userId,
            tier: data.tier || "VIP1",
            points: data.points || "0.00000000",
            levelAValidCount: data.levelAValidCount ?? 0,
            levelBcdValidCount: data.levelBcdValidCount ?? 0,
            teamTotalCount: data.teamTotalCount ?? 0
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createVipStatus) failed:", error);
          throw new Error("Failed to initialize user VIP status.");
        }
      }
      /**
       * Update active VIP status details
       */
      async updateVipStatus(id, updates) {
        try {
          const result = await db.update(vipStatus).set({
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm15.eq)(vipStatus.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database update (updateVipStatus) failed:", error);
          throw new Error("Failed to update user VIP status.");
        }
      }
      /**
       * Add a record into the append-only VIP changes history ledger
       */
      async createVipHistoryEntry(data) {
        try {
          const result = await db.insert(vipHistory).values({
            userId: data.userId,
            previousTier: data.previousTier,
            newTier: data.newTier,
            reason: data.reason,
            updatedBy: data.updatedBy || "SYSTEM"
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createVipHistoryEntry) failed:", error);
          throw new Error("Failed to record VIP upgrade/downgrade history.");
        }
      }
      /**
       * Get user's historic VIP changes
       */
      async getVipHistoryByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(vipHistory).where((0, import_drizzle_orm15.eq)(vipHistory.userId, userId)).orderBy((0, import_drizzle_orm15.desc)(vipHistory.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (getVipHistoryByUserId) failed:", error);
          throw new Error("Failed to retrieve user VIP history.");
        }
      }
    };
    vipRepository = new VipRepository();
  }
});

// server/repositories/notificationRepository.ts
var import_drizzle_orm19, NotificationRepository, notificationRepository;
var init_notificationRepository = __esm({
  "server/repositories/notificationRepository.ts"() {
    import_drizzle_orm19 = require("drizzle-orm");
    init_db();
    init_schema();
    NotificationRepository = class {
      /**
       * Find a notification by its unique database ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(notifications).where((0, import_drizzle_orm19.eq)(notifications.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve notification from database.");
        }
      }
      /**
       * Find all notifications for a user with pagination and optional read status filter
       */
      async findByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const read = options?.read;
          let query = db.select().from(notifications).$dynamic();
          const conditions = [(0, import_drizzle_orm19.eq)(notifications.userId, userId)];
          if (read !== void 0) {
            conditions.push((0, import_drizzle_orm19.eq)(notifications.read, read));
          }
          const result = await query.where((0, import_drizzle_orm19.and)(...conditions)).orderBy((0, import_drizzle_orm19.desc)(notifications.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to retrieve user notifications.");
        }
      }
      /**
       * Create a new notification record for a user
       */
      async createNotification(data) {
        try {
          const result = await db.insert(notifications).values({
            userId: data.userId,
            message: data.message,
            priority: data.priority || "LOW"
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createNotification) failed:", error);
          throw new Error("Failed to store notification record.");
        }
      }
      /**
       * Mark a specific notification as read
       */
      async markAsRead(id) {
        try {
          const result = await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm19.eq)(notifications.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database update (markAsRead) failed:", error);
          throw new Error("Failed to mark notification as read.");
        }
      }
      /**
       * Mark all notifications for a user as read
       */
      async markAllAsRead(userId) {
        try {
          const result = await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm19.eq)(notifications.userId, userId)).returning();
          return result;
        } catch (error) {
          console.error("Database update (markAllAsRead) failed:", error);
          throw new Error("Failed to mark all user notifications as read.");
        }
      }
      /**
       * Delete a notification (standard cleanup/dismiss action)
       */
      async deleteNotification(id) {
        try {
          const result = await db.delete(notifications).where((0, import_drizzle_orm19.eq)(notifications.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Database deletion (deleteNotification) failed:", error);
          throw new Error("Failed to delete notification.");
        }
      }
    };
    notificationRepository = new NotificationRepository();
  }
});

// server/services/notificationService.ts
var import_drizzle_orm20, NotificationService, notificationService;
var init_notificationService = __esm({
  "server/services/notificationService.ts"() {
    import_drizzle_orm20 = require("drizzle-orm");
    init_db();
    init_schema();
    init_notificationRepository();
    NotificationService = class {
      /**
       * Dispatch a notification to a specific user
       */
      async createNotification(userId, message, priority) {
        return notificationRepository.createNotification({ userId, message, priority });
      }
      /**
       * Helper to format and create a structured notification with JSON payload
       */
      async createStructuredNotification(userId, data) {
        const message = JSON.stringify({
          title: data.title,
          description: data.description,
          icon: data.icon,
          type: data.type
        });
        return notificationRepository.createNotification({
          userId,
          message,
          priority: data.priority || "LOW"
        });
      }
      /**
       * Helper to send a structured notification to all administrators
       */
      async notifyAdmins(data) {
        try {
          const admins = await db.select().from(users).where((0, import_drizzle_orm20.or)((0, import_drizzle_orm20.eq)(users.role, "ADMIN"), (0, import_drizzle_orm20.eq)(users.role, "SUPERADMIN")));
          const message = JSON.stringify({
            title: data.title,
            description: data.description,
            icon: data.icon,
            type: data.type
          });
          for (const admin of admins) {
            await notificationRepository.createNotification({
              userId: admin.id,
              message,
              priority: data.priority || "LOW"
            });
          }
        } catch (err) {
          console.error("Failed to notify admins:", err);
        }
      }
      /**
       * Retrieve paginated notifications for a user
       */
      async getUserNotifications(userId, options) {
        return notificationRepository.findByUserId(userId, options);
      }
      /**
       * Mark a specific notification as read after authorization check
       */
      async markNotificationAsRead(id, userId) {
        const notification = await notificationRepository.findById(id);
        if (!notification) {
          throw new Error(`Notification not found with ID: ${id}`);
        }
        if (notification.userId !== userId) {
          throw new Error("Unauthorized notification action.");
        }
        return notificationRepository.markAsRead(id);
      }
      /**
       * Mark all notifications of a user as read
       */
      async markAllNotificationsAsRead(userId) {
        return notificationRepository.markAllAsRead(userId);
      }
      /**
       * Dismiss/Delete a notification after authorization check
       */
      async deleteNotification(id, userId) {
        const notification = await notificationRepository.findById(id);
        if (!notification) {
          throw new Error(`Notification not found with ID: ${id}`);
        }
        if (notification.userId !== userId) {
          throw new Error("Unauthorized notification action.");
        }
        return notificationRepository.deleteNotification(id);
      }
    };
    notificationService = new NotificationService();
  }
});

// server/repositories/transactionRepository.ts
var import_drizzle_orm21, TransactionRepository, transactionRepository;
var init_transactionRepository = __esm({
  "server/repositories/transactionRepository.ts"() {
    import_drizzle_orm21 = require("drizzle-orm");
    init_db();
    init_schema();
    TransactionRepository = class {
      /**
       * Find a transaction by its sequential database ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(transactions).where((0, import_drizzle_orm21.eq)(transactions.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve transaction from ledger.");
        }
      }
      /**
       * Find all transactions linking to a specific source entity or reference code
       */
      async findByReferenceId(referenceId) {
        try {
          const result = await db.select().from(transactions).where((0, import_drizzle_orm21.eq)(transactions.referenceId, referenceId));
          return result;
        } catch (error) {
          console.error("Database query (findByReferenceId) failed:", error);
          throw new Error("Failed to retrieve transactions by reference ID.");
        }
      }
      /**
       * Get transactions for a user with pagination and optional filters (type, status)
       */
      async findByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 20;
          const offset = options?.offset ?? 0;
          const type = options?.type;
          const status = options?.status;
          let query = db.select().from(transactions).$dynamic();
          const conditions = [(0, import_drizzle_orm21.eq)(transactions.userId, userId)];
          if (type) {
            conditions.push((0, import_drizzle_orm21.eq)(transactions.type, type));
          }
          if (status) {
            conditions.push((0, import_drizzle_orm21.eq)(transactions.status, status));
          }
          const result = await query.where((0, import_drizzle_orm21.and)(...conditions)).orderBy((0, import_drizzle_orm21.desc)(transactions.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to query user transactions ledger.");
        }
      }
      /**
       * Write a new immutable transaction entry into the financial ledger
       */
      async createTransaction(data) {
        try {
          const result = await db.insert(transactions).values({
            userId: data.userId,
            walletId: data.walletId,
            type: data.type,
            referenceId: data.referenceId,
            status: data.status || "COMPLETED",
            description: data.description,
            amount: data.amount,
            balanceBefore: data.balanceBefore,
            balanceAfter: data.balanceAfter,
            createdBy: data.createdBy || "SYSTEM"
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createTransaction) failed:", error);
          throw new Error("Failed to record immutable transaction ledger entry.");
        }
      }
      /**
       * Get system-wide transaction logs with pagination and optional filters (audit panel)
       */
      async findAll(options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const type = options?.type;
          const status = options?.status;
          let query = db.select().from(transactions).$dynamic();
          const conditions = [];
          if (type) {
            conditions.push((0, import_drizzle_orm21.eq)(transactions.type, type));
          }
          if (status) {
            conditions.push((0, import_drizzle_orm21.eq)(transactions.status, status));
          }
          if (conditions.length > 0) {
            query = query.where((0, import_drizzle_orm21.and)(...conditions));
          }
          const result = await query.orderBy((0, import_drizzle_orm21.desc)(transactions.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findAll) failed:", error);
          throw new Error("Failed to retrieve system transactions ledger.");
        }
      }
    };
    transactionRepository = new TransactionRepository();
  }
});

// server/repositories/referralRepository.ts
var import_drizzle_orm22, ReferralRepository, referralRepository;
var init_referralRepository = __esm({
  "server/repositories/referralRepository.ts"() {
    import_drizzle_orm22 = require("drizzle-orm");
    init_db();
    init_schema();
    ReferralRepository = class {
      /**
       * Find the upline/parent relationship for a given child user ID
       */
      async findRelationshipByChildId(childId) {
        try {
          const result = await db.select().from(referralRelationships).where((0, import_drizzle_orm22.eq)(referralRelationships.childId, childId));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findRelationshipByChildId) failed:", error);
          throw new Error("Failed to retrieve referral parent relationship.");
        }
      }
      /**
       * Find downline relationships under a parent user
       */
      async findRelationshipsByParentId(parentId, options) {
        try {
          const limit = options?.limit ?? 100;
          const offset = options?.offset ?? 0;
          const referralLevel = options?.referralLevel;
          let query = db.select().from(referralRelationships).$dynamic();
          const conditions = [(0, import_drizzle_orm22.eq)(referralRelationships.parentId, parentId)];
          if (referralLevel !== void 0) {
            conditions.push((0, import_drizzle_orm22.eq)(referralRelationships.referralLevel, referralLevel));
          }
          const result = await query.where((0, import_drizzle_orm22.and)(...conditions)).orderBy((0, import_drizzle_orm22.desc)(referralRelationships.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findRelationshipsByParentId) failed:", error);
          throw new Error("Failed to query referral children.");
        }
      }
      /**
       * Record a new referral hierarchical relationship link
       */
      async createRelationship(data) {
        try {
          const result = await db.insert(referralRelationships).values({
            parentId: data.parentId,
            childId: data.childId,
            referralLevel: data.referralLevel
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createRelationship) failed:", error);
          throw new Error("Failed to save referral relationship.");
        }
      }
      /**
       * Record an earned referral reward commission
       */
      async createReferralIncome(data) {
        try {
          const result = await db.insert(referralIncomeHistory).values({
            userId: data.userId,
            sourceUserId: data.sourceUserId,
            depositId: data.depositId || null,
            amount: data.amount,
            level: data.level,
            transactionId: data.transactionId
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createReferralIncome) failed:", error);
          throw new Error("Failed to record referral reward.");
        }
      }
      /**
       * Retrieve a user's referral income history with pagination
       */
      async getReferralIncomeByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(referralIncomeHistory).where((0, import_drizzle_orm22.eq)(referralIncomeHistory.userId, userId)).orderBy((0, import_drizzle_orm22.desc)(referralIncomeHistory.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (getReferralIncomeByUserId) failed:", error);
          throw new Error("Failed to load referral earnings history.");
        }
      }
    };
    referralRepository = new ReferralRepository();
  }
});

// server/repositories/incomeRepository.ts
var import_drizzle_orm23, IncomeRepository, incomeRepository;
var init_incomeRepository = __esm({
  "server/repositories/incomeRepository.ts"() {
    import_drizzle_orm23 = require("drizzle-orm");
    init_db();
    init_schema();
    IncomeRepository = class {
      /**
       * Find an income record by its unique database ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(incomeHistory).where((0, import_drizzle_orm23.eq)(incomeHistory.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve income history record.");
        }
      }
      /**
       * Get all income records for a specific user with pagination and optional type filter
       */
      async findByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const type = options?.type;
          let query = db.select().from(incomeHistory).$dynamic();
          const conditions = [(0, import_drizzle_orm23.eq)(incomeHistory.userId, userId)];
          if (type) {
            conditions.push((0, import_drizzle_orm23.eq)(incomeHistory.type, type));
          }
          const result = await query.where((0, import_drizzle_orm23.and)(...conditions)).orderBy((0, import_drizzle_orm23.desc)(incomeHistory.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to query user income history ledger.");
        }
      }
      /**
       * Record a new credit/earning income event
       */
      async createIncome(data) {
        try {
          const result = await db.insert(incomeHistory).values({
            userId: data.userId,
            walletId: data.walletId,
            type: data.type,
            amount: data.amount,
            description: data.description,
            transactionId: data.transactionId
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createIncome) failed:", error);
          throw new Error("Failed to record income history ledger entry.");
        }
      }
      /**
       * Get aggregate metrics of user earnings grouped by income category type
       */
      async getIncomeSummaryByUserId(userId) {
        try {
          const result = await db.select({
            type: incomeHistory.type,
            totalAmount: import_drizzle_orm23.sql`sum(${incomeHistory.amount})`
          }).from(incomeHistory).where((0, import_drizzle_orm23.eq)(incomeHistory.userId, userId)).groupBy(incomeHistory.type);
          return result;
        } catch (error) {
          console.error("Database query (getIncomeSummaryByUserId) failed:", error);
          throw new Error("Failed to compute user income aggregation.");
        }
      }
    };
    incomeRepository = new IncomeRepository();
  }
});

// server/repositories/teamCommissionHistoryRepository.ts
var import_drizzle_orm24, TeamCommissionHistoryRepository, teamCommissionHistoryRepository;
var init_teamCommissionHistoryRepository = __esm({
  "server/repositories/teamCommissionHistoryRepository.ts"() {
    import_drizzle_orm24 = require("drizzle-orm");
    init_db();
    init_schema();
    TeamCommissionHistoryRepository = class {
      /**
       * Record one Team Commission payout. Called ONLY by ReferralService — the
       * single owning Service for all Team Commission logic (Section 17).
       */
      async createRecord(data) {
        try {
          const result = await db.insert(teamCommissionHistory).values({
            receiverUserId: data.receiverUserId,
            sourceUserId: data.sourceUserId,
            claimId: data.claimId,
            level: data.level,
            sourceDpyAmount: data.sourceDpyAmount,
            commissionAmount: data.commissionAmount
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createRecord) failed:", error);
          throw new Error("Failed to record team commission history.");
        }
      }
      /**
       * Retrieve a receiving user's Team Commission history, paginated, newest first.
       * Joins the Users table to resolve the source user's username at query time —
       * username is never stored on this table (Users table is the single source of
       * truth for identity).
       *
       * Required by the Controller Layer to render the History UI table:
       * Time | Username | Level | DPY Claimed | Commission Earned.
       */
      async getHistoryByReceiverId(receiverUserId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select({
            id: teamCommissionHistory.id,
            createdAt: teamCommissionHistory.createdAt,
            sourceUserId: teamCommissionHistory.sourceUserId,
            sourceUsername: users.username,
            level: teamCommissionHistory.level,
            sourceDpyAmount: teamCommissionHistory.sourceDpyAmount,
            commissionAmount: teamCommissionHistory.commissionAmount
          }).from(teamCommissionHistory).innerJoin(users, (0, import_drizzle_orm24.eq)(teamCommissionHistory.sourceUserId, users.id)).where((0, import_drizzle_orm24.eq)(teamCommissionHistory.receiverUserId, receiverUserId)).orderBy((0, import_drizzle_orm24.desc)(teamCommissionHistory.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (getHistoryByReceiverId) failed:", error);
          throw new Error("Failed to load team commission history.");
        }
      }
      /**
       * Retrieve every commission record generated by a single DPY claim
       * (used for internal verification / admin audit lookups).
       */
      async getHistoryByClaimId(claimId) {
        try {
          const result = await db.select().from(teamCommissionHistory).where((0, import_drizzle_orm24.eq)(teamCommissionHistory.claimId, claimId));
          return result;
        } catch (error) {
          console.error("Database query (getHistoryByClaimId) failed:", error);
          throw new Error("Failed to load team commission records for claim.");
        }
      }
    };
    teamCommissionHistoryRepository = new TeamCommissionHistoryRepository();
  }
});

// server/repositories/auditRepository.ts
var import_drizzle_orm25, AuditRepository, auditRepository;
var init_auditRepository = __esm({
  "server/repositories/auditRepository.ts"() {
    import_drizzle_orm25 = require("drizzle-orm");
    init_db();
    init_schema();
    AuditRepository = class {
      /**
       * Find an audit log by its unique database ID
       */
      async findById(id) {
        try {
          const result = await db.select().from(auditLogs).where((0, import_drizzle_orm25.eq)(auditLogs.id, id));
          return result[0] || null;
        } catch (error) {
          console.error("Database query (findById) failed:", error);
          throw new Error("Failed to retrieve audit log from database.");
        }
      }
      /**
       * Get audit logs for actions triggered by a specific actor (admin or system agent)
       */
      async findByActor(actorUid, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(auditLogs).where((0, import_drizzle_orm25.eq)(auditLogs.actorUid, actorUid)).orderBy((0, import_drizzle_orm25.desc)(auditLogs.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByActor) failed:", error);
          throw new Error("Failed to query actor audit logs.");
        }
      }
      /**
       * Get audit logs that affected a specific user ID
       */
      async findByUserId(userId, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(auditLogs).where((0, import_drizzle_orm25.eq)(auditLogs.userId, userId)).orderBy((0, import_drizzle_orm25.desc)(auditLogs.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByUserId) failed:", error);
          throw new Error("Failed to query user-focused audit logs.");
        }
      }
      /**
       * Get audit logs targeting a specific resource path (e.g. "users/u-123" or "wallets/w-abc")
       */
      async findByResource(resource, options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const result = await db.select().from(auditLogs).where((0, import_drizzle_orm25.eq)(auditLogs.resource, resource)).orderBy((0, import_drizzle_orm25.desc)(auditLogs.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findByResource) failed:", error);
          throw new Error("Failed to query resource audit logs.");
        }
      }
      /**
       * Record a new audit log entry (immutable security journal)
       */
      async createAuditLog(data) {
        try {
          const result = await db.insert(auditLogs).values({
            actorUid: data.actorUid,
            userId: data.userId || null,
            action: data.action,
            resource: data.resource,
            ipAddress: data.ipAddress || null,
            device: data.device || null,
            oldValue: data.oldValue || null,
            newValue: data.newValue || null
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Database insertion (createAuditLog) failed:", error);
          throw new Error("Failed to write immutable audit ledger entry.");
        }
      }
      /**
       * Get all audit logs with optional filters (comprehensive admin panel list)
       */
      async findAll(options) {
        try {
          const limit = options?.limit ?? 50;
          const offset = options?.offset ?? 0;
          const action = options?.action;
          let query = db.select().from(auditLogs).$dynamic();
          if (action) {
            query = query.where((0, import_drizzle_orm25.eq)(auditLogs.action, action));
          }
          const result = await query.orderBy((0, import_drizzle_orm25.desc)(auditLogs.createdAt)).limit(limit).offset(offset);
          return result;
        } catch (error) {
          console.error("Database query (findAll) failed:", error);
          throw new Error("Failed to load system audit logs.");
        }
      }
    };
    auditRepository = new AuditRepository();
  }
});

// server/services/referralService.ts
var TEAM_COMMISSION_MATRIX, ReferralService, referralService;
var init_referralService = __esm({
  "server/services/referralService.ts"() {
    init_referralRepository();
    init_userRepository();
    init_vipRepository();
    init_walletRepository();
    init_transactionRepository();
    init_incomeRepository();
    init_notificationRepository();
    init_teamCommissionHistoryRepository();
    init_auditRepository();
    TEAM_COMMISSION_MATRIX = {
      VIP1: [0, 0, 0, 0],
      VIP2: [0.1, 0.05, 0.03, 0.02],
      VIP3: [0.12, 0.06, 0.04, 0.03],
      VIP4: [0.15, 0.08, 0.05, 0.04],
      VIP5: [0.17, 0.09, 0.06, 0.05],
      VIP6: [0.2, 0.1, 0.07, 0.06],
      VIP7: [0.22, 0.11, 0.08, 0.07],
      VIP8: [0.24, 0.12, 0.09, 0.08]
    };
    ReferralService = class {
      /**
       * Link a newly registered child to their direct parent
       */
      async linkReferral(childId, parentId) {
        const parent = await userRepository.findById(parentId);
        if (!parent) {
          throw new Error(`Referrer user not found with ID: ${parentId}`);
        }
        const child = await userRepository.findById(childId);
        if (!child) {
          throw new Error(`Referred child user not found with ID: ${childId}`);
        }
        const existing = await referralRepository.findRelationshipByChildId(childId);
        if (existing) {
          throw new Error(`User ${childId} has already been referred or linked.`);
        }
        const relationship = await referralRepository.createRelationship({
          parentId,
          childId,
          referralLevel: 1
        });
        return relationship;
      }
      /**
       * Traverse the referral tree level-by-level to retrieve all downline descendants
       * of a parent user, capped at maxLevel (defaults to 4: Level A, B, C, D).
       */
      async getDownlineDescendants(parentId, maxLevel = 4) {
        const allDescendants = [];
        const traverse = async (currentParentId, currentLevel) => {
          if (currentLevel > maxLevel) return;
          const directChildren = await referralRepository.findRelationshipsByParentId(currentParentId);
          for (const rel of directChildren) {
            allDescendants.push({
              childId: rel.childId,
              parentId: currentParentId,
              referralLevel: currentLevel
            });
            await traverse(rel.childId, currentLevel + 1);
          }
        };
        await traverse(parentId, 1);
        return allDescendants;
      }
      /**
       * Get referral income history logs for a user
       */
      async getReferralIncomeHistory(userId, options) {
        return referralRepository.getReferralIncomeByUserId(userId, options);
      }
      /**
       * Distribute Team Commission up to 4 levels (A/B/C/D) of uplines when a downline
       * user successfully claims their Daily DPY.
       *
       * Business Logic Spec Section 16 — Team Commission/Level:
       * - Commission % is based on the RECEIVING upline's CURRENT VIP tier (never the source's).
       * - Commission is distributed instantly on DPY claim.
       * - One Team Commission History record is created for every commission generated.
       *
       * This is the ONLY place in the codebase that calculates or distributes Team
       * Commission (Section 17 — Service Ownership Matrix). ClaimService must never
       * duplicate this logic — it only calls this method after completing a claim.
       */
      async distributeTeamCommission(sourceUserId, dpyAmount, claimId) {
        if (!(dpyAmount > 0)) return;
        try {
          let currentChildId = sourceUserId;
          for (let level = 1; level <= 4; level++) {
            const rel = await referralRepository.findRelationshipByChildId(currentChildId);
            if (!rel) break;
            const receiverUserId = rel.parentId;
            const receiverVip = await vipRepository.findByUserId(receiverUserId);
            const receiverTier = receiverVip?.tier || "VIP1";
            const rates = TEAM_COMMISSION_MATRIX[receiverTier] || TEAM_COMMISSION_MATRIX.VIP1;
            const rate = rates[level - 1];
            if (rate > 0) {
              const receiverWallet = await walletRepository.findByUserId(receiverUserId);
              if (receiverWallet) {
                const commissionAmount = dpyAmount * rate;
                const commissionStr = commissionAmount.toFixed(8);
                const balanceBefore = parseFloat(receiverWallet.availableBalance);
                const balanceAfter = balanceBefore + commissionAmount;
                await walletRepository.incrementBalances(receiverWallet.id, {
                  availableBalance: commissionStr,
                  teamIncome: commissionStr,
                  totalEarned: commissionStr
                });
                const txn = await transactionRepository.createTransaction({
                  userId: receiverUserId,
                  walletId: receiverWallet.id,
                  type: "TEAM_INCOME",
                  referenceId: claimId,
                  status: "COMPLETED",
                  description: `Team Commission (Level ${level}) from downline DPY claim \u2014 ${(rate * 100).toFixed(2)}% of ${dpyAmount.toFixed(8)} USDT.`,
                  amount: commissionStr,
                  balanceBefore: balanceBefore.toFixed(8),
                  balanceAfter: balanceAfter.toFixed(8),
                  createdBy: "SYSTEM"
                });
                await incomeRepository.createIncome({
                  userId: receiverUserId,
                  walletId: receiverWallet.id,
                  type: "TEAM_INCOME",
                  amount: commissionStr,
                  description: `Team Commission (Level ${level}) \u2014 ${receiverTier} rate ${(rate * 100).toFixed(2)}%`,
                  transactionId: txn.id
                });
                const historyRecord = await teamCommissionHistoryRepository.createRecord({
                  receiverUserId,
                  sourceUserId,
                  claimId,
                  level,
                  sourceDpyAmount: dpyAmount.toFixed(8),
                  commissionAmount: commissionStr
                });
                await auditRepository.createAuditLog({
                  actorUid: "SYSTEM",
                  userId: receiverUserId,
                  action: "TEAM_COMMISSION_CREDITED",
                  resource: `team_commission_history/${historyRecord.id}`,
                  newValue: JSON.stringify({ sourceUserId, level, receiverTier, rate, sourceDpyAmount: dpyAmount.toFixed(8), commissionAmount: commissionStr })
                });
                await notificationRepository.createNotification({
                  userId: receiverUserId,
                  message: `You received ${commissionStr} USDT in Team Commission (Level ${level}) from a downline's DPY claim.`,
                  priority: "LOW"
                });
              }
            }
            currentChildId = receiverUserId;
          }
        } catch (err) {
          console.error(`Failed to distribute Team Commission for source user ${sourceUserId}:`, err);
        }
      }
      /**
       * Retrieve a user's Team Commission History (Time / Username / Level / DPY Claimed /
       * Commission Earned) — required by the Controller Layer for the history UI table.
       */
      async getTeamCommissionHistory(userId, options) {
        return teamCommissionHistoryRepository.getHistoryByReceiverId(userId, options);
      }
    };
    referralService = new ReferralService();
  }
});

// server/services/vipService.ts
var vipService_exports = {};
__export(vipService_exports, {
  VipService: () => VipService,
  default: () => vipService_default,
  vipService: () => vipService
});
var VipService, vipService, vipService_default;
var init_vipService = __esm({
  "server/services/vipService.ts"() {
    init_vipRepository();
    init_walletRepository();
    init_referralService();
    init_referralRepository();
    init_notificationService();
    init_auditRepository();
    VipService = class {
      /**
       * Helper to fetch a list of VIP thresholds and info
       */
      getVipMatrix() {
        return [
          { tier: "VIP1", minBalance: 10, levelA: 0, levelBCD: 0, teamTotal: 0, dpy: 6e-3 },
          { tier: "VIP2", minBalance: 50, levelA: 2, levelBCD: 0, teamTotal: 2, dpy: 8e-3 },
          { tier: "VIP3", minBalance: 100, levelA: 3, levelBCD: 6, teamTotal: 9, dpy: 0.01 },
          { tier: "VIP4", minBalance: 500, levelA: 6, levelBCD: 20, teamTotal: 26, dpy: 0.012 },
          { tier: "VIP5", minBalance: 1e3, levelA: 7, levelBCD: 35, teamTotal: 42, dpy: 0.013 },
          { tier: "VIP6", minBalance: 3e3, levelA: 8, levelBCD: 50, teamTotal: 58, dpy: 0.015 },
          { tier: "VIP7", minBalance: 5e3, levelA: 15, levelBCD: 70, teamTotal: 85, dpy: 0.02 },
          { tier: "VIP8", minBalance: 1e4, levelA: 30, levelBCD: 200, teamTotal: 230, dpy: 0.025 }
        ];
      }
      /**
       * Calculate valid team counts for levels 1 to 4 under a user
       */
      async calculateTeamCounts(userId) {
        const descendants = await referralService.getDownlineDescendants(userId);
        let levelAValidCount = 0;
        let levelBcdValidCount = 0;
        const childWallets = await Promise.all(
          descendants.map(async (d) => {
            const wallet = await walletRepository.findByUserId(d.childId);
            return {
              referralLevel: d.referralLevel,
              wallet
            };
          })
        );
        for (const cw of childWallets) {
          if (!cw.wallet) continue;
          const totalBalance = parseFloat(cw.wallet.availableBalance) + parseFloat(cw.wallet.lockedBalance);
          if (totalBalance >= 50) {
            if (cw.referralLevel === 1) {
              levelAValidCount++;
            } else if (cw.referralLevel >= 2 && cw.referralLevel <= 4) {
              levelBcdValidCount++;
            }
          }
        }
        return {
          levelAValidCount,
          levelBcdValidCount,
          teamTotalCount: levelAValidCount + levelBcdValidCount
        };
      }
      /**
       * Recalculates and updates a user's active VIP tier based on wallet balances and team qualification
       */
      async recalculateVip(userId) {
        const vip = await vipRepository.findByUserId(userId);
        if (!vip) return null;
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) return null;
        const walletBalance = parseFloat(wallet.availableBalance) + parseFloat(wallet.lockedBalance);
        const { levelAValidCount, levelBcdValidCount, teamTotalCount } = await this.calculateTeamCounts(userId);
        const calculatedTier = this.determineEligibleVip(walletBalance, levelAValidCount, levelBcdValidCount);
        const previousTier = vip.tier;
        const currentPoints = parseFloat(wallet.totalDeposited);
        const updatedVip = await vipRepository.updateVipStatus(vip.id, {
          tier: calculatedTier,
          points: currentPoints.toFixed(8),
          levelAValidCount,
          levelBcdValidCount,
          teamTotalCount
        });
        if (calculatedTier !== previousTier) {
          await vipRepository.createVipHistoryEntry({
            userId,
            previousTier,
            newTier: calculatedTier,
            reason: `Auto VIP recalculation based on wallet balance (${walletBalance.toFixed(2)} USDT) and team qualification (A:${levelAValidCount}, BCD:${levelBcdValidCount}).`
          });
          const prevNum = parseInt(previousTier.replace("VIP", "") || "1", 10);
          const currNum = parseInt(calculatedTier.replace("VIP", "") || "1", 10);
          const isUpgrade = currNum > prevNum;
          await notificationService.createStructuredNotification(userId, {
            title: isUpgrade ? "VIP Level Upgraded!" : "VIP Level Adjusted",
            description: isUpgrade ? `Congratulations! Your VIP membership has been upgraded from ${previousTier} to ${calculatedTier}.` : `Your VIP membership has been adjusted from ${previousTier} to ${calculatedTier}.`,
            icon: isUpgrade ? "Sparkles" : "ShieldAlert",
            type: "vip",
            priority: "HIGH"
          });
          await auditRepository.createAuditLog({
            actorUid: "SYSTEM",
            userId,
            action: "VIP_TIER_CHANGE",
            resource: `vip_status/${vip.id}`,
            oldValue: previousTier,
            newValue: calculatedTier
          });
          const parentRel = await referralRepository.findRelationshipByChildId(userId);
          if (parentRel && parentRel.referralLevel === 1) {
            await this.recalculateVip(parentRel.parentId);
          }
        }
        return updatedVip;
      }
      determineEligibleVip(walletBalance, levelA, levelBCD) {
        const teamTotal = levelA + levelBCD;
        if (walletBalance >= 1e4 && levelA >= 30 && levelBCD >= 200 && teamTotal >= 230) {
          return "VIP8";
        }
        if (walletBalance >= 5e3 && levelA >= 15 && levelBCD >= 70 && teamTotal >= 85) {
          return "VIP7";
        }
        if (walletBalance >= 3e3 && levelA >= 8 && levelBCD >= 50 && teamTotal >= 58) {
          return "VIP6";
        }
        if (walletBalance >= 1e3 && levelA >= 7 && levelBCD >= 35 && teamTotal >= 42) {
          return "VIP5";
        }
        if (walletBalance >= 500 && levelA >= 6 && levelBCD >= 20 && teamTotal >= 26) {
          return "VIP4";
        }
        if (walletBalance >= 100 && levelA >= 3 && levelBCD >= 6 && teamTotal >= 9) {
          return "VIP3";
        }
        if (walletBalance >= 50 && levelA >= 2 && teamTotal >= 2) {
          return "VIP2";
        }
        return "VIP1";
      }
    };
    vipService = new VipService();
    vipService_default = vipService;
  }
});

// server.ts
var import_express7 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_vite = require("vite");

// server/config/index.ts
var dotenv = __toESM(require("dotenv"), 1);
dotenv.config();
var config2 = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET || "super-secret-key-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "super-refresh-secret-key-change-in-production",
    expiresIn: "15m",
    refreshExpiresIn: "7d"
  },
  database: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    dbName: process.env.SQL_DB_NAME,
    adminUser: process.env.SQL_ADMIN_USER,
    adminPassword: process.env.SQL_ADMIN_PASSWORD
  },
  email: {
    // No fallback defaults — these are required. EmailService/ResendProvider
    // fail fast (throw) at construction time if either is missing.
    resendApiKey: process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM
  }
};

// server/utils/logger.ts
var Logger = class {
  format(level, message, meta) {
    const timestamp21 = (/* @__PURE__ */ new Date()).toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
    return `[${timestamp21}] [${level}] ${message}${metaString}`;
  }
  debug(message, meta) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("DEBUG", message, meta));
    }
  }
  info(message, meta) {
    console.info(this.format("INFO", message, meta));
  }
  warn(message, meta) {
    console.warn(this.format("WARN", message, meta));
  }
  error(message, error, meta) {
    const combinedMeta = {
      ...meta || {},
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    };
    console.error(this.format("ERROR", message, combinedMeta));
  }
};
var logger = new Logger();

// server/utils/response.ts
function sendSuccess(res, data, statusCode = 200) {
  const responseBody = {
    success: true,
    data,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.status(statusCode).json(responseBody);
}
function sendError(res, message, code = "INTERNAL_ERROR", statusCode = 500, details) {
  const responseBody = {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.status(statusCode).json(responseBody);
}

// server/middlewares/errorHandler.ts
var ApiError = class _ApiError extends Error {
  constructor(statusCode, message, code = "BAD_REQUEST", details) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, _ApiError.prototype);
  }
};
var errorHandler = (err, req, res, next) => {
  logger.error(`Express Request Error: ${req.method} ${req.url}`, err);
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.code, err.statusCode, err.details);
  }
  const isProd = process.env.NODE_ENV === "production";
  return sendError(
    res,
    isProd ? "An unexpected error occurred on our server." : err.message,
    "INTERNAL_SERVER_ERROR",
    500,
    isProd ? void 0 : err.stack
  );
};

// server/middlewares/security.ts
var helmetMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob: android-asset: referrer; frame-ancestors *;"
    );
  } else {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: referrer;"
    );
  }
  next();
};
var corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
};
var ipBuckets = /* @__PURE__ */ new Map();
var rateLimiter = (windowMs = 15 * 60 * 1e3, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    let bucket = ipBuckets.get(ip);
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs
      };
      ipBuckets.set(ip, bucket);
    } else {
      bucket.count++;
    }
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - bucket.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(bucket.resetTime / 1e3));
    if (bucket.count > maxRequests) {
      return next(new ApiError(429, "Too many requests. Please try again later.", "RATE_LIMIT_EXCEEDED"));
    }
    next();
  };
};

// server/routes/index.ts
var import_express6 = require("express");

// server/routes/v1/index.ts
var import_express5 = require("express");

// server/routes/v1/userRoutes.ts
var import_express = require("express");

// server/services/userService.ts
init_userRepository();

// server/repositories/authRepository.ts
var import_drizzle_orm13 = require("drizzle-orm");
init_db();
init_schema();
var AuthRepository = class {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const result = await db.select().from(users).where((0, import_drizzle_orm13.eq)(users.email, email.toLowerCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByEmail) failed:", error);
      throw new Error("Failed to query repository state.");
    }
  }
  /**
   * Find user by username
   */
  async findByUsername(username) {
    try {
      const result = await db.select().from(users).where((0, import_drizzle_orm13.eq)(users.username, username.toLowerCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByUsername) failed:", error);
      throw new Error("Failed to query repository state.");
    }
  }
  /**
   * Find user by unique public/visible User ID (e.g. DS322256)
   */
  async findByUserId(userId) {
    try {
      const result = await db.select().from(users).where((0, import_drizzle_orm13.eq)(users.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to query repository state.");
    }
  }
  /**
   * Find user by referral code
   */
  async findByReferralCode(referralCode) {
    try {
      const result = await db.select().from(users).where((0, import_drizzle_orm13.eq)(users.referralCode, referralCode.toUpperCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByReferralCode) failed:", error);
      throw new Error("Failed to query repository state.");
    }
  }
  /**
   * Create and persist a new user record
   */
  async createUser(data) {
    try {
      const result = await db.insert(users).values({
        uid: data.uid,
        email: data.email.toLowerCase().trim(),
        username: data.username.toLowerCase().trim(),
        name: data.name || null,
        phone: data.phone || null,
        country: data.country || null,
        passwordHash: data.passwordHash,
        role: data.role,
        userId: data.userId,
        referralCode: data.referralCode,
        parentReferralId: data.parentReferralId || null,
        status: data.status || "ACTIVE"
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createUser) failed:", error);
      throw new Error("Failed to persist credentials state in database.");
    }
  }
  /**
   * Update password hash of a user
   */
  async updatePassword(uid, passwordHash) {
    try {
      const result = await db.update(users).set({
        passwordHash,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm13.eq)(users.uid, uid)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updatePassword) failed:", error);
      throw new Error("Failed to update credentials state in database.");
    }
  }
  /**
   * Update status of a user
   */
  async updateStatus(uid, status) {
    try {
      const result = await db.update(users).set({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm13.eq)(users.uid, uid)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateStatus) failed:", error);
      throw new Error("Failed to update status in database.");
    }
  }
  /**
   * Increment failed login attempts. If attempts reach 5, lock the account for 15 minutes.
   */
  async incrementFailedLoginAttempts(id, currentAttempts) {
    try {
      const attempts = currentAttempts + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1e3) : null;
      const result = await db.update(users).set({
        failedLoginAttempts: attempts,
        lockUntil,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm13.eq)(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Database update (incrementFailedLoginAttempts) failed:", error);
      throw new Error("Failed to update login attempt tracking.");
    }
  }
  /**
   * Reset failed login attempts and unlock the account.
   */
  async resetFailedLoginAttempts(id) {
    try {
      const result = await db.update(users).set({
        failedLoginAttempts: 0,
        lockUntil: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm13.eq)(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Database update (resetFailedLoginAttempts) failed:", error);
      throw new Error("Failed to reset login attempt tracking.");
    }
  }
};
var authRepository = new AuthRepository();

// server/services/userService.ts
init_walletRepository();
init_vipRepository();

// server/repositories/activityRepository.ts
var import_drizzle_orm16 = require("drizzle-orm");
init_db();
init_schema();
var ActivityRepository = class {
  /**
   * Find an activity log by its unique database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(activityLogs).where((0, import_drizzle_orm16.eq)(activityLogs.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findById) failed:", error);
      throw new Error("Failed to retrieve activity log.");
    }
  }
  /**
   * Find activity logs for a specific user with pagination and optional filters
   */
  async findByUserId(userId, options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const event = options?.event;
      const status = options?.status;
      let query = db.select().from(activityLogs).$dynamic();
      const conditions = [(0, import_drizzle_orm16.eq)(activityLogs.userId, userId)];
      if (event) {
        conditions.push((0, import_drizzle_orm16.eq)(activityLogs.event, event));
      }
      if (status) {
        conditions.push((0, import_drizzle_orm16.eq)(activityLogs.status, status));
      }
      const result = await query.where((0, import_drizzle_orm16.and)(...conditions)).orderBy((0, import_drizzle_orm16.desc)(activityLogs.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to query user activity logs.");
    }
  }
  /**
   * Write a new user session or profile-related security activity log (append-only)
   */
  async createActivityLog(data) {
    try {
      const result = await db.insert(activityLogs).values({
        userId: data.userId,
        event: data.event,
        status: data.status || "SUCCESS",
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        details: data.details || null
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createActivityLog) failed:", error);
      throw new Error("Failed to record user activity log.");
    }
  }
  /**
   * Get system-wide user activity logs (useful for admin monitoring)
   */
  async findAll(options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const event = options?.event;
      const status = options?.status;
      let query = db.select().from(activityLogs).$dynamic();
      const conditions = [];
      if (event) {
        conditions.push((0, import_drizzle_orm16.eq)(activityLogs.event, event));
      }
      if (status) {
        conditions.push((0, import_drizzle_orm16.eq)(activityLogs.status, status));
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm16.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm16.desc)(activityLogs.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve system activity logs.");
    }
  }
};
var activityRepository = new ActivityRepository();

// server/repositories/sessionRepository.ts
var import_drizzle_orm17 = require("drizzle-orm");
init_db();
init_schema();
var SessionRepository = class {
  /**
   * Create and persist a new user session
   */
  async createSession(data) {
    try {
      const result = await db.insert(sessions).values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        device: data.device || null,
        browser: data.browser || null,
        ipAddress: data.ipAddress || null,
        expiresAt: data.expiresAt,
        createdAt: /* @__PURE__ */ new Date(),
        lastActivity: /* @__PURE__ */ new Date(),
        revoked: false
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Failed to create session in database:", error);
      throw new Error("Failed to persist secure session in database.");
    }
  }
  /**
   * Find a session by its secure token hash
   */
  async findByTokenHash(tokenHash) {
    try {
      const result = await db.select().from(sessions).where((0, import_drizzle_orm17.eq)(sessions.tokenHash, tokenHash));
      return result[0] || null;
    } catch (error) {
      console.error("Failed to query session by token hash:", error);
      throw new Error("Failed to query session from database.");
    }
  }
  /**
   * Update the last activity timestamp for session lifetime tracking
   */
  async updateLastActivity(id) {
    try {
      await db.update(sessions).set({ lastActivity: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm17.eq)(sessions.id, id));
    } catch (error) {
      console.error("Failed to update session last activity:", error);
    }
  }
  /**
   * Find all active (non-revoked, non-expired) sessions for a user, newest first.
   * Added so Services never need to query Drizzle/sessions directly (Blueprint Rule #2).
   */
  async findActiveSessionsByUserId(userId) {
    try {
      const result = await db.select().from(sessions).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(sessions.userId, userId), (0, import_drizzle_orm17.eq)(sessions.revoked, false), (0, import_drizzle_orm17.ne)(sessions.expiresAt, /* @__PURE__ */ new Date()))).orderBy((0, import_drizzle_orm17.desc)(sessions.createdAt));
      return result;
    } catch (error) {
      console.error("Database query (findActiveSessionsByUserId) failed:", error);
      throw new Error("Failed to retrieve active sessions from database.");
    }
  }
  /**
   * Find the most recently active session for a user (used for security summaries).
   */
  async findLatestActiveSession(userId) {
    try {
      const result = await db.select().from(sessions).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(sessions.userId, userId), (0, import_drizzle_orm17.eq)(sessions.revoked, false))).orderBy((0, import_drizzle_orm17.desc)(sessions.lastActivity)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findLatestActiveSession) failed:", error);
      throw new Error("Failed to retrieve latest active session from database.");
    }
  }
  /**
   * Revoke every session for a user EXCEPT the one matching the given token hash
   * (used for "log out all other devices").
   */
  async revokeAllExcept(userId, keepTokenHash) {
    try {
      await db.update(sessions).set({ revoked: true }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(sessions.userId, userId), (0, import_drizzle_orm17.ne)(sessions.tokenHash, keepTokenHash)));
    } catch (error) {
      console.error("Failed to revoke other sessions:", error);
      throw new Error("Failed to terminate other active sessions.");
    }
  }
  /**
   * Revoke a specific session (soft delete / logout)
   */
  async revokeSession(tokenHash) {
    try {
      await db.update(sessions).set({ revoked: true }).where((0, import_drizzle_orm17.eq)(sessions.tokenHash, tokenHash));
    } catch (error) {
      console.error("Failed to revoke session:", error);
      throw new Error("Failed to revoke session in database.");
    }
  }
  /**
   * Revoke all sessions for a specific user (global sign-out)
   */
  async revokeAllUserSessions(userId) {
    try {
      await db.update(sessions).set({ revoked: true }).where((0, import_drizzle_orm17.eq)(sessions.userId, userId));
    } catch (error) {
      console.error("Failed to revoke all user sessions:", error);
      throw new Error("Failed to terminate all active sessions.");
    }
  }
};
var sessionRepository = new SessionRepository();

// server/repositories/settingsRepository.ts
var import_drizzle_orm18 = require("drizzle-orm");
init_db();
init_schema();
var SettingsRepository = class {
  /* =========================================================================
   * SYSTEM SETTINGS (GLOBAL PLATFORM BUSINESS RULES)
   * ========================================================================= */
  /**
   * Find a specific system configuration setting by its string key identifier
   */
  async findSystemSettingByKey(key) {
    try {
      const result = await db.select().from(systemSettings).where((0, import_drizzle_orm18.eq)(systemSettings.key, key));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findSystemSettingByKey) failed:", error);
      throw new Error("Failed to retrieve system setting.");
    }
  }
  /**
   * Get all platform system settings
   */
  async findAllSystemSettings() {
    try {
      const result = await db.select().from(systemSettings);
      return result;
    } catch (error) {
      console.error("Database query (findAllSystemSettings) failed:", error);
      throw new Error("Failed to retrieve all system settings.");
    }
  }
  /**
   * Update or create a system setting (by key)
   */
  async upsertSystemSetting(data) {
    try {
      const result = await db.insert(systemSettings).values({
        id: data.id,
        key: data.key,
        value: data.value,
        description: data.description || null,
        updatedBy: data.updatedBy || "SYSTEM"
      }).onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: data.value,
          description: data.description || null,
          updatedBy: data.updatedBy || "SYSTEM",
          updatedAt: /* @__PURE__ */ new Date()
        }
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database query (upsertSystemSetting) failed:", error);
      throw new Error("Failed to upsert system configuration.");
    }
  }
  /**
   * Update an existing system setting value by key
   */
  async updateSystemSetting(key, value, updatedBy) {
    try {
      const result = await db.update(systemSettings).set({
        value,
        updatedBy: updatedBy || "SYSTEM",
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm18.eq)(systemSettings.key, key)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateSystemSetting) failed:", error);
      throw new Error("Failed to update system configuration.");
    }
  }
  /* =========================================================================
   * USER SETTINGS (PERSONALIZED USER ACCOUNT PREFERENCES)
   * ========================================================================= */
  /**
   * Find localized preferences and security choices for a user
   */
  async findUserSettingsByUserId(userId) {
    try {
      const result = await db.select().from(userSettings).where((0, import_drizzle_orm18.eq)(userSettings.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findUserSettingsByUserId) failed:", error);
      throw new Error("Failed to retrieve user settings.");
    }
  }
  /**
   * Create personalized default preferences for a user
   */
  async createUserSettings(data) {
    try {
      const result = await db.insert(userSettings).values({
        userId: data.userId,
        mfaEnabled: data.mfaEnabled ?? false,
        emailNotifications: data.emailNotifications ?? true,
        marketingConsent: data.marketingConsent ?? false,
        language: data.language || "en",
        theme: data.theme || "light"
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createUserSettings) failed:", error);
      throw new Error("Failed to create localized user preferences.");
    }
  }
  /**
   * Update localized personalizations or security flags for a user
   */
  async updateUserSettings(userId, updates) {
    try {
      const result = await db.update(userSettings).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm18.eq)(userSettings.userId, userId)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateUserSettings) failed:", error);
      throw new Error("Failed to update user personalizations.");
    }
  }
};
var settingsRepository = new SettingsRepository();

// server/services/userService.ts
init_notificationService();
init_types();

// server/utils/password.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
async function hashPassword(password) {
  const salt = await import_bcryptjs.default.genSalt(12);
  return import_bcryptjs.default.hash(password, salt);
}
async function comparePassword(password, hash) {
  return import_bcryptjs.default.compare(password, hash);
}

// server/utils/securityLogger.ts
init_db();
init_schema();
var SecurityLogger = class {
  /**
   * Log an authentication or user activity to the database activity_logs
   */
  static async logActivity(data) {
    try {
      await db.insert(activityLogs).values({
        userId: data.userId,
        event: data.event,
        status: data.status,
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        details: data.details || null,
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Failed to write database activity log:", error);
    }
  }
  /**
   * Log a security or system modification to the database audit_logs (e.g., when userId is unavailable or for system-level actions)
   */
  static async logAudit(data) {
    try {
      await db.insert(auditLogs).values({
        actorUid: data.actorUid,
        action: data.action,
        resource: data.resource,
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Failed to write database audit log:", error);
    }
  }
};

// server/services/userService.ts
var import_crypto = __toESM(require("crypto"), 1);
function hashToken(token) {
  return import_crypto.default.createHash("sha256").update(token).digest("hex");
}
var UserService = class {
  /**
   * Synchronize or register authenticated user state.
   */
  async syncUserAuthentication(uid, email) {
    const existingUser = await userRepository.findByUid(uid);
    if (existingUser) {
      await this.ensureUserResources(existingUser.id);
      return existingUser;
    }
    const createdUser = await userRepository.upsertUser({
      uid,
      email: email.toLowerCase().trim()
    });
    await this.ensureUserResources(createdUser.id);
    return createdUser;
  }
  /**
   * Lazy initialize user resources like wallets and vipStatus
   */
  async ensureUserResources(userId) {
    try {
      const existingWallet = await walletRepository.findByUserId(userId);
      if (!existingWallet) {
        const trialAmountSetting = await settingsRepository.findSystemSettingByKey("TRIAL_FUND_AMOUNT");
        const trialAmount = trialAmountSetting ? trialAmountSetting.value : "100.00000000";
        await walletRepository.createWallet({
          userId,
          availableBalance: "0.00000000",
          lockedBalance: "0.00000000",
          trialBalance: trialAmount
        });
      }
      const existingVip = await vipRepository.findByUserId(userId);
      if (!existingVip) {
        await vipRepository.createVipStatus({
          userId,
          tier: "VIP1",
          points: "0.00000000"
        });
      }
    } catch (err) {
      console.error(`Failed to ensure resources for user ${userId}:`, err);
    }
  }
  /**
   * Fetch authenticated user details by UID
   */
  async getUserProfile(uid) {
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
  async changePassword(uid, data, ipAddress, userAgent) {
    const user = await this.getUserProfile(uid);
    if (!user.passwordHash) {
      throw new Error("No password hash established for this account. Cannot verify current password.");
    }
    const isMatch = await comparePassword(data.currentPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password does not match.");
    }
    if (data.newPlain.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(data.newPlain)) {
      throw new Error("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(data.newPlain)) {
      throw new Error("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(data.newPlain)) {
      throw new Error("Password must contain at least one number.");
    }
    if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(data.newPlain)) {
      throw new Error("Password must contain at least one special character.");
    }
    const hashed = await hashPassword(data.newPlain);
    await userRepository.updateUserProfile(uid, {
      passwordHash: hashed,
      passwordChangedAt: /* @__PURE__ */ new Date()
    });
    await SecurityLogger.logActivity({
      userId: user.id,
      event: "PASSWORD_CHANGE",
      status: "SUCCESS",
      ipAddress,
      device: userAgent,
      details: "Password changed by user in Account Security Center."
    });
    await SecurityLogger.logAudit({
      actorUid: uid,
      action: "PASSWORD_CHANGE",
      resource: `users/${uid}`,
      ipAddress,
      device: userAgent,
      newValue: "Password successfully updated"
    });
    await notificationService.createStructuredNotification(user.id, {
      title: "Password Changed Successfully",
      description: "Your account password has been changed successfully. If you did not make this change, please contact support immediately.",
      icon: "Key",
      type: "security",
      priority: "HIGH"
    });
    return { message: "Password updated successfully." };
  }
  /**
   * Change user email address
   */
  async changeEmail(uid, data, ipAddress, userAgent) {
    const user = await this.getUserProfile(uid);
    if (!user.passwordHash) {
      throw new Error("No password hash established for this account. Cannot verify current password.");
    }
    const isMatch = await comparePassword(data.currentPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password does not match.");
    }
    const newEmailLower = data.newEmail.trim().toLowerCase();
    const duplicate = await authRepository.findByEmail(newEmailLower);
    if (duplicate) {
      throw new Error("This email address is already registered.");
    }
    await userRepository.updateUserProfile(uid, {
      email: newEmailLower
    });
    await SecurityLogger.logActivity({
      userId: user.id,
      event: "PROFILE_UPDATE",
      status: "SUCCESS",
      ipAddress,
      device: userAgent,
      details: `Email updated from ${user.email} to ${newEmailLower}`
    });
    await SecurityLogger.logAudit({
      actorUid: uid,
      action: "EMAIL_CHANGE",
      resource: `users/${uid}`,
      ipAddress,
      device: userAgent,
      oldValue: user.email,
      newValue: newEmailLower
    });
    await notificationService.createStructuredNotification(user.id, {
      title: "Email Address Updated",
      description: `Your account email address has been successfully updated to ${newEmailLower}.`,
      icon: "ShieldAlert",
      type: "security",
      priority: "HIGH"
    });
    return { message: "Email address updated successfully." };
  }
  /**
   * Update Profile info (Name & Phone)
   */
  async updateProfile(uid, data, ipAddress, userAgent) {
    const user = await this.getUserProfile(uid);
    await userRepository.updateUserProfile(uid, {
      name: data.name !== void 0 ? data.name.trim() : user.name,
      phone: data.phone !== void 0 ? data.phone.trim() : user.phone
    });
    await SecurityLogger.logActivity({
      userId: user.id,
      event: "PROFILE_UPDATE",
      status: "SUCCESS",
      ipAddress,
      device: userAgent,
      details: `Profile info updated: ${data.name ? "name " : ""}${data.phone ? "phone" : ""}`
    });
    return { message: "Profile information updated successfully." };
  }
  /**
   * Retrieve active, valid sessions for current user
   */
  async getSessions(uid) {
    const user = await this.getUserProfile(uid);
    return sessionRepository.findActiveSessionsByUserId(user.id);
  }
  /**
   * Logout all other sessions
   */
  async logoutAllOthers(uid, currentRefreshToken, ipAddress, userAgent) {
    const user = await this.getUserProfile(uid);
    const tokenHash = hashToken(currentRefreshToken);
    await sessionRepository.revokeAllExcept(user.id, tokenHash);
    await SecurityLogger.logAudit({
      actorUid: uid,
      action: "LOGOUT_ALL_SESSIONS",
      resource: `users/${uid}/sessions`,
      ipAddress,
      device: userAgent,
      newValue: "All other active sessions terminated by the user."
    });
    return { message: "All other active sessions have been terminated successfully." };
  }
  /**
   * Admin-level user listing with aggregated resources (wallets, VIP tiers)
   */
  async getAdminUserList() {
    const allUsers = await userRepository.findAll({ limit: 1e3, offset: 0 });
    const list = [];
    for (const u of allUsers) {
      await this.ensureUserResources(u.id);
      const walletRecord = await walletRepository.findByUserId(u.id);
      const balance = walletRecord ? walletRecord.availableBalance : "0.00000000";
      const vipRecord = await vipRepository.findByUserId(u.id);
      const vipTier = vipRecord ? vipRecord.tier : "VIP1";
      const lastLoginRecord = await activityRepository.findByUserId(u.id, {
        event: "LOGIN",
        status: "SUCCESS",
        limit: 1
      });
      const lastLoginTime = lastLoginRecord[0] ? lastLoginRecord[0].createdAt : null;
      const lastLoginIp = lastLoginRecord[0] ? lastLoginRecord[0].ipAddress : null;
      list.push({
        id: u.id,
        uid: u.uid,
        name: u.name || "",
        email: u.email,
        phone: u.phone || "",
        role: u.role,
        status: u.status,
        vipTier,
        walletBalance: parseFloat(balance),
        registrationDate: u.createdAt,
        lastLogin: lastLoginTime,
        lastLoginIp,
        failedLoginAttempts: u.failedLoginAttempts,
        lockUntil: u.lockUntil,
        passwordChangedAt: u.passwordChangedAt
      });
    }
    return list;
  }
  /**
   * Admin updates user profile / configuration
   */
  async updateProfileByAdmin(uid, role) {
    const fieldsToUpdate = {};
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
  async adminActionUser(adminUid, targetUid, payload, ipAddress, userAgent) {
    const targetUser = await this.getUserProfile(targetUid);
    const updates = { updatedAt: /* @__PURE__ */ new Date() };
    switch (payload.action) {
      case "RESET_PASSWORD": {
        if (!payload.password || payload.password.trim().length < 8) {
          throw new Error("A secure password of at least 8 characters is required for reset.");
        }
        const hash = await hashPassword(payload.password);
        updates.passwordHash = hash;
        updates.passwordChangedAt = /* @__PURE__ */ new Date();
        await sessionRepository.revokeAllUserSessions(targetUser.id);
        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: "PASSWORD_RESET",
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          newValue: "Password manually reset by Administrator."
        });
        break;
      }
      case "SUSPEND": {
        updates.status = "SUSPENDED";
        await sessionRepository.revokeAllUserSessions(targetUser.id);
        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: "USER_SUSPEND",
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.status,
          newValue: "SUSPENDED"
        });
        break;
      }
      case "UNLOCK": {
        updates.status = "ACTIVE";
        updates.failedLoginAttempts = 0;
        updates.lockUntil = null;
        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: "USER_UNLOCK",
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.status,
          newValue: "ACTIVE"
        });
        break;
      }
      case "CHANGE_ROLE": {
        const allowedRoles = Object.values(UserRole);
        if (!payload.value || !allowedRoles.includes(payload.value)) {
          throw new Error("Invalid security role specified.");
        }
        updates.role = payload.value;
        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: "ROLE_CHANGE",
          resource: `users/${targetUid}`,
          ipAddress,
          device: userAgent,
          oldValue: targetUser.role,
          newValue: payload.value
        });
        break;
      }
      case "CHANGE_VIP": {
        if (!payload.value) {
          throw new Error("VIP tier is required.");
        }
        const vipRecord = await vipRepository.findByUserId(targetUser.id);
        if (vipRecord) {
          await vipRepository.updateVipStatus(vipRecord.id, {
            tier: payload.value
          });
        }
        await SecurityLogger.logAudit({
          actorUid: adminUid,
          action: "CHANGE_VIP",
          resource: `users/${targetUid}/vip`,
          ipAddress,
          device: userAgent,
          newValue: payload.value
        });
        break;
      }
      default:
        throw new Error(`Unsupported administrative security operation: ${payload.action}`);
    }
    const result = await userRepository.updateUserProfile(targetUid, updates);
    if (!result) {
      throw new Error(`Failed to apply updates to target user ${targetUid}`);
    }
    return result;
  }
  /**
   * SECURITY DASHBOARD: Returns a high-level security audit profile summary for a user
   */
  async getSecuritySummary(uid) {
    const user = await this.getUserProfile(uid);
    const currentSession = await sessionRepository.findLatestActiveSession(user.id);
    const lastLoginLogs = await activityRepository.findByUserId(user.id, {
      event: "LOGIN",
      limit: 2
    });
    const prevLogin = lastLoginLogs[1] || lastLoginLogs[0] || null;
    const userSettingsRecord = await settingsRepository.findUserSettingsByUserId(user.id);
    const mfaEnabled = userSettingsRecord ? userSettingsRecord.mfaEnabled : false;
    return {
      passwordChangedAt: user.passwordChangedAt,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockStatus: user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date() ? "LOCKED" : "UNLOCKED",
      lockUntil: user.lockUntil,
      currentLoginDevice: currentSession ? `${currentSession.browser || ""} on ${currentSession.device || ""}` : null,
      lastLoginTime: prevLogin ? prevLogin.createdAt : null,
      lastLoginIp: prevLogin ? prevLogin.ipAddress : null,
      mfaEnabled
    };
  }
};
var userService = new UserService();

// server/services/dashboardService.ts
init_walletRepository();
init_vipRepository();
init_transactionRepository();
init_referralService();

// server/services/incomeService.ts
init_incomeRepository();
var IncomeService = class {
  /**
   * Helper to write a new income log entry for auditing and analytics grouping
   */
  async recordIncome(data) {
    return incomeRepository.createIncome(data);
  }
  /**
   * Get paginated income history logs for a user
   */
  async getUserIncomeHistory(userId, options) {
    return incomeRepository.findByUserId(userId, options);
  }
  /**
   * Retrieve structured total summary metrics for user dashboard display card
   * Categorizes aggregate earnings exactly as defined in Section 10:
   * - Referral Income (REFERRAL)
   * - Daily Yield (DAILY_YIELD)
   * - Team Income (TEAM_INCOME)
   * - Incentive Income (INCENTIVE, SALARY, Weekly Salary, Rewards, etc.)
   */
  async getUserIncomeSummary(userId) {
    const summaryList = await incomeRepository.getIncomeSummaryByUserId(userId);
    let referralIncome = 0;
    let dailyYield = 0;
    let teamIncome = 0;
    let incentiveIncome = 0;
    for (const item of summaryList) {
      const amount = parseFloat(item.totalAmount || "0.0");
      switch (item.type) {
        case "REFERRAL":
          referralIncome += amount;
          break;
        case "DAILY_YIELD":
          dailyYield += amount;
          break;
        case "TEAM_INCOME":
          teamIncome += amount;
          break;
        default:
          incentiveIncome += amount;
          break;
      }
    }
    return {
      referralIncome: referralIncome.toFixed(8),
      dailyYield: dailyYield.toFixed(8),
      teamIncome: teamIncome.toFixed(8),
      incentiveIncome: incentiveIncome.toFixed(8),
      totalEarned: (referralIncome + dailyYield + teamIncome + incentiveIncome).toFixed(8)
    };
  }
};
var incomeService = new IncomeService();

// server/repositories/claimRepository.ts
var import_drizzle_orm26 = require("drizzle-orm");
init_db();
init_schema();
var ClaimRepository = class {
  /**
   * Find a claim by its unique database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(claims).where((0, import_drizzle_orm26.eq)(claims.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findById) failed:", error);
      throw new Error("Failed to retrieve claim from database.");
    }
  }
  /**
   * Find all claims for a user with pagination and optional status filter
   */
  async findByUserId(userId, options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      let query = db.select().from(claims).$dynamic();
      const conditions = [(0, import_drizzle_orm26.eq)(claims.userId, userId)];
      if (status) {
        conditions.push((0, import_drizzle_orm26.eq)(claims.claimStatus, status));
      }
      const result = await query.where((0, import_drizzle_orm26.and)(...conditions)).orderBy((0, import_drizzle_orm26.desc)(claims.claimDate)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to retrieve user claims.");
    }
  }
  /**
   * Create a new claimable reward record
   */
  async createClaim(data) {
    try {
      const result = await db.insert(claims).values({
        userId: data.userId,
        claimDate: data.claimDate,
        claimStatus: data.claimStatus || "PENDING",
        rewardAmount: data.rewardAmount,
        totalAssets: data.totalAssets || "0.00000000",
        vipTier: data.vipTier || "VIP1",
        vipRate: data.vipRate || "0.00000000",
        claimWindowOpenTime: data.claimWindowOpenTime,
        claimWindowCloseTime: data.claimWindowCloseTime
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createClaim) failed:", error);
      throw new Error("Failed to initialize new claimable yield entry.");
    }
  }
  /**
   * Mark a claim as CLAIMED, EXPIRED, or FORFEITED, linking any associated transaction
   */
  async updateClaimStatus(id, status, updates) {
    try {
      const result = await db.update(claims).set({
        claimStatus: status,
        ...updates
      }).where((0, import_drizzle_orm26.eq)(claims.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateClaimStatus) failed:", error);
      throw new Error("Failed to update claim state.");
    }
  }
  /**
   * Find all PENDING claims whose claim window has already closed as of the given time
   * (i.e. unclaimed DPY that must expire at the next 00:00 UTC reset).
   */
  async findExpiredPendingClaims(asOf = /* @__PURE__ */ new Date()) {
    try {
      const result = await db.select().from(claims).where((0, import_drizzle_orm26.and)((0, import_drizzle_orm26.eq)(claims.claimStatus, "PENDING"), (0, import_drizzle_orm26.lt)(claims.claimWindowCloseTime, asOf)));
      return result;
    } catch (error) {
      console.error("Database query (findExpiredPendingClaims) failed:", error);
      throw new Error("Failed to look up expired pending claims.");
    }
  }
  /**
   * Find any daily claim record in today's window regardless of its status (PENDING, CLAIMED, etc.)
   */
  async findAnyClaimInWindow(userId, date) {
    try {
      const result = await db.select().from(claims).where(
        (0, import_drizzle_orm26.and)(
          (0, import_drizzle_orm26.eq)(claims.userId, userId),
          (0, import_drizzle_orm26.lte)(claims.claimWindowOpenTime, date),
          (0, import_drizzle_orm26.gte)(claims.claimWindowCloseTime, date)
        )
      );
      return result;
    } catch (error) {
      console.error("Database query (findAnyClaimInWindow) failed:", error);
      throw new Error("Failed to look up any claims in the current window.");
    }
  }
  /**
   * Find any currently active pending claim(s) where the current time falls inside the window
   */
  async findActiveClaimsInWindow(userId, date) {
    try {
      const result = await db.select().from(claims).where(
        (0, import_drizzle_orm26.and)(
          (0, import_drizzle_orm26.eq)(claims.userId, userId),
          (0, import_drizzle_orm26.eq)(claims.claimStatus, "PENDING"),
          (0, import_drizzle_orm26.lte)(claims.claimWindowOpenTime, date),
          (0, import_drizzle_orm26.gte)(claims.claimWindowCloseTime, date)
        )
      );
      return result;
    } catch (error) {
      console.error("Database query (findActiveClaimsInWindow) failed:", error);
      throw new Error("Failed to look up active claims in the current window.");
    }
  }
};
var claimRepository = new ClaimRepository();

// server/repositories/depositAddressRepository.ts
var import_drizzle_orm27 = require("drizzle-orm");
init_db();
init_schema();
var DepositAddressRepository = class {
  /**
   * Find all generated deposit addresses for a user
   */
  async findByUserId(userId) {
    try {
      const result = await db.select().from(depositAddresses).where((0, import_drizzle_orm27.eq)(depositAddresses.userId, userId));
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to retrieve deposit addresses.");
    }
  }
  /**
   * Find a specific deposit address for a user on a given blockchain network
   */
  async findByUserAndNetwork(userId, network) {
    try {
      const result = await db.select().from(depositAddresses).where(
        (0, import_drizzle_orm27.and)(
          (0, import_drizzle_orm27.eq)(depositAddresses.userId, userId),
          (0, import_drizzle_orm27.eq)(depositAddresses.network, network)
        )
      );
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByUserAndNetwork) failed:", error);
      throw new Error("Failed to retrieve network deposit address.");
    }
  }
  /**
   * Find a deposit address by the generated public crypto address
   * This maps incoming blockchain payments back to a specific user/account.
   */
  async findByAddress(address) {
    try {
      const result = await db.select().from(depositAddresses).where((0, import_drizzle_orm27.eq)(depositAddresses.address, address));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByAddress) failed:", error);
      throw new Error("Failed to retrieve deposit address from database.");
    }
  }
  /**
   * Create and record a new permanent deposit address for a user
   */
  async createDepositAddress(data) {
    try {
      const result = await db.insert(depositAddresses).values({
        userId: data.userId,
        network: data.network,
        address: data.address,
        derivationIndex: data.derivationIndex,
        qrPath: data.qrPath
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createDepositAddress) failed:", error);
      throw new Error("Failed to store generated deposit address.");
    }
  }
};
var depositAddressRepository = new DepositAddressRepository();

// server/services/claimService.ts
init_walletRepository();
init_vipRepository();
init_transactionRepository();
init_notificationRepository();
init_incomeRepository();
init_auditRepository();
init_referralService();
var ClaimService = class {
  /**
   * Helper to determine DPY percentage rate based on VIP tier
   */
  getDpyRateByVip(tier) {
    switch (tier) {
      case "VIP8":
        return 0.025;
      case "VIP7":
        return 0.02;
      case "VIP6":
        return 0.015;
      case "VIP5":
        return 0.013;
      case "VIP4":
        return 0.012;
      case "VIP3":
        return 0.01;
      case "VIP2":
        return 8e-3;
      default:
        return 6e-3;
    }
  }
  /**
   * Generate a pending daily claim record for a single user for a given date
   */
  async generateClaimForUser(userId, date = /* @__PURE__ */ new Date()) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) return null;
    const vip = await vipRepository.findByUserId(userId);
    const vipTier = vip ? vip.tier : "VIP1";
    const rate = this.getDpyRateByVip(vipTier);
    const activeBalance = parseFloat(wallet.availableBalance);
    const rewardAmount = activeBalance * rate;
    if (rewardAmount <= 0) {
      return null;
    }
    const openTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const closeTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    const existingClaims = await claimRepository.findAnyClaimInWindow(userId, date);
    if (existingClaims.length > 0) {
      return existingClaims[0];
    }
    const claim = await claimRepository.createClaim({
      userId,
      claimDate: date,
      claimStatus: "PENDING",
      rewardAmount: rewardAmount.toFixed(8),
      totalAssets: activeBalance.toFixed(8),
      vipTier,
      vipRate: rate.toFixed(4),
      claimWindowOpenTime: openTime,
      claimWindowCloseTime: closeTime
    });
    return claim;
  }
  /**
   * Process manual DPY yield claims triggered by the user
   */
  async claimDailyYield(claimId, userId) {
    const claim = await claimRepository.findById(claimId);
    if (!claim) {
      throw new Error(`Daily DPY claim record not found for ID: ${claimId}`);
    }
    if (claim.userId !== userId) {
      throw new Error("Unauthorized claim action.");
    }
    if (claim.claimStatus !== "PENDING") {
      throw new Error(`This claim has already been ${claim.claimStatus.toLowerCase()}.`);
    }
    const now = /* @__PURE__ */ new Date();
    if (now < claim.claimWindowOpenTime || now > claim.claimWindowCloseTime) {
      throw new Error("This claim window has expired or is not yet open.");
    }
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }
    const rewardAmount = parseFloat(claim.rewardAmount);
    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + rewardAmount;
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: claim.rewardAmount,
      dailyYield: claim.rewardAmount,
      totalEarned: claim.rewardAmount
    });
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: "DAILY_YIELD",
      referenceId: claim.id,
      status: "COMPLETED",
      description: `Claimed daily DPY yield: ${claim.rewardAmount} USDT (VIP rate: ${(parseFloat(claim.vipRate) * 100).toFixed(2)}%).`,
      amount: claim.rewardAmount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: "SYSTEM"
    });
    await incomeRepository.createIncome({
      userId,
      walletId: wallet.id,
      type: "DAILY_YIELD",
      amount: claim.rewardAmount,
      description: `Daily DPY yield matching VIP tier ${claim.vipTier}`,
      transactionId: txn.id
    });
    const updatedClaim = await claimRepository.updateClaimStatus(claim.id, "CLAIMED", {
      claimedAt: now,
      transactionId: txn.id
    });
    await notificationRepository.createNotification({
      userId,
      message: `Successfully claimed daily yield of ${claim.rewardAmount} USDT.`,
      priority: "MEDIUM"
    });
    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: "DAILY_DPY_CLAIMED",
      resource: `claims/${claim.id}`,
      newValue: JSON.stringify({ rewardAmount: claim.rewardAmount, vipTier: claim.vipTier, vipRate: claim.vipRate })
    });
    await referralService.distributeTeamCommission(userId, rewardAmount, claim.id);
    return updatedClaim;
  }
  /**
   * Automatically expire any unclaimed Daily DPY claims past their 00:00 UTC window close.
   * Business Logic Spec Section 11: "Unclaimed DPY expires at the next 00:00 UTC reset."
   * A fresh claim is generated separately by generateClaimForUser() on the next cycle.
   */
  async expireUnclaimedClaims(date = /* @__PURE__ */ new Date()) {
    let expiredCount = 0;
    try {
      const expiredClaims = await claimRepository.findExpiredPendingClaims(date);
      for (const claim of expiredClaims) {
        await claimRepository.updateClaimStatus(claim.id, "EXPIRED", {
          expired: true
        });
        await notificationRepository.createNotification({
          userId: claim.userId,
          message: `Your Daily DPY reward of ${claim.rewardAmount} USDT expired unclaimed and has been forfeited.`,
          priority: "LOW"
        });
        expiredCount++;
      }
    } catch (err) {
      console.error("Failed to expire unclaimed rewards:", err);
    }
    return { expiredCount };
  }
};
var claimService = new ClaimService();

// server/services/dashboardService.ts
var DashboardService = class {
  /**
   * Aggregate all metrics and states to compile the comprehensive user dashboard payload
   */
  async getDashboardData(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }
    const availableBalance = parseFloat(wallet.availableBalance);
    const lockedBalance = parseFloat(wallet.lockedBalance);
    const totalAssets = availableBalance + lockedBalance;
    const earnings = await incomeService.getUserIncomeSummary(userId);
    let vip = await vipRepository.findByUserId(userId);
    if (!vip) {
      vip = await vipRepository.createVipStatus({
        userId,
        tier: "VIP1"
      });
    }
    const descendants = await referralService.getDownlineDescendants(userId);
    let levelACount = 0;
    let levelBCount = 0;
    let levelCCount = 0;
    let levelDCount = 0;
    let levelAValidCount = 0;
    let levelBcdValidCount = 0;
    const descendantWallets = await Promise.all(
      descendants.map(async (d) => {
        const dWallet = await walletRepository.findByUserId(d.childId);
        return {
          referralLevel: d.referralLevel,
          wallet: dWallet
        };
      })
    );
    for (const dw of descendantWallets) {
      const level = dw.referralLevel;
      if (level === 1) levelACount++;
      else if (level === 2) levelBCount++;
      else if (level === 3) levelCCount++;
      else if (level === 4) levelDCount++;
      if (dw.wallet) {
        const dBalance = parseFloat(dw.wallet.availableBalance) + parseFloat(dw.wallet.lockedBalance);
        if (dBalance >= 50) {
          if (level === 1) {
            levelAValidCount++;
          } else if (level >= 2 && level <= 4) {
            levelBcdValidCount++;
          }
        }
      }
    }
    const recentTransactions = await transactionRepository.findByUserId(userId, { limit: 5 });
    const recentActivities = await activityRepository.findByUserId(userId, { limit: 5 });
    const now = /* @__PURE__ */ new Date();
    let activeClaims = await claimRepository.findActiveClaimsInWindow(userId, now);
    if (activeClaims.length === 0) {
      const generated = await claimService.generateClaimForUser(userId, now);
      if (generated) {
        activeClaims = [generated];
      }
    }
    const dailyClaimAvailable = activeClaims.length > 0;
    const pendingClaim = dailyClaimAvailable ? activeClaims[0] : null;
    const trialAmountSetting = await settingsRepository.findSystemSettingByKey("TRIAL_FUND_AMOUNT");
    const trialDurationSetting = await settingsRepository.findSystemSettingByKey("TRIAL_FUND_DURATION_DAYS");
    const depositAddressesList = await depositAddressRepository.findByUserId(userId);
    return {
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        lockedBalance: wallet.lockedBalance,
        principalBalance: wallet.principalBalance,
        trialBalance: wallet.trialBalance,
        totalAssets: totalAssets.toFixed(8),
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn
      },
      depositAddresses: depositAddressesList.map((da) => ({
        network: da.network,
        address: da.address
      })),
      earnings,
      vip: {
        tier: vip.tier,
        points: vip.points,
        levelAValidCount: vip.levelAValidCount,
        levelBcdValidCount: vip.levelBcdValidCount,
        teamTotalCount: vip.teamTotalCount,
        assignedAt: vip.assignedAt
      },
      team: {
        levelACount,
        levelBCount,
        levelCCount,
        levelDCount,
        totalReferralCount: levelACount + levelBCount + levelCCount + levelDCount,
        levelAValidCount,
        levelBcdValidCount,
        teamTotalValidCount: levelAValidCount + levelBcdValidCount
      },
      dailyClaim: {
        available: dailyClaimAvailable && (pendingClaim ? pendingClaim.claimStatus === "PENDING" : false),
        claimId: pendingClaim ? pendingClaim.id : null,
        amount: pendingClaim ? pendingClaim.rewardAmount : "0.00000000",
        windowClose: pendingClaim ? pendingClaim.claimWindowCloseTime : null,
        status: pendingClaim ? pendingClaim.claimStatus : "PENDING"
      },
      recentTransactions,
      recentActivities,
      trialFundInfo: {
        amount: trialAmountSetting ? trialAmountSetting.value : "100.00000000",
        durationDays: trialDurationSetting ? parseInt(trialDurationSetting.value) : 7,
        activeTrialBalance: wallet.trialBalance
      }
    };
  }
};
var dashboardService = new DashboardService();

// server/services/supportService.ts
var import_crypto2 = __toESM(require("crypto"), 1);

// server/repositories/supportRepository.ts
var import_drizzle_orm28 = require("drizzle-orm");
init_db();
init_schema();
var SupportRepository = class {
  /**
   * Find a support ticket by its unique sequential database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(supportTickets).where((0, import_drizzle_orm28.eq)(supportTickets.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findById) failed:", error);
      throw new Error("Failed to retrieve support ticket.");
    }
  }
  /**
   * Find a support ticket by its human-readable unique code
   */
  async findByTicketNumber(ticketNumber) {
    try {
      const result = await db.select().from(supportTickets).where((0, import_drizzle_orm28.eq)(supportTickets.ticketNumber, ticketNumber));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByTicketNumber) failed:", error);
      throw new Error("Failed to retrieve support ticket by code.");
    }
  }
  /**
   * Retrieve support tickets for a user with pagination and optional status filter
   */
  async findByUserId(userId, options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      let query = db.select().from(supportTickets).$dynamic();
      const conditions = [(0, import_drizzle_orm28.eq)(supportTickets.userId, userId)];
      if (status) {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.status, status));
      }
      const result = await query.where((0, import_drizzle_orm28.and)(...conditions)).orderBy((0, import_drizzle_orm28.desc)(supportTickets.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to query user support tickets.");
    }
  }
  /**
   * Create a new support ticket
   */
  async createTicket(data) {
    try {
      const result = await db.insert(supportTickets).values({
        userId: data.userId,
        ticketNumber: data.ticketNumber,
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority || "LOW",
        status: "OPEN",
        attachmentName: data.attachmentName || null,
        attachmentData: data.attachmentData || null
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createTicket) failed:", error);
      throw new Error("Failed to submit new support ticket.");
    }
  }
  /**
   * Update support ticket status, priority, or assignee
   */
  async updateTicket(id, updates) {
    try {
      const result = await db.update(supportTickets).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm28.eq)(supportTickets.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateTicket) failed:", error);
      throw new Error("Failed to update support ticket.");
    }
  }
  /**
   * Find all support tickets joined with user details (admin audit panel view)
   */
  async findAdminTickets(options) {
    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const priority = options?.priority;
      const category = options?.category;
      const search = options?.search;
      let query = db.select({
        id: supportTickets.id,
        userId: supportTickets.userId,
        ticketNumber: supportTickets.ticketNumber,
        status: supportTickets.status,
        priority: supportTickets.priority,
        assignedAdminUid: supportTickets.assignedAdminUid,
        category: supportTickets.category,
        subject: supportTickets.subject,
        description: supportTickets.description,
        attachmentName: supportTickets.attachmentName,
        attachmentData: supportTickets.attachmentData,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        userEmail: users.email,
        userName: users.name,
        userVisibleId: users.userId
      }).from(supportTickets).leftJoin(users, (0, import_drizzle_orm28.eq)(supportTickets.userId, users.id)).$dynamic();
      const conditions = [];
      if (status && status !== "All" && status !== "ALL") {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.status, status));
      }
      if (priority && priority !== "All" && priority !== "ALL") {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.priority, priority));
      }
      if (category && category !== "All" && category !== "ALL") {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.category, category));
      }
      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(
          (0, import_drizzle_orm28.or)(
            (0, import_drizzle_orm28.ilike)(supportTickets.ticketNumber, searchPattern),
            (0, import_drizzle_orm28.ilike)(supportTickets.subject, searchPattern),
            (0, import_drizzle_orm28.ilike)(supportTickets.description, searchPattern),
            (0, import_drizzle_orm28.ilike)(users.email, searchPattern),
            (0, import_drizzle_orm28.ilike)(users.name, searchPattern)
          )
        );
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm28.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm28.desc)(supportTickets.updatedAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAdminTickets) failed:", error);
      throw new Error("Failed to retrieve system support tickets ledger.");
    }
  }
  /**
   * Find all support tickets (admin audit panel view)
   */
  async findAll(options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const priority = options?.priority;
      let query = db.select().from(supportTickets).$dynamic();
      const conditions = [];
      if (status) {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.status, status));
      }
      if (priority) {
        conditions.push((0, import_drizzle_orm28.eq)(supportTickets.priority, priority));
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm28.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm28.desc)(supportTickets.updatedAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve system support tickets ledger.");
    }
  }
  /**
   * Create a support message / reply under a specific ticket
   */
  async createMessage(data) {
    try {
      const result = await db.insert(supportMessages).values({
        ticketId: data.ticketId,
        senderId: data.senderId || null,
        senderType: data.senderType,
        message: data.message
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createMessage) failed:", error);
      throw new Error("Failed to save support thread reply.");
    }
  }
  /**
   * Get messages / replies under a support ticket to display conversations
   */
  async findMessagesByTicketId(ticketId, options) {
    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;
      const result = await db.select().from(supportMessages).where((0, import_drizzle_orm28.eq)(supportMessages.ticketId, ticketId)).orderBy((0, import_drizzle_orm28.desc)(supportMessages.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findMessagesByTicketId) failed:", error);
      throw new Error("Failed to retrieve support ticket conversation.");
    }
  }
};
var supportRepository = new SupportRepository();

// server/services/supportService.ts
init_notificationService();
var SupportService = class {
  /**
   * Helper to generate a unique human-readable ticket number (e.g. TICK-ABCD-1234)
   */
  generateTicketNumber() {
    const randomHex = import_crypto2.default.randomBytes(3).toString("hex").toUpperCase();
    const seq = Math.floor(100 + Math.random() * 900);
    return `MF-${randomHex}-${seq}`;
  }
  /**
   * User or Admin creates a brand new support ticket
   */
  async createSupportTicket(data) {
    const ticketNumber = this.generateTicketNumber();
    const ticket = await supportRepository.createTicket({
      userId: data.userId,
      ticketNumber,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "LOW",
      attachmentName: data.attachmentName,
      attachmentData: data.attachmentData
    });
    await supportRepository.createMessage({
      ticketId: ticket.id,
      senderId: data.userId,
      senderType: "USER",
      message: data.description
    });
    await notificationService.notifyAdmins({
      title: "New Support Ticket Created",
      description: `Inquiry ${ticket.ticketNumber} regarding ${data.category} has been opened.`,
      icon: "MessageSquare",
      type: "support",
      priority: "MEDIUM"
    });
    return ticket;
  }
  /**
   * Add a response/reply message under a support ticket thread with authorization mapping
   */
  async addTicketReply(data) {
    const ticket = await supportRepository.findById(data.ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${data.ticketId}`);
    }
    if (data.senderType === "USER" && ticket.userId !== data.senderId) {
      throw new Error("Unauthorized action on support ticket thread.");
    }
    const messageRecord = await supportRepository.createMessage({
      ticketId: data.ticketId,
      senderId: data.senderId,
      senderType: data.senderType,
      message: data.message
    });
    const newStatus = data.senderType === "ADMIN" ? "PENDING_USER" : "OPEN";
    await supportRepository.updateTicket(ticket.id, { status: newStatus });
    if (data.senderType === "ADMIN") {
      await notificationService.createStructuredNotification(ticket.userId, {
        title: "New Support Message",
        description: `MetaFirm Support has replied to your ticket ${ticket.ticketNumber}: "${data.message.substring(0, 60)}..."`,
        icon: "MessageSquare",
        type: "support",
        priority: "HIGH"
      });
    } else if (data.senderType === "USER") {
      await notificationService.notifyAdmins({
        title: "New User Ticket Reply",
        description: `User replied to ticket ${ticket.ticketNumber}: "${data.message.substring(0, 60)}..."`,
        icon: "MessageSquare",
        type: "support",
        priority: "MEDIUM"
      });
    }
    return messageRecord;
  }
  /**
   * Retrieve list of support tickets submitted by a specific user
   */
  async getUserTickets(userId, options) {
    return supportRepository.findByUserId(userId, options);
  }
  /**
   * Retrieve list of all support tickets for administrative oversight
   */
  async getAdminTickets(options) {
    return supportRepository.findAdminTickets(options);
  }
  /**
   * Retrieve all messages/conversation history under a specific ticket
   */
  async getTicketMessages(ticketId, userId, isAdmin = false) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${ticketId}`);
    }
    if (!isAdmin && ticket.userId !== userId) {
      throw new Error("Unauthorized action. You do not have permission to view this support conversation.");
    }
    return supportRepository.findMessagesByTicketId(ticketId);
  }
  /**
   * Update ticket properties (status, priority, admin assignee) - Administrative Actions
   */
  async updateTicketProperties(ticketId, updates) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${ticketId}`);
    }
    return supportRepository.updateTicket(ticket.id, updates);
  }
  /**
   * Find a specific support ticket by its sequential database ID
   */
  async getTicketById(ticketId) {
    return supportRepository.findById(ticketId);
  }
};
var supportService = new SupportService();

// server/controllers/userController.ts
init_notificationService();
init_db();
init_schema();
var import_drizzle_orm35 = require("drizzle-orm");

// server/repositories/depositRepository.ts
var import_drizzle_orm29 = require("drizzle-orm");
init_db();
init_schema();
var DepositRepository = class {
  /**
   * Find a deposit by its unique sequential database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(deposits).where((0, import_drizzle_orm29.eq)(deposits.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findById) failed:", error);
      throw new Error("Failed to retrieve deposit from database.");
    }
  }
  /**
   * Find a deposit by its unique human-readable reference number
   */
  async findByReference(referenceNumber) {
    try {
      const result = await db.select().from(deposits).where((0, import_drizzle_orm29.eq)(deposits.referenceNumber, referenceNumber));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByReference) failed:", error);
      throw new Error("Failed to retrieve deposit from database.");
    }
  }
  /**
   * Find a deposit by its unique blockchain transaction hash to prevent double credits
   */
  async findByTxHash(txHash) {
    try {
      const result = await db.select().from(deposits).where((0, import_drizzle_orm29.eq)(deposits.txHash, txHash));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByTxHash) failed:", error);
      throw new Error("Failed to retrieve deposit from database.");
    }
  }
  /**
   * Get deposits for a specific user with pagination and optional status filter
   */
  async findByUserId(userId, options) {
    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      let query = db.select().from(deposits).$dynamic();
      const conditions = [(0, import_drizzle_orm29.eq)(deposits.userId, userId)];
      if (status) {
        conditions.push((0, import_drizzle_orm29.eq)(deposits.status, status));
      }
      const result = await query.where((0, import_drizzle_orm29.and)(...conditions)).orderBy((0, import_drizzle_orm29.desc)(deposits.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to query user deposits.");
    }
  }
  /**
   * Create a new deposit record
   */
  async createDeposit(data) {
    try {
      const result = await db.insert(deposits).values({
        userId: data.userId,
        walletId: data.walletId,
        referenceNumber: data.referenceNumber,
        amount: data.amount,
        status: data.status || "PENDING",
        txHash: data.txHash || null,
        network: data.network,
        depositAddress: data.depositAddress,
        adminNotes: data.adminNotes || null
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createDeposit) failed:", error);
      throw new Error("Failed to record deposit in database.");
    }
  }
  /**
   * Update deposit status
   */
  async updateStatus(id, status, updates) {
    try {
      const result = await db.update(deposits).set({
        status,
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm29.eq)(deposits.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateStatus) failed:", error);
      throw new Error("Failed to update deposit status.");
    }
  }
  /**
   * Get all deposits (with filters and pagination) for administrative panel
   */
  async findAll(options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      let query = db.select().from(deposits).$dynamic();
      if (status) {
        query = query.where((0, import_drizzle_orm29.eq)(deposits.status, status));
      }
      const result = await query.orderBy((0, import_drizzle_orm29.desc)(deposits.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve deposits ledger.");
    }
  }
};
var depositRepository = new DepositRepository();

// server/blockchain/services/DepositService.ts
init_walletRepository();
init_transactionRepository();
init_referralRepository();
init_notificationService();
init_vipService();
init_auditRepository();

// server/blockchain/providers/TatumProvider.ts
var import_crypto3 = __toESM(require("crypto"), 1);

// server/blockchain/config/blockchainConfig.ts
var dotenv3 = __toESM(require("dotenv"), 1);
dotenv3.config();
var rawEnv = process.env.BLOCKCHAIN_ENV?.trim().toLowerCase();
if (!rawEnv) {
  throw new Error(
    "[blockchainConfig] Critical Configuration Error: BLOCKCHAIN_ENV environment variable is missing or empty. You must explicitly set BLOCKCHAIN_ENV to 'production', 'sandbox', 'testnet', or 'development' in your environment configuration."
  );
}
var blockchainEnv;
var isTestnet;
if (rawEnv === "production" || rawEnv === "mainnet") {
  blockchainEnv = "production";
  isTestnet = false;
} else if (rawEnv === "sandbox" || rawEnv === "testnet") {
  blockchainEnv = "sandbox";
  isTestnet = true;
} else if (rawEnv === "development") {
  blockchainEnv = "development";
  isTestnet = true;
} else {
  throw new Error(
    `[blockchainConfig] Critical Configuration Error: Invalid BLOCKCHAIN_ENV value '${process.env.BLOCKCHAIN_ENV}'. Allowed values are 'production', 'sandbox', 'testnet', or 'development'.`
  );
}
var apiKey = process.env.TATUM_API_KEY || "";
var baseUrl = process.env.TATUM_BASE_URL || "https://api.tatum.io";
var blockchainConfig = {
  env: blockchainEnv,
  baseUrl,
  apiKey,
  isConfigured: !!apiKey,
  isTestnet,
  networks: {
    USDT_BEP20: {
      contractAddress: process.env.USDT_BEP20_CONTRACT || process.env.USDT_CONTRACT || (isTestnet ? "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd" : "0x55d398326f99059ff775485246999027b3197955"),
      xpub: process.env.USDT_BEP20_XPUB || process.env.USDT_XPUB || "",
      hotPrivateKey: process.env.USDT_BEP20_HOT_PRIVATE_KEY || process.env.HOT_WALLET_PRIVATE_KEY || "",
      hotAddress: process.env.USDT_BEP20_HOT_ADDRESS || process.env.HOT_WALLET_ADDRESS || "",
      chainName: "BSC",
      decimals: parseInt(process.env.USDT_BEP20_DECIMALS || process.env.USDT_DECIMALS || "18", 10)
    },
    USDT_POLYGON: {
      contractAddress: process.env.USDT_POLYGON_CONTRACT || (isTestnet ? "0x41e94eb019c0762f9bfcf9fb1e58725bfb01728b" : "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"),
      xpub: process.env.USDT_POLYGON_XPUB || "",
      hotPrivateKey: process.env.USDT_POLYGON_HOT_PRIVATE_KEY || "",
      hotAddress: process.env.USDT_POLYGON_HOT_ADDRESS || "",
      chainName: "POLYGON",
      decimals: parseInt(process.env.USDT_POLYGON_DECIMALS || "6", 10)
    },
    USDT_TRC20: {
      contractAddress: process.env.USDT_TRC20_CONTRACT || (isTestnet ? "TXYZdfUrW2Dx79gSStj7Q47S8oexuF3pC3" : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
      xpub: process.env.USDT_TRC20_XPUB || "",
      hotPrivateKey: process.env.USDT_TRC20_HOT_PRIVATE_KEY || "",
      hotAddress: process.env.USDT_TRC20_HOT_ADDRESS || "",
      chainName: "TRON",
      decimals: parseInt(process.env.USDT_TRC20_DECIMALS || "6", 10)
    }
  }
};

// server/blockchain/errors/BlockchainError.ts
var BlockchainError = class extends Error {
  constructor(message, code = "BLOCKCHAIN_ERROR") {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
};
var ProviderError = class extends BlockchainError {
  constructor(message, statusCode, code = "PROVIDER_ERROR") {
    super(message, code);
    this.statusCode = statusCode;
  }
};

// server/blockchain/utils/amountUtils.ts
function formatTokenAmount(rawBigInt, decimals = 18) {
  if (rawBigInt <= 0n) return "0.00000000";
  const divisor = BigInt(10 ** decimals);
  const integerPart = rawBigInt / divisor;
  const remainderPart = rawBigInt % divisor;
  if (remainderPart === 0n) {
    return `${integerPart.toString()}.00000000`;
  }
  let remainderStr = remainderPart.toString().padStart(decimals, "0");
  if (decimals > 8) {
    remainderStr = remainderStr.slice(0, 8);
  } else if (decimals < 8) {
    remainderStr = remainderStr.padEnd(8, "0");
  }
  return `${integerPart.toString()}.${remainderStr}`;
}
function normalizeAmount(rawAmount, decimals = 18) {
  if (rawAmount === void 0 || rawAmount === null || rawAmount === "") {
    return "0.00000000";
  }
  const strAmount = String(rawAmount).trim();
  if (strAmount.startsWith("0x") || strAmount.startsWith("0X")) {
    try {
      return formatTokenAmount(BigInt(strAmount), decimals);
    } catch (_) {
      return "0.00000000";
    }
  }
  if (!strAmount.includes(".") && !strAmount.includes("e") && !strAmount.includes("E")) {
    try {
      const rawBigInt = BigInt(strAmount);
      const threshold = BigInt(10 ** Math.max(0, decimals - 2));
      if (rawBigInt > threshold) {
        return formatTokenAmount(rawBigInt, decimals);
      }
    } catch (_) {
    }
  }
  const parsed = parseFloat(strAmount);
  if (isNaN(parsed) || parsed <= 0) return "0.00000000";
  return parsed.toFixed(8);
}

// server/blockchain/providers/TatumProvider.ts
var TatumProvider = class {
  constructor() {
    this.apiKey = blockchainConfig.apiKey;
    this.isConfigured = blockchainConfig.isConfigured;
    if (!this.isConfigured) {
      console.warn("[TatumProvider] Tatum API key is missing. Running in simulation mode with deterministic address/transaction fallbacks.");
    }
  }
  /**
   * Helper to perform GET requests with proper Tatum headers
   */
  async getRequest(path2) {
    const url = `${blockchainConfig.baseUrl}${path2}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(`Tatum API request failed on ${path2}: Status ${response.status} - ${errorText}`, response.status);
    }
    return response.json();
  }
  /**
   * Helper to perform POST requests with proper Tatum headers
   */
  async postRequest(path2, body) {
    const url = `${blockchainConfig.baseUrl}${path2}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(`Tatum API POST request failed on ${path2}: Status ${response.status} - ${errorText}`, response.status);
    }
    return response.json();
  }
  /**
   * Automatically generate permanent deposit addresses based on derivation index.
   */
  async generateDepositAddress(network, derivationIndex) {
    const netConfig = blockchainConfig.networks[network];
    const xpub = netConfig?.xpub;
    if (this.isConfigured && xpub) {
      try {
        let tatumPath = "";
        if (network === "USDT_BEP20") {
          tatumPath = `/v3/bsc/address/${xpub}/${derivationIndex}`;
        } else if (network === "USDT_POLYGON") {
          tatumPath = `/v3/polygon/address/${xpub}/${derivationIndex}`;
        } else if (network === "USDT_TRC20") {
          tatumPath = `/v3/tron/address/${xpub}/${derivationIndex}`;
        }
        if (tatumPath) {
          console.log(`[TatumProvider] Generating address on-chain via path: ${tatumPath}`);
          const result = await this.getRequest(tatumPath);
          if (result && result.address) {
            return result.address;
          }
        }
      } catch (error) {
        console.error(`[TatumProvider] Tatum address generation failed for network ${network} index ${derivationIndex}:`, error.message);
      }
    }
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes("TRC20")) {
      const hash = import_crypto3.default.createHash("sha256").update(`tron:${derivationIndex}`).digest("hex");
      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let derived = "T";
      for (let i = 0; i < 33; i++) {
        const index21 = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % chars.length;
        derived += chars[index21];
      }
      return derived;
    } else {
      const hash = import_crypto3.default.createHash("sha256").update(`evm:${network}:${derivationIndex}`).digest("hex");
      return `0x${hash.slice(0, 40)}`;
    }
  }
  /**
   * Retrieve current blockchain height to calculate confirmations
   */
  async getCurrentBlockHeight(network) {
    if (!this.isConfigured) return 100;
    try {
      if (network === "USDT_BEP20") {
        const res = await this.getRequest("/v3/bsc/block/current");
        return res.blockNumber;
      } else if (network === "USDT_POLYGON") {
        const res = await this.getRequest("/v3/polygon/block/current");
        return res.blockNumber;
      } else if (network === "USDT_TRC20") {
        const res = await this.getRequest("/v3/tron/info");
        return res.blockNumber;
      }
    } catch (e) {
      console.error(`[TatumProvider] Failed to get current block height for ${network}:`, e.message);
    }
    return 100;
  }
  /**
   * Query token balance on-chain
   */
  async getBalance(network, address) {
    if (!this.isConfigured) return "0.00000000";
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig) return "0.00000000";
    try {
      const chain = netConfig.chainName;
      const contract = netConfig.contractAddress;
      const path2 = `/v3/blockchain/token/balance/${chain}/${contract}/${address}`;
      const result = await this.getRequest(path2);
      return result?.balance || "0.00000000";
    } catch (err) {
      console.error(`[TatumProvider] Failed to get balance for ${address} on ${network}:`, err.message);
      return "0.00000000";
    }
  }
  /**
   * Validate blockchain address format
   */
  async validateAddress(network, address) {
    if (!address) return false;
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes("TRC20")) {
      return address.startsWith("T") && address.length === 34;
    } else {
      return address.startsWith("0x") && address.length === 42;
    }
  }
  /**
   * Verify and fetch transaction details
   */
  async getTransaction(network, txHash) {
    if (this.isConfigured) {
      try {
        const netConfig = blockchainConfig.networks[network];
        let chain = netConfig?.chainName || "BSC";
        const decimals = netConfig?.decimals ?? (network === "USDT_BEP20" ? 18 : 6);
        try {
          const tokenTxUrl = `/v3/blockchain/token/transaction/${chain}/${txHash}`;
          const parsedTx = await this.getRequest(tokenTxUrl);
          if (parsedTx) {
            const blockHeight = await this.getCurrentBlockHeight(network);
            const txBlock = parsedTx.blockNumber || blockHeight;
            const confirmations = blockHeight - txBlock + 1;
            return {
              hash: txHash,
              amount: normalizeAmount(parsedTx.amount || parsedTx.value || "0", decimals),
              sender: parsedTx.from || "",
              receiver: parsedTx.to || "",
              confirmations: Math.max(1, confirmations),
              isSuccessful: true
            };
          }
        } catch (tokenErr) {
          console.log(`[TatumProvider] Structured token transfer lookup failed or not found for ${txHash}. Trying raw transaction lookup.`);
        }
        let rawTxUrl = "";
        if (network === "USDT_BEP20") {
          rawTxUrl = `/v3/bsc/transaction/${txHash}`;
        } else if (network === "USDT_POLYGON") {
          rawTxUrl = `/v3/polygon/transaction/${txHash}`;
        } else if (network === "USDT_TRC20") {
          rawTxUrl = `/v3/tron/transaction/${txHash}`;
        }
        if (rawTxUrl) {
          const rawTx = await this.getRequest(rawTxUrl);
          if (rawTx) {
            const blockHeight = await this.getCurrentBlockHeight(network);
            const txBlock = rawTx.blockNumber || rawTx.block_num || blockHeight;
            const confirmations = blockHeight - txBlock + 1;
            const isSuccess = rawTx.status === true || rawTx.status === 1 || rawTx.status === void 0;
            let from = rawTx.from || "";
            let to = rawTx.to || "";
            let amount = "0.00000000";
            const logs = rawTx.logs || rawTx.log || [];
            for (const log of logs) {
              const topics = log.topics || [];
              if (topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
                if (topics[1]) from = "0x" + topics[1].slice(-40);
                if (topics[2]) to = "0x" + topics[2].slice(-40);
                if (log.data && log.data !== "0x") {
                  const hexVal = log.data.replace(/^0x/, "");
                  if (hexVal) {
                    try {
                      const rawBigInt = BigInt("0x" + hexVal);
                      amount = formatTokenAmount(rawBigInt, decimals);
                    } catch (err) {
                      console.error("[TatumProvider] Error parsing BigInt token transfer amount:", err);
                    }
                  }
                }
              }
            }
            return {
              hash: txHash,
              amount: amount !== "0.00000000" ? amount : normalizeAmount(rawTx.value || "0", decimals),
              sender: from,
              receiver: to,
              confirmations: Math.max(1, confirmations),
              isSuccessful: isSuccess
            };
          }
        }
      } catch (error) {
        console.error(`[TatumProvider] Tatum query failed for tx ${txHash} on ${network}:`, error.message);
      }
    }
    if (txHash.startsWith("SIM_DEP_")) {
      const parts = txHash.split("_");
      const amount = parts[2] || "100.00000000";
      return {
        hash: txHash,
        amount: parseFloat(amount).toFixed(8),
        sender: "0xsenderaddresssimulatedforusdttransfer",
        receiver: "0xreceiveraddresssimulatedforusdttransfer",
        confirmations: 12,
        isSuccessful: true
      };
    }
    return null;
  }
  /**
   * Fetch native blockchain balance (BNB, MATIC, TRX)
   */
  async getNativeBalance(network, address) {
    if (this.isConfigured) {
      try {
        let path2 = "";
        if (network === "USDT_BEP20") {
          path2 = `/v3/bsc/account/balance/${address}`;
          const res = await this.getRequest(path2);
          return res.balance || "0.00000000";
        } else if (network === "USDT_POLYGON") {
          path2 = `/v3/polygon/account/balance/${address}`;
          const res = await this.getRequest(path2);
          return res.balance || "0.00000000";
        } else if (network === "USDT_TRC20") {
          path2 = `/v3/tron/account/${address}`;
          const res = await this.getRequest(path2);
          const sun = res.balance || 0;
          return (sun / 1e6).toFixed(6);
        }
      } catch (err) {
        console.error(`[TatumProvider] Failed to get native balance for ${address}:`, err.message);
      }
    }
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { depositAddresses: depositAddresses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq26 } = await import("drizzle-orm");
      const dbAddr = await db2.select().from(depositAddresses2).where(eq26(depositAddresses2.address, address)).limit(1);
      if (dbAddr.length > 0) {
        return dbAddr[0].nativeBalance || "0.00000000";
      }
    } catch (dbErr) {
      console.error("[TatumProvider] Database query for native balance failed:", dbErr.message);
    }
    return "0.00000000";
  }
  /**
   * Fund native gas to deposit address from hot/treasury wallet
   */
  async fundGas(network, toAddress, amount) {
    const netConfig = blockchainConfig.networks[network];
    const chain = netConfig?.chainName || "BSC";
    const signingKey = netConfig?.hotPrivateKey || "";
    if (this.isConfigured && signingKey) {
      try {
        let path2 = "";
        let body = {};
        if (network === "USDT_BEP20") {
          path2 = "/v3/bsc/transaction";
          body = {
            to: toAddress,
            currency: "BNB",
            amount,
            fromPrivateKey: signingKey
          };
        } else if (network === "USDT_POLYGON") {
          path2 = "/v3/polygon/transaction";
          body = {
            to: toAddress,
            currency: "MATIC",
            amount,
            fromPrivateKey: signingKey
          };
        } else if (network === "USDT_TRC20") {
          path2 = "/v3/tron/transaction";
          body = {
            to: toAddress,
            amount,
            fromPrivateKey: signingKey
          };
        }
        if (path2) {
          console.log(`[TatumProvider] Broadcasting gas funding on ${network} to ${toAddress}, amount: ${amount}`);
          const result = await this.postRequest(path2, body);
          if (result && result.txId) {
            return result.txId;
          }
        }
      } catch (error) {
        console.error(`[TatumProvider] On-chain gas funding failed on ${network}:`, error.message);
        throw error;
      }
    }
    const txHash = "0x" + import_crypto3.default.randomBytes(32).toString("hex");
    console.log(`[TatumProvider] [SIMULATION ONLY] Native Gas Funding of ${amount} on ${network} to ${toAddress}. Generated txHash: ${txHash}`);
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { depositAddresses: depositAddresses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq26 } = await import("drizzle-orm");
      const dbAddr = await db2.select().from(depositAddresses2).where(eq26(depositAddresses2.address, toAddress)).limit(1);
      if (dbAddr.length > 0) {
        const currentNative = parseFloat(dbAddr[0].nativeBalance || "0.00000000");
        const newNative = (currentNative + parseFloat(amount)).toFixed(8);
        await db2.update(depositAddresses2).set({
          nativeBalance: newNative,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq26(depositAddresses2.id, dbAddr[0].id));
      }
    } catch (dbErr) {
      console.error("[TatumProvider] Failed to update simulated native balance in database:", dbErr.message);
    }
    return txHash;
  }
  /**
   * Automated transfer / broadcast of withdrawals to user's destination wallet.
   */
  async broadcastTransaction(network, toAddress, amount, fromPrivateKey) {
    const netConfig = blockchainConfig.networks[network];
    const contract = netConfig?.contractAddress;
    const chain = netConfig?.chainName || "BSC";
    const signingKey = fromPrivateKey || netConfig?.hotPrivateKey || "";
    if (this.isConfigured && signingKey && contract) {
      try {
        const requestBody = {
          chain,
          symbol: "USDT",
          to: toAddress,
          amount,
          contractAddress: contract,
          fromPrivateKey: signingKey
        };
        console.log(`[TatumProvider] Initiating direct token transfer on network ${network} to ${toAddress}, amount: ${amount}`);
        const result = await this.postRequest("/v3/blockchain/token/transaction", requestBody);
        if (result && result.txId) {
          return result.txId;
        }
      } catch (error) {
        console.error(`[TatumProvider] Tatum direct token transfer failed on network ${network}:`, error.message);
        throw error;
      }
    }
    const txHash = "0x" + import_crypto3.default.randomBytes(32).toString("hex");
    console.log(`[TatumProvider] [SIMULATION ONLY] USDT Transfer initiated on ${network} to ${toAddress} with amount ${amount}. Generated txHash: ${txHash}`);
    return txHash;
  }
};

// server/blockchain/providers/index.ts
var activeBlockchainProvider = new TatumProvider();
var providers_default = activeBlockchainProvider;

// server/blockchain/services/DepositService.ts
init_db();
init_schema();
var import_drizzle_orm32 = require("drizzle-orm");

// server/blockchain/services/SweepQueueProcessor.ts
var import_drizzle_orm31 = require("drizzle-orm");
init_db();
init_schema();
init_auditRepository();

// server/blockchain/services/TreasuryService.ts
var import_drizzle_orm30 = require("drizzle-orm");
init_db();
init_schema();
init_auditRepository();

// server/blockchain/keys/KeyManager.ts
var import_crypto4 = __toESM(require("crypto"), 1);
var import_ethers = require("ethers");
var EnvSecretProvider = class {
  async getSecret(key) {
    return process.env[key] || null;
  }
};
var KeyManager = class {
  constructor(secretProvider) {
    this.secretProvider = secretProvider || new EnvSecretProvider();
  }
  /**
   * Sets a custom secret provider (e.g. Google Secret Manager, AWS Secrets Manager)
   * to satisfy requirement 11 (Future Secret Management) without changing TreasuryService.
   */
  setSecretProvider(provider) {
    this.secretProvider = provider;
  }
  /**
   * Helper to retrieve master keys securely.
   */
  async getMasterKey(network, type) {
    const cleanNetwork = network.toUpperCase();
    const envKey = `USDT_${cleanNetwork.replace("USDT_", "")}_${type}`;
    const value = await this.secretProvider.getSecret(envKey);
    return value || "";
  }
  /**
   * Derive a child public address for a network and index.
   */
  async deriveAddress(network, derivationIndex) {
    const xpub = await this.getMasterKey(network, "XPUB");
    if (!xpub) {
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }
    try {
      const wallet = import_ethers.HDNodeWallet.fromExtendedKey(xpub);
      const child = wallet.deriveChild(derivationIndex);
      return child.address;
    } catch (error) {
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }
  }
  /**
   * Derive a child private key for a network and index.
   * Private keys are NEVER stored in the database or logs.
   */
  async derivePrivateKey(network, derivationIndex) {
    const xpriv = await this.getMasterKey(network, "XPRIV");
    if (!xpriv) {
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }
    try {
      const wallet = import_ethers.HDNodeWallet.fromExtendedKey(xpriv);
      const child = wallet.deriveChild(derivationIndex);
      return child.privateKey;
    } catch (error) {
      console.warn(`[KeyManager] Invalid extended private key for ${network}. Using deterministic simulation key.`);
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }
  }
  /**
   * Helper to generate a deterministic fallback address (matching TatumProvider fallback logic)
   */
  generateDeterministicFallbackAddress(network, derivationIndex) {
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes("TRC20")) {
      const hash = import_crypto4.default.createHash("sha256").update(`tron:${derivationIndex}`).digest("hex");
      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let derived = "T";
      for (let i = 0; i < 33; i++) {
        const index21 = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % chars.length;
        derived += chars[index21];
      }
      return derived;
    } else {
      const hash = import_crypto4.default.createHash("sha256").update(`evm:${network}:${derivationIndex}`).digest("hex");
      return `0x${hash.slice(0, 40)}`;
    }
  }
  /**
   * Helper to generate a deterministic fallback private key for testing/simulation
   */
  generateDeterministicFallbackPrivateKey(network, derivationIndex) {
    const seed = `metafirm:${network}:private:${derivationIndex}`;
    const hash = import_crypto4.default.createHash("sha256").update(seed).digest("hex");
    return `0x${hash}`;
  }
};
var keyManager = new KeyManager();

// server/blockchain/services/TreasuryService.ts
var DEFAULT_TREASURY_CONFIGS = {
  USDT_BEP20: {
    network: "USDT_BEP20",
    hotAddress: "0xBE0c8838B296bc8e6307B2D26786a3449339e0E7",
    coldAddress: "0x9Be6F66a87754d924fD08873E47A70176D5Bf92b",
    autoSweepEnabled: true,
    autoSweepThreshold: "50.00000000"
  },
  USDT_POLYGON: {
    network: "USDT_POLYGON",
    hotAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
    coldAddress: "0x89205A0A3b2a2512f410529A98c39e8023e3E01a",
    autoSweepEnabled: true,
    autoSweepThreshold: "50.00000000"
  },
  USDT_TRC20: {
    network: "USDT_TRC20",
    hotAddress: "TYb4L7uC16X4G2GvT7vL7f8tYg1fQhZ9uD",
    coldAddress: "TFA1vL8uX5G3GvA4vM9tX5tEg9fHhK3vL",
    autoSweepEnabled: true,
    autoSweepThreshold: "50.00000000"
  }
};
var TreasuryService = class {
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
  }
  /**
   * Seed / retrieve the treasury configuration for a specific network
   */
  async getOrCreateTreasuryWallet(network) {
    const cleanNetwork = network.toUpperCase();
    const existing = await db.select().from(treasuryWallets).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, cleanNetwork)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const defaultConfig = DEFAULT_TREASURY_CONFIGS[cleanNetwork];
    if (!defaultConfig) {
      throw new Error(`Unsupported treasury blockchain network: ${network}`);
    }
    logger.info(`[TreasuryService] Seeding default treasury configuration for ${cleanNetwork}...`);
    const inserted = await db.insert(treasuryWallets).values({
      network: cleanNetwork,
      hotAddress: defaultConfig.hotAddress,
      coldAddress: defaultConfig.coldAddress,
      autoSweepEnabled: defaultConfig.autoSweepEnabled,
      autoSweepThreshold: defaultConfig.autoSweepThreshold,
      hotBalance: "0.00000000",
      coldBalance: "0.00000000"
    }).returning();
    return inserted[0];
  }
  /**
   * Initialize all default treasury wallet configurations if missing
   */
  async ensureAllTreasuryWallets() {
    for (const network of Object.keys(DEFAULT_TREASURY_CONFIGS)) {
      await this.getOrCreateTreasuryWallet(network);
    }
  }
  /**
   * Fetch complete treasury metrics and list of deposit addresses for a network
   */
  async getTreasuryOverview(network) {
    const walletConfig = await this.getOrCreateTreasuryWallet(network);
    const addresses = await db.select().from(depositAddresses).where((0, import_drizzle_orm30.eq)(depositAddresses.network, network)).orderBy((0, import_drizzle_orm30.desc)(depositAddresses.createdAt));
    let totalPendingSweep = 0;
    addresses.forEach((addr) => {
      totalPendingSweep += parseFloat(addr.onChainBalance);
    });
    let liveHotBalance = walletConfig.hotBalance;
    let liveColdBalance = walletConfig.coldBalance;
    try {
      const liveHot = await this.provider.getBalance(network, walletConfig.hotAddress);
      const liveCold = await this.provider.getBalance(network, walletConfig.coldAddress);
      if (liveHot !== "0.00000000" || liveCold !== "0.00000000") {
        await db.update(treasuryWallets).set({
          hotBalance: liveHot,
          coldBalance: liveCold,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, network));
        liveHotBalance = liveHot;
        liveColdBalance = liveCold;
      }
    } catch (err) {
      logger.warn(`[TreasuryService] Failed to fetch on-chain live hot/cold balances for ${network}: ${err.message}`);
    }
    return {
      config: walletConfig,
      totalPendingSweep: totalPendingSweep.toFixed(8),
      liveHotBalance,
      liveColdBalance,
      depositAddresses: addresses
    };
  }
  /**
   * Sweep funds from a specific user deposit address to the Hot Wallet (USER_TO_HOT)
   */
  async sweepUserDepositAddress(addressId, adminUid = "SYSTEM") {
    const addressRecord = await db.select().from(depositAddresses).where((0, import_drizzle_orm30.eq)(depositAddresses.id, addressId)).limit(1);
    if (addressRecord.length === 0) {
      throw new Error(`User deposit address record not found: ${addressId}`);
    }
    const addr = addressRecord[0];
    const amountFloat = parseFloat(addr.onChainBalance);
    if (amountFloat <= 0) {
      throw new Error(`Deposit address ${addr.address} has no positive balance to sweep.`);
    }
    const amountStr = addr.onChainBalance;
    const treasury = await this.getOrCreateTreasuryWallet(addr.network);
    logger.info(`[TreasuryService] Commencing sweep for address ${addr.address} (${amountStr} USDT) to Hot Wallet ${treasury.hotAddress}`);
    const job = await db.insert(treasurySweepJobs).values({
      network: addr.network,
      sourceAddress: addr.address,
      destinationAddress: treasury.hotAddress,
      sweepType: "USER_TO_HOT",
      amount: amountStr,
      status: "PENDING",
      attempts: 1
    }).returning();
    const jobId = job[0].id;
    try {
      await db.update(treasurySweepJobs).set({ status: "IN_PROGRESS", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
      if (addr.derivationIndex === null || addr.derivationIndex === void 0) {
        throw new Error(`Deposit address ${addr.address} does not have a derivation index assigned.`);
      }
      const childPrivateKey = await keyManager.derivePrivateKey(addr.network, addr.derivationIndex);
      const txHash = await this.provider.broadcastTransaction(
        addr.network,
        treasury.hotAddress,
        amountStr,
        childPrivateKey
      );
      await db.transaction(async (tx) => {
        await tx.update(treasurySweepJobs).set({
          status: "COMPLETED",
          txHash,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
        await tx.update(depositAddresses).set({
          onChainBalance: "0.00000000",
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(depositAddresses.id, addressId));
        const currentHotFloat = parseFloat(treasury.hotBalance);
        const newHotStr = (currentHotFloat + amountFloat).toFixed(8);
        await tx.update(treasuryWallets).set({
          hotBalance: newHotStr,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, addr.network));
      });
      logger.info(`[TreasuryService] Sweep COMPLETED for address ${addr.address}. TxHash: ${txHash}`);
      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: addr.userId,
        action: "TREASURY_SWEEP_USER_TO_HOT",
        resource: `treasury/jobs/${jobId}`,
        oldValue: amountStr,
        newValue: txHash
      });
      return { success: true, jobId, txHash };
    } catch (err) {
      logger.error(`[TreasuryService] Sweep FAILED for address ${addr.address}:`, err.message);
      await db.update(treasurySweepJobs).set({
        status: "FAILED",
        errorMessage: err.message,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
      return { success: false, jobId, error: err.message };
    }
  }
  /**
   * Sweep ALL eligible deposit addresses on a selected network
   */
  async sweepAllEligibleAddresses(network, adminUid = "SYSTEM") {
    const cleanNetwork = network.toUpperCase();
    const addresses = await db.select().from(depositAddresses).where(
      (0, import_drizzle_orm30.and)(
        (0, import_drizzle_orm30.eq)(depositAddresses.network, cleanNetwork),
        import_drizzle_orm30.sql`CAST(${depositAddresses.onChainBalance} AS DECIMAL) > 0`
      )
    );
    logger.info(`[TreasuryService] Found ${addresses.length} eligible addresses with positive balance for ${cleanNetwork}`);
    const results = [];
    for (const addr of addresses) {
      const res = await this.sweepUserDepositAddress(addr.id, adminUid);
      results.push({ address: addr.address, ...res });
    }
    return results;
  }
  /**
   * Transfer funds from Hot Wallet to Cold Wallet (HOT_TO_COLD)
   */
  async sweepHotToCold(network, amount, adminUid = "SYSTEM") {
    const cleanNetwork = network.toUpperCase();
    const treasury = await this.getOrCreateTreasuryWallet(cleanNetwork);
    const amountFloat = parseFloat(amount);
    if (amountFloat <= 0) {
      throw new Error("Transfer amount to cold wallet must be strictly positive.");
    }
    const currentHotFloat = parseFloat(treasury.hotBalance);
    if (currentHotFloat < amountFloat) {
      throw new Error(`Insufficient Hot Wallet balance. Available: ${treasury.hotBalance} USDT, Requested: ${amount} USDT`);
    }
    logger.info(`[TreasuryService] Commencing sweep from Hot Wallet (${treasury.hotAddress}) to Cold Wallet (${treasury.coldAddress}) of ${amount} USDT`);
    const job = await db.insert(treasurySweepJobs).values({
      network: cleanNetwork,
      sourceAddress: treasury.hotAddress,
      destinationAddress: treasury.coldAddress,
      sweepType: "HOT_TO_COLD",
      amount,
      status: "PENDING",
      attempts: 1
    }).returning();
    const jobId = job[0].id;
    try {
      await db.update(treasurySweepJobs).set({ status: "IN_PROGRESS", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
      const txHash = await this.provider.broadcastTransaction(cleanNetwork, treasury.coldAddress, amount);
      await db.transaction(async (tx) => {
        await tx.update(treasurySweepJobs).set({
          status: "COMPLETED",
          txHash,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
        const newHotStr = (currentHotFloat - amountFloat).toFixed(8);
        const currentColdFloat = parseFloat(treasury.coldBalance);
        const newColdStr = (currentColdFloat + amountFloat).toFixed(8);
        await tx.update(treasuryWallets).set({
          hotBalance: newHotStr,
          coldBalance: newColdStr,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, cleanNetwork));
      });
      logger.info(`[TreasuryService] Hot to Cold Sweep COMPLETED. TxHash: ${txHash}`);
      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null,
        // Not bound to any specific user
        action: "TREASURY_SWEEP_HOT_TO_COLD",
        resource: `treasury/jobs/${jobId}`,
        oldValue: amount,
        newValue: txHash
      });
      return { success: true, jobId, txHash };
    } catch (err) {
      logger.error(`[TreasuryService] Hot to Cold Sweep FAILED:`, err.message);
      await db.update(treasurySweepJobs).set({
        status: "FAILED",
        errorMessage: err.message,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
      return { success: false, jobId, error: err.message };
    }
  }
  /**
   * Retry a failed sweep job
   */
  async retrySweepJob(jobId, adminUid = "SYSTEM") {
    const jobRecord = await db.select().from(treasurySweepJobs).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId)).limit(1);
    if (jobRecord.length === 0) {
      throw new Error(`Sweep job record not found: ${jobId}`);
    }
    const job = jobRecord[0];
    if (job.status !== "FAILED") {
      throw new Error(`Only failed sweep jobs can be retried. Current status is: ${job.status}`);
    }
    logger.info(`[TreasuryService] Retrying failed sweep job ${jobId} of ${job.amount} USDT on ${job.network}`);
    await db.update(treasurySweepJobs).set({
      attempts: job.attempts + 1,
      status: "IN_PROGRESS",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
    try {
      const txHash = await this.provider.broadcastTransaction(job.network, job.destinationAddress, job.amount);
      await db.transaction(async (tx) => {
        await tx.update(treasurySweepJobs).set({
          status: "COMPLETED",
          txHash,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
        const amountFloat = parseFloat(job.amount);
        const treasury = await this.getOrCreateTreasuryWallet(job.network);
        if (job.sweepType === "USER_TO_HOT") {
          const addrRecord = await tx.select().from(depositAddresses).where(
            (0, import_drizzle_orm30.and)(
              (0, import_drizzle_orm30.eq)(depositAddresses.address, job.sourceAddress),
              (0, import_drizzle_orm30.eq)(depositAddresses.network, job.network)
            )
          ).limit(1);
          if (addrRecord.length > 0) {
            await tx.update(depositAddresses).set({
              onChainBalance: "0.00000000",
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm30.eq)(depositAddresses.id, addrRecord[0].id));
          }
          const newHotStr = (parseFloat(treasury.hotBalance) + amountFloat).toFixed(8);
          await tx.update(treasuryWallets).set({
            hotBalance: newHotStr,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, job.network));
        } else if (job.sweepType === "HOT_TO_COLD") {
          const newHotStr = (parseFloat(treasury.hotBalance) - amountFloat).toFixed(8);
          const newColdStr = (parseFloat(treasury.coldBalance) + amountFloat).toFixed(8);
          await tx.update(treasuryWallets).set({
            hotBalance: newHotStr,
            coldBalance: newColdStr,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, job.network));
        }
      });
      logger.info(`[TreasuryService] Retry for job ${jobId} completed successfully! TxHash: ${txHash}`);
      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null,
        action: "TREASURY_SWEEP_RETRY_SUCCESS",
        resource: `treasury/jobs/${jobId}`,
        oldValue: job.attempts.toString(),
        newValue: txHash
      });
      return { success: true, txHash };
    } catch (err) {
      logger.error(`[TreasuryService] Retry for job ${jobId} failed:`, err.message);
      await db.update(treasurySweepJobs).set({
        status: "FAILED",
        errorMessage: err.message,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm30.eq)(treasurySweepJobs.id, jobId));
      return { success: false, error: err.message };
    }
  }
  /**
   * Trigger threshold check on a specific deposit address. If conditions are met, sweep automatically.
   */
  async checkAndTriggerAutoSweep(addressId) {
    try {
      const addressRecord = await db.select().from(depositAddresses).where((0, import_drizzle_orm30.eq)(depositAddresses.id, addressId)).limit(1);
      if (addressRecord.length === 0) return;
      const addr = addressRecord[0];
      const treasury = await this.getOrCreateTreasuryWallet(addr.network);
      if (!treasury.autoSweepEnabled) {
        logger.debug(`[TreasuryService] Auto-sweep is disabled for network ${addr.network}`);
        return;
      }
      const balanceFloat = parseFloat(addr.onChainBalance);
      const thresholdFloat = parseFloat(treasury.autoSweepThreshold);
      if (balanceFloat >= thresholdFloat) {
        logger.info(`[TreasuryService] Auto-sweep triggered! Address ${addr.address} balance ${balanceFloat} USDT >= threshold ${thresholdFloat} USDT`);
        await this.sweepUserDepositAddress(addr.id, "SYSTEM");
      }
    } catch (err) {
      logger.error(`[TreasuryService] Failed to check / trigger auto-sweep for address ${addressId}:`, err.message);
    }
  }
  /**
   * Update auto-sweep configurations for a network
   */
  async updateAutoSweepConfig(network, enabled, threshold, adminUid = "SYSTEM") {
    const cleanNetwork = network.toUpperCase();
    await this.getOrCreateTreasuryWallet(cleanNetwork);
    const updated = await db.update(treasuryWallets).set({
      autoSweepEnabled: enabled,
      autoSweepThreshold: threshold,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm30.eq)(treasuryWallets.network, cleanNetwork)).returning();
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: null,
      action: "TREASURY_AUTO_SWEEP_CONFIG_UPDATE",
      resource: `treasury/config/${cleanNetwork}`,
      oldValue: JSON.stringify({ enabled: !enabled }),
      newValue: JSON.stringify({ enabled, threshold })
    });
    return updated[0];
  }
  /**
   * Get list of all sweep jobs
   */
  async getSweepJobs(network) {
    const query = db.select().from(treasurySweepJobs);
    if (network) {
      const cleanNetwork = network.toUpperCase();
      return query.where((0, import_drizzle_orm30.eq)(treasurySweepJobs.network, cleanNetwork)).orderBy((0, import_drizzle_orm30.desc)(treasurySweepJobs.createdAt));
    }
    return query.orderBy((0, import_drizzle_orm30.desc)(treasurySweepJobs.createdAt));
  }
};
var treasuryService = new TreasuryService();

// server/blockchain/services/SweepQueueProcessor.ts
var MIN_GAS_REQUIRED = {
  USDT_BEP20: "0.005",
  // BNB
  USDT_POLYGON: "0.1",
  // MATIC/POL
  USDT_TRC20: "15.0"
  // TRX
};
var GAS_FUND_AMOUNT = {
  USDT_BEP20: "0.005",
  USDT_POLYGON: "0.1",
  USDT_TRC20: "20.0"
};
var SweepQueueProcessor = class {
  // Prevent concurrent operations on the same address/wallet
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
    this.intervalId = null;
    this.isProcessing = false;
    this.activeLocks = /* @__PURE__ */ new Set();
  }
  /**
   * Start the background sweep queue worker
   */
  start() {
    if (this.intervalId) return;
    logger.info("[SweepQueueProcessor] Starting background sweep queue processing loop...");
    this.intervalId = setInterval(() => this.processQueue(), 2e4);
  }
  /**
   * Stop the background sweep queue worker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("[SweepQueueProcessor] Background sweep queue loop stopped.");
    }
  }
  /**
   * Main state-machine processing loop
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      const activeItems = await db.select().from(sweepQueue).where(
        (0, import_drizzle_orm31.or)(
          (0, import_drizzle_orm31.eq)(sweepQueue.status, "PENDING"),
          (0, import_drizzle_orm31.eq)(sweepQueue.status, "WAITING_DELAY"),
          (0, import_drizzle_orm31.eq)(sweepQueue.status, "WAITING_GAS"),
          (0, import_drizzle_orm31.eq)(sweepQueue.status, "GAS_FUNDING"),
          (0, import_drizzle_orm31.eq)(sweepQueue.status, "READY_TO_SWEEP")
        )
      );
      for (const item of activeItems) {
        if (this.activeLocks.has(item.depositAddress)) {
          continue;
        }
        this.activeLocks.add(item.depositAddress);
        try {
          await this.processQueueItem(item);
        } catch (err) {
          logger.error(`[SweepQueueProcessor] Failed to process queue item ${item.id}:`, err.message);
        } finally {
          this.activeLocks.delete(item.depositAddress);
        }
      }
    } catch (error) {
      logger.error("[SweepQueueProcessor] Error in queue processing loop:", error.message);
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Process a single queue item based on its status
   */
  async processQueueItem(item) {
    const treasury = await treasuryService.getOrCreateTreasuryWallet(item.network);
    if (treasury.paused) {
      logger.debug(`[SweepQueueProcessor] Sweeps are paused for network ${item.network}. Skipping item ${item.id}`);
      return;
    }
    const mode = treasury.sweepMode || "AUTOMATIC";
    const amountFloat = parseFloat(item.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || "1.00000000");
    if (amountFloat < thresholdFloat) {
      if (item.status !== "PENDING") {
        await db.update(sweepQueue).set({ status: "PENDING", gasStatus: "LOW", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, item.id));
      }
      return;
    }
    const now = /* @__PURE__ */ new Date();
    if (item.eligibleAt > now) {
      if (item.status !== "WAITING_DELAY") {
        await db.update(sweepQueue).set({ status: "WAITING_DELAY", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, item.id));
      }
      return;
    }
    const nativeBalStr = await this.provider.getNativeBalance(item.network, item.depositAddress);
    const nativeBal = parseFloat(nativeBalStr);
    const minGas = parseFloat(MIN_GAS_REQUIRED[item.network] || "0");
    const hasSufficientGas = nativeBal >= minGas;
    if (mode === "MANUAL") {
      const targetStatus = hasSufficientGas ? "READY_TO_SWEEP" : "WAITING_GAS";
      const targetGasStatus = hasSufficientGas ? "OK" : "LOW";
      if (item.status !== "PENDING" && item.status !== targetStatus) {
        await db.update(sweepQueue).set({
          status: "PENDING",
          gasStatus: targetGasStatus,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, item.id));
      }
      return;
    }
    switch (item.status) {
      case "PENDING":
      case "WAITING_DELAY":
        if (hasSufficientGas) {
          await this.transitionItem(item.id, "READY_TO_SWEEP", "OK");
        } else {
          await this.transitionItem(item.id, "WAITING_GAS", "LOW");
        }
        break;
      case "WAITING_GAS":
        if (hasSufficientGas) {
          await this.transitionItem(item.id, "READY_TO_SWEEP", "OK");
        } else {
          await this.fundGasForQueueItem(item.id, "SYSTEM");
        }
        break;
      case "GAS_FUNDING":
        if (hasSufficientGas) {
          await this.transitionItem(item.id, "READY_TO_SWEEP", "OK");
        } else {
          logger.debug(`[SweepQueueProcessor] Waiting for gas funding to reflect for ${item.depositAddress}. Current: ${nativeBalStr}`);
        }
        break;
      case "READY_TO_SWEEP":
        if (!hasSufficientGas) {
          await this.transitionItem(item.id, "WAITING_GAS", "LOW");
        } else {
          await this.sweepQueueItem(item.id, "SYSTEM");
        }
        break;
      default:
        break;
    }
  }
  /**
   * Helper to transition queue item states
   */
  async transitionItem(itemId, status, gasStatus, errorMessage) {
    await db.update(sweepQueue).set({
      status,
      gasStatus,
      errorMessage: errorMessage || null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
    logger.info(`[SweepQueueProcessor] Item ${itemId} transitioned to ${status} (Gas: ${gasStatus})`);
  }
  /**
   * Fund gas manually or automatically for a queue item
   */
  async fundGasForQueueItem(itemId, adminUid = "SYSTEM") {
    const itemRecord = await db.select().from(sweepQueue).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId)).limit(1);
    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }
    const item = itemRecord[0];
    if (item.status === "COMPLETED" || item.status === "CANCELLED") {
      throw new Error(`Cannot fund gas for item in status: ${item.status}`);
    }
    const fundAmount = GAS_FUND_AMOUNT[item.network];
    if (!fundAmount) {
      throw new Error(`Unsupported network for gas funding: ${item.network}`);
    }
    logger.info(`[SweepQueueProcessor] Initiating gas funding of ${fundAmount} for ${item.depositAddress} (${item.network})`);
    await db.update(sweepQueue).set({
      status: "GAS_FUNDING",
      gasStatus: "FUNDING_SENT",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
    try {
      const gasTxHash = await this.provider.fundGas(item.network, item.depositAddress, fundAmount);
      await db.update(sweepQueue).set({
        gasTxHash,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: item.userId,
        action: "TREASURY_GAS_FUNDING_SENT",
        resource: `sweepQueue/${itemId}`,
        oldValue: "0.00000000",
        newValue: JSON.stringify({ amount: fundAmount, txHash: gasTxHash })
      });
      logger.info(`[SweepQueueProcessor] Gas funding tx broadcasted: ${gasTxHash}`);
      return gasTxHash;
    } catch (err) {
      logger.error(`[SweepQueueProcessor] Gas funding FAILED for ${item.depositAddress}:`, err.message);
      await db.update(sweepQueue).set({
        status: "WAITING_GAS",
        gasStatus: "FAILED",
        errorMessage: `Gas funding failed: ${err.message}`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
      throw err;
    }
  }
  /**
   * Sweep a queue item manually or automatically
   */
  async sweepQueueItem(itemId, adminUid = "SYSTEM") {
    const itemRecord = await db.select().from(sweepQueue).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId)).limit(1);
    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }
    const item = itemRecord[0];
    if (item.status === "COMPLETED" || item.status === "CANCELLED") {
      throw new Error(`Cannot sweep item in status: ${item.status}`);
    }
    logger.info(`[SweepQueueProcessor] Initiating sweep for queue item ${itemId} (${item.amount} USDT)`);
    await db.update(sweepQueue).set({
      status: "SWEEPING",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
    try {
      const addrRec = await db.select().from(depositAddresses).where(
        (0, import_drizzle_orm31.and)(
          (0, import_drizzle_orm31.eq)(depositAddresses.address, item.depositAddress),
          (0, import_drizzle_orm31.eq)(depositAddresses.network, item.network)
        )
      ).limit(1);
      if (addrRec.length === 0) {
        throw new Error(`Deposit address record not found for address: ${item.depositAddress}`);
      }
      const sweepResult = await treasuryService.sweepUserDepositAddress(addrRec[0].id, adminUid);
      if (sweepResult.success && sweepResult.txHash) {
        await db.update(sweepQueue).set({
          status: "COMPLETED",
          sweepTxHash: sweepResult.txHash,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
        try {
          const spentGas = MIN_GAS_REQUIRED[item.network];
          const newNative = Math.max(0, parseFloat(addrRec[0].nativeBalance || "0") - parseFloat(spentGas)).toFixed(8);
          await db.update(depositAddresses).set({
            nativeBalance: newNative,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm31.eq)(depositAddresses.id, addrRec[0].id));
        } catch (gasErr) {
        }
        logger.info(`[SweepQueueProcessor] Sweep queue item ${itemId} COMPLETED. Tx: ${sweepResult.txHash}`);
        return sweepResult.txHash;
      } else {
        throw new Error(sweepResult.error || "Unknown sweep error");
      }
    } catch (err) {
      logger.error(`[SweepQueueProcessor] Sweep queue item ${itemId} FAILED:`, err.message);
      await db.update(sweepQueue).set({
        status: "FAILED",
        errorMessage: err.message,
        attempts: item.attempts + 1,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
      throw err;
    }
  }
  /**
   * Helper to calculate the eligible date based on Delay configuration
   */
  calculateEligibleAt(createdAt, delayConfig, customMinutes) {
    const date = new Date(createdAt);
    switch (delayConfig) {
      case "IMMEDIATE":
        return date;
      case "1_HOUR":
        date.setHours(date.getHours() + 1);
        return date;
      case "6_HOURS":
        date.setHours(date.getHours() + 6);
        return date;
      case "24_HOURS":
        date.setDate(date.getDate() + 1);
        return date;
      case "3_DAYS":
        date.setDate(date.getDate() + 3);
        return date;
      case "7_DAYS":
        date.setDate(date.getDate() + 7);
        return date;
      case "CUSTOM":
        date.setMinutes(date.getMinutes() + customMinutes);
        return date;
      case "MANUAL_ONLY":
        date.setFullYear(date.getFullYear() + 100);
        return date;
      default:
        return date;
    }
  }
  /**
   * Register a new deposit in the sweep queue
   */
  async registerDeposit(depositId) {
    const depRecord = await db.select().from(deposits).where((0, import_drizzle_orm31.eq)(deposits.id, depositId)).limit(1);
    if (depRecord.length === 0) return null;
    const deposit = depRecord[0];
    const existing = await db.select().from(sweepQueue).where((0, import_drizzle_orm31.eq)(sweepQueue.depositId, depositId)).limit(1);
    if (existing.length > 0) return existing[0];
    const treasury = await treasuryService.getOrCreateTreasuryWallet(deposit.network);
    const amountFloat = parseFloat(deposit.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || "1.00000000");
    let status = "PENDING";
    let eligibleAt = /* @__PURE__ */ new Date();
    if (amountFloat < thresholdFloat) {
      status = "PENDING";
    } else {
      const mode = treasury.sweepMode || "AUTOMATIC";
      if (mode === "MANUAL") {
        status = "PENDING";
      } else {
        eligibleAt = this.calculateEligibleAt(/* @__PURE__ */ new Date(), treasury.sweepDelay || "IMMEDIATE", treasury.customDelayMinutes || 0);
        if (eligibleAt > /* @__PURE__ */ new Date()) {
          status = "WAITING_DELAY";
        } else {
          const nativeBalStr = await this.provider.getNativeBalance(deposit.network, deposit.depositAddress);
          const nativeBal = parseFloat(nativeBalStr);
          const minGas = parseFloat(MIN_GAS_REQUIRED[deposit.network] || "0");
          status = nativeBal >= minGas ? "READY_TO_SWEEP" : "WAITING_GAS";
        }
      }
    }
    const inserted = await db.insert(sweepQueue).values({
      depositId: deposit.id,
      userId: deposit.userId,
      depositAddress: deposit.depositAddress,
      network: deposit.network,
      amount: deposit.amount,
      status,
      gasStatus: "LOW",
      // will be evaluated on first loop pass
      eligibleAt
    }).returning();
    logger.info(`[SweepQueueProcessor] Registered deposit ${deposit.id} into Sweep Queue in status ${status}`);
    if (status === "READY_TO_SWEEP" || status === "WAITING_GAS") {
      setTimeout(() => this.processQueue(), 100);
    }
    return inserted[0];
  }
  /**
   * Cancel or remove an item from the sweep queue
   */
  async cancelQueueItem(itemId, adminUid = "SYSTEM") {
    await db.update(sweepQueue).set({
      status: "CANCELLED",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm31.eq)(sweepQueue.id, itemId));
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: null,
      action: "TREASURY_SWEEP_CANCELLED",
      resource: `sweepQueue/${itemId}`,
      oldValue: "ACTIVE",
      newValue: "CANCELLED"
    });
  }
  /**
   * Bulk Operations
   */
  async bulkFundGas(itemIds, adminUid = "SYSTEM") {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.fundGasForQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
  async bulkSweep(itemIds, adminUid = "SYSTEM") {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
  async bulkFundAndSweep(itemIds, adminUid = "SYSTEM") {
    const results = [];
    for (const id of itemIds) {
      try {
        let txHashGas = "";
        try {
          txHashGas = await this.fundGasForQueueItem(id, adminUid);
        } catch (gasErr) {
        }
        const txHashSweep = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, gasTxHash: txHashGas, sweepTxHash: txHashSweep });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
};
var sweepQueueProcessor = new SweepQueueProcessor();

// server/blockchain/services/DepositService.ts
var DepositService = class {
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
  }
  /**
   * Initiate a pending deposit request
   */
  async createDeposit(userId, amount, network, depositAddress, txHash) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }
    if (parseFloat(amount) <= 0) {
      throw new Error("Deposit amount must be strictly positive.");
    }
    const randomDigits = Math.floor(1e7 + Math.random() * 9e7).toString();
    const referenceNumber = `DEP${randomDigits}`;
    const deposit = await depositRepository.createDeposit({
      userId,
      walletId: wallet.id,
      referenceNumber,
      amount,
      network,
      depositAddress,
      txHash,
      status: "PENDING"
    });
    return deposit;
  }
  /**
   * Complete and verify a pending deposit (e.g., from admin review or webhooks)
   */
  async processSuccessfulDeposit(depositId, txHash, adminUid) {
    const deposit = await depositRepository.findById(depositId);
    if (!deposit) {
      throw new Error(`Deposit record not found for ID: ${depositId}`);
    }
    if (deposit.status !== "PENDING") {
      throw new Error(`Deposit has already been processed with status: ${deposit.status}`);
    }
    const userId = deposit.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }
    const updatedDeposit = await depositRepository.updateStatus(depositId, "COMPLETED", {
      txHash: txHash || deposit.txHash || void 0,
      adminNotes: adminUid ? `Manually completed by admin ${adminUid}` : void 0
    });
    const depositAmount = parseFloat(deposit.amount);
    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + depositAmount;
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: deposit.amount,
      principalBalance: deposit.amount,
      totalDeposited: deposit.amount
    });
    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: "DEPOSIT",
      referenceId: deposit.id,
      status: "COMPLETED",
      description: `Successful deposit of ${deposit.amount} USDT via ${deposit.network}.`,
      amount: deposit.amount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: adminUid || "SYSTEM"
    });
    await notificationService.createStructuredNotification(userId, {
      title: "Deposit Successful",
      description: `Your deposit of ${deposit.amount} USDT has been credited successfully.`,
      icon: "ArrowDownCircle",
      type: "deposit",
      priority: "HIGH"
    });
    await auditRepository.createAuditLog({
      actorUid: adminUid || "SYSTEM",
      userId,
      action: "DEPOSIT_COMPLETED",
      resource: `deposits/${deposit.id}`,
      oldValue: "PENDING",
      newValue: JSON.stringify({ amount: deposit.amount, network: deposit.network, balanceAfter: balanceAfter.toFixed(8) })
    });
    await this.processReferralReward(userId, deposit.amount, deposit.id, adminUid || "SYSTEM");
    await vipService.recalculateVip(userId);
    try {
      const dbAddr = await db.select().from(depositAddresses).where(
        (0, import_drizzle_orm32.and)(
          (0, import_drizzle_orm32.eq)(depositAddresses.address, deposit.depositAddress),
          (0, import_drizzle_orm32.eq)(depositAddresses.network, deposit.network)
        )
      ).limit(1);
      if (dbAddr.length > 0) {
        const addressId = dbAddr[0].id;
        const currentOnChain = parseFloat(dbAddr[0].onChainBalance || "0.00000000");
        const newOnChain = (currentOnChain + depositAmount).toFixed(8);
        await db.update(depositAddresses).set({
          onChainBalance: newOnChain,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm32.eq)(depositAddresses.id, addressId));
        await sweepQueueProcessor.registerDeposit(depositId);
      }
    } catch (err) {
      console.error("[DepositService] Failed to update on-chain deposit address balance:", err.message);
    }
    return updatedDeposit;
  }
  /**
   * Internal helper to process referral rewards for upline parent
   */
  async processReferralReward(childId, depositAmountStr, depositId, actor) {
    try {
      const childWallet = await walletRepository.findByUserId(childId);
      if (!childWallet) return;
      const totalDepositedVal = parseFloat(childWallet.totalDeposited) + parseFloat(depositAmountStr);
      if (totalDepositedVal > parseFloat(depositAmountStr)) {
        return;
      }
      const relationship = await referralRepository.findRelationshipByChildId(childId);
      if (!relationship) {
        return;
      }
      const parentId = relationship.parentId;
      const parentWallet = await walletRepository.findByUserId(parentId);
      if (!parentWallet) return;
      const configKey = "REFERRAL_REWARD_PERCENTAGE";
      const configSetting = await settingsRepository.findSystemSettingByKey(configKey);
      const rewardRate = configSetting ? parseFloat(configSetting.value) : 0.1;
      const depositAmount = parseFloat(depositAmountStr);
      const rewardAmount = depositAmount * rewardRate;
      if (rewardAmount <= 0) return;
      const rewardAmountStr = rewardAmount.toFixed(8);
      const parentBalanceBefore = parseFloat(parentWallet.availableBalance);
      const parentBalanceAfter = parentBalanceBefore + rewardAmount;
      await walletRepository.incrementBalances(parentWallet.id, {
        availableBalance: rewardAmountStr,
        referralIncome: rewardAmountStr,
        totalEarned: rewardAmountStr
      });
      const parentTxn = await transactionRepository.createTransaction({
        userId: parentId,
        walletId: parentWallet.id,
        type: "REFERRAL_REWARD",
        referenceId: depositId,
        status: "COMPLETED",
        description: `Referral commission from first deposit of downline (Level ${relationship.referralLevel}).`,
        amount: rewardAmountStr,
        balanceBefore: parentBalanceBefore.toFixed(8),
        balanceAfter: parentBalanceAfter.toFixed(8),
        createdBy: actor
      });
      await referralRepository.createReferralIncome({
        userId: parentId,
        sourceUserId: childId,
        depositId,
        amount: rewardAmountStr,
        level: relationship.referralLevel,
        transactionId: parentTxn.id
      });
      await notificationService.createStructuredNotification(parentId, {
        title: "Referral Reward Received",
        description: `Congratulations! You received a referral reward of ${rewardAmountStr} USDT from a referred user's first deposit.`,
        icon: "Award",
        type: "referral",
        priority: "MEDIUM"
      });
      await auditRepository.createAuditLog({
        actorUid: actor,
        userId: parentId,
        action: "REFERRAL_REWARD_CREDITED",
        resource: `wallets/${parentWallet.id}`,
        newValue: JSON.stringify({ sourceUserId: childId, depositId, level: relationship.referralLevel, amount: rewardAmountStr })
      });
      await vipService.recalculateVip(parentId);
    } catch (err) {
      console.error(`Failed to process referral rewards for child ${childId}:`, err);
    }
  }
};
var depositService = new DepositService();

// server/services/depositService.ts
var depositService2 = depositService;

// server/services/blockchainProvider.ts
var TatumProvider2 = class {
  async generateAddress(network, derivationIndex) {
    return providers_default.generateDepositAddress(network, derivationIndex);
  }
  async getTransaction(network, txHash) {
    return providers_default.getTransaction(network, txHash);
  }
  async transferUSDT(network, toAddress, amount) {
    return providers_default.broadcastTransaction(network, toAddress, amount);
  }
};
var blockchainProvider = new TatumProvider2();

// server/controllers/userController.ts
init_transactionRepository();

// server/repositories/withdrawalRepository.ts
var import_drizzle_orm33 = require("drizzle-orm");
init_db();
init_schema();
var WithdrawalRepository = class {
  /**
   * Find a withdrawal by its unique sequential database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(withdrawals).where((0, import_drizzle_orm33.eq)(withdrawals.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findById) failed:", error);
      throw new Error("Failed to retrieve withdrawal from database.");
    }
  }
  /**
   * Find a withdrawal by its unique human-readable reference trace code
   */
  async findByReference(reference) {
    try {
      const result = await db.select().from(withdrawals).where((0, import_drizzle_orm33.eq)(withdrawals.reference, reference));
      return result[0] || null;
    } catch (error) {
      console.error("Database query (findByReference) failed:", error);
      throw new Error("Failed to retrieve withdrawal from database.");
    }
  }
  /**
   * Get withdrawals for a specific user with pagination and optional status filter
   */
  async findByUserId(userId, options) {
    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      let query = db.select().from(withdrawals).$dynamic();
      const conditions = [(0, import_drizzle_orm33.eq)(withdrawals.userId, userId)];
      if (status) {
        conditions.push((0, import_drizzle_orm33.eq)(withdrawals.status, status));
      }
      const result = await query.where((0, import_drizzle_orm33.and)(...conditions)).orderBy((0, import_drizzle_orm33.desc)(withdrawals.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findByUserId) failed:", error);
      throw new Error("Failed to query user withdrawals.");
    }
  }
  /**
   * Create a new withdrawal record
   */
  async createWithdrawal(data) {
    try {
      const result = await db.insert(withdrawals).values({
        userId: data.userId,
        walletId: data.walletId,
        amount: data.amount,
        fee: data.fee,
        netAmount: data.netAmount,
        walletAddress: data.walletAddress,
        network: data.network,
        reference: data.reference,
        status: data.status || "PENDING",
        adminApprovalStatus: data.adminApprovalStatus || "PENDING",
        adminNotes: data.adminNotes || null
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createWithdrawal) failed:", error);
      throw new Error("Failed to record withdrawal in database.");
    }
  }
  /**
   * Update withdrawal status, admin approvals, or transaction hashes
   */
  async updateStatus(id, status, updates) {
    try {
      const result = await db.update(withdrawals).set({
        status,
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm33.eq)(withdrawals.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database update (updateStatus) failed:", error);
      throw new Error("Failed to update withdrawal status.");
    }
  }
  /**
   * Find all withdrawals (with filters and pagination) for administrative dashboard
   */
  async findAll(options) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const adminApprovalStatus = options?.adminApprovalStatus;
      let query = db.select().from(withdrawals).$dynamic();
      const conditions = [];
      if (status) {
        conditions.push((0, import_drizzle_orm33.eq)(withdrawals.status, status));
      }
      if (adminApprovalStatus) {
        conditions.push((0, import_drizzle_orm33.eq)(withdrawals.adminApprovalStatus, adminApprovalStatus));
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm33.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm33.desc)(withdrawals.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve withdrawals ledger.");
    }
  }
};
var withdrawalRepository = new WithdrawalRepository();

// server/blockchain/services/WithdrawalService.ts
init_walletRepository();
init_transactionRepository();
init_notificationService();
init_auditRepository();
init_vipService();
var WithdrawalService = class {
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
  }
  /**
   * Request / Initiate a new pending withdrawal
   */
  async createWithdrawal(userId, amountStr, walletAddress, network) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }
    const amount = parseFloat(amountStr);
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be strictly positive.");
    }
    const minConfig = await settingsRepository.findSystemSettingByKey("MIN_WITHDRAWAL_LIMIT");
    const minLimit = minConfig ? parseFloat(minConfig.value) : 10;
    if (amount < minLimit) {
      throw new Error(`Minimum withdrawal limit is ${minLimit} USDT.`);
    }
    const availableBalance = parseFloat(wallet.availableBalance);
    if (availableBalance < amount) {
      throw new Error(`Insufficient funds. Available: ${wallet.availableBalance} USDT, Requested: ${amountStr} USDT.`);
    }
    const feeConfig = await settingsRepository.findSystemSettingByKey("WITHDRAWAL_FEE_PERCENTAGE");
    const feeRate = feeConfig ? parseFloat(feeConfig.value) : 0.1;
    const fee = amount * feeRate;
    const netAmount = amount - fee;
    const randomDigits = Math.floor(1e7 + Math.random() * 9e7).toString();
    const reference = `WTH${randomDigits}`;
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: (-amount).toFixed(8),
      lockedBalance: amount.toFixed(8)
    });
    const withdrawal = await withdrawalRepository.createWithdrawal({
      userId,
      walletId: wallet.id,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      netAmount: netAmount.toFixed(8),
      walletAddress,
      network,
      reference,
      status: "PENDING",
      adminApprovalStatus: "PENDING"
    });
    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: "WITHDRAWAL_REQUESTED",
      resource: `withdrawals/${withdrawal.id}`,
      newValue: JSON.stringify({ amount: amount.toFixed(8), fee: fee.toFixed(8), netAmount: netAmount.toFixed(8), network })
    });
    await notificationService.createStructuredNotification(userId, {
      title: "Withdrawal Request Submitted",
      description: `Your withdrawal request of ${amount.toFixed(8)} USDT has been submitted and is pending review.`,
      icon: "ArrowUpCircle",
      type: "withdrawal",
      priority: "MEDIUM"
    });
    await notificationService.notifyAdmins({
      title: "New Withdrawal Request",
      description: `A user has requested a withdrawal of ${amount.toFixed(8)} USDT.`,
      icon: "ArrowUpCircle",
      type: "withdrawal",
      priority: "HIGH"
    });
    return withdrawal;
  }
  /**
   * Broadcast and execute direct on-chain token payout for approved withdrawal
   */
  async executeOnChainPayout(withdrawalId) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found: ${withdrawalId}`);
    }
    return this.provider.broadcastTransaction(
      withdrawal.network,
      withdrawal.walletAddress,
      withdrawal.netAmount
    );
  }
  /**
   * Approve and complete a pending withdrawal
   */
  async approveWithdrawal(withdrawalId, txHash, adminUid) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }
    if (withdrawal.status !== "PENDING") {
      throw new Error(`Withdrawal is already completed/rejected with status: ${withdrawal.status}`);
    }
    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, "COMPLETED", {
      txHash,
      adminApprovalStatus: "APPROVED",
      adminNotes: `Approved by administrator: ${adminUid}`
    });
    const amount = parseFloat(withdrawal.amount);
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      totalWithdrawn: amount.toFixed(8)
    });
    const balanceBefore = parseFloat(wallet.availableBalance) + amount;
    const balanceAfter = parseFloat(wallet.availableBalance);
    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: "WITHDRAWAL",
      referenceId: withdrawal.id,
      status: "COMPLETED",
      description: `Completed withdrawal of ${withdrawal.amount} USDT (Fee: ${withdrawal.fee} USDT, Net: ${withdrawal.netAmount} USDT) to ${withdrawal.walletAddress}.`,
      amount: withdrawal.amount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: adminUid
    });
    await notificationService.createStructuredNotification(userId, {
      title: "Withdrawal Completed",
      description: `Your withdrawal request of ${withdrawal.amount} USDT has been completed successfully.`,
      icon: "ArrowUpCircle",
      type: "withdrawal",
      priority: "HIGH"
    });
    await vipService.recalculateVip(userId);
    return updatedWithdrawal;
  }
  /**
   * Reject and refund a pending withdrawal
   */
  async rejectWithdrawal(withdrawalId, reason, adminUid) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }
    if (withdrawal.status !== "PENDING") {
      throw new Error(`Withdrawal has already been processed with status: ${withdrawal.status}`);
    }
    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, "REJECTED", {
      adminApprovalStatus: "REJECTED",
      adminNotes: `Rejected by administrator ${adminUid}. Reason: ${reason}`
    });
    const amount = parseFloat(withdrawal.amount);
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      availableBalance: amount.toFixed(8)
    });
    await notificationService.createStructuredNotification(userId, {
      title: "Withdrawal Rejected",
      description: `Your withdrawal request of ${withdrawal.amount} USDT was rejected. Reason: ${reason}. Funds have been refunded to your available balance.`,
      icon: "ShieldAlert",
      type: "withdrawal",
      priority: "HIGH"
    });
    return updatedWithdrawal;
  }
};
var withdrawalService = new WithdrawalService();

// server/services/withdrawalService.ts
var withdrawalService2 = withdrawalService;

// server/providers/resendProvider.ts
var import_resend = require("resend");
var ResendProvider = class {
  constructor(apiKey2 = config2.email.resendApiKey, fromAddress = config2.email.fromAddress) {
    const cleanApiKey = apiKey2 ? apiKey2.replace(/^['"]|['"]$/g, "").trim() : "";
    const cleanFromAddress = fromAddress ? fromAddress.replace(/^['"]|['"]$/g, "").trim() : "";
    if (!cleanApiKey) {
      throw new Error("RESEND_API_KEY is not configured in the environment. Real email delivery is required.");
    }
    if (!cleanFromAddress) {
      throw new Error("EMAIL_FROM is not configured in the environment. Real email delivery is required.");
    }
    this.client = new import_resend.Resend(cleanApiKey);
    this.fromAddress = cleanFromAddress;
  }
  async send({ to, subject, html }) {
    console.log(`[Resend] Initiating real email delivery to ${to} with subject: "${subject}"`);
    try {
      const response = await this.client.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html
      });
      console.log("[Resend API Response]:", JSON.stringify(response, null, 2));
      if (response.error) {
        throw new Error(`Resend API Error (HTTP ${response.error.statusCode || "422"}): ${response.error.message} [Name: ${response.error.name}]`);
      }
    } catch (err) {
      console.error("[Resend Send Exception]:", err);
      throw err;
    }
  }
};

// server/templates/otpEmail.ts
function otpEmailTemplate({ otp, purpose = "verify your account" }) {
  return {
    subject: "Your MetaFirm Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">MetaFirm Verification Code</h2>
        <p style="color: #374151; font-size: 15px;">
          Use the code below to ${purpose}. This code is valid for a limited time.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    `
  };
}

// server/templates/resetPasswordEmail.ts
function resetPasswordEmailTemplate({ otp }) {
  return {
    subject: "Reset Your MetaFirm Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Password Reset Request</h2>
        <p style="color: #374151; font-size: 15px;">
          We received a request to reset your MetaFirm password. Use the code below to continue.
          This code is valid for a limited time.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request a password reset, please ignore this email or contact support \u2014
          your account remains secure.
        </p>
      </div>
    `
  };
}

// server/templates/welcomeEmail.ts
function welcomeEmailTemplate({ username }) {
  return {
    subject: "Welcome to MetaFirm",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Welcome to MetaFirm, ${username}!</h2>
        <p style="color: #374151; font-size: 15px;">
          Your account has been created successfully. You're all set to explore
          deposits, VIP rewards, referrals, and more on the MetaFirm platform.
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not create this account, please contact our support team immediately.
        </p>
      </div>
    `
  };
}

// server/services/emailService.ts
var EmailService = class {
  constructor(provider = new ResendProvider()) {
    this.provider = provider;
  }
  /**
   * Send a one-time-password email (e.g. registration / login verification).
   * Not wired into any auth flow yet — infrastructure only, ready for future use.
   */
  async sendOtpEmail(to, otp, purpose) {
    const { subject, html } = otpEmailTemplate({ otp, purpose });
    await this.provider.send({ to, subject, html });
  }
  /**
   * Send a password-reset OTP email.
   * Not wired into any auth flow yet — infrastructure only, ready for future use.
   */
  async sendPasswordResetOtp(to, otp) {
    const { subject, html } = resetPasswordEmailTemplate({ otp });
    await this.provider.send({ to, subject, html });
  }
  /**
   * Send a welcome email after successful registration.
   * Not wired into any registration flow yet — infrastructure only, ready for future use.
   */
  async sendWelcomeEmail(to, username) {
    const { subject, html } = welcomeEmailTemplate({ username });
    await this.provider.send({ to, subject, html });
  }
};
var emailService = new EmailService();

// server/utils/totp.ts
var import_crypto5 = __toESM(require("crypto"), 1);
function base32Decode(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/[\s=]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (let i = 0; i < cleaned.length; i++) {
    const character = cleaned[i];
    const idx = alphabet.indexOf(character);
    if (idx === -1) {
      throw new Error("Invalid base32 character: " + character);
    }
    value = value << 5 | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push(value >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
function verifyTOTP(token, secret, windowSteps = 1) {
  try {
    const key = base32Decode(secret);
    const epoch = Math.round(Date.now() / 1e3);
    const counter = Math.floor(epoch / 30);
    for (let i = -windowSteps; i <= windowSteps; i++) {
      const currentCounter = counter + i;
      const buffer = Buffer.alloc(8);
      let tmp = currentCounter;
      for (let j = 7; j >= 0; j--) {
        buffer[j] = tmp & 255;
        tmp = Math.floor(tmp / 256);
      }
      const hmac = import_crypto5.default.createHmac("sha1", key);
      hmac.update(buffer);
      const hmacResult = hmac.digest();
      const offset = hmacResult[hmacResult.length - 1] & 15;
      const code = (hmacResult[offset] & 127) << 24 | (hmacResult[offset + 1] & 255) << 16 | (hmacResult[offset + 2] & 255) << 8 | hmacResult[offset + 3] & 255;
      const otp = (code % 1e6).toString().padStart(6, "0");
      if (otp === token.trim()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("TOTP validation failed:", error);
    return false;
  }
}
function generateTOTPSecret(length = 16) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = import_crypto5.default.randomBytes(length);
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}
var totp = {
  generateSecret: () => generateTOTPSecret(16),
  verifyToken: (secret, token) => verifyTOTP(token, secret),
  getOtpauthUrl: (email, secret, issuer = "MetaFirm") => {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }
};

// server/cache/redisClient.ts
var RedisClient = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Get a key's value. Returns null if key does not exist or has expired.
   */
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  /**
   * Set a key to hold a string value.
   * Supports 'EX' option for setting expiration in seconds.
   */
  async set(key, value, mode, duration) {
    let expiresAt = null;
    if (mode === "EX" && typeof duration === "number") {
      expiresAt = Date.now() + duration * 1e3;
    }
    this.cache.set(key, { value, expiresAt });
    return "OK";
  }
  /**
   * Delete a key. Returns 1 if deleted, 0 if did not exist.
   */
  async del(key) {
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      return 1;
    }
    return 0;
  }
  /**
   * Check if a key exists. Returns 1 if exists and not expired, 0 otherwise.
   */
  async exists(key) {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }
  /**
   * Increment the integer value of a key by 1.
   * If key does not exist, set it to 0 before performing increment.
   */
  async incr(key) {
    const currentStr = await this.get(key);
    let currentVal = 0;
    if (currentStr !== null) {
      const parsed = parseInt(currentStr, 10);
      if (!isNaN(parsed)) {
        currentVal = parsed;
      }
    }
    const newVal = currentVal + 1;
    const entry = this.cache.get(key);
    const expiresAt = entry ? entry.expiresAt : null;
    this.cache.set(key, { value: newVal.toString(), expiresAt });
    return newVal;
  }
  /**
   * Set a timeout on key in seconds.
   */
  async expire(key, seconds) {
    const entry = this.cache.get(key);
    if (!entry) return 0;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return 0;
    }
    entry.expiresAt = Date.now() + seconds * 1e3;
    this.cache.set(key, entry);
    return 1;
  }
  /**
   * Flush all keys (for testing/debugging).
   */
  async flushAll() {
    this.cache.clear();
    return "OK";
  }
};
var redisClient = new RedisClient();

// server/cache/redisKeys.ts
var REDIS_KEYS = {
  /**
   * Generates the key for storing a registration OTP
   */
  registrationOtp: (email) => `otp:register:${email.toLowerCase()}`,
  /**
   * Generates the key for tracking registration OTP resend cooldown (1 minute)
   */
  registrationCooldown: (email) => `otp:register:cooldown:${email.toLowerCase()}`,
  /**
   * Generates the key for counting failed registration OTP attempts
   */
  registrationAttempts: (email) => `otp:register:attempts:${email.toLowerCase()}`,
  /**
   * Generates the key for storing a forgot password OTP
   */
  forgotPasswordOtp: (email) => `otp:forgot-password:${email.toLowerCase()}`,
  /**
   * Generates the key for tracking forgot password OTP resend cooldown (1 minute)
   */
  forgotPasswordCooldown: (email) => `otp:forgot-password:cooldown:${email.toLowerCase()}`,
  /**
   * Generates the key for counting failed forgot password OTP attempts
   */
  forgotPasswordAttempts: (email) => `otp:forgot-password:attempts:${email.toLowerCase()}`,
  /**
   * Generates the key for storing a withdrawal OTP
   */
  withdrawalOtp: (email) => `otp:withdrawal:${email.toLowerCase()}`,
  /**
   * Generates the key for tracking withdrawal OTP resend cooldown
   */
  withdrawalCooldown: (email) => `otp:withdrawal:cooldown:${email.toLowerCase()}`,
  /**
   * Generates the key for counting failed withdrawal OTP attempts
   */
  withdrawalAttempts: (email) => `otp:withdrawal:attempts:${email.toLowerCase()}`,
  /**
   * Generates the key for storing a withdrawal address OTP
   */
  withdrawalAddressOtp: (email) => `otp:withdrawal-address:${email.toLowerCase()}`,
  /**
   * Generates the key for tracking withdrawal address OTP resend cooldown
   */
  withdrawalAddressCooldown: (email) => `otp:withdrawal-address:cooldown:${email.toLowerCase()}`,
  /**
   * Generates the key for counting failed withdrawal address OTP attempts
   */
  withdrawalAddressAttempts: (email) => `otp:withdrawal-address:attempts:${email.toLowerCase()}`
};
var CACHE_TTL = {
  OTP_EXPIRY_SECONDS: 600,
  // 10 minutes for OTP validity
  COOLDOWN_SECONDS: 60,
  // 1 minute before user can request a new OTP
  MAX_ATTEMPTS: 5
  // Max 5 attempts before lock/blacklist
};

// server/utils/otp.ts
var import_crypto6 = __toESM(require("crypto"), 1);
function generateOTP(length = 6) {
  if (length <= 0) return "";
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return import_crypto6.default.randomInt(min, max + 1).toString();
}

// server/cache/services/otpService.ts
var OtpService = class {
  /**
   * Helper to resolve keys based on type
   */
  getKeys(email, type) {
    const trimmed = email.trim().toLowerCase();
    switch (type) {
      case "register":
        return {
          otp: REDIS_KEYS.registrationOtp(trimmed),
          cooldown: REDIS_KEYS.registrationCooldown(trimmed),
          attempts: REDIS_KEYS.registrationAttempts(trimmed)
        };
      case "forgot-password":
        return {
          otp: REDIS_KEYS.forgotPasswordOtp(trimmed),
          cooldown: REDIS_KEYS.forgotPasswordCooldown(trimmed),
          attempts: REDIS_KEYS.forgotPasswordAttempts(trimmed)
        };
      case "withdrawal":
        return {
          otp: REDIS_KEYS.withdrawalOtp(trimmed),
          cooldown: REDIS_KEYS.withdrawalCooldown(trimmed),
          attempts: REDIS_KEYS.withdrawalAttempts(trimmed)
        };
      case "withdrawal-address":
        return {
          otp: REDIS_KEYS.withdrawalAddressOtp(trimmed),
          cooldown: REDIS_KEYS.withdrawalAddressCooldown(trimmed),
          attempts: REDIS_KEYS.withdrawalAddressAttempts(trimmed)
        };
    }
  }
  /**
   * Check if a cooldown is active for a given email and type.
   * Returns remaining seconds, or 0 if no cooldown is active.
   */
  async getCooldownRemaining(email, type) {
    const keys = this.getKeys(email, type);
    const exists = await redisClient.exists(keys.cooldown);
    if (!exists) return 0;
    return CACHE_TTL.COOLDOWN_SECONDS;
  }
  /**
   * Generates a new 6-digit secure OTP, checks for active cooldown, and stores it.
   */
  async generateAndStoreOtp(email, type) {
    const trimmedEmail = email.trim().toLowerCase();
    const keys = this.getKeys(trimmedEmail, type);
    const isCooldownActive = await redisClient.exists(keys.cooldown);
    if (isCooldownActive) {
      throw new Error("Please wait 60 seconds before requesting a new verification code.");
    }
    const otp = generateOTP(6);
    await redisClient.set(keys.otp, otp, "EX", CACHE_TTL.OTP_EXPIRY_SECONDS);
    await redisClient.set(keys.cooldown, "1", "EX", CACHE_TTL.COOLDOWN_SECONDS);
    await redisClient.set(keys.attempts, "0", "EX", CACHE_TTL.OTP_EXPIRY_SECONDS);
    return { otp };
  }
  /**
   * Verifies an OTP with brute-force prevention.
   * Throws errors on failures, returns true on success.
   */
  async verifyOtp(email, otpCandidate, type) {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otpCandidate.trim();
    const keys = this.getKeys(trimmedEmail, type);
    const attemptsStr = await redisClient.get(keys.attempts);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    if (attempts >= CACHE_TTL.MAX_ATTEMPTS) {
      await redisClient.del(keys.otp);
      throw new Error("Too many failed attempts. This verification code has been invalidated. Please request a new one.");
    }
    const storedOtp = await redisClient.get(keys.otp);
    if (!storedOtp) {
      throw new Error("The verification code is invalid or has expired. Please request a new one.");
    }
    if (storedOtp !== cleanOtp) {
      const newAttempts = await redisClient.incr(keys.attempts);
      await redisClient.expire(keys.attempts, CACHE_TTL.OTP_EXPIRY_SECONDS);
      const remaining = CACHE_TTL.MAX_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        await redisClient.del(keys.otp);
        throw new Error("Too many failed attempts. This verification code has been invalidated. Please request a new one.");
      }
      throw new Error(`Invalid verification code. You have ${remaining} attempts remaining.`);
    }
    await redisClient.del(keys.otp);
    await redisClient.del(keys.attempts);
    await redisClient.del(keys.cooldown);
    return true;
  }
};
var otpService = new OtpService();

// server/blockchain/services/AddressService.ts
var import_drizzle_orm34 = require("drizzle-orm");
init_db();
var AddressService = class {
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
  }
  /**
   * Securely and atomically gets the next derivation index for a network using PostgreSQL sequences.
   */
  async getNextDerivationIndex(network) {
    const cleanNetwork = network.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const seqName = `seq_derivation_index_${cleanNetwork}`;
    await db.execute(import_drizzle_orm34.sql.raw(`CREATE SEQUENCE IF NOT EXISTS ${seqName} START WITH 1 MINVALUE 1;`));
    const result = await db.execute(import_drizzle_orm34.sql.raw(`SELECT nextval('${seqName}') as val;`));
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error(`Failed to fetch next value from sequence ${seqName}`);
    }
    const val = parseInt(result.rows[0].val, 10);
    return val - 1;
  }
  /**
   * Retrieves or generates a permanent deposit address for a specific user and network
   */
  async getOrCreateDepositAddress(userId, network) {
    const existing = await depositAddressRepository.findByUserAndNetwork(userId, network);
    if (existing) {
      return existing;
    }
    const derivationIndex = await this.getNextDerivationIndex(network);
    const address = await this.provider.generateDepositAddress(network, derivationIndex);
    const qrPath = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(address)}`;
    try {
      const newAddress = await depositAddressRepository.createDepositAddress({
        userId,
        network,
        address,
        derivationIndex,
        qrPath
      });
      return newAddress;
    } catch (error) {
      const existingAgain = await depositAddressRepository.findByUserAndNetwork(userId, network);
      if (existingAgain) {
        return existingAgain;
      }
      throw error;
    }
  }
  /**
   * Validate destination address format on target network
   */
  async validateAddress(network, address) {
    return this.provider.validateAddress(network, address);
  }
};
var addressService = new AddressService();

// server/controllers/userController.ts
var UserController = class {
  /**
   * Sync authenticated User credentials to local PostgreSQL database
   */
  async syncUser(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
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
  async getProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const walletRecord = await db.select().from(wallets).where((0, import_drizzle_orm35.eq)(wallets.userId, user.id));
      const vipRecord = await db.select().from(vipStatus).where((0, import_drizzle_orm35.eq)(vipStatus.userId, user.id));
      const profile = {
        ...user,
        walletBalance: walletRecord[0] ? parseFloat(walletRecord[0].availableBalance) : 0,
        vipTier: vipRecord[0] ? vipRecord[0].tier : "VIP_0"
      };
      return sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch compiled dashboard aggregation metrics for currently authenticated user
   */
  async getDashboard(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const userProfile = await userService.getUserProfile(req.user.uid);
      const dashboardData = await dashboardService.getDashboardData(userProfile.id);
      return sendSuccess(res, dashboardData, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch official VIP Qualification Matrix and requirements
   */
  async getVipMatrix(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { vipService: vipService2 } = await Promise.resolve().then(() => (init_vipService(), vipService_exports));
      const matrix = vipService2.getVipMatrix();
      return sendSuccess(res, matrix, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Execute manual Daily DPY yield claim
   */
  async claimYield(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { claimId } = req.body;
      if (!claimId) {
        throw new ApiError(400, "Claim ID is required to process yield.", "BAD_REQUEST");
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
  async updateProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { name, phone } = req.body;
      const result = await userService.updateProfile(req.user.uid, { name, phone }, req.ip, req.headers["user-agent"]);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Change password securely
   */
  async changePassword(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All password fields are required.", "BAD_REQUEST");
      }
      if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match.", "BAD_REQUEST");
      }
      const result = await userService.changePassword(
        req.user.uid,
        { currentPlain: currentPassword, newPlain: newPassword },
        req.ip,
        req.headers["user-agent"]
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Change email address
   */
  async changeEmail(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { currentPassword, newEmail } = req.body;
      if (!currentPassword || !newEmail) {
        throw new ApiError(400, "Current password and new email are required.", "BAD_REQUEST");
      }
      const result = await userService.changeEmail(
        req.user.uid,
        { currentPlain: currentPassword, newEmail },
        req.ip,
        req.headers["user-agent"]
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch active sessions for currently authenticated user
   */
  async getSessions(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
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
  async logoutAllOthers(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(400, "No active refresh token found. Unable to authenticate session to keep.", "BAD_REQUEST");
      }
      const result = await userService.logoutAllOthers(
        req.user.uid,
        refreshToken,
        req.ip,
        req.headers["user-agent"]
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Admin level users list
   */
  async getAdminUserList(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
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
  async adminActionUser(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const { action, password, value } = req.body;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
      }
      const updatedUser = await userService.adminActionUser(
        req.user.uid,
        targetUid,
        { action, password, value },
        req.ip,
        req.headers["user-agent"]
      );
      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch current security summary profile metrics
   */
  async getSecuritySummary(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
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
  async adminUpdateUser(req, res, next) {
    try {
      const { targetUid } = req.params;
      const { role } = req.body;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
      }
      const updatedUser = await userService.updateProfileByAdmin(
        targetUid,
        role
      );
      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Fetch support tickets created by the authenticated user
   */
  async getSupportTickets(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const tickets = await supportService.getUserTickets(user.id);
      return sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Create a support ticket
   */
  async createSupportTicket(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { category, subject, description, attachmentName, attachmentData } = req.body;
      if (!category || !subject || !description) {
        throw new ApiError(400, "Category, subject, and description are required fields.", "BAD_REQUEST");
      }
      const ticket = await supportService.createSupportTicket({
        userId: user.id,
        category,
        subject,
        description,
        attachmentName,
        attachmentData
      });
      return sendSuccess(res, ticket, 201);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Fetch conversation messages under a support ticket
   */
  async getTicketMessages(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;
      if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required", "BAD_REQUEST");
      }
      const messages = await supportService.getTicketMessages(ticketId, user.id, false);
      return sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Reply to an existing support ticket
   */
  async replyToTicket(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;
      const { message } = req.body;
      if (!ticketId || !message) {
        throw new ApiError(400, "Ticket ID and message content are required", "BAD_REQUEST");
      }
      const messageRecord = await supportService.addTicketReply({
        ticketId,
        senderId: user.id,
        senderType: "USER",
        message
      });
      return sendSuccess(res, messageRecord, 201);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Close a support ticket
   */
  async closeTicket(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;
      if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required", "BAD_REQUEST");
      }
      const ticket = await supportService.getTicketById(ticketId);
      if (!ticket) {
        throw new ApiError(404, "Ticket not found", "NOT_FOUND");
      }
      if (ticket.userId !== user.id) {
        throw new ApiError(403, "Unauthorized to close this support ticket", "FORBIDDEN");
      }
      const updatedTicket = await supportService.updateTicketProperties(ticketId, {
        status: "CLOSED"
      });
      return sendSuccess(res, updatedTicket, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Fetch notifications for the authenticated user
   */
  async getNotifications(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const notifications2 = await notificationService.getUserNotifications(user.id);
      return sendSuccess(res, notifications2, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Mark a single notification as read
   */
  async markNotificationRead(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { id } = req.params;
      if (!id) {
        throw new ApiError(400, "Notification ID is required", "BAD_REQUEST");
      }
      const updated = await notificationService.markNotificationAsRead(id, user.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Mark all notifications as read
   */
  async markAllNotificationsRead(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      await notificationService.markAllNotificationsAsRead(user.id);
      return sendSuccess(res, { success: true }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * DELETE Delete/Dismiss a single notification
   */
  async deleteNotification(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { id } = req.params;
      if (!id) {
        throw new ApiError(400, "Notification ID is required", "BAD_REQUEST");
      }
      const deleted = await notificationService.deleteNotification(id, user.id);
      return sendSuccess(res, deleted, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Verify and automatically credit a deposit based on a provided transaction hash.
   */
  async verifyDeposit(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { txHash, network } = req.body;
      if (!txHash || !network) {
        throw new ApiError(400, "Transaction Hash and Network are required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const userAddressRecord = await depositAddressRepository.findByUserAndNetwork(user.id, network);
      if (!userAddressRecord) {
        throw new ApiError(404, "No deposit address generated for this network. Please contact support.", "NOT_FOUND");
      }
      const assignedAddress = userAddressRecord.address;
      const blockchainTx = await blockchainProvider.getTransaction(network, txHash);
      if (!blockchainTx) {
        throw new ApiError(404, "Transaction hash not found on the blockchain. Please verify and retry.", "NOT_FOUND");
      }
      if (!blockchainTx.isSuccessful) {
        throw new ApiError(400, "The provided transaction failed on-chain.", "BAD_REQUEST");
      }
      if (blockchainTx.receiver.toLowerCase() !== assignedAddress.toLowerCase()) {
        throw new ApiError(400, `Transaction receiver (${blockchainTx.receiver}) does not match your assigned address for this network.`, "BAD_REQUEST");
      }
      const existingDeposit = await depositRepository.findByTxHash(txHash);
      if (existingDeposit) {
        throw new ApiError(400, "This transaction hash has already been verified and credited.", "REPLAY_ATTACK");
      }
      const deposit = await depositService2.createDeposit(
        user.id,
        blockchainTx.amount,
        network,
        assignedAddress,
        txHash
      );
      const completedDeposit = await depositService2.processSuccessfulDeposit(deposit.id, txHash, "SYSTEM");
      return sendSuccess(res, {
        message: "Deposit verified and credited successfully!",
        deposit: completedDeposit
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Generates and returns a new 2FA setup secret and QR code URL
   */
  async getMfaSetup(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const secret = totp.generateSecret();
      await settingsRepository.updateUserSettings(user.id, {
        mfaSecret: secret
      });
      const otpauthUrl = totp.getOtpauthUrl(user.email, secret, "MetaFirm");
      return sendSuccess(res, {
        secret,
        otpauthUrl,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Verifies the setup code and enables MFA
   */
  async enableMfa(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { code } = req.body;
      if (!code) {
        throw new ApiError(400, "Verification code is required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      if (!settings || !settings.mfaSecret) {
        throw new ApiError(400, "MFA setup has not been initiated. Please fetch configuration first.", "BAD_REQUEST");
      }
      const isValid = totp.verifyToken(settings.mfaSecret, code);
      if (!isValid) {
        throw new ApiError(400, "Invalid Google Authenticator code. Verification failed.", "BAD_REQUEST");
      }
      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: true
      });
      return sendSuccess(res, {
        message: "Google Authenticator 2FA enabled successfully!"
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Disables MFA requiring verification
   */
  async disableMfa(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { code } = req.body;
      if (!code) {
        throw new ApiError(400, "Verification code is required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      if (!settings || !settings.mfaEnabled || !settings.mfaSecret) {
        throw new ApiError(400, "MFA is not currently enabled.", "BAD_REQUEST");
      }
      const isValid = totp.verifyToken(settings.mfaSecret, code);
      if (!isValid) {
        throw new ApiError(400, "Invalid Google Authenticator code. Verification failed.", "BAD_REQUEST");
      }
      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: false,
        mfaSecret: null
      });
      return sendSuccess(res, {
        message: "Google Authenticator 2FA disabled successfully!"
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Retrieves user's registered withdrawal addresses
   */
  async getWithdrawalAddresses(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      const addresses = settings && settings.withdrawalAddresses ? JSON.parse(settings.withdrawalAddresses) : { USDT_BEP20: [], USDT_POLYGON: [], USDT_TRC20: [] };
      return sendSuccess(res, addresses, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Generates and dispatches Email OTP to add/change withdrawal address
   */
  async sendWithdrawalAddressOtp(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { otp } = await otpService.generateAndStoreOtp(user.email, "withdrawal-address");
      await emailService.sendOtpEmail(user.email, otp, "Registering new withdrawal address");
      return sendSuccess(res, {
        message: "OTP sent successfully to your registered email."
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Validates Email OTP and adds a verified withdrawal address
   */
  async addWithdrawalAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network, address, otp } = req.body;
      if (!network || !address || !otp) {
        throw new ApiError(400, "Network, address, and OTP code are required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      await otpService.verifyOtp(user.email, otp, "withdrawal-address");
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      const addresses = settings && settings.withdrawalAddresses ? JSON.parse(settings.withdrawalAddresses) : { USDT_BEP20: [], USDT_POLYGON: [], USDT_TRC20: [] };
      if (!addresses[network]) {
        addresses[network] = [];
      }
      if (!addresses[network].includes(address)) {
        addresses[network].push(address);
      }
      await settingsRepository.updateUserSettings(user.id, {
        withdrawalAddresses: JSON.stringify(addresses)
      });
      return sendSuccess(res, {
        message: "Withdrawal address added and verified successfully!",
        addresses
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Generates and dispatches Email OTP to process a withdrawal
   */
  async sendWithdrawalOtp(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { otp } = await otpService.generateAndStoreOtp(user.email, "withdrawal");
      await emailService.sendOtpEmail(user.email, otp, "Initiating an outbound withdrawal");
      return sendSuccess(res, {
        message: "OTP sent successfully to your registered email."
      }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Dual-factor validated withdrawal submission
   */
  async requestWithdrawal(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { amount, network, walletAddress, emailOtp, googleAuth2fa } = req.body;
      if (!amount || !network || !walletAddress || !emailOtp || !googleAuth2fa) {
        throw new ApiError(400, "Amount, network, address, Email OTP, and Authenticator code are required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      await otpService.verifyOtp(user.email, emailOtp, "withdrawal");
      if (settings && settings.mfaEnabled && settings.mfaSecret) {
        const isValid = totp.verifyToken(settings.mfaSecret, googleAuth2fa);
        if (!isValid) {
          throw new ApiError(400, "Invalid Google Authenticator code.", "BAD_REQUEST");
        }
      } else {
        throw new ApiError(400, "Multi-Factor Google Authenticator is required for withdrawal execution. Please enable it in Security first.", "BAD_REQUEST");
      }
      const verifiedAddresses = settings && settings.withdrawalAddresses ? JSON.parse(settings.withdrawalAddresses) : {};
      const networkList = verifiedAddresses[network] || [];
      if (!networkList.includes(walletAddress)) {
        throw new ApiError(400, "The specified withdrawal address has not been registered and verified in your Security configuration.", "BAD_REQUEST");
      }
      const withdrawal = await withdrawalService2.createWithdrawal(
        user.id,
        amount,
        walletAddress,
        network
      );
      return sendSuccess(res, {
        message: "Withdrawal request submitted successfully for administrative review.",
        withdrawal
      }, 201);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch deposits for the current user
   */
  async getDeposits(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const status = req.query.status;
      const list = await depositRepository.findByUserId(user.id, { limit, offset, status });
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch transactions for the current user
   */
  async getTransactions(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const type = req.query.type;
      const status = req.query.status;
      const list = await transactionRepository.findByUserId(user.id, { limit, offset, type, status });
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fetch withdrawals for the current user
   */
  async getWithdrawals(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const list = await withdrawalRepository.findByUserId(user.id);
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Generate or retrieve a permanent deposit address for a selected network
   */
  async generateDepositAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, "Network parameter is required.", "BAD_REQUEST");
      }
      const user = await userService.getUserProfile(req.user.uid);
      const addressRecord = await addressService.getOrCreateDepositAddress(user.id, network);
      return sendSuccess(res, addressRecord, 200);
    } catch (error) {
      next(error);
    }
  }
};
var userController = new UserController();

// server/middlewares/auth.ts
init_types();

// server/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_ISSUER = "cefi-platform-auth";
var JWT_AUDIENCE = "cefi-platform-client";
function generateAccessToken(payload) {
  return import_jsonwebtoken.default.sign(payload, config2.jwt.secret, {
    expiresIn: config2.jwt.expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}
function generateRefreshToken(payload) {
  return import_jsonwebtoken.default.sign(payload, config2.jwt.refreshSecret, {
    expiresIn: config2.jwt.refreshExpiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}
function verifyAccessToken(token) {
  if (!token) {
    throw new Error("Token is undefined or empty");
  }
  return import_jsonwebtoken.default.verify(token, config2.jwt.secret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}
function verifyRefreshToken(token) {
  if (!token) {
    throw new Error("Token is undefined or empty");
  }
  return import_jsonwebtoken.default.verify(token, config2.jwt.refreshSecret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}

// server/middlewares/auth.ts
var requireAuth = async (req, res, next) => {
  let token = req.cookies?.accessToken || null;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split("Bearer ")[1];
    }
  }
  if (!token) {
    return next(new ApiError(401, "Unauthorized: Missing or malformed access token", "MISSING_TOKEN"));
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || "USER" /* USER */
    };
    next();
  } catch (error) {
    console.error("Error verifying identity token:", error);
    return next(new ApiError(401, "Unauthorized: Invalid or expired access token", "INVALID_TOKEN"));
  }
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Authentication required", "AUTHENTICATION_REQUIRED"));
    }
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(new ApiError(403, "Forbidden: Insufficient platform permissions", "INSUFFICIENT_PERMISSIONS"));
    }
    next();
  };
};

// server/middlewares/validate.ts
var import_zod = require("zod");
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const issues = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        console.error("Validation failed for request:", req.originalUrl, "Payload:", req.body, "Issues:", JSON.stringify(issues));
        return next(
          new ApiError(
            400,
            "Request payload validation failed",
            "VALIDATION_ERROR",
            issues
          )
        );
      }
      next(error);
    }
  };
};

// shared/validators/index.ts
var import_zod2 = require("zod");
init_types();
var PasswordSchema = import_zod2.z.string().min(8, "Password must be at least 8 characters long").refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" }).refine((val) => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" }).refine((val) => /\d/.test(val), { message: "Password must contain at least one number" }).refine((val) => /[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(val), { message: "Password must contain at least one special character" });
var RegisterSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Invalid email address"),
  password: PasswordSchema,
  referralCode: import_zod2.z.string().optional()
});
var LoginSchema = import_zod2.z.object({
  email: import_zod2.z.string().optional(),
  emailOrUsername: import_zod2.z.string().optional(),
  password: import_zod2.z.string().min(1, "Password is required")
}).refine((data) => data.email !== void 0 || data.emailOrUsername !== void 0, {
  message: "Username or Email is required",
  path: ["emailOrUsername"]
});
var ForgotPasswordSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Invalid email address")
});
var ResetPasswordSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Invalid email address"),
  token: import_zod2.z.string().min(1, "Verification code (OTP) is required"),
  password: PasswordSchema
});
var RegisterUserSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Invalid email address")
});
var UpdateUserAdminSchema = import_zod2.z.object({
  role: import_zod2.z.nativeEnum(UserRole).optional()
});

// server/routes/v1/userRoutes.ts
init_types();
var router = (0, import_express.Router)();
router.post(
  "/sync",
  requireAuth,
  validateRequest(RegisterUserSchema),
  userController.syncUser
);
router.get(
  "/profile",
  requireAuth,
  userController.getProfile
);
router.get(
  "/dashboard",
  requireAuth,
  userController.getDashboard
);
router.get(
  "/vip-matrix",
  requireAuth,
  userController.getVipMatrix
);
router.post(
  "/claim-yield",
  requireAuth,
  userController.claimYield
);
router.patch(
  "/profile",
  requireAuth,
  userController.updateProfile
);
router.post(
  "/security/change-password",
  requireAuth,
  userController.changePassword
);
router.post(
  "/security/change-email",
  requireAuth,
  userController.changeEmail
);
router.get(
  "/security/sessions",
  requireAuth,
  userController.getSessions
);
router.post(
  "/security/sessions/logout-all-others",
  requireAuth,
  userController.logoutAllOthers
);
router.get(
  "/security/summary",
  requireAuth,
  userController.getSecuritySummary
);
router.get(
  "/admin/list",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  userController.getAdminUserList
);
router.post(
  "/admin/action/:targetUid",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  userController.adminActionUser
);
router.patch(
  "/admin/update/:targetUid",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  validateRequest(UpdateUserAdminSchema),
  userController.adminUpdateUser
);
router.get(
  "/notifications",
  requireAuth,
  userController.getNotifications
);
router.post(
  "/notifications/read-all",
  requireAuth,
  userController.markAllNotificationsRead
);
router.post(
  "/notifications/:id/read",
  requireAuth,
  userController.markNotificationRead
);
router.delete(
  "/notifications/:id",
  requireAuth,
  userController.deleteNotification
);
router.get(
  "/support/tickets",
  requireAuth,
  userController.getSupportTickets
);
router.post(
  "/support/tickets",
  requireAuth,
  userController.createSupportTicket
);
router.get(
  "/support/tickets/:ticketId/messages",
  requireAuth,
  userController.getTicketMessages
);
router.post(
  "/support/tickets/:ticketId/messages",
  requireAuth,
  userController.replyToTicket
);
router.post(
  "/support/tickets/:ticketId/close",
  requireAuth,
  userController.closeTicket
);
router.get(
  "/deposits",
  requireAuth,
  userController.getDeposits
);
router.get(
  "/transactions",
  requireAuth,
  userController.getTransactions
);
router.post(
  "/deposits/verify",
  requireAuth,
  userController.verifyDeposit
);
router.post(
  "/deposits/address",
  requireAuth,
  userController.generateDepositAddress
);
router.get(
  "/security/mfa/setup",
  requireAuth,
  userController.getMfaSetup
);
router.post(
  "/security/mfa/enable",
  requireAuth,
  userController.enableMfa
);
router.post(
  "/security/mfa/disable",
  requireAuth,
  userController.disableMfa
);
router.get(
  "/security/withdrawal-addresses",
  requireAuth,
  userController.getWithdrawalAddresses
);
router.post(
  "/security/withdrawal-addresses/send-otp",
  requireAuth,
  userController.sendWithdrawalAddressOtp
);
router.post(
  "/security/withdrawal-addresses",
  requireAuth,
  userController.addWithdrawalAddress
);
router.post(
  "/withdrawals/send-otp",
  requireAuth,
  userController.sendWithdrawalOtp
);
router.post(
  "/withdrawals/request",
  requireAuth,
  userController.requestWithdrawal
);
router.get(
  "/withdrawals",
  requireAuth,
  userController.getWithdrawals
);
var userRoutes_default = router;

// server/routes/v1/authRoutes.ts
var import_express2 = require("express");

// server/services/authService.ts
var import_crypto7 = __toESM(require("crypto"), 1);
init_types();
function hashToken2(token) {
  return import_crypto7.default.createHash("sha256").update(token).digest("hex");
}
var pendingRegistrationsStore = /* @__PURE__ */ new Map();
var AuthService = class {
  /**
   * Helper to hash a plain reset token using SHA-256
   */
  hashResetToken(token) {
    return import_crypto7.default.createHash("sha256").update(token).digest("hex");
  }
  /**
   * Helper to generate a unique random 8-character uppercase referral code
   */
  async generateUniqueReferralCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = import_crypto7.default.randomBytes(4).toString("hex").toUpperCase();
      const existing = await authRepository.findByReferralCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error("Failed to generate unique referral code. Please retry.");
  }
  /**
   * Helper to generate a unique random 8-character visible User ID (e.g. DS322256)
   */
  async generateUniqueUserId() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const digits = Math.floor(1e5 + Math.random() * 9e5).toString();
      const userIdCandidate = `DS${digits}`;
      const existing = await authRepository.findByUserId(userIdCandidate);
      if (!existing) {
        return userIdCandidate;
      }
    }
    throw new Error("Failed to generate unique public user ID. Please retry.");
  }
  getPendingRegistration(email) {
    const trimmed = email.toLowerCase().trim();
    const entry = pendingRegistrationsStore.get(trimmed);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      pendingRegistrationsStore.delete(trimmed);
      return null;
    }
    return entry;
  }
  setPendingRegistration(email, data) {
    const trimmed = email.toLowerCase().trim();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    pendingRegistrationsStore.set(trimmed, { ...data, expiresAt });
  }
  deletePendingRegistration(email) {
    const trimmed = email.toLowerCase().trim();
    pendingRegistrationsStore.delete(trimmed);
  }
  /**
   * Enterprise registration logic with OTP verification
   */
  async registerUser(data) {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedUsername = data.username.trim().toLowerCase();
    const existingEmail = await authRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new Error("Email address is already registered on this platform.");
    }
    const existingUsername = await authRepository.findByUsername(trimmedUsername);
    if (existingUsername) {
      throw new Error("Username is already registered on this platform.");
    }
    let parentReferralId = null;
    if (data.parentReferralCode) {
      const parentUser = await authRepository.findByReferralCode(data.parentReferralCode);
      if (!parentUser) {
        throw new Error("The provided referral code is invalid or does not exist.");
      }
      parentReferralId = parentUser.id;
    }
    const userId = await this.generateUniqueUserId();
    const referralCode = await this.generateUniqueReferralCode();
    const uid = import_crypto7.default.randomUUID();
    const passwordHash = await hashPassword(data.passwordPlain);
    const pendingData = {
      uid,
      email: trimmedEmail,
      username: trimmedUsername,
      name: data.name || null,
      phone: data.phone || null,
      country: data.country || null,
      passwordHash,
      role: "USER" /* USER */,
      userId,
      referralCode,
      parentReferralId,
      status: "PENDING_VERIFICATION"
    };
    this.setPendingRegistration(trimmedEmail, pendingData);
    const { otp } = await otpService.generateAndStoreOtp(trimmedEmail, "register");
    await emailService.sendOtpEmail(trimmedEmail, otp, "verify your account");
    const { passwordHash: _, ...safeUser } = pendingData;
    return {
      user: safeUser
    };
  }
  /**
   * Verify the registration OTP and activate the user.
   * On success, generates Access/Refresh tokens so the user is instantly authenticated.
   */
  async verifyRegistrationOtp(email, otp) {
    const trimmedEmail = email.trim().toLowerCase();
    await otpService.verifyOtp(trimmedEmail, otp, "register");
    const pendingData = this.getPendingRegistration(trimmedEmail);
    if (!pendingData) {
      throw new Error("Registration session has expired or does not exist. Please register again.");
    }
    const existingEmail = await authRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new Error("Email address is already registered on this platform.");
    }
    const existingUsername = await authRepository.findByUsername(pendingData.username);
    if (existingUsername) {
      throw new Error("Username is already registered on this platform.");
    }
    const user = await authRepository.createUser({
      uid: pendingData.uid,
      email: pendingData.email,
      username: pendingData.username,
      name: pendingData.name,
      phone: pendingData.phone,
      country: pendingData.country,
      passwordHash: pendingData.passwordHash,
      role: pendingData.role,
      userId: pendingData.userId,
      referralCode: pendingData.referralCode,
      parentReferralId: pendingData.parentReferralId,
      status: "ACTIVE"
    });
    this.deletePendingRegistration(trimmedEmail);
    try {
      await emailService.sendWelcomeEmail(trimmedEmail, user.username || "Investor");
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
    const payload = {
      uid: user.uid,
      email: user.email,
      role: user.role
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = import_crypto7.default.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      device: "Web Client",
      browser: "Browser",
      ipAddress: null,
      expiresAt
    });
    const { passwordHash: _, ...safeUser } = user;
    safeUser.status = "ACTIVE";
    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }
  /**
   * Resend a registration OTP if the account is pending verification.
   */
  async resendRegistrationOtp(email) {
    const trimmedEmail = email.trim().toLowerCase();
    const pendingData = this.getPendingRegistration(trimmedEmail);
    if (!pendingData) {
      throw new Error("Registration session has expired or does not exist. Please register again.");
    }
    const { otp } = await otpService.generateAndStoreOtp(trimmedEmail, "register");
    await emailService.sendOtpEmail(trimmedEmail, otp, "verify your account");
    return {
      success: true
    };
  }
  /**
   * Enterprise login logic
   */
  async loginUser(data) {
    const trimmedIdentifier = data.emailOrUsername.trim().toLowerCase();
    let user = await authRepository.findByEmail(trimmedIdentifier);
    if (!user) {
      user = await authRepository.findByUsername(trimmedIdentifier);
    }
    if (!user) {
      throw new Error("Invalid username, email address or password.");
    }
    if (user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 6e4);
      throw new Error(`This account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`);
    }
    if (user.lockUntil && user.lockUntil <= /* @__PURE__ */ new Date()) {
      await authRepository.resetFailedLoginAttempts(user.id);
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
    }
    if (user.status !== "ACTIVE") {
      throw new Error("This user account has been suspended or is pending verification.");
    }
    if (!user.passwordHash) {
      throw new Error("Invalid email address or password.");
    }
    const isMatch = await comparePassword(data.passwordPlain, user.passwordHash);
    if (!isMatch) {
      const updatedUser = await authRepository.incrementFailedLoginAttempts(user.id, user.failedLoginAttempts);
      await SecurityLogger.logActivity({
        userId: user.id,
        event: "LOGIN",
        status: "FAILED",
        ipAddress: data.ipAddress,
        device: data.device ? `${data.browser || ""} on ${data.device}` : null,
        details: `Incorrect password. Failed attempt count: ${updatedUser.failedLoginAttempts}`
      });
      if (updatedUser.failedLoginAttempts >= 5) {
        await SecurityLogger.logActivity({
          userId: user.id,
          event: "SECURITY_EVENT",
          status: "FAILED",
          ipAddress: data.ipAddress,
          device: data.device ? `${data.browser || ""} on ${data.device}` : null,
          details: `Account temporarily locked due to 5 consecutive failed login attempts.`
        });
        throw new Error("This account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.");
      }
      throw new Error("Invalid email address or password.");
    }
    if (user.failedLoginAttempts > 0) {
      await authRepository.resetFailedLoginAttempts(user.id);
    }
    const payload = {
      uid: user.uid,
      email: user.email,
      role: user.role
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = hashToken2(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      device: data.device,
      browser: data.browser,
      ipAddress: data.ipAddress,
      expiresAt
    });
    await SecurityLogger.logActivity({
      userId: user.id,
      event: "LOGIN",
      status: "SUCCESS",
      ipAddress: data.ipAddress,
      device: data.device ? `${data.browser || ""} on ${data.device}` : null,
      details: "Successful credentials authentication."
    });
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }
  /**
   * Refresh token rotation logic (DB-backed and multi-device safe)
   */
  async refreshSession(refreshToken, ipAddress, device, browser) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new Error("Session validation failed. Please sign in again.");
    }
    const tokenHash = hashToken2(refreshToken);
    const session = await sessionRepository.findByTokenHash(tokenHash);
    if (!session) {
      throw new Error("Refresh token is invalid or has been revoked.");
    }
    if (session.revoked) {
      throw new Error("This session has been terminated or the token is revoked.");
    }
    if (session.expiresAt < /* @__PURE__ */ new Date()) {
      throw new Error("The secure session has expired. Please log in again.");
    }
    await sessionRepository.revokeSession(tokenHash);
    const payload = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    const newHash = hashToken2(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await sessionRepository.createSession({
      userId: session.userId,
      tokenHash: newHash,
      device: device || session.device,
      browser: browser || session.browser,
      ipAddress: ipAddress || session.ipAddress,
      expiresAt
    });
    await SecurityLogger.logActivity({
      userId: session.userId,
      event: "SECURITY_EVENT",
      status: "SUCCESS",
      ipAddress: ipAddress || session.ipAddress,
      device: device ? `${browser || ""} on ${device}` : session.device ? `${session.browser || ""} on ${session.device}` : null,
      details: "Successful refresh token rotation."
    });
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
  /**
   * Revoke session upon logout (DB-backed)
   */
  async logoutUser(refreshToken) {
    if (refreshToken) {
      const tokenHash = hashToken2(refreshToken);
      const session = await sessionRepository.findByTokenHash(tokenHash);
      if (session) {
        await sessionRepository.revokeSession(tokenHash);
        await SecurityLogger.logActivity({
          userId: session.userId,
          event: "LOGOUT",
          status: "SUCCESS",
          ipAddress: session.ipAddress,
          device: session.device ? `${session.browser || ""} on ${session.device}` : null,
          details: "Session invalidated on user request."
        });
      }
    }
  }
  /**
   * Forgot password: Create secure reset OTP code, store, and set expiration in Redis
   */
  async forgotPassword(email) {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(trimmedEmail);
    let otp;
    if (user) {
      if (user.status !== "ACTIVE") {
        throw new Error("This account is pending verification or is not active.");
      }
      const result = await otpService.generateAndStoreOtp(trimmedEmail, "forgot-password");
      otp = result.otp;
      try {
        await emailService.sendPasswordResetOtp(trimmedEmail, otp);
      } catch (err) {
        console.error("Failed to send forgot password OTP email:", err);
      }
    }
    return {
      message: "If the email is registered, a 6-digit verification code has been sent to your email address."
    };
  }
  /**
   * Reset password: Confirm OTP validity and apply new password securely
   */
  async resetPassword(data) {
    const trimmedEmail = data.email.trim().toLowerCase();
    await otpService.verifyOtp(trimmedEmail, data.tokenPlain, "forgot-password");
    const userRecord = await authRepository.findByEmail(trimmedEmail);
    if (!userRecord) {
      throw new Error("The account associated with this request could not be found.");
    }
    const newPasswordHash = await hashPassword(data.passwordPlain);
    await authRepository.updatePassword(userRecord.uid, newPasswordHash);
    await sessionRepository.revokeAllUserSessions(userRecord.id);
    await SecurityLogger.logActivity({
      userId: userRecord.id,
      event: "PASSWORD_CHANGE",
      status: "SUCCESS",
      ipAddress: data.ipAddress,
      device: data.device ? `${data.browser || ""} on ${data.device}` : null,
      details: "Password successfully updated via OTP. All active sessions invalidated."
    });
    return {
      message: "Your account password has been updated successfully."
    };
  }
};
var authService = new AuthService();

// server/utils/ua.ts
function parseUserAgent(userAgentString) {
  if (!userAgentString) {
    return { browser: "Unknown Browser", device: "Desktop" };
  }
  let browser = "Unknown Browser";
  let device = "Desktop";
  const ua = userAgentString.toLowerCase();
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Safari";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "Opera";
  } else if (ua.includes("msie") || ua.includes("trident/")) {
    browser = "Internet Explorer";
  }
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
    if (ua.includes("iphone")) {
      device = "iPhone";
    } else if (ua.includes("ipad")) {
      device = "iPad";
    } else if (ua.includes("android")) {
      device = "Android Device";
    } else {
      device = "Mobile Device";
    }
  }
  return { browser, device };
}

// server/controllers/authController.ts
var isProduction = process.env.NODE_ENV === "production";
var cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1e3,
    // 15 minutes
    path: "/"
  },
  refreshToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 days
    path: "/"
  },
  clear: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/"
  }
};
var AuthController = class {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, username, name, phone, country, password, referralCode } = req.body;
      const result = await authService.registerUser({
        email,
        username,
        name,
        phone,
        country,
        passwordPlain: password,
        parentReferralCode: referralCode
      });
      return res.status(201).json({
        success: true,
        message: "Registration initiated. A 6-digit verification code has been sent to your email.",
        data: {
          email,
          user: result.user
        }
      });
    } catch (error) {
      const userMessage = error.message.includes("Database") || error.message.includes("repository") || error.message.includes("persist") ? "A system error occurred during registration. Please try again." : error.message;
      return next(new ApiError(400, userMessage, "REGISTRATION_FAILED"));
    }
  }
  /**
   * Verify registration OTP and activate user (with auto-login)
   */
  async verifyRegistrationOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new ApiError(400, "Email and 6-digit verification code are required.", "BAD_REQUEST");
      }
      const result = await authService.verifyRegistrationOtp(email, otp);
      res.cookie("accessToken", result.tokens.accessToken, cookieOptions.accessToken);
      res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions.refreshToken);
      return res.status(200).json({
        success: true,
        message: "Verification successful. Your account is now active.",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error) {
      return next(new ApiError(400, error.message, "VERIFICATION_FAILED"));
    }
  }
  /**
   * Resend registration OTP
   */
  async resendRegistrationOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(400, "Email is required to resend verification code.", "BAD_REQUEST");
      }
      const result = await authService.resendRegistrationOtp(email);
      return res.status(200).json({
        success: true,
        message: "A new 6-digit verification code has been sent to your email address.",
        data: {}
      });
    } catch (error) {
      return next(new ApiError(400, error.message, "RESEND_OTP_FAILED"));
    }
  }
  /**
   * Login a user and attach secure HttpOnly cookies
   */
  async login(req, res, next) {
    try {
      const { email, emailOrUsername, password } = req.body;
      const ipAddress = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"];
      const { browser, device } = parseUserAgent(userAgent);
      const result = await authService.loginUser({
        emailOrUsername: emailOrUsername || email,
        passwordPlain: password,
        ipAddress,
        device,
        browser
      });
      res.cookie("accessToken", result.tokens.accessToken, cookieOptions.accessToken);
      res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions.refreshToken);
      return res.status(200).json({
        success: true,
        message: "Authentication successful.",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error) {
      const userMessage = error.message.includes("Database") || error.message.includes("query") ? "A system error occurred during authentication." : error.message;
      return next(new ApiError(401, userMessage, "AUTHENTICATION_FAILED"));
    }
  }
  /**
   * Refresh the access and refresh tokens (Rotation-enabled)
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required.", "BAD_REQUEST");
      }
      const ipAddress = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"];
      const { browser, device } = parseUserAgent(userAgent);
      const result = await authService.refreshSession(refreshToken, ipAddress, device, browser);
      res.cookie("accessToken", result.accessToken, cookieOptions.accessToken);
      res.cookie("refreshToken", result.refreshToken, cookieOptions.refreshToken);
      return res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully.",
        data: {}
      });
    } catch (error) {
      const isRevoked = error.message.includes("revoked") || error.message.includes("validation") || error.message.includes("revocation") || error.message.includes("terminated");
      return next(new ApiError(isRevoked ? 401 : 400, error.message, "SESSION_REFRESH_FAILED"));
    }
  }
  /**
   * Logout a user and clear secure session cookies
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }
      res.clearCookie("accessToken", cookieOptions.clear);
      res.clearCookie("refreshToken", cookieOptions.clear);
      return res.status(200).json({
        success: true,
        message: "Logged out successfully. Session invalidated."
      });
    } catch (error) {
      return next(error);
    }
  }
  /**
   * Forgot password: Create reset token
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {}
      });
    } catch (error) {
      return next(error);
    }
  }
  /**
   * Reset password: Apply new password
   */
  async resetPassword(req, res, next) {
    try {
      const { email, token, password } = req.body;
      if (!email || !token || !password) {
        throw new ApiError(400, "Email, verification code (OTP), and password are required.", "BAD_REQUEST");
      }
      const ipAddress = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"];
      const { browser, device } = parseUserAgent(userAgent);
      const result = await authService.resetPassword({
        email,
        tokenPlain: token,
        passwordPlain: password,
        ipAddress,
        device,
        browser
      });
      res.clearCookie("accessToken", cookieOptions.clear);
      res.clearCookie("refreshToken", cookieOptions.clear);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return next(new ApiError(400, error.message, "PASSWORD_RESET_FAILED"));
    }
  }
  /**
   * Get current user details
   */
  async me(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized: Access token missing or invalid.", "UNAUTHORIZED");
      }
      const userDetails = await authRepository.findByEmail(req.user.email);
      if (!userDetails) {
        throw new ApiError(404, "User profile not found.", "NOT_FOUND");
      }
      const { passwordHash: _, ...safeUser } = userDetails;
      return res.status(200).json({
        success: true,
        message: "Current user profile retrieved.",
        data: { user: safeUser }
      });
    } catch (error) {
      return next(error);
    }
  }
};
var authController = new AuthController();

// server/routes/v1/authRoutes.ts
var router2 = (0, import_express2.Router)();
router2.post("/register", validateRequest(RegisterSchema), authController.register);
router2.post("/verify-otp", authController.verifyRegistrationOtp);
router2.post("/resend-otp", authController.resendRegistrationOtp);
router2.post("/login", validateRequest(LoginSchema), authController.login);
router2.post("/refresh", authController.refresh);
router2.post("/logout", authController.logout);
router2.post("/forgot-password", validateRequest(ForgotPasswordSchema), authController.forgotPassword);
router2.post("/reset-password", validateRequest(ResetPasswordSchema), authController.resetPassword);
router2.get("/me", requireAuth, authController.me);
var authRoutes_default = router2;

// server/routes/v1/adminRoutes.ts
var import_express3 = require("express");

// server/services/adminService.ts
init_userRepository();
init_walletRepository();
init_transactionRepository();
init_auditRepository();
init_notificationRepository();
init_vipService();
init_referralService();
init_db();
init_schema();
var import_drizzle_orm36 = require("drizzle-orm");
var AdminService = class {
  /**
   * Fetch paginated, filtered and sorted list of admin users
   */
  async getAdminUsersPaginated(options) {
    const conditions = [];
    if (options.search) {
      const pattern = `%${options.search}%`;
      conditions.push(
        (0, import_drizzle_orm36.or)(
          (0, import_drizzle_orm36.like)(users.name, pattern),
          (0, import_drizzle_orm36.like)(users.email, pattern),
          (0, import_drizzle_orm36.like)(users.phone, pattern),
          (0, import_drizzle_orm36.like)(users.userId, pattern),
          (0, import_drizzle_orm36.like)(users.uid, pattern)
        )
      );
    }
    if (options.filter && options.filter !== "All") {
      if (options.filter === "Active") {
        conditions.push((0, import_drizzle_orm36.eq)(users.status, "ACTIVE"));
      } else if (options.filter === "Suspended") {
        conditions.push((0, import_drizzle_orm36.eq)(users.status, "SUSPENDED"));
      } else if (options.filter.startsWith("VIP")) {
        conditions.push((0, import_drizzle_orm36.eq)(vipStatus.tier, options.filter));
      }
    }
    let orderByClause;
    switch (options.sortBy) {
      case "HighestBalance":
        orderByClause = (0, import_drizzle_orm36.desc)(wallets.availableBalance);
        break;
      case "LowestBalance":
        orderByClause = (0, import_drizzle_orm36.asc)(wallets.availableBalance);
        break;
      case "HighestReferrals":
        orderByClause = (0, import_drizzle_orm36.desc)(vipStatus.levelAValidCount);
        break;
      case "HighestTeamSize":
        orderByClause = (0, import_drizzle_orm36.desc)(vipStatus.teamTotalCount);
        break;
      case "Newest":
        orderByClause = (0, import_drizzle_orm36.desc)(users.createdAt);
        break;
      case "Oldest":
        orderByClause = (0, import_drizzle_orm36.asc)(users.createdAt);
        break;
      default:
        orderByClause = (0, import_drizzle_orm36.desc)(users.createdAt);
    }
    const whereClause = conditions.length > 0 ? (0, import_drizzle_orm36.and)(...conditions) : void 0;
    const countResult = await db.select({ count: import_drizzle_orm36.sql`count(${users.id})::int` }).from(users).leftJoin(vipStatus, (0, import_drizzle_orm36.eq)(vipStatus.userId, users.id)).where(whereClause);
    const totalCount = countResult[0]?.count || 0;
    const results = await db.select({
      user: users,
      wallet: wallets,
      vip: vipStatus
    }).from(users).leftJoin(wallets, (0, import_drizzle_orm36.eq)(wallets.userId, users.id)).leftJoin(vipStatus, (0, import_drizzle_orm36.eq)(vipStatus.userId, users.id)).where(whereClause).orderBy(orderByClause).limit(options.limit).offset(options.offset);
    const mappedUsers = [];
    for (const r of results) {
      const u = r.user;
      const wallet = r.wallet;
      const vip = r.vip;
      const descendants = await referralService.getDownlineDescendants(u.id);
      const levelA = descendants.filter((d) => d.referralLevel === 1).length;
      const levelB = descendants.filter((d) => d.referralLevel === 2).length;
      const levelC = descendants.filter((d) => d.referralLevel === 3).length;
      const levelD = descendants.filter((d) => d.referralLevel === 4).length;
      mappedUsers.push({
        id: u.uid,
        // mapped to uid so frontend actions target uid
        userId: u.userId,
        name: u.name || "",
        email: u.email,
        mobile: u.phone || "",
        rank: vip?.tier || "VIP1",
        balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : "$0.00",
        levelA,
        levelB,
        levelC,
        levelD,
        status: u.status === "ACTIVE" ? "Active" : "Suspended",
        joined: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        adminNotes: u.name ? `Administrative profile for ${u.name}.` : "No administrative notes."
      });
    }
    return {
      users: mappedUsers,
      pagination: {
        total: totalCount,
        page: Math.floor(options.offset / options.limit) + 1,
        limit: options.limit
      }
    };
  }
  /**
   * Get complete details of a single user
   */
  async getUserProfileDetail(targetUid) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const wallet = await walletRepository.findByUserId(user.id);
    const vip = await db.select().from(vipStatus).where((0, import_drizzle_orm36.eq)(vipStatus.userId, user.id));
    const descendants = await referralService.getDownlineDescendants(user.id);
    return {
      id: user.uid,
      userId: user.userId,
      name: user.name || "",
      email: user.email,
      mobile: user.phone || "",
      rank: vip[0]?.tier || "VIP1",
      balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : "$0.00",
      status: user.status === "ACTIVE" ? "Active" : "Suspended",
      joined: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      walletDetails: wallet ? {
        availableBalance: parseFloat(wallet.availableBalance),
        lockedBalance: parseFloat(wallet.lockedBalance),
        principalBalance: parseFloat(wallet.principalBalance),
        trialBalance: parseFloat(wallet.trialBalance),
        referralIncome: parseFloat(wallet.referralIncome),
        dailyYield: parseFloat(wallet.dailyYield),
        teamIncome: parseFloat(wallet.teamIncome),
        incentiveIncome: parseFloat(wallet.incentiveIncome)
      } : null,
      teamCounts: {
        levelA: descendants.filter((d) => d.referralLevel === 1).length,
        levelB: descendants.filter((d) => d.referralLevel === 2).length,
        levelC: descendants.filter((d) => d.referralLevel === 3).length,
        levelD: descendants.filter((d) => d.referralLevel === 4).length,
        total: descendants.length
      }
    };
  }
  /**
   * Update editable fields of user's profile
   */
  async updateAdminUserProfile(adminUid, targetUid, fields, ipAddress, userAgent) {
    const targetUser = await userRepository.findByUid(targetUid);
    if (!targetUser) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const updates = { updatedAt: /* @__PURE__ */ new Date() };
    if (fields.name !== void 0) updates.name = fields.name;
    if (fields.email !== void 0) updates.email = fields.email;
    if (fields.phone !== void 0) updates.phone = fields.phone;
    if (fields.status !== void 0) {
      updates.status = fields.status === "Suspended" ? "SUSPENDED" : "ACTIVE";
    }
    const updatedUser = await userRepository.updateUserProfile(targetUid, updates);
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: targetUser.id,
      action: "ADMIN_PROFILE_UPDATE",
      resource: `users/${targetUid}`,
      oldValue: JSON.stringify({
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        status: targetUser.status
      }),
      newValue: JSON.stringify(updates)
    });
    return updatedUser;
  }
  /**
   * Get user transactions history
   */
  async getUserTransactions(targetUid, options) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const txs = await transactionRepository.findByUserId(user.id, options);
    return txs.map((t) => ({
      id: t.id,
      type: t.type,
      amount: `$${parseFloat(t.amount).toFixed(2)}`,
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      description: t.description
    }));
  }
  /**
   * Get user deposit history
   */
  async getUserDeposits(targetUid, options) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const deps = await depositRepository.findByUserId(user.id, options);
    return deps.map((d) => ({
      id: d.id,
      amount: `$${parseFloat(d.amount).toFixed(2)}`,
      method: d.network || "USDT",
      txHash: d.txHash || "N/A",
      date: new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: d.status === "COMPLETED" ? "Completed" : d.status === "PENDING" ? "Pending" : "Rejected"
    }));
  }
  /**
   * Get user withdrawal history
   */
  async getUserWithdrawals(targetUid, options) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const withs = await withdrawalRepository.findByUserId(user.id, options);
    return withs.map((w) => ({
      id: w.id,
      amount: `$${parseFloat(w.amount).toFixed(2)}`,
      wallet: w.walletAddress,
      date: new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: w.status === "COMPLETED" ? "Approved" : w.status === "PENDING" ? "Pending" : "Rejected"
    }));
  }
  /**
   * Get user audit history
   */
  async getUserAudits(targetUid, options) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const audits = await auditRepository.findByUserId(user.id, options);
    return audits.map((a) => ({
      action: a.action,
      admin: a.actorUid === "SYSTEM" ? "System" : "Admin",
      ip: "127.0.0.1",
      // Standard fallback IP
      time: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      module: a.resource
    }));
  }
  /**
   * Get user team network list of Level A, B, C, D descendants
   */
  async getUserTeamNetwork(targetUid) {
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
        const vip = await db.select().from(vipStatus).where((0, import_drizzle_orm36.eq)(vipStatus.userId, u.id));
        list.push({
          id: u.uid,
          userId: u.userId,
          name: u.name || "Anonymous",
          email: u.email,
          level: d.referralLevel === 1 ? "A" : d.referralLevel === 2 ? "B" : d.referralLevel === 3 ? "C" : "D",
          vipTier: vip[0]?.tier || "VIP1",
          walletBalance: wallet ? parseFloat(wallet.availableBalance) : 0,
          joined: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        });
      }
    }
    return list;
  }
  /**
   * Adjust user wallet balances atomically (Manual Admin Ledger Adjustment)
   */
  async adjustWalletBalance(userId, deltas, memo, adminUid) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }
    const beforeBalance = parseFloat(wallet.availableBalance);
    const availableDelta = parseFloat(deltas.availableBalance || "0.0");
    const afterBalance = beforeBalance + availableDelta;
    const updatedWallet = await walletRepository.incrementBalances(wallet.id, deltas);
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: "ADMIN_ADJUST",
      referenceId: wallet.id,
      status: "COMPLETED",
      description: memo || "Administrative manual account balance adjustment.",
      amount: availableDelta.toFixed(8),
      balanceBefore: beforeBalance.toFixed(8),
      balanceAfter: afterBalance.toFixed(8),
      createdBy: adminUid
    });
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: "WALLET_MANUAL_ADJUSTMENT",
      resource: `wallets/${wallet.id}`,
      oldValue: JSON.stringify(wallet),
      newValue: JSON.stringify(updatedWallet)
    });
    await notificationRepository.createNotification({
      userId,
      message: `Your account balance was adjusted by our support team: "${memo}"`,
      priority: "MEDIUM"
    });
    await vipService.recalculateVip(userId);
    return updatedWallet;
  }
  /**
   * Update a user's account active status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)
   */
  async updateUserStatus(userId, status, adminUid, reason) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    const updatedUser = await userRepository.updateUserProfile(user.uid, { status });
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: "USER_STATUS_CHANGE",
      resource: `users/${userId}`,
      oldValue: user.status,
      newValue: status
    });
    await notificationRepository.createNotification({
      userId,
      message: `Your account status has been updated to ${status}. Reason: ${reason}`,
      priority: "HIGH"
    });
    return updatedUser;
  }
  /**
   * Administrative Approval of pending Withdrawals.
   * Delegates ALL ledger/wallet/VIP logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async approveWithdrawal(withdrawalId, adminUid, txHash, notes) {
    const updatedW = await withdrawalService2.approveWithdrawal(withdrawalId, txHash, adminUid);
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: "WITHDRAWAL_APPROVAL",
      resource: `withdrawals/${updatedW.id}`,
      newValue: notes ? `APPROVED \u2014 ${notes}` : "APPROVED"
    });
    return updatedW;
  }
  /**
   * Administrative Rejection of pending Withdrawals.
   * Delegates ALL ledger/wallet logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async rejectWithdrawal(withdrawalId, adminUid, notes) {
    const updatedW = await withdrawalService2.rejectWithdrawal(withdrawalId, notes, adminUid);
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: "WITHDRAWAL_REJECTION",
      resource: `withdrawals/${updatedW.id}`,
      newValue: "REJECTED"
    });
    return updatedW;
  }
  /**
   * Retrieve platform system wide audit logs
   */
  async getSystemAuditLogs(options) {
    return auditRepository.findAll(options);
  }
  /**
   * Fetch all registered users in the platform (paginated, newest first).
   */
  async getAllUsers(options) {
    return userRepository.findAll(options);
  }
  /**
   * Retrieve all platform support tickets
   */
  async getAllSupportTickets(options) {
    return supportRepository.findAll(options);
  }
  /**
   * Retrieve aggregated admin dashboard statistics and trends (Single Source of Truth)
   */
  async getAdminDashboardOverview() {
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.status === "ACTIVE").length;
    const suspendedUsers = allUsers.filter((u) => u.status === "SUSPENDED").length;
    const allWallets = await db.select().from(wallets);
    let totalLiquidity = 0;
    for (const w of allWallets) {
      totalLiquidity += parseFloat(w.availableBalance) + parseFloat(w.lockedBalance) + parseFloat(w.principalBalance);
    }
    const allDeposits = await db.select().from(deposits);
    let totalInboundDeposits = 0;
    for (const d of allDeposits) {
      if (d.status === "COMPLETED") {
        totalInboundDeposits += parseFloat(d.amount);
      }
    }
    const allWithdrawals = await db.select().from(withdrawals);
    const pendingWithdrawalsCount = allWithdrawals.filter((w) => w.status === "PENDING").length;
    const pendingDepositsCount = allDeposits.filter((d) => d.status === "PENDING").length;
    const allTickets = await db.select().from(supportTickets);
    const activeSupportTicketsCount = allTickets.filter((t) => t.status === "OPEN").length;
    const allActivityLogs = await db.select().from(activityLogs);
    const securityThreatsCount = allActivityLogs.filter(
      (l) => l.event === "SECURITY_EVENT" || l.status === "FAILED"
    ).length;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = /* @__PURE__ */ new Date();
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
        revenueSum: 0
      });
    }
    for (const u of allUsers) {
      const uDate = new Date(u.createdAt);
      for (const m of last6Months) {
        if (uDate.getFullYear() === m.year && uDate.getMonth() === m.month) {
          m.usersCount++;
        }
      }
    }
    const firstMonthDate = new Date(last6Months[0].year, last6Months[0].month, 1);
    let cumulativeUsers = allUsers.filter((u) => new Date(u.createdAt) < firstMonthDate).length;
    const userGrowthTrend = last6Months.map((m) => {
      cumulativeUsers += m.usersCount;
      return {
        month: m.label,
        users: cumulativeUsers
      };
    });
    for (const d of allDeposits) {
      if (d.status === "COMPLETED") {
        const dDate = new Date(d.createdAt);
        for (const m of last6Months) {
          if (dDate.getFullYear() === m.year && dDate.getMonth() === m.month) {
            m.depositsSum += parseFloat(d.amount);
          }
        }
      }
    }
    for (const w of allWithdrawals) {
      if (w.status === "COMPLETED") {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.withdrawalsSum += parseFloat(w.amount);
          }
        }
      }
    }
    const txFlowTrend = last6Months.map((m) => ({
      month: m.label,
      deposits: m.depositsSum,
      withdrawals: m.withdrawalsSum
    }));
    for (const w of allWithdrawals) {
      if (w.status === "COMPLETED") {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.revenueSum += parseFloat(w.fee || "0");
          }
        }
      }
    }
    const revenueTrend = last6Months.map((m) => ({
      month: m.label,
      revenue: m.revenueSum
    }));
    return {
      stats: {
        totalUsers,
        activeUsers,
        liquidityPool: totalLiquidity,
        totalInboundDeposits
      },
      queues: {
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingDeposits: pendingDepositsCount,
        activeSupportTickets: activeSupportTicketsCount,
        securityThreats: securityThreatsCount,
        suspendedUsers
      },
      charts: {
        userGrowth: userGrowthTrend,
        txFlow: txFlowTrend,
        revenue: revenueTrend
      }
    };
  }
};
var adminService = new AdminService();

// server/controllers/adminController.ts
init_userRepository();
init_notificationRepository();
init_auditRepository();
init_db();
init_schema();
var import_drizzle_orm37 = require("drizzle-orm");
var AdminController = class {
  /**
   * Fetch compiled admin dashboard overview aggregation and statistics
   */
  async getDashboardOverview(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
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
  async getUsers(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const search = req.query.search || "";
      const filter = req.query.filter || "All";
      const sortBy = req.query.sortBy || "Newest";
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "10", 10);
      const offset = (page - 1) * limit;
      const result = await adminService.getAdminUsersPaginated({
        search,
        filter,
        sortBy,
        limit,
        offset
      });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Detailed profile of a single user
   */
  async getUserProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async updateUserProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const { name, email, mobile, status } = req.body;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
      }
      const result = await adminService.updateAdminUserProfile(
        req.user.uid,
        targetUid,
        { name, email, phone: mobile, status },
        req.ip,
        req.headers["user-agent"]
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Adjust a user's wallet
   */
  async adjustWalletBalance(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const { amount, memo } = req.body;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
      }
      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, "User not found", "NOT_FOUND");
      }
      const result = await adminService.adjustWalletBalance(
        user.id,
        { availableBalance: amount.toString() },
        memo || "Manual wallet adjustment by administrator",
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
  async sendNotification(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const { message, priority } = req.body;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
      }
      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, "User not found", "NOT_FOUND");
      }
      await notificationRepository.createNotification({
        userId: user.id,
        message,
        priority: priority || "MEDIUM"
      });
      return sendSuccess(res, { success: true, message: "Notification sent successfully." }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Retrieve user's transaction history
   */
  async getUserTransactions(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "50", 10);
      const offset = (page - 1) * limit;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async getUserDeposits(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "50", 10);
      const offset = (page - 1) * limit;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async getUserWithdrawals(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "50", 10);
      const offset = (page - 1) * limit;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async getUserAudits(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "50", 10);
      const offset = (page - 1) * limit;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async getUserTeamNetwork(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, "Target user UID is required", "BAD_REQUEST");
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
  async getAdminTickets(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const status = req.query.status;
      const priority = req.query.priority;
      const category = req.query.category;
      const search = req.query.search;
      const limit = parseInt(req.query.limit || "100", 10);
      const offset = parseInt(req.query.offset || "0", 10);
      const tickets = await supportService.getAdminTickets({
        status,
        priority,
        category,
        search,
        limit,
        offset
      });
      return sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Retrieve conversation history under a specific ticket (Admin view)
   */
  async getAdminTicketMessages(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { ticketId } = req.params;
      if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required", "BAD_REQUEST");
      }
      const messages = await supportService.getTicketMessages(ticketId, "", true);
      return sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Submit an admin reply to a ticket thread
   */
  async replyToTicketAsAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { ticketId } = req.params;
      const { message } = req.body;
      if (!ticketId || !message) {
        throw new ApiError(400, "Ticket ID and message content are required", "BAD_REQUEST");
      }
      const adminUser = await userRepository.findByUid(req.user.uid);
      if (!adminUser) {
        throw new ApiError(404, "Admin user profile not found", "NOT_FOUND");
      }
      const messageRecord = await supportService.addTicketReply({
        ticketId,
        senderId: adminUser.id,
        senderType: "ADMIN",
        message
      });
      return sendSuccess(res, messageRecord, 201);
    } catch (error) {
      next(error);
    }
  }
  /**
   * PATCH Update properties of a support ticket (status, priority, assignment)
   */
  async updateTicketProperties(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { ticketId } = req.params;
      const { status, priority, assignedAdminUid } = req.body;
      if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required", "BAD_REQUEST");
      }
      const updatedTicket = await supportService.updateTicketProperties(ticketId, {
        status,
        priority,
        assignedAdminUid
      });
      return sendSuccess(res, updatedTicket, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Retrieve treasury wallet configurations, balances, and deposit addresses for a network
   */
  async getTreasuryOverview(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network } = req.params;
      if (!network) {
        throw new ApiError(400, "Network parameter is required.", "BAD_REQUEST");
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
  async sweepUserDepositAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { addressId } = req.body;
      if (!addressId) {
        throw new ApiError(400, "Address ID is required.", "BAD_REQUEST");
      }
      const result = await treasuryService.sweepUserDepositAddress(addressId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || "Failed to execute sweep operation.", "INTERNAL_ERROR");
      }
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Sweep all positive-balance deposit addresses on a network
   */
  async sweepAllEligibleAddresses(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, "Network parameter is required.", "BAD_REQUEST");
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
  async sweepHotToCold(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network, amount } = req.body;
      if (!network || !amount) {
        throw new ApiError(400, "Network and amount are required parameters.", "BAD_REQUEST");
      }
      const result = await treasuryService.sweepHotToCold(network, amount, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || "Failed to transfer to cold wallet.", "INTERNAL_ERROR");
      }
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Retry a failed sweep job
   */
  async sweepRetryJob(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { jobId } = req.body;
      if (!jobId) {
        throw new ApiError(400, "Job ID is required.", "BAD_REQUEST");
      }
      const result = await treasuryService.retrySweepJob(jobId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || "Failed to retry sweep job.", "INTERNAL_ERROR");
      }
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Update auto-sweep configurations
   */
  async updateAutoSweepConfig(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network, autoSweepEnabled, autoSweepThreshold } = req.body;
      if (!network || autoSweepEnabled === void 0 || !autoSweepThreshold) {
        throw new ApiError(400, "All parameters are required.", "BAD_REQUEST");
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
  async getSweepJobs(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const network = req.query.network;
      const jobs = await treasuryService.getSweepJobs(network);
      return sendSuccess(res, jobs, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET Retrieve sweep queue items with real-time native gas balances
   */
  async getSweepQueue(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const network = req.query.network;
      const status = req.query.status;
      let q = db.select({
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
        userEmail: users.email
      }).from(sweepQueue).innerJoin(users, (0, import_drizzle_orm37.eq)(sweepQueue.userId, users.id));
      const conditions = [];
      if (network) {
        conditions.push((0, import_drizzle_orm37.eq)(sweepQueue.network, network.toUpperCase()));
      }
      if (status) {
        conditions.push((0, import_drizzle_orm37.eq)(sweepQueue.status, status));
      }
      if (conditions.length > 0) {
        q = q.where((0, import_drizzle_orm37.and)(...conditions));
      }
      const items = await q.orderBy((0, import_drizzle_orm37.desc)(sweepQueue.createdAt));
      const itemsWithGas = await Promise.all(
        items.map(async (item) => {
          let nativeGasBalance = "0.00000000";
          try {
            nativeGasBalance = await activeBlockchainProvider.getNativeBalance(item.network, item.depositAddress);
          } catch (e) {
          }
          return {
            ...item,
            nativeGasBalance
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
  async fundGasQueueItem(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, "Queue Item ID is required.", "BAD_REQUEST");
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
  async sweepQueueItem(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, "Queue Item ID is required.", "BAD_REQUEST");
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
  async cancelQueueItem(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, "Queue Item ID is required.", "BAD_REQUEST");
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
  async bulkActionQueue(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { itemIds, action } = req.body;
      if (!itemIds || !Array.isArray(itemIds) || !action) {
        throw new ApiError(400, "itemIds (array) and action are required parameters.", "BAD_REQUEST");
      }
      let results;
      if (action === "FUND_GAS") {
        results = await sweepQueueProcessor.bulkFundGas(itemIds, req.user.uid);
      } else if (action === "SWEEP") {
        results = await sweepQueueProcessor.bulkSweep(itemIds, req.user.uid);
      } else if (action === "FUND_AND_SWEEP") {
        results = await sweepQueueProcessor.bulkFundAndSweep(itemIds, req.user.uid);
      } else {
        throw new ApiError(400, `Unsupported bulk action: ${action}`, "BAD_REQUEST");
      }
      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST Update sweep mode and delay configuration
   */
  async updateSweepModeConfig(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication credentials required", "UNAUTHORIZED");
      }
      const { network, sweepMode, sweepDelay, customDelayMinutes, autoSweepThreshold, paused } = req.body;
      if (!network) {
        throw new ApiError(400, "Network parameter is required.", "BAD_REQUEST");
      }
      const cleanNetwork = network.toUpperCase();
      await treasuryService.getOrCreateTreasuryWallet(cleanNetwork);
      const updateFields = { updatedAt: /* @__PURE__ */ new Date() };
      if (sweepMode !== void 0) updateFields.sweepMode = sweepMode;
      if (sweepDelay !== void 0) updateFields.sweepDelay = sweepDelay;
      if (customDelayMinutes !== void 0) updateFields.customDelayMinutes = parseInt(customDelayMinutes, 10);
      if (autoSweepThreshold !== void 0) updateFields.autoSweepThreshold = autoSweepThreshold;
      if (paused !== void 0) updateFields.paused = paused;
      const updated = await db.update(treasuryWallets).set(updateFields).where((0, import_drizzle_orm37.eq)(treasuryWallets.network, cleanNetwork)).returning();
      await auditRepository.createAuditLog({
        actorUid: req.user.uid,
        userId: null,
        action: "TREASURY_SWEEP_CONFIG_COMPREHENSIVE_UPDATE",
        resource: `treasury/config/${cleanNetwork}`,
        oldValue: "STALE",
        newValue: JSON.stringify(updateFields)
      });
      return sendSuccess(res, updated[0], 200);
    } catch (error) {
      next(error);
    }
  }
};
var adminController = new AdminController();

// server/routes/v1/adminRoutes.ts
init_types();
var router3 = (0, import_express3.Router)();
router3.get(
  "/dashboard/overview",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getDashboardOverview
);
router3.get(
  "/users",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUsers
);
router3.get(
  "/users/:targetUid/profile",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserProfile
);
router3.patch(
  "/users/:targetUid/profile",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.updateUserProfile
);
router3.post(
  "/users/:targetUid/wallet-adjustment",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.adjustWalletBalance
);
router3.post(
  "/users/:targetUid/send-notification",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sendNotification
);
router3.get(
  "/users/:targetUid/transactions",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserTransactions
);
router3.get(
  "/users/:targetUid/deposits",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserDeposits
);
router3.get(
  "/users/:targetUid/withdrawals",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserWithdrawals
);
router3.get(
  "/users/:targetUid/audits",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserAudits
);
router3.get(
  "/users/:targetUid/team",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getUserTeamNetwork
);
router3.get(
  "/support/tickets",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getAdminTickets
);
router3.get(
  "/support/tickets/:ticketId/messages",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getAdminTicketMessages
);
router3.post(
  "/support/tickets/:ticketId/messages",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.replyToTicketAsAdmin
);
router3.patch(
  "/support/tickets/:ticketId",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.updateTicketProperties
);
router3.get(
  "/treasury/:network",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getTreasuryOverview
);
router3.post(
  "/treasury/sweep/address",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sweepUserDepositAddress
);
router3.post(
  "/treasury/sweep/all",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sweepAllEligibleAddresses
);
router3.post(
  "/treasury/sweep/hot-to-cold",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sweepHotToCold
);
router3.post(
  "/treasury/sweep/retry",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sweepRetryJob
);
router3.post(
  "/treasury/config",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.updateAutoSweepConfig
);
router3.get(
  "/treasury-jobs",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getSweepJobs
);
router3.get(
  "/treasury/sweep-queue",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.getSweepQueue
);
router3.post(
  "/treasury/sweep-queue/fund-gas",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.fundGasQueueItem
);
router3.post(
  "/treasury/sweep-queue/sweep",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.sweepQueueItem
);
router3.post(
  "/treasury/sweep-queue/cancel",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.cancelQueueItem
);
router3.post(
  "/treasury/sweep-queue/bulk-action",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.bulkActionQueue
);
router3.post(
  "/treasury/sweep-mode",
  requireAuth,
  requireRole(["ADMIN" /* ADMIN */, "SUPERADMIN" /* SUPERADMIN */]),
  adminController.updateSweepModeConfig
);
var adminRoutes_default = router3;

// server/routes/v1/webhookRoutes.ts
var import_express4 = require("express");
var import_crypto8 = __toESM(require("crypto"), 1);

// server/blockchain/webhooks/TatumWebhookHandler.ts
var TatumWebhookHandler = class {
  /**
   * Process an incoming Tatum transaction webhook payload
   */
  async handleIncomingNotification(payload) {
    logger.info(`[TatumWebhookHandler] Received webhook notification: ${JSON.stringify(payload)}`);
    const { address, txId, amount, asset, chain } = payload;
    if (asset && asset.toUpperCase() !== "USDT") {
      logger.info(`[TatumWebhookHandler] Ignoring non-USDT webhook asset: ${asset}`);
      return { status: "ignored", reason: "non_usdt_asset" };
    }
    const addressRecord = await depositAddressRepository.findByAddress(address);
    if (!addressRecord) {
      logger.warn(`[TatumWebhookHandler] Webhook address ${address} does not map to any system user. Ignoring.`);
      return { status: "ignored", reason: "address_not_found" };
    }
    const userId = addressRecord.userId;
    const network = addressRecord.network;
    const networkConfig = blockchainConfig.networks[network];
    const expectedContractAddress = networkConfig?.contractAddress;
    const incomingContractAddress = payload.contractAddress || payload.tokenAddress || payload.contract;
    if (!networkConfig || !expectedContractAddress) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Missing network configuration for network=${network}. txHash=${txId}, network=${network}, incomingContractAddress=${incomingContractAddress || "MISSING"}, expectedContractAddress=NONE, depositAddress=${address}`
      );
      return { status: "rejected", reason: "missing_network_config" };
    }
    if (!incomingContractAddress) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Missing contract address in webhook payload. txHash=${txId}, network=${network}, incomingContractAddress=MISSING, expectedContractAddress=${expectedContractAddress}, depositAddress=${address}`
      );
      return { status: "rejected", reason: "missing_contract_address" };
    }
    const isTron = network === "USDT_TRC20";
    const isContractValid = isTron ? incomingContractAddress === expectedContractAddress : incomingContractAddress.toLowerCase() === expectedContractAddress.toLowerCase();
    if (!isContractValid) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Fake or mismatched token contract address detected! txHash=${txId}, network=${network}, incomingContractAddress=${incomingContractAddress}, expectedContractAddress=${expectedContractAddress}, depositAddress=${address}`
      );
      return { status: "rejected", reason: "contract_address_mismatch" };
    }
    const existingDeposit = await depositRepository.findByTxHash(txId);
    if (existingDeposit) {
      if (existingDeposit.status === "COMPLETED") {
        logger.info(`[TatumWebhookHandler] Webhook tx ${txId} was already successfully processed. Skipping.`);
        return { status: "processed_already", depositId: existingDeposit.id };
      }
      logger.info(`[TatumWebhookHandler] Webhook tx ${txId} exists as pending. Completing now.`);
      await depositService.processSuccessfulDeposit(existingDeposit.id, txId, "SYSTEM");
      return { status: "completed", depositId: existingDeposit.id };
    }
    const networkDecimals = networkConfig?.decimals ?? (network === "USDT_BEP20" ? 18 : 6);
    const normalizedAmount = normalizeAmount(amount, networkDecimals);
    logger.info(`[TatumWebhookHandler] Generating new deposit record for user ${userId} of ${normalizedAmount} USDT via webhook.`);
    const newDeposit = await depositService.createDeposit(userId, normalizedAmount, network, address, txId);
    await depositService.processSuccessfulDeposit(newDeposit.id, txId, "SYSTEM");
    return { status: "created_and_completed", depositId: newDeposit.id };
  }
};
var tatumWebhookHandler = new TatumWebhookHandler();

// server/routes/v1/webhookRoutes.ts
var router4 = (0, import_express4.Router)();
var WEBHOOK_SECRET = process.env.TATUM_WEBHOOK_SECRET || "";
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers["x-tatum-signature"] || req.headers["x-payload-signature"];
  const timestampHeader = req.headers["x-tatum-timestamp"] || req.headers["x-timestamp"];
  if (timestampHeader) {
    const requestTime = parseInt(timestampHeader, 10);
    const currentTime = Math.floor(Date.now() / 1e3);
    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 300) {
      logger.warn("[Webhook] Replay attack detected or timestamp skewed too far.");
      return res.status(401).json({ error: "Replay attack or timestamp skewed too far." });
    }
  }
  if (process.env.NODE_ENV === "production" || WEBHOOK_SECRET) {
    if (!signature) {
      logger.warn("[Webhook] Request rejected: missing signature header.");
      return res.status(401).json({ error: "Missing webhook signature header." });
    }
    if (!WEBHOOK_SECRET) {
      logger.error("[Webhook] TATUM_WEBHOOK_SECRET is not configured on the server. Rejecting all webhooks for security.");
      return res.status(500).json({ error: "Server misconfiguration." });
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      logger.warn("[Webhook] Request rejected: empty raw body.");
      return res.status(400).json({ error: "Empty payload body." });
    }
    try {
      const hmac = import_crypto8.default.createHmac("sha512", WEBHOOK_SECRET);
      const computedSignature = hmac.update(rawBody).digest("hex");
      const isSignatureValid = import_crypto8.default.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(signature)
      );
      if (!isSignatureValid) {
        logger.warn("[Webhook] Request rejected: signature verification failed (forged payload).");
        return res.status(401).json({ error: "Signature verification failed." });
      }
    } catch (err) {
      logger.error("[Webhook] Error during signature verification:", err.message);
      return res.status(500).json({ error: "Internal signature verification error." });
    }
  } else {
    logger.warn("[Webhook] WEBHOOK_SECRET not set. Skipping signature verification (development/simulation mode).");
  }
  next();
}
router4.post("/tatum", verifyWebhookSignature, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.address || !payload.txId || !payload.amount) {
      logger.warn(`[Webhook] Rejected invalid payload format: ${JSON.stringify(payload)}`);
      return res.status(400).json({ error: "Invalid payload structure. Required: address, txId, amount" });
    }
    const result = await tatumWebhookHandler.handleIncomingNotification(payload);
    return res.status(200).json(result);
  } catch (err) {
    logger.error("[Webhook] Failed to process incoming Tatum webhook:", err.message);
    return res.status(500).json({ error: "Failed to process webhook transaction." });
  }
});
var webhookRoutes_default = router4;

// server/routes/v1/index.ts
var router5 = (0, import_express5.Router)();
router5.use("/auth", authRoutes_default);
router5.use("/users", userRoutes_default);
router5.use("/admin", adminRoutes_default);
router5.use("/webhooks", webhookRoutes_default);
router5.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var v1_default = router5;

// server/routes/index.ts
var router6 = (0, import_express6.Router)();
router6.use("/v1", v1_default);
var routes_default = router6;

// server/blockchain/services/TransactionMonitor.ts
init_notificationService();
var TransactionMonitor = class {
  // Required on-chain confirmations
  constructor(provider = activeBlockchainProvider) {
    this.provider = provider;
    this.timer = null;
    this.isChecking = false;
    // Track consecutive non-existence of transaction hash on-chain to save API credits
    this.queryAttempts = {};
    // Max times we poll Tatum for a txHash before assuming it's an invalid or fake hash
    this.MAX_ATTEMPTS = 30;
    // 30 checks * 30s interval = 15 minutes
    this.CONFIRMATIONS_REQUIRED = 6;
  }
  /**
   * Start background transaction monitor loop
   */
  start(intervalMs = 3e4) {
    if (this.timer) {
      logger.info("Transaction monitor is already running.");
      return;
    }
    logger.info(`Starting background transaction monitoring loop (Interval: ${intervalMs}ms)...`);
    this.timer = setInterval(() => this.checkPendingDeposits(), intervalMs);
    this.checkPendingDeposits().catch((err) => {
      logger.error("Error in initial transaction monitoring check:", err);
    });
  }
  /**
   * Stop background transaction monitor loop
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info("Transaction monitor loop stopped.");
    }
  }
  /**
   * Scan database for pending deposits with txHash and verify on-chain
   */
  async checkPendingDeposits() {
    if (this.isChecking) {
      logger.debug("Previous transaction check is still executing. Skipping this tick.");
      return;
    }
    this.isChecking = true;
    try {
      const pendingDeposits = await depositRepository.findAll({ status: "PENDING" });
      const withTxHash = pendingDeposits.filter((d) => !!d.txHash);
      if (withTxHash.length === 0) {
        this.isChecking = false;
        return;
      }
      logger.debug(`Polling on-chain status for ${withTxHash.length} pending deposits...`);
      for (const deposit of withTxHash) {
        const txHash = deposit.txHash;
        const depositId = deposit.id;
        try {
          const blockchainTx = await this.provider.getTransaction(deposit.network, txHash);
          if (!blockchainTx) {
            const attempts = (this.queryAttempts[depositId] || 0) + 1;
            this.queryAttempts[depositId] = attempts;
            if (attempts >= this.MAX_ATTEMPTS) {
              logger.warn(`Deposit ${depositId} with hash ${txHash} has timed out on-chain after ${attempts} attempts. Marking as FAILED.`);
              await depositRepository.updateStatus(depositId, "FAILED", {
                adminNotes: `On-chain monitoring timeout: Transaction hash was not detected within ${this.MAX_ATTEMPTS} poll intervals.`
              });
              await notificationService.createStructuredNotification(deposit.userId, {
                title: "Deposit Verification Failed",
                description: `Verification for your deposit of ${deposit.amount} USDT timed out. Please verify your transaction hash or submit a support ticket.`,
                icon: "XCircle",
                type: "deposit",
                priority: "HIGH"
              });
              delete this.queryAttempts[depositId];
            } else {
              logger.debug(`Tx ${txHash} not yet found on-chain. Attempt ${attempts}/${this.MAX_ATTEMPTS}`);
            }
            continue;
          }
          this.queryAttempts[depositId] = 0;
          if (!blockchainTx.isSuccessful) {
            logger.warn(`Transaction hash ${txHash} is marked as FAILED on-chain. Updating deposit record.`);
            await depositRepository.updateStatus(depositId, "FAILED", {
              adminNotes: "Transaction was marked as FAILED by the on-chain network explorers."
            });
            await notificationService.createStructuredNotification(deposit.userId, {
              title: "Deposit Failed on Blockchain",
              description: `Your transaction of ${deposit.amount} USDT on ${deposit.network} was marked as failed on-chain.`,
              icon: "XCircle",
              type: "deposit",
              priority: "HIGH"
            });
            delete this.queryAttempts[depositId];
            continue;
          }
          const confirmations = blockchainTx.confirmations;
          if (confirmations >= this.CONFIRMATIONS_REQUIRED) {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) reached ${confirmations}/${this.CONFIRMATIONS_REQUIRED} confirmations. Crediting user account.`);
            await depositService.processSuccessfulDeposit(depositId, txHash, "SYSTEM");
            delete this.queryAttempts[depositId];
          } else {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) found on-chain with ${confirmations}/${this.CONFIRMATIONS_REQUIRED} confirmations. Awaiting additional blocks...`);
          }
        } catch (error) {
          logger.error(`Error processing transaction monitoring check for deposit ID ${depositId} (hash: ${txHash}):`, error);
        }
      }
    } catch (err) {
      logger.error("Fatal error encountered in background transaction monitoring workflow:", err);
    } finally {
      this.isChecking = false;
    }
  }
};
var transactionMonitor = new TransactionMonitor();

// server/services/transactionMonitor.ts
var transactionMonitor2 = transactionMonitor;

// server.ts
async function bootstrap() {
  const app = (0, import_express7.default)();
  const PORT = config2.port;
  try {
    await treasuryService.ensureAllTreasuryWallets();
    logger.info("[Bootstrap] Treasury wallets verified/seeded successfully.");
  } catch (err) {
    logger.error("[Bootstrap] Failed to verify/seed treasury wallets:", err.message);
  }
  app.set("trust proxy", true);
  logger.info(`Starting CeFi Platform Foundation in [${config2.nodeEnv}] mode...`);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(import_express7.default.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(import_express7.default.urlencoded({ extended: true }));
  app.use((0, import_cookie_parser.default)());
  app.use("/api", rateLimiter(15 * 60 * 1e3, 300), routes_default);
  if (config2.nodeEnv !== "production") {
    logger.info("Mounting Vite middleware for Hot-Module replacement and client builds...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Mounting production static assets build directories...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express7.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.use(errorHandler);
  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server successfully bound to host 0.0.0.0, listening on port ${PORT}`);
    transactionMonitor2.start();
    sweepQueueProcessor.start();
  });
  const shutdown = () => {
    logger.info("Received shutdown signal. Commencing graceful termination...");
    transactionMonitor2.stop();
    sweepQueueProcessor.stop();
    server.close(() => {
      logger.info("Express server successfully closed. Process exiting.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
bootstrap().catch((error) => {
  logger.error("Fatal initialization error during bootstrap sequence:", error);
  process.exit(1);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
