/**
 * Notification API Functions
 *
 * Raw API calls for notification operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { SystemNotification } from "@/types";

/**
 * Notification API endpoints
 */
export const notificationApi = {
  /**
   * Get all notifications
   */
  getAll: () => apiClient.get<SystemNotification[]>("/system-notifications"),

  /**
   * Mark a notification as read
   */
  markAsRead: (id: string) =>
    apiClient.patch<void>(`/system-notifications/${id}/read`, {}),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => apiClient.post<void>("/system-notifications/read-all", {}),

  /**
   * Delete a notification
   */
  delete: (id: string) => apiClient.delete<void>(`/system-notifications/${id}`),
};
