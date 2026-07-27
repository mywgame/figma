/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Resend } from 'resend';
import { config } from '../config/index.ts';
import type { EmailProvider, SendEmailParams } from './emailProvider.ts';

/**
 * ResendProvider — the ONLY file in the entire codebase allowed to import or
 * call the Resend SDK. Every other file must go through EmailService, which
 * depends only on the EmailProvider interface, never on this class directly.
 *
 * Configuration is REQUIRED — no hardcoded defaults. Missing configuration
 * fails fast (throws) at construction time rather than failing silently
 * later when an email is actually sent.
 */
export class ResendProvider implements EmailProvider {
  private client: Resend | null = null;
  private readonly apiKey?: string;
  private readonly fromAddress?: string;

  constructor(apiKey: string | undefined = config.email.resendApiKey, fromAddress: string | undefined = config.email.fromAddress) {
    this.apiKey = apiKey ? apiKey.replace(/^['"]|['"]$/g, '').trim() : undefined;
    this.fromAddress = fromAddress ? fromAddress.replace(/^['"]|['"]$/g, '').trim() : undefined;
  }

  private getClient(): { client: Resend; fromAddress: string } {
    if (!this.apiKey) {
      throw new Error('RESEND_API_KEY is not configured in the environment. Real email delivery is required.');
    }
    if (!this.fromAddress) {
      throw new Error('EMAIL_FROM is not configured in the environment. Real email delivery is required.');
    }
    if (!this.client) {
      this.client = new Resend(this.apiKey);
    }
    return { client: this.client, fromAddress: this.fromAddress };
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    console.log(`[Resend] Initiating real email delivery to ${to} with subject: "${subject}"`);
    try {
      const { client, fromAddress } = this.getClient();
      const response = await client.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });

      console.log('[Resend API Response]:', JSON.stringify(response, null, 2));

      if (response.error) {
        throw new Error(`Resend API Error (HTTP ${response.error.statusCode || '422'}): ${response.error.message} [Name: ${response.error.name}]`);
      }
    } catch (err: any) {
      console.error('[Resend Send Exception]:', err);
      throw err;
    }
  }
}

export default ResendProvider;
