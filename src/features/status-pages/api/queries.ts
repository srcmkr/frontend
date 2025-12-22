/**
 * Status Page Query Hooks
 *
 * TanStack Query hooks for fetching status page data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { statusPageKeys } from "./keys";
import { statusPageApi } from "./status-page-api";

/**
 * Fetch all status pages
 */
export function useStatusPages() {
  return useQuery({
    queryKey: statusPageKeys.list(),
    queryFn: () => statusPageApi.getAll(),
  });
}

/**
 * Fetch all status pages with Suspense support
 */
export function useStatusPagesSuspense() {
  return useSuspenseQuery({
    queryKey: statusPageKeys.list(),
    queryFn: () => statusPageApi.getAll(),
  });
}

/**
 * Fetch a single status page by ID
 */
export function useStatusPage(id: string | null) {
  return useQuery({
    queryKey: statusPageKeys.detail(id ?? ""),
    queryFn: () => statusPageApi.getById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch a status page by slug (for public view)
 */
export function useStatusPageBySlug(slug: string | null) {
  return useQuery({
    queryKey: statusPageKeys.bySlug(slug ?? ""),
    queryFn: () => statusPageApi.getBySlug(slug!),
    enabled: !!slug,
  });
}
