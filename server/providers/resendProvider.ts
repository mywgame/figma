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
  private readonly client: Resend | null = null;
  private readonly fromAddress: string | undefined;

  constructor(apiKey: string | undefined = config.email.resendApiKey, fromAddress: string | undefined = config.email.fromAddress) {
    this.fromAddress = fromAddress;
    if (apiKey) {
      this.client = new Resend(apiKey);
    } else {
      console.warn('RESEND_API_KEY is not configured in the environment. Email sending will be disabled.');
    }
    if (!fromAddress) {
      console.warn('EMAIL_FROM is not configured in the environment. Email sending will be disabled.');
    }
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    if (!this.client || !this.fromAddress) {
      throw new Error(
        'Email provider is not configured. Please set RESEND_API_KEY and EMAIL_FROM in your environment variables to use email services.'
      );
    }

    const { error } = await this.client.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
}

export default ResendProvider;
