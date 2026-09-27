/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Function to create a new connection pool using the Object Method.
export const createPool = () => {
  let connectionString = process.env.DATABASE_URL?.trim();

  // Strip wrapping quotes if present in environment secret
  if (connectionString) {
    if ((connectionString.startsWith('"') && connectionString.endsWith('"')) ||
        (connectionString.startsWith("'") && connectionString.endsWith("'"))) {
      connectionString = connectionString.slice(1, -1).trim();
    }
  }

  if (connectionString) {
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 10000, // Terminate idle pool connections after 10s so Neon compute can scale-to-zero
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      ssl: connectionString.includes('neon.tech') || connectionString.includes('sslmode=require') || connectionString.includes('railway') || connectionString.includes('rlwy.net') || process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  const cleanHost = process.env.SQL_HOST ? process.env.SQL_HOST.replace(/^["']|["']$/g, '').trim() : undefined;
  const cleanUser = process.env.SQL_USER ? process.env.SQL_USER.replace(/^["']|["']$/g, '').trim() : undefined;
  const cleanPassword = process.env.SQL_PASSWORD ? process.env.SQL_PASSWORD.replace(/^["']|["']$/g, '').trim() : undefined;
  const cleanDb = process.env.SQL_DB_NAME ? process.env.SQL_DB_NAME.replace(/^["']|["']$/g, '').trim() : undefined;

  // Fall back to individual SQL credentials only if DATABASE_URL is absent
  return new Pool({
    host: cleanHost,
    user: cleanUser,
    password: cleanPassword,
    database: cleanDb,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl: cleanHost?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
};

// Create a pool instance.
export const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

