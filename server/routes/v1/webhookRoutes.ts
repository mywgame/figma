/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { tatumWebhookHandler } from '../../blockchain/webhooks/TatumWebhookHandler.ts';
import { logger } from '../../utils/logger.ts';

const router = Router();

// Retrieve Tatum webhook secret from environment (or default to fallback in non-production)
const WEBHOOK_SECRET = process.env.TATUM_WEBHOOK_SECRET || '';

/**
 * Middleware to strictly verify Tatum webhook signatures and timestamps to prevent replay/forgery attacks.
 */
function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-tatum-signature'] as string || req.headers['x-payload-signature'] as string;
  const timestampHeader = req.headers['x-tatum-timestamp'] as string || req.headers['x-timestamp'] as string;

  // 1. Replay attack protection: If timestamp is present, verify it is within a 5-minute window (300 seconds)
  if (timestampHeader) {
    const requestTime = parseInt(timestampHeader, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 300) {
      logger.warn('[Webhook] Replay attack detected or timestamp skewed too far.');
      return res.status(401).json({ error: 'Replay attack or timestamp skewed too far.' });
    }
  }

  // 2. Strict Signature Enforcement in Production / when Secret is configured
  if (process.env.NODE_ENV === 'production' || WEBHOOK_SECRET) {
    if (!signature) {
      logger.warn('[Webhook] Request rejected: missing signature header.');
      return res.status(401).json({ error: 'Missing webhook signature header.' });
    }

    if (!WEBHOOK_SECRET) {
      logger.error('[Webhook] TATUM_WEBHOOK_SECRET is not configured on the server. Rejecting all webhooks for security.');
      return res.status(500).json({ error: 'Server misconfiguration.' });
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      logger.warn('[Webhook] Request rejected: empty raw body.');
      return res.status(400).json({ error: 'Empty payload body.' });
    }

    try {
      // Tatum signs using HMAC SHA512 of the raw body with the webhook secret
      const hmac = crypto.createHmac('sha512', WEBHOOK_SECRET);
      const computedSignature = hmac.update(rawBody).digest('hex');

      const computedBuf = Buffer.from(computedSignature, 'hex');
      const sigBuf = Buffer.from(signature.trim(), 'hex');

      // Use constant-time comparison to prevent timing attacks, checking equal lengths first
      const isSignatureValid = computedBuf.length === sigBuf.length && crypto.timingSafeEqual(computedBuf, sigBuf);

      if (!isSignatureValid) {
        logger.warn('[Webhook] Request rejected: signature verification failed (forged payload).');
        return res.status(401).json({ error: 'Signature verification failed.' });
      }
    } catch (err: any) {
      logger.error('[Webhook] Error during signature verification:', err.message);
      return res.status(500).json({ error: 'Internal signature verification error.' });
    }
  } else {
    // In local development/sandbox without TATUM_WEBHOOK_SECRET, we log a warning but allow for mock testing
    logger.warn('[Webhook] WEBHOOK_SECRET not set. Skipping signature verification (development/simulation mode).');
  }

  next();
}

/**
 * Production Webhook Endpoint
 * POST /api/v1/webhooks/tatum
 */
router.post('/tatum', verifyWebhookSignature, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Flexible extraction of payload fields sent by Tatum notifications
    const address = payload?.address || payload?.account || payload?.to || payload?.counterAddress;
    const txId = payload?.txId || payload?.txHash || payload?.hash || payload?.transactionId;
    const amount = payload?.amount || payload?.value;

    if (!payload || !address || !txId) {
      logger.warn(`[Webhook] Rejected invalid payload format: ${JSON.stringify(payload)}`);
      return res.status(400).json({ error: 'Invalid payload structure. Required: address, txId/txHash' });
    }

    const normalizedPayload = {
      ...payload,
      address,
      txId,
      amount: amount !== undefined ? String(amount) : '0',
    };

    const result = await tatumWebhookHandler.handleIncomingNotification(normalizedPayload);
    return res.status(200).json(result);
  } catch (err: any) {
    logger.error('[Webhook] Failed to process incoming Tatum webhook:', err.message);
    return res.status(500).json({ error: 'Failed to process webhook transaction.' });
  }
});

export default router;
