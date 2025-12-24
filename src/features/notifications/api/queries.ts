/**
 * Notification Query Hooks
 *
 * TanStack Query hooks for fetching notification data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "./keys";
import { notificationApi } from "./notification-api";

/**
 * Fetch all notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.getAll(),
    // Refetch every 30 seconds for real-time updates
    refetchInterval: 30000,
  });
}
