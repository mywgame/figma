var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc16) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc16 = __getOwnPropDesc(from, key)) || desc16.enumerable });
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

// server.ts
var import_express6 = __toESM(require("express"), 1);
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
    const timestamp20 = (/* @__PURE__ */ new Date()).toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
    return `[${timestamp20}] [${level}] ${message}${metaString}`;
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
var import_express5 = require("express");

// server/routes/v1/index.ts
var import_express4 = require("express");

// server/routes/v1/userRoutes.ts
var import_express = require("express");

// server/repositories/userRepository.ts
var import_drizzle_orm12 = require("drizzle-orm");

// src/db/index.ts
var dotenv2 = __toESM(require("dotenv"), 1);
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);

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
  systemSettings: () => systemSettings,
  teamCommissionHistory: () => teamCommissionHistory,
  transactions: () => transactions,
  userSettings: () => userSettings,
  users: () => users,
  vipHistory: () => vipHistory,
  vipStatus: () => vipStatus,
  wallets: () => wallets,
  withdrawals: () => withdrawals
});

// src/db/users.ts
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)(
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

// src/db/wallets.ts
var import_pg_core2 = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var wallets = (0, import_pg_core2.pgTable)(
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

// src/db/deposit_addresses.ts
var import_pg_core3 = require("drizzle-orm/pg-core");
var depositAddresses = (0, import_pg_core3.pgTable)(
  "deposit_addresses",
  {
    id: (0, import_pg_core3.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, import_pg_core3.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    network: (0, import_pg_core3.text)("network").notNull(),
    // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20', etc.
    address: (0, import_pg_core3.text)("address").notNull(),
    // Unique generated blockchain wallet address
    createdAt: (0, import_pg_core3.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, import_pg_core3.timestamp)("updated_at").defaultNow().notNull()
  },
  (table) => [
    (0, import_pg_core3.uniqueIndex)("deposit_addresses_user_network_idx").on(table.userId, table.network),
    (0, import_pg_core3.uniqueIndex)("deposit_addresses_address_idx").on(table.address),
    (0, import_pg_core3.index)("deposit_addresses_user_idx").on(table.userId)
  ]
);

// src/db/deposits.ts
var import_pg_core4 = require("drizzle-orm/pg-core");
var import_drizzle_orm2 = require("drizzle-orm");
var deposits = (0, import_pg_core4.pgTable)(
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

// src/db/withdrawals.ts
var import_pg_core5 = require("drizzle-orm/pg-core");
var import_drizzle_orm3 = require("drizzle-orm");
var withdrawals = (0, import_pg_core5.pgTable)(
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

// src/db/transactions.ts
var import_pg_core6 = require("drizzle-orm/pg-core");
var import_drizzle_orm4 = require("drizzle-orm");
var transactions = (0, import_pg_core6.pgTable)(
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

// src/db/vip.ts
var import_pg_core7 = require("drizzle-orm/pg-core");
var import_drizzle_orm5 = require("drizzle-orm");
var vipStatus = (0, import_pg_core7.pgTable)(
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
var vipHistory = (0, import_pg_core7.pgTable)(
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

// src/db/referrals.ts
var import_pg_core8 = require("drizzle-orm/pg-core");
var import_drizzle_orm6 = require("drizzle-orm");
var referralRelationships = (0, import_pg_core8.pgTable)(
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
var referralIncomeHistory = (0, import_pg_core8.pgTable)(
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

// src/db/claims.ts
var import_pg_core9 = require("drizzle-orm/pg-core");
var import_drizzle_orm7 = require("drizzle-orm");
var claims = (0, import_pg_core9.pgTable)(
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

// src/db/income.ts
var import_pg_core10 = require("drizzle-orm/pg-core");
var import_drizzle_orm8 = require("drizzle-orm");
var incomeHistory = (0, import_pg_core10.pgTable)(
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

// src/db/salary.ts
var import_pg_core11 = require("drizzle-orm/pg-core");
var import_drizzle_orm9 = require("drizzle-orm");
var salaryHistory = (0, import_pg_core11.pgTable)(
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

// src/db/achievements.ts
var import_pg_core12 = require("drizzle-orm/pg-core");
var import_drizzle_orm10 = require("drizzle-orm");
var achievements = (0, import_pg_core12.pgTable)(
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

// src/db/notifications.ts
var import_pg_core13 = require("drizzle-orm/pg-core");
var notifications = (0, import_pg_core13.pgTable)(
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

// src/db/support.ts
var import_pg_core14 = require("drizzle-orm/pg-core");
var supportTickets = (0, import_pg_core14.pgTable)(
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
var supportMessages = (0, import_pg_core14.pgTable)(
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

// src/db/audit.ts
var import_pg_core15 = require("drizzle-orm/pg-core");
var auditLogs = (0, import_pg_core15.pgTable)(
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

// src/db/activities.ts
var import_pg_core16 = require("drizzle-orm/pg-core");
var activityLogs = (0, import_pg_core16.pgTable)(
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

// src/db/settings.ts
var import_pg_core17 = require("drizzle-orm/pg-core");
var systemSettings = (0, import_pg_core17.pgTable)(
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
var userSettings = (0, import_pg_core17.pgTable)(
  "user_settings",
  {
    id: (0, import_pg_core17.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, import_pg_core17.uuid)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    // 1-to-1 User configuration alignment
    mfaEnabled: (0, import_pg_core17.boolean)("mfa_enabled").default(false).notNull(),
    // Multi-Factor Auth status
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

// src/db/sessions.ts
var import_pg_core18 = require("drizzle-orm/pg-core");
var sessions = (0, import_pg_core18.pgTable)(
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

// src/db/team_commission_history.ts
var import_pg_core19 = require("drizzle-orm/pg-core");
var import_drizzle_orm11 = require("drizzle-orm");
var teamCommissionHistory = (0, import_pg_core19.pgTable)(
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

// src/db/index.ts
dotenv2.config();
var { Pool } = import_pg.default;
var createPool = () => {
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
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// shared/types/index.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["USER"] = "USER";
  UserRole2["VIP"] = "VIP";
  UserRole2["ADMIN"] = "ADMIN";
  UserRole2["SUPERADMIN"] = "SUPERADMIN";
  return UserRole2;
})(UserRole || {});

// server/repositories/userRepository.ts
var UserRepository = class {
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
var userRepository = new UserRepository();

// server/repositories/authRepository.ts
var import_drizzle_orm13 = require("drizzle-orm");
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

// server/repositories/walletRepository.ts
var import_drizzle_orm14 = require("drizzle-orm");
var WalletRepository = class {
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
var walletRepository = new WalletRepository();

// server/repositories/vipRepository.ts
var import_drizzle_orm15 = require("drizzle-orm");
var VipRepository = class {
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
var vipRepository = new VipRepository();

// server/repositories/activityRepository.ts
var import_drizzle_orm16 = require("drizzle-orm");
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

// server/repositories/depositAddressRepository.ts
var import_drizzle_orm19 = require("drizzle-orm");
var DepositAddressRepository = class {
  /**
   * Find all generated deposit addresses for a user
   */
  async findByUserId(userId) {
    try {
      const result = await db.select().from(depositAddresses).where((0, import_drizzle_orm19.eq)(depositAddresses.userId, userId));
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
        (0, import_drizzle_orm19.and)(
          (0, import_drizzle_orm19.eq)(depositAddresses.userId, userId),
          (0, import_drizzle_orm19.eq)(depositAddresses.network, network)
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
      const result = await db.select().from(depositAddresses).where((0, import_drizzle_orm19.eq)(depositAddresses.address, address));
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
        address: data.address
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Database insertion (createDepositAddress) failed:", error);
      throw new Error("Failed to store generated deposit address.");
    }
  }
};
var depositAddressRepository = new DepositAddressRepository();

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
      const existingAddresses = await depositAddressRepository.findByUserId(userId);
      if (existingAddresses.length === 0) {
        const randomHex = () => import_crypto.default.randomBytes(20).toString("hex");
        await depositAddressRepository.createDepositAddress({
          userId,
          network: "USDT_BEP20",
          address: `0x${randomHex()}`
        });
        await depositAddressRepository.createDepositAddress({
          userId,
          network: "USDT_POLYGON",
          address: `0x${randomHex()}`
        });
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let trcAddress = "T";
        for (let i = 0; i < 33; i++) {
          trcAddress += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        await depositAddressRepository.createDepositAddress({
          userId,
          network: "USDT_TRC20",
          address: trcAddress
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
    return {
      passwordChangedAt: user.passwordChangedAt,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockStatus: user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date() ? "LOCKED" : "UNLOCKED",
      lockUntil: user.lockUntil,
      currentLoginDevice: currentSession ? `${currentSession.browser || ""} on ${currentSession.device || ""}` : null,
      lastLoginTime: prevLogin ? prevLogin.createdAt : null,
      lastLoginIp: prevLogin ? prevLogin.ipAddress : null
    };
  }
};
var userService = new UserService();

// server/repositories/transactionRepository.ts
var import_drizzle_orm20 = require("drizzle-orm");
var TransactionRepository = class {
  /**
   * Find a transaction by its sequential database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(transactions).where((0, import_drizzle_orm20.eq)(transactions.id, id));
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
      const result = await db.select().from(transactions).where((0, import_drizzle_orm20.eq)(transactions.referenceId, referenceId));
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
      const conditions = [(0, import_drizzle_orm20.eq)(transactions.userId, userId)];
      if (type) {
        conditions.push((0, import_drizzle_orm20.eq)(transactions.type, type));
      }
      if (status) {
        conditions.push((0, import_drizzle_orm20.eq)(transactions.status, status));
      }
      const result = await query.where((0, import_drizzle_orm20.and)(...conditions)).orderBy((0, import_drizzle_orm20.desc)(transactions.createdAt)).limit(limit).offset(offset);
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
        conditions.push((0, import_drizzle_orm20.eq)(transactions.type, type));
      }
      if (status) {
        conditions.push((0, import_drizzle_orm20.eq)(transactions.status, status));
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm20.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm20.desc)(transactions.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve system transactions ledger.");
    }
  }
};
var transactionRepository = new TransactionRepository();

// server/repositories/referralRepository.ts
var import_drizzle_orm21 = require("drizzle-orm");
var ReferralRepository = class {
  /**
   * Find the upline/parent relationship for a given child user ID
   */
  async findRelationshipByChildId(childId) {
    try {
      const result = await db.select().from(referralRelationships).where((0, import_drizzle_orm21.eq)(referralRelationships.childId, childId));
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
      const conditions = [(0, import_drizzle_orm21.eq)(referralRelationships.parentId, parentId)];
      if (referralLevel !== void 0) {
        conditions.push((0, import_drizzle_orm21.eq)(referralRelationships.referralLevel, referralLevel));
      }
      const result = await query.where((0, import_drizzle_orm21.and)(...conditions)).orderBy((0, import_drizzle_orm21.desc)(referralRelationships.createdAt)).limit(limit).offset(offset);
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
      const result = await db.select().from(referralIncomeHistory).where((0, import_drizzle_orm21.eq)(referralIncomeHistory.userId, userId)).orderBy((0, import_drizzle_orm21.desc)(referralIncomeHistory.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (getReferralIncomeByUserId) failed:", error);
      throw new Error("Failed to load referral earnings history.");
    }
  }
};
var referralRepository = new ReferralRepository();

// server/repositories/incomeRepository.ts
var import_drizzle_orm22 = require("drizzle-orm");
var IncomeRepository = class {
  /**
   * Find an income record by its unique database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(incomeHistory).where((0, import_drizzle_orm22.eq)(incomeHistory.id, id));
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
      const conditions = [(0, import_drizzle_orm22.eq)(incomeHistory.userId, userId)];
      if (type) {
        conditions.push((0, import_drizzle_orm22.eq)(incomeHistory.type, type));
      }
      const result = await query.where((0, import_drizzle_orm22.and)(...conditions)).orderBy((0, import_drizzle_orm22.desc)(incomeHistory.createdAt)).limit(limit).offset(offset);
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
        totalAmount: import_drizzle_orm22.sql`sum(${incomeHistory.amount})`
      }).from(incomeHistory).where((0, import_drizzle_orm22.eq)(incomeHistory.userId, userId)).groupBy(incomeHistory.type);
      return result;
    } catch (error) {
      console.error("Database query (getIncomeSummaryByUserId) failed:", error);
      throw new Error("Failed to compute user income aggregation.");
    }
  }
};
var incomeRepository = new IncomeRepository();

// server/repositories/notificationRepository.ts
var import_drizzle_orm23 = require("drizzle-orm");
var NotificationRepository = class {
  /**
   * Find a notification by its unique database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(notifications).where((0, import_drizzle_orm23.eq)(notifications.id, id));
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
      const conditions = [(0, import_drizzle_orm23.eq)(notifications.userId, userId)];
      if (read !== void 0) {
        conditions.push((0, import_drizzle_orm23.eq)(notifications.read, read));
      }
      const result = await query.where((0, import_drizzle_orm23.and)(...conditions)).orderBy((0, import_drizzle_orm23.desc)(notifications.createdAt)).limit(limit).offset(offset);
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
      const result = await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm23.eq)(notifications.id, id)).returning();
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
      const result = await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm23.eq)(notifications.userId, userId)).returning();
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
      const result = await db.delete(notifications).where((0, import_drizzle_orm23.eq)(notifications.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Database deletion (deleteNotification) failed:", error);
      throw new Error("Failed to delete notification.");
    }
  }
};
var notificationRepository = new NotificationRepository();

// server/repositories/teamCommissionHistoryRepository.ts
var import_drizzle_orm24 = require("drizzle-orm");
var TeamCommissionHistoryRepository = class {
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
var teamCommissionHistoryRepository = new TeamCommissionHistoryRepository();

// server/repositories/auditRepository.ts
var import_drizzle_orm25 = require("drizzle-orm");
var AuditRepository = class {
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
var auditRepository = new AuditRepository();

// server/services/referralService.ts
var TEAM_COMMISSION_MATRIX = {
  VIP1: [0, 0, 0, 0],
  VIP2: [0.1, 0.05, 0.03, 0.02],
  VIP3: [0.12, 0.06, 0.04, 0.03],
  VIP4: [0.15, 0.08, 0.05, 0.04],
  VIP5: [0.17, 0.09, 0.06, 0.05],
  VIP6: [0.2, 0.1, 0.07, 0.06],
  VIP7: [0.22, 0.11, 0.08, 0.07],
  VIP8: [0.24, 0.12, 0.09, 0.08]
};
var ReferralService = class {
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
var referralService = new ReferralService();

// server/services/incomeService.ts
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

// server/services/claimService.ts
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

// server/controllers/userController.ts
var import_drizzle_orm27 = require("drizzle-orm");
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
      const walletRecord = await db.select().from(wallets).where((0, import_drizzle_orm27.eq)(wallets.userId, user.id));
      const vipRecord = await db.select().from(vipStatus).where((0, import_drizzle_orm27.eq)(vipStatus.userId, user.id));
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
};
var userController = new UserController();

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
var userRoutes_default = router;

// server/routes/v1/authRoutes.ts
var import_express2 = require("express");

// server/services/authService.ts
var import_crypto3 = __toESM(require("crypto"), 1);

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
  forgotPasswordAttempts: (email) => `otp:forgot-password:attempts:${email.toLowerCase()}`
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
var import_crypto2 = __toESM(require("crypto"), 1);
function generateOTP(length = 6) {
  if (length <= 0) return "";
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return import_crypto2.default.randomInt(min, max + 1).toString();
}

// server/cache/services/otpService.ts
var OtpService = class {
  /**
   * Check if a cooldown is active for a given email and type.
   * Returns remaining seconds, or 0 if no cooldown is active.
   */
  async getCooldownRemaining(email, type) {
    const cooldownKey = type === "register" ? REDIS_KEYS.registrationCooldown(email) : REDIS_KEYS.forgotPasswordCooldown(email);
    const exists = await redisClient.exists(cooldownKey);
    if (!exists) return 0;
    return CACHE_TTL.COOLDOWN_SECONDS;
  }
  /**
   * Generates a new 6-digit secure OTP, checks for active cooldown, and stores it.
   */
  async generateAndStoreOtp(email, type) {
    const trimmedEmail = email.trim().toLowerCase();
    const cooldownKey = type === "register" ? REDIS_KEYS.registrationCooldown(trimmedEmail) : REDIS_KEYS.forgotPasswordCooldown(trimmedEmail);
    const isCooldownActive = await redisClient.exists(cooldownKey);
    if (isCooldownActive) {
      throw new Error("Please wait 60 seconds before requesting a new verification code.");
    }
    const otp = generateOTP(6);
    const otpKey = type === "register" ? REDIS_KEYS.registrationOtp(trimmedEmail) : REDIS_KEYS.forgotPasswordOtp(trimmedEmail);
    await redisClient.set(otpKey, otp, "EX", CACHE_TTL.OTP_EXPIRY_SECONDS);
    await redisClient.set(cooldownKey, "1", "EX", CACHE_TTL.COOLDOWN_SECONDS);
    const attemptsKey = type === "register" ? REDIS_KEYS.registrationAttempts(trimmedEmail) : REDIS_KEYS.forgotPasswordAttempts(trimmedEmail);
    await redisClient.set(attemptsKey, "0", "EX", CACHE_TTL.OTP_EXPIRY_SECONDS);
    return { otp };
  }
  /**
   * Verifies an OTP with brute-force prevention.
   * Throws errors on failures, returns true on success.
   */
  async verifyOtp(email, otpCandidate, type) {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otpCandidate.trim();
    const otpKey = type === "register" ? REDIS_KEYS.registrationOtp(trimmedEmail) : REDIS_KEYS.forgotPasswordOtp(trimmedEmail);
    const attemptsKey = type === "register" ? REDIS_KEYS.registrationAttempts(trimmedEmail) : REDIS_KEYS.forgotPasswordAttempts(trimmedEmail);
    const attemptsStr = await redisClient.get(attemptsKey);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    if (attempts >= CACHE_TTL.MAX_ATTEMPTS) {
      await redisClient.del(otpKey);
      throw new Error("Too many failed attempts. This verification code has been invalidated. Please request a new one.");
    }
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp) {
      throw new Error("The verification code is invalid or has expired. Please request a new one.");
    }
    if (storedOtp !== cleanOtp) {
      const newAttempts = await redisClient.incr(attemptsKey);
      await redisClient.expire(attemptsKey, CACHE_TTL.OTP_EXPIRY_SECONDS);
      const remaining = CACHE_TTL.MAX_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        await redisClient.del(otpKey);
        throw new Error("Too many failed attempts. This verification code has been invalidated. Please request a new one.");
      }
      throw new Error(`Invalid verification code. You have ${remaining} attempts remaining.`);
    }
    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);
    const cooldownKey = type === "register" ? REDIS_KEYS.registrationCooldown(trimmedEmail) : REDIS_KEYS.forgotPasswordCooldown(trimmedEmail);
    await redisClient.del(cooldownKey);
    return true;
  }
};
var otpService = new OtpService();

// server/providers/resendProvider.ts
var import_resend = require("resend");
var ResendProvider = class {
  constructor(apiKey = config2.email.resendApiKey, fromAddress = config2.email.fromAddress) {
    this.client = null;
    this.fromAddress = fromAddress;
    if (apiKey) {
      this.client = new import_resend.Resend(apiKey);
    } else {
      console.warn("RESEND_API_KEY is not configured in the environment. Email sending will be disabled.");
    }
    if (!fromAddress) {
      console.warn("EMAIL_FROM is not configured in the environment. Email sending will be disabled.");
    }
  }
  async send({ to, subject, html }) {
    if (!this.client || !this.fromAddress) {
      throw new Error(
        "Email provider is not configured. Please set RESEND_API_KEY and EMAIL_FROM in your environment variables to use email services."
      );
    }
    const { error } = await this.client.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html
    });
    if (error) {
      throw new Error(`Failed to send email via Resend: ${error.message}`);
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

// server/services/authService.ts
function hashToken2(token) {
  return import_crypto3.default.createHash("sha256").update(token).digest("hex");
}
var pendingRegistrationsStore = /* @__PURE__ */ new Map();
var AuthService = class {
  /**
   * Helper to hash a plain reset token using SHA-256
   */
  hashResetToken(token) {
    return import_crypto3.default.createHash("sha256").update(token).digest("hex");
  }
  /**
   * Helper to generate a unique random 8-character uppercase referral code
   */
  async generateUniqueReferralCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = import_crypto3.default.randomBytes(4).toString("hex").toUpperCase();
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
    const uid = import_crypto3.default.randomUUID();
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
    try {
      await emailService.sendOtpEmail(trimmedEmail, otp, "verify your account");
    } catch (err) {
      console.error("Failed to send registration OTP email:", err);
    }
    const { passwordHash: _, ...safeUser } = pendingData;
    return {
      user: safeUser,
      debugOtp: process.env.NODE_ENV !== "production" ? otp : void 0
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
    const tokenHash = import_crypto3.default.createHash("sha256").update(refreshToken).digest("hex");
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
      success: true,
      debugOtp: process.env.NODE_ENV !== "production" ? otp : void 0
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
      message: "If the email is registered, a 6-digit verification code has been sent to your email address.",
      debugToken: process.env.NODE_ENV !== "production" ? otp : void 0
      // Map the generated OTP as debugToken in dev
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
          user: result.user,
          debugOtp: result.debugOtp
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
        data: {
          debugOtp: result.debugOtp
        }
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
        data: {
          debugToken: process.env.NODE_ENV !== "production" ? result.debugToken : void 0
        }
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

// server/repositories/supportRepository.ts
var import_drizzle_orm28 = require("drizzle-orm");
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
        status: "OPEN"
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

// server/repositories/depositRepository.ts
var import_drizzle_orm29 = require("drizzle-orm");
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

// server/repositories/withdrawalRepository.ts
var import_drizzle_orm30 = require("drizzle-orm");
var WithdrawalRepository = class {
  /**
   * Find a withdrawal by its unique sequential database ID
   */
  async findById(id) {
    try {
      const result = await db.select().from(withdrawals).where((0, import_drizzle_orm30.eq)(withdrawals.id, id));
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
      const result = await db.select().from(withdrawals).where((0, import_drizzle_orm30.eq)(withdrawals.reference, reference));
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
      const conditions = [(0, import_drizzle_orm30.eq)(withdrawals.userId, userId)];
      if (status) {
        conditions.push((0, import_drizzle_orm30.eq)(withdrawals.status, status));
      }
      const result = await query.where((0, import_drizzle_orm30.and)(...conditions)).orderBy((0, import_drizzle_orm30.desc)(withdrawals.createdAt)).limit(limit).offset(offset);
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
      }).where((0, import_drizzle_orm30.eq)(withdrawals.id, id)).returning();
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
        conditions.push((0, import_drizzle_orm30.eq)(withdrawals.status, status));
      }
      if (adminApprovalStatus) {
        conditions.push((0, import_drizzle_orm30.eq)(withdrawals.adminApprovalStatus, adminApprovalStatus));
      }
      if (conditions.length > 0) {
        query = query.where((0, import_drizzle_orm30.and)(...conditions));
      }
      const result = await query.orderBy((0, import_drizzle_orm30.desc)(withdrawals.createdAt)).limit(limit).offset(offset);
      return result;
    } catch (error) {
      console.error("Database query (findAll) failed:", error);
      throw new Error("Failed to retrieve withdrawals ledger.");
    }
  }
};
var withdrawalRepository = new WithdrawalRepository();

// server/services/vipService.ts
var VipService = class {
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
      await notificationRepository.createNotification({
        userId,
        message: `Your VIP membership has been updated from ${previousTier} to ${calculatedTier}.`,
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
var vipService = new VipService();

// server/services/withdrawalService.ts
var WithdrawalService = class {
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
    return withdrawal;
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
    await notificationRepository.createNotification({
      userId,
      message: `Your withdrawal request of ${withdrawal.amount} USDT has been completed successfully.`,
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
    await notificationRepository.createNotification({
      userId,
      message: `Your withdrawal request of ${withdrawal.amount} USDT was rejected. Reason: ${reason}. Funds have been refunded to your available balance.`,
      priority: "HIGH"
    });
    return updatedWithdrawal;
  }
};
var withdrawalService = new WithdrawalService();

// server/services/adminService.ts
var import_drizzle_orm31 = require("drizzle-orm");
var AdminService = class {
  /**
   * Fetch paginated, filtered and sorted list of admin users
   */
  async getAdminUsersPaginated(options) {
    const conditions = [];
    if (options.search) {
      const pattern = `%${options.search}%`;
      conditions.push(
        (0, import_drizzle_orm31.or)(
          (0, import_drizzle_orm31.like)(users.name, pattern),
          (0, import_drizzle_orm31.like)(users.email, pattern),
          (0, import_drizzle_orm31.like)(users.phone, pattern),
          (0, import_drizzle_orm31.like)(users.userId, pattern),
          (0, import_drizzle_orm31.like)(users.uid, pattern)
        )
      );
    }
    if (options.filter && options.filter !== "All") {
      if (options.filter === "Active") {
        conditions.push((0, import_drizzle_orm31.eq)(users.status, "ACTIVE"));
      } else if (options.filter === "Suspended") {
        conditions.push((0, import_drizzle_orm31.eq)(users.status, "SUSPENDED"));
      } else if (options.filter.startsWith("VIP")) {
        conditions.push((0, import_drizzle_orm31.eq)(vipStatus.tier, options.filter));
      }
    }
    let orderByClause;
    switch (options.sortBy) {
      case "HighestBalance":
        orderByClause = (0, import_drizzle_orm31.desc)(wallets.availableBalance);
        break;
      case "LowestBalance":
        orderByClause = (0, import_drizzle_orm31.asc)(wallets.availableBalance);
        break;
      case "HighestReferrals":
        orderByClause = (0, import_drizzle_orm31.desc)(vipStatus.levelAValidCount);
        break;
      case "HighestTeamSize":
        orderByClause = (0, import_drizzle_orm31.desc)(vipStatus.teamTotalCount);
        break;
      case "Newest":
        orderByClause = (0, import_drizzle_orm31.desc)(users.createdAt);
        break;
      case "Oldest":
        orderByClause = (0, import_drizzle_orm31.asc)(users.createdAt);
        break;
      default:
        orderByClause = (0, import_drizzle_orm31.desc)(users.createdAt);
    }
    const whereClause = conditions.length > 0 ? (0, import_drizzle_orm31.and)(...conditions) : void 0;
    const countResult = await db.select({ count: import_drizzle_orm31.sql`count(${users.id})::int` }).from(users).leftJoin(vipStatus, (0, import_drizzle_orm31.eq)(vipStatus.userId, users.id)).where(whereClause);
    const totalCount = countResult[0]?.count || 0;
    const results = await db.select({
      user: users,
      wallet: wallets,
      vip: vipStatus
    }).from(users).leftJoin(wallets, (0, import_drizzle_orm31.eq)(wallets.userId, users.id)).leftJoin(vipStatus, (0, import_drizzle_orm31.eq)(vipStatus.userId, users.id)).where(whereClause).orderBy(orderByClause).limit(options.limit).offset(options.offset);
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
    const vip = await db.select().from(vipStatus).where((0, import_drizzle_orm31.eq)(vipStatus.userId, user.id));
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
        const vip = await db.select().from(vipStatus).where((0, import_drizzle_orm31.eq)(vipStatus.userId, u.id));
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
    const updatedW = await withdrawalService.approveWithdrawal(withdrawalId, txHash, adminUid);
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
    const updatedW = await withdrawalService.rejectWithdrawal(withdrawalId, notes, adminUid);
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
};
var adminController = new AdminController();

// server/routes/v1/adminRoutes.ts
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
var adminRoutes_default = router3;

// server/routes/v1/index.ts
var router4 = (0, import_express4.Router)();
router4.use("/auth", authRoutes_default);
router4.use("/users", userRoutes_default);
router4.use("/admin", adminRoutes_default);
router4.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var v1_default = router4;

// server/routes/index.ts
var router5 = (0, import_express5.Router)();
router5.use("/v1", v1_default);
var routes_default = router5;

// server.ts
async function bootstrap() {
  const app = (0, import_express6.default)();
  const PORT = config2.port;
  app.set("trust proxy", true);
  logger.info(`Starting CeFi Platform Foundation in [${config2.nodeEnv}] mode...`);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(import_express6.default.json());
  app.use(import_express6.default.urlencoded({ extended: true }));
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
    app.use(import_express6.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.use(errorHandler);
  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server successfully bound to host 0.0.0.0, listening on port ${PORT}`);
  });
  const shutdown = () => {
    logger.info("Received shutdown signal. Commencing graceful termination...");
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
