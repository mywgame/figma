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
  private readonly client: Resend;
  private readonly fromAddress: string;

  constructor(apiKey: string | undefined = config.email.resendApiKey, fromAddress: string | undefined = config.email.fromAddress) {
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not configured. Set RESEND_API_KEY in your environment before using ResendProvider.'
      );
    }
    if (!fromAddress) {
      throw new Error(
        'EMAIL_FROM is not configured. Set EMAIL_FROM in your environment before using ResendProvider (e.g. EMAIL_FROM="MetaFirm <noreply@metafirm.app>").'
      );
    }

    this.client = new Resend(apiKey);
    this.fromAddress = fromAddress;
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
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
