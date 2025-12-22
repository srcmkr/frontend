/**
 * Settings API Functions
 *
 * Raw API calls for settings operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

// Re-export types from mocks for now (will be moved to @/types later)
export type { ApiKey, NotificationChannel } from "@/mocks/settings";

/**
 * Settings API endpoints
 */
export const settingsApi = {
  // API Keys
  getApiKeys: () =>
    apiClient.get<import("@/mocks/settings").ApiKey[]>("/settings/api-keys"),

  // Notification Channels
  getNotificationChannels: () =>
    apiClient.get<import("@/mocks/settings").NotificationChannel[]>(
      "/settings/notification-channels"
    ),

  // Users
  getUsers: () => apiClient.get<User[]>("/settings/users"),
};
