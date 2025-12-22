/**
 * Query Key Factory for Monitors
 *
 * Provides consistent, type-safe query keys for all monitor-related queries.
 * Keys are hierarchical to enable targeted cache invalidation.
 */

export const monitorKeys = {
  // Base key for all monitor queries
  all: ["monitors"] as const,

  // List queries - filters are applied client-side, not in query key
  // This ensures proper caching behavior since API returns all monitors
  lists: () => [...monitorKeys.all, "list"] as const,
  list: () => [...monitorKeys.lists()] as const,

  // Detail queries
  details: () => [...monitorKeys.all, "detail"] as const,
  detail: (id: string) => [...monitorKeys.details(), id] as const,

  // Sub-resources for a specific monitor
  checks: (id: string, hours?: number) =>
    [...monitorKeys.detail(id), "checks", hours ?? 24] as const,
  stats: (id: string) => [...monitorKeys.detail(id), "stats"] as const,
  uptimeHistory: (id: string) =>
    [...monitorKeys.detail(id), "uptime-history"] as const,
};

// Service Groups (separate from monitors but related)
export const serviceGroupKeys = {
  all: ["service-groups"] as const,
  list: () => [...serviceGroupKeys.all, "list"] as const,
};
