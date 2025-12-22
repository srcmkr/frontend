/**
 * Status Page Query Key Factory
 *
 * Hierarchical key structure for cache invalidation.
 */

export const statusPageKeys = {
  all: ["status-pages"] as const,
  lists: () => [...statusPageKeys.all, "list"] as const,
  list: () => [...statusPageKeys.lists()] as const,
  details: () => [...statusPageKeys.all, "detail"] as const,
  detail: (id: string) => [...statusPageKeys.details(), id] as const,
  bySlug: (slug: string) => [...statusPageKeys.all, "slug", slug] as const,
};
