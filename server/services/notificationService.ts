/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { notificationRepository } from '../repositories/notificationRepository.ts';

export class NotificationService {
  /**
   * Dispatch a notification to a specific user
   */
  async createNotification(userId: string, message: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
    return notificationRepository.createNotification({ userId, message, priority });
  }

  /**
   * Retrieve paginated notifications for a user
   */
  async getUserNotifications(userId: string, options?: { limit?: number; offset?: number; read?: boolean }) {
    return notificationRepository.findByUserId(userId, options);
  }

  /**
   * Mark a specific notification as read after authorization check
   */
  async markNotificationAsRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error(`Notification not found with ID: ${id}`);
    }
    if (notification.userId !== userId) {
      throw new Error('Unauthorized notification action.');
    }
    return notificationRepository.markAsRead(id);
  }

  /**
   * Mark all notifications of a user as read
   */
  async markAllNotificationsAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Dismiss/Delete a notification after authorization check
   */
  async deleteNotification(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error(`Notification not found with ID: ${id}`);
    }
    if (notification.userId !== userId) {
      throw new Error('Unauthorized notification action.');
    }
    return notificationRepository.deleteNotification(id);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
