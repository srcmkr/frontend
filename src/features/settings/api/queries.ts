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

// ============================================
// Settings Category Queries
// ============================================

/**
 * Fetch monitoring settings
 */
export function useMonitoringSettings() {
  return useQuery({
    queryKey: settingsKeys.monitoring(),
    queryFn: () => settingsApi.getMonitoringSettings(),
  });
}

/**
 * Fetch notification settings
 */
export function useNotificationSettings() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => settingsApi.getNotificationSettings(),
  });
}

/**
 * Fetch data settings
 */
export function useDataSettings() {
  return useQuery({
    queryKey: settingsKeys.data(),
    queryFn: () => settingsApi.getDataSettings(),
  });
}

/**
 * Fetch status page settings
 */
export function useStatusPageSettings() {
  return useQuery({
    queryKey: settingsKeys.statusPage(),
    queryFn: () => settingsApi.getStatusPageSettings(),
  });
}

/**
 * Fetch system settings
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: () => settingsApi.getSystemSettings(),
  });
}
