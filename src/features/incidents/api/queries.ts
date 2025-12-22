/**
 * Incident Query Hooks
 *
 * TanStack Query hooks for fetching incident data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { incidentKeys } from "./keys";
import { incidentApi } from "./incident-api";
import type { IncidentFilterState } from "@/types";

/**
 * Fetch all incidents
 */
export function useIncidents(filters?: Partial<IncidentFilterState>) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => incidentApi.getAll(),
  });
}

/**
 * Fetch all incidents with Suspense support
 */
export function useIncidentsSuspense(filters?: Partial<IncidentFilterState>) {
  return useSuspenseQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => incidentApi.getAll(),
  });
}

/**
 * Fetch a single incident by ID
 */
export function useIncident(id: string | null) {
  return useQuery({
    queryKey: incidentKeys.detail(id ?? ""),
    queryFn: () => incidentApi.getById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch incident statistics
 */
export function useIncidentStats() {
  return useQuery({
    queryKey: incidentKeys.stats(),
    queryFn: () => incidentApi.getStats(),
  });
}
