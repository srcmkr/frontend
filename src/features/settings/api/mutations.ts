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
import type {
  CreateNotificationChannelRequest,
  UpdateNotificationChannelRequest,
} from "./settings-api";

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

// ============================================
// Notification Channel Mutations
// ============================================

/**
 * Create notification channel
 */
export function useCreateNotificationChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationChannelRequest) =>
      settingsApi.createNotificationChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.notificationChannels(),
      });
    },
  });
}

/**
 * Update notification channel (PATCH semantics)
 */
export function useUpdateNotificationChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationChannelRequest }) =>
      settingsApi.updateNotificationChannel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.notificationChannels(),
      });
    },
  });
}

/**
 * Delete notification channel
 */
export function useDeleteNotificationChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteNotificationChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.notificationChannels(),
      });
    },
  });
}

/**
 * Test notification channel
 */
export function useTestNotificationChannel() {
  return useMutation({
    mutationFn: (id: string) => settingsApi.testNotificationChannel(id),
    // No cache invalidation needed - this is just a test
  });
}
