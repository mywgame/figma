/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { systemSettings, userSettings } from '../../src/db/schema.ts';

export class SettingsRepository {
  /* =========================================================================
   * SYSTEM SETTINGS (GLOBAL PLATFORM BUSINESS RULES)
   * ========================================================================= */

  /**
   * Find a specific system configuration setting by its string key identifier
   */
  async findSystemSettingByKey(key: string) {
    try {
      const result = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findSystemSettingByKey) failed:', error);
      throw new Error('Failed to retrieve system setting.');
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
      console.error('Database query (findAllSystemSettings) failed:', error);
      throw new Error('Failed to retrieve all system settings.');
    }
  }

  /**
   * Update or create a system setting (by key)
   */
  async upsertSystemSetting(data: {
    id: number;
    key: string;
    value: string;
    description?: string;
    updatedBy?: string;
  }) {
    try {
      const result = await db
        .insert(systemSettings)
        .values({
          id: data.id,
          key: data.key,
          value: data.value,
          description: data.description || null,
          updatedBy: data.updatedBy || 'SYSTEM',
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: data.value,
            description: data.description || null,
            updatedBy: data.updatedBy || 'SYSTEM',
            updatedAt: new Date(),
          },
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database query (upsertSystemSetting) failed:', error);
      throw new Error('Failed to upsert system configuration.');
    }
  }

  /**
   * Update an existing system setting value by key
   */
  async updateSystemSetting(key: string, value: string, updatedBy?: string) {
    try {
      const result = await db
        .update(systemSettings)
        .set({
          value,
          updatedBy: updatedBy || 'SYSTEM',
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateSystemSetting) failed:', error);
      throw new Error('Failed to update system configuration.');
    }
  }

  /* =========================================================================
   * USER SETTINGS (PERSONALIZED USER ACCOUNT PREFERENCES)
   * ========================================================================= */

  /**
   * Find localized preferences and security choices for a user
   */
  async findUserSettingsByUserId(userId: string) {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findUserSettingsByUserId) failed:', error);
      throw new Error('Failed to retrieve user settings.');
    }
  }

  /**
   * Create personalized default preferences for a user
   */
  async createUserSettings(data: {
    userId: string;
    mfaEnabled?: boolean;
    emailNotifications?: boolean;
    marketingConsent?: boolean;
    language?: string;
    theme?: string;
  }) {
    try {
      const result = await db
        .insert(userSettings)
        .values({
          userId: data.userId,
          mfaEnabled: data.mfaEnabled ?? false,
          emailNotifications: data.emailNotifications ?? true,
          marketingConsent: data.marketingConsent ?? false,
          language: data.language || 'en',
          theme: data.theme || 'light',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createUserSettings) failed:', error);
      throw new Error('Failed to create localized user preferences.');
    }
  }

  /**
   * Update localized personalizations or security flags for a user
   */
  async updateUserSettings(
    userId: string,
    updates: Partial<{
      mfaEnabled: boolean;
      emailNotifications: boolean;
      marketingConsent: boolean;
      language: string;
      theme: string;
    }>
  ) {
    try {
      const result = await db
        .update(userSettings)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateUserSettings) failed:', error);
      throw new Error('Failed to update user personalizations.');
    }
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
