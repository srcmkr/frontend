/**
 * Settings API Functions
 *
 * Raw API calls for settings operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { User, ApiKey, NotificationChannel } from "@/types";
import type {
  MonitoringSettings,
  NotificationSettings,
  DataSettings,
  StatusPageSettings,
  SystemSettings,
} from "./types";

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

  // ============================================
  // Settings Categories
  // ============================================

  // Monitoring Settings
  getMonitoringSettings: () =>
    apiClient.get<MonitoringSettings>("/settings/monitoring"),
  updateMonitoringSettings: (data: MonitoringSettings) =>
    apiClient.patch<MonitoringSettings>("/settings/monitoring", data),

  // Notification Settings
  getNotificationSettings: () =>
    apiClient.get<NotificationSettings>("/settings/notifications"),
  updateNotificationSettings: (data: NotificationSettings) =>
    apiClient.patch<NotificationSettings>("/settings/notifications", data),

  // Data Settings
  getDataSettings: () => apiClient.get<DataSettings>("/settings/data"),
  updateDataSettings: (data: DataSettings) =>
    apiClient.patch<DataSettings>("/settings/data", data),

  // Status Page Settings
  getStatusPageSettings: () =>
    apiClient.get<StatusPageSettings>("/settings/status-pages"),
  updateStatusPageSettings: (data: StatusPageSettings) =>
    apiClient.patch<StatusPageSettings>("/settings/status-pages", data),

  // System Settings
  getSystemSettings: () => apiClient.get<SystemSettings>("/settings/system"),
  updateSystemSettings: (data: SystemSettings) =>
    apiClient.patch<SystemSettings>("/settings/system", data),
};
