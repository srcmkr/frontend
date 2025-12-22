/**
 * Incident Query Key Factory
 *
 * Hierarchical key structure for cache invalidation.
 */

import type { IncidentFilterState } from "@/types";

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters?: Partial<IncidentFilterState>) =>
    [...incidentKeys.lists(), filters ?? {}] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  stats: () => [...incidentKeys.all, "stats"] as const,
};
