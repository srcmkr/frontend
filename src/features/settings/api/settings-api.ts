/**
 * Settings API Functions
 *
 * Raw API calls for settings operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { User, ApiKey, NotificationChannel } from "@/types";

/**
 * Settings API endpoints
 */
export const settingsApi = {
  // API Keys
  getApiKeys: () => apiClient.get<ApiKey[]>("/settings/api-keys"),

  // Notification Channels
  getNotificationChannels: () =>
    apiClient.get<NotificationChannel[]>("/settings/notification-channels"),

  // Users
  getUsers: () => apiClient.get<User[]>("/settings/users"),
};
