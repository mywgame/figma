/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import userRoutes from './userRoutes.ts';
import authRoutes from './authRoutes.ts';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes
router.use('/users', userRoutes);

// Future endpoints placeholder (Wallets, Yield claims, Referrals, Salaries, Admin reports, etc.)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
