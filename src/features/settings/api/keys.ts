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
};
