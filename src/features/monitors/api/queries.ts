/**
 * Monitor Query Hooks
 *
 * TanStack Query hooks for fetching monitor data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { monitorKeys, serviceGroupKeys } from "./keys";
import { monitorApi, serviceGroupApi } from "./monitor-api";

/**
 * Fetch all monitors with uptime history
 * Note: Filtering is done client-side after fetching all monitors
 */
export function useMonitors() {
  return useQuery({
    queryKey: monitorKeys.list(),
    queryFn: () => monitorApi.getAll(),
  });
}

/**
 * Fetch all monitors with Suspense support
 * Note: Filtering is done client-side after fetching all monitors
 */
export function useMonitorsSuspense() {
  return useSuspenseQuery({
    queryKey: monitorKeys.list(),
    queryFn: () => monitorApi.getAll(),
  });
}

/**
 * Fetch a single monitor by ID
 */
export function useMonitor(id: string | null) {
  return useQuery({
    queryKey: monitorKeys.detail(id ?? ""),
    queryFn: () => monitorApi.getById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch check results for a monitor
 */
export function useMonitorCheckResults(id: string | null, hours = 24) {
  return useQuery({
    queryKey: monitorKeys.checks(id ?? "", hours),
    queryFn: () => monitorApi.getCheckResults(id!, hours),
    enabled: !!id,
  });
}

/**
 * Fetch detailed statistics for a monitor
 */
export function useMonitorDetailedStats(id: string | null) {
  return useQuery({
    queryKey: monitorKeys.stats(id ?? ""),
    queryFn: () => monitorApi.getDetailedStats(id!),
    enabled: !!id,
  });
}

/**
 * Fetch all service groups
 */
export function useServiceGroups() {
  return useQuery({
    queryKey: serviceGroupKeys.list(),
    queryFn: () => serviceGroupApi.getAll(),
  });
}
