/**
 * Notification Mutation Hooks
 *
 * TanStack Query mutations for modifying notification data.
 * Includes optimistic updates and cache invalidation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationKeys } from "./keys";
import { notificationApi } from "./notification-api";
import type { SystemNotification } from "@/types";

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),

    // Optimistic update for instant UI feedback
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<
        SystemNotification[]
      >(notificationKeys.list());

      // Optimistically update the cache
      if (previousNotifications) {
        queryClient.setQueryData<SystemNotification[]>(
          notificationKeys.list(),
          previousNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        );
      }

      return { previousNotifications };
    },

    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(),
          context.previousNotifications
        );
      }
      toast.error(`Fehler beim Markieren: ${err.message}`);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),

    // Optimistic update for instant UI feedback
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<
        SystemNotification[]
      >(notificationKeys.list());

      // Optimistically update the cache - mark all as read
      if (previousNotifications) {
        queryClient.setQueryData<SystemNotification[]>(
          notificationKeys.list(),
          previousNotifications.map((n) => ({ ...n, read: true }))
        );
      }

      return { previousNotifications };
    },

    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(),
          context.previousNotifications
        );
      }
      toast.error(`Fehler beim Markieren: ${err.message}`);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },

    onSuccess: () => {
      toast.success("Alle Benachrichtigungen als gelesen markiert");
    },
  });
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),

    // Optimistic update for instant UI feedback
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<
        SystemNotification[]
      >(notificationKeys.list());

      // Optimistically update the cache - remove the notification
      if (previousNotifications) {
        queryClient.setQueryData<SystemNotification[]>(
          notificationKeys.list(),
          previousNotifications.filter((n) => n.id !== id)
        );
      }

      return { previousNotifications };
    },

    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(),
          context.previousNotifications
        );
      }
      toast.error(`Fehler beim Löschen: ${err.message}`);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },

    onSuccess: () => {
      toast.success("Benachrichtigung gelöscht");
    },
  });
}
