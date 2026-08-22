/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { settingsRepository } from '../../repositories/settingsRepository.ts';
import { sendSuccess } from '../../utils/response.ts';

const router = Router();

/**
 * @route GET /api/v1/system/app-version
 * @desc Retrieve current APK version policy, minimum required version, and download link
 * @access Public (No authentication required so APK can verify on cold boot)
 */
router.get('/app-version', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      minVersionSetting,
      latestVersionSetting,
      downloadUrlSetting,
      releaseNotesSetting,
      forceUpdateSetting,
    ] = await Promise.all([
      settingsRepository.findSystemSettingByKey('MIN_REQUIRED_APK_VERSION'),
      settingsRepository.findSystemSettingByKey('LATEST_APK_VERSION'),
      settingsRepository.findSystemSettingByKey('APK_DOWNLOAD_URL'),
      settingsRepository.findSystemSettingByKey('APK_UPDATE_RELEASE_NOTES'),
      settingsRepository.findSystemSettingByKey('FORCE_UPDATE_ENABLED'),
    ]);

    const minRequiredVersion = minVersionSetting?.value || '1.0.0';
    const latestVersion = latestVersionSetting?.value || '1.0.0';
    const downloadUrl = downloadUrlSetting?.value || 'https://metafirm.app/download/metafirm-latest.apk';
    const releaseNotes = releaseNotesSetting?.value || 'Critical security update, database node connectivity improvements, and performance enhancements.';
    const forceUpdateEnabled = forceUpdateSetting?.value ? forceUpdateSetting.value === 'true' : true;

    return sendSuccess(res, {
      minRequiredVersion,
      latestVersion,
      downloadUrl,
      releaseNotes,
      forceUpdateEnabled,
      checkedAt: new Date().toISOString(),
    }, 200);
  } catch (error) {
    next(error);
  }
});

export default router;
