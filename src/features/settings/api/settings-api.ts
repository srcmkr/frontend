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

// ============================================
// Notification Channel Types
// ============================================

export interface CreateNotificationChannelRequest {
  name: string;
  type: "email" | "webhook";
  config: {
    apiKey?: string;
    fromEmail?: string;
    toEmails?: string[];
    url?: string;
    headers?: Record<string, string>;
  };
}

export interface UpdateNotificationChannelRequest {
  name?: string;
  enabled?: boolean;
  config?: {
    apiKey?: string;
    fromEmail?: string;
    toEmails?: string[];
    url?: string;
    headers?: Record<string, string>;
  };
}

export interface NotificationTestResult {
  success: boolean;
  message: string;
  errorDetails?: string;
}

// ============================================
// Config Transformation Helpers
// ============================================

// Transform frontend config to backend format
const transformConfigToBackend = (config: any, type: string) => {
  if (type === "webhook") {
    return {
      webhookUrl: config.url,
      webhookHeaders: config.headers,
    };
  }
  return config; // Email config matches
};

// Transform backend config to frontend format
const transformConfigFromBackend = (config: any, type: string) => {
  if (type === "webhook") {
    return {
      url: config.webhookUrl,
      headers: config.webhookHeaders,
    };
  }
  return config;
};

/**
 * Settings API endpoints
 */
export const settingsApi = {
  // API Keys
  getApiKeys: () => apiClient.get<ApiKey[]>("/settings/api-keys"),

  // Notification Channels
  getNotificationChannels: async () => {
    const channels = await apiClient.get<any[]>("/notifications");
    // Transform backend config to frontend format
    return channels.map((channel) => ({
      ...channel,
      config: transformConfigFromBackend(channel.config, channel.type),
    })) as NotificationChannel[];
  },

  createNotificationChannel: async (data: CreateNotificationChannelRequest) => {
    const requestData = {
      ...data,
      config: transformConfigToBackend(data.config, data.type),
    };
    const response = await apiClient.post<any>("/notifications", requestData);
    return {
      ...response,
      config: transformConfigFromBackend(response.config, response.type),
    } as NotificationChannel;
  },

  updateNotificationChannel: async (
    id: string,
    data: UpdateNotificationChannelRequest
  ) => {
    const requestData = data.config
      ? { ...data, config: transformConfigToBackend(data.config, "webhook") }
      : data;
    const response = await apiClient.patch<any>(
      `/notifications/${id}`,
      requestData
    );
    return {
      ...response,
      config: transformConfigFromBackend(response.config, response.type),
    } as NotificationChannel;
  },

  deleteNotificationChannel: (id: string) =>
    apiClient.delete<void>(`/notifications/${id}`),

  testNotificationChannel: (id: string) =>
    apiClient.post<NotificationTestResult>(`/notifications/${id}/test`),

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
