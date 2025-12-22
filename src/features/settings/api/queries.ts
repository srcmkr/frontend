/**
 * Settings Query Hooks
 *
 * TanStack Query hooks for fetching settings data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "./keys";
import { settingsApi } from "./settings-api";

/**
 * Fetch API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: settingsKeys.apiKeys(),
    queryFn: () => settingsApi.getApiKeys(),
  });
}

/**
 * Fetch notification channels
 */
export function useNotificationChannels() {
  return useQuery({
    queryKey: settingsKeys.notificationChannels(),
    queryFn: () => settingsApi.getNotificationChannels(),
  });
}

/**
 * Fetch users
 */
export function useUsers() {
  return useQuery({
    queryKey: settingsKeys.users(),
    queryFn: () => settingsApi.getUsers(),
  });
}
