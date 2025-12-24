/**
 * Query Key Factory for Notifications
 *
 * Provides consistent, type-safe query keys for all notification-related queries.
 * Keys are hierarchical to enable targeted cache invalidation.
 */

export const notificationKeys = {
  // Base key for all notification queries
  all: ["notifications"] as const,

  // List queries
  lists: () => [...notificationKeys.all, "list"] as const,
  list: () => [...notificationKeys.lists()] as const,
};
