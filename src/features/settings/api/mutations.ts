/**
 * Settings Mutation Hooks
 *
 * TanStack Query mutations for updating settings.
 * No optimistic updates - settings changes are infrequent and critical.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "./keys";
import { settingsApi } from "./settings-api";
import type {
  MonitoringSettings,
  NotificationSettings,
  DataSettings,
  StatusPageSettings,
  SystemSettings,
} from "./types";

/**
 * Update monitoring settings
 */
export function useUpdateMonitoringSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MonitoringSettings) =>
      settingsApi.updateMonitoringSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.monitoring() });
    },
  });
}

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationSettings) =>
      settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

/**
 * Update data settings
 */
export function useUpdateDataSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DataSettings) =>
      settingsApi.updateDataSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.data() });
    },
  });
}

/**
 * Update status page settings
 */
export function useUpdateStatusPageSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StatusPageSettings) =>
      settingsApi.updateStatusPageSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.statusPage() });
    },
  });
}

/**
 * Update system settings
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SystemSettings) =>
      settingsApi.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.system() });
    },
  });
}
