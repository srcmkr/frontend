/**
 * Settings Query Key Factory
 *
 * Hierarchical key structure for cache invalidation.
 */

export const settingsKeys = {
  all: ["settings"] as const,

  // API Keys
  apiKeys: () => [...settingsKeys.all, "api-keys"] as const,

  // Notification Channels
  notificationChannels: () => [...settingsKeys.all, "notification-channels"] as const,

  // Users
  users: () => [...settingsKeys.all, "users"] as const,
  user: (id: string) => [...settingsKeys.users(), id] as const,

  // Settings Categories
  monitoring: () => [...settingsKeys.all, "monitoring"] as const,
  notifications: () => [...settingsKeys.all, "notifications"] as const,
  data: () => [...settingsKeys.all, "data"] as const,
  statusPage: () => [...settingsKeys.all, "status-page"] as const,
  system: () => [...settingsKeys.all, "system"] as const,
};
