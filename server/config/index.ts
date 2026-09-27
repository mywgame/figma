/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { cleanEnv, cleanEnvOrNull } from '../utils/envUtils.ts';

export const config = {
  port: 3000,
  nodeEnv: cleanEnv(process.env.NODE_ENV) || 'development',
  clientUrl: cleanEnv(process.env.CLIENT_URL) || 'http://localhost:3000',
  jwt: {
    secret: cleanEnv(process.env.JWT_SECRET) || 'super-secret-key-change-in-production',
    refreshSecret: cleanEnv(process.env.JWT_REFRESH_SECRET) || 'super-refresh-secret-key-change-in-production',
    expiresIn: cleanEnv(process.env.JWT_EXPIRES_IN) || '30m',
    refreshExpiresIn: cleanEnv(process.env.JWT_REFRESH_EXPIRES_IN) || '7d',
  },
  database: {
    host: cleanEnvOrNull(process.env.SQL_HOST),
    user: cleanEnvOrNull(process.env.SQL_USER),
    password: cleanEnvOrNull(process.env.SQL_PASSWORD),
    dbName: cleanEnvOrNull(process.env.SQL_DB_NAME),
    adminUser: cleanEnvOrNull(process.env.SQL_ADMIN_USER),
    adminPassword: cleanEnvOrNull(process.env.SQL_ADMIN_PASSWORD),
  },
  email: {
    // No fallback defaults — these are required. EmailService/ResendProvider
    // fail fast (throw) at construction time if either is missing.
    resendApiKey: cleanEnvOrNull(process.env.RESEND_API_KEY) || undefined,
    fromAddress: cleanEnvOrNull(process.env.EMAIL_FROM) || undefined,
  }
};
