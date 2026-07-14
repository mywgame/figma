/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { settingsRepository } from '../repositories/settingsRepository.ts';

export class SettingsService {
  /* =========================================================================
   * SYSTEM SETTINGS (GLOBAL PLATFORM BUSINESS RULES)
   * ========================================================================= */

  /**
   * Retrieve a specific system configuration setting by key, with dynamic fallback support
   */
  async getSystemSetting(key: string, defaultValue = ''): Promise<string> {
    const setting = await settingsRepository.findSystemSettingByKey(key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Fetch all global platform configurations
   */
  async getSystemSettings() {
    return settingsRepository.findAllSystemSettings();
  }

  /**
   * Update an existing global platform configuration setting by key
   */
  async updateSystemSetting(key: string, value: string, adminUid: string) {
    const updatedSetting = await settingsRepository.updateSystemSetting(key, value, adminUid);
    if (!updatedSetting) {
      throw new Error(`System setting not found for key: ${key}`);
    }
    return updatedSetting;
  }

  /* =========================================================================
   * USER SETTINGS (PERSONALIZED USER ACCOUNT PREFERENCES)
   * ========================================================================= */

  /**
   * Fetch a user's localized preferences and security choices
   */
  async getUserSettings(userId: string) {
    let settings = await settingsRepository.findUserSettingsByUserId(userId);
    if (!settings) {
      // Lazy initialization fallback if user settings did not pre-exist
      settings = await settingsRepository.createUserSettings({
        userId,
      });
    }
    return settings;
  }

  /**
   * Update localized personalizations, notifications, or security choices for a user
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
    const settings = await this.getUserSettings(userId);
    return settingsRepository.updateUserSettings(userId, updates);
  }
}

export const settingsService = new SettingsService();
export default settingsService;
