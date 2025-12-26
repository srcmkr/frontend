/**
 * Monitor Mutation Hooks
 *
 * TanStack Query mutations for modifying monitor data.
 * Includes optimistic updates and cache invalidation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { monitorKeys, serviceGroupKeys } from "./keys";
import { monitorApi, serviceGroupApi, type CreateMonitorInput, type UpdateMonitorInput, type MonitorWithHistory } from "./monitor-api";
import type { ServiceGroup } from "@/types";

/**
 * Special ID for the default "All Services" group
 * Uses a well-known UUID that's easy to recognize
 */
const DEFAULT_GROUP_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Create a new monitor
 */
export function useCreateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonitorInput) => monitorApi.create(data),
    onSuccess: async (newMonitor) => {
      // Invalidate list to refetch with new monitor
      queryClient.invalidateQueries({ queryKey: monitorKeys.lists() });

      // Check if service groups exist
      const serviceGroups = queryClient.getQueryData<ServiceGroup[]>(serviceGroupKeys.list()) || [];

      // Find or create "All Services" group and add the new monitor
      let updatedGroups: ServiceGroup[];

      if (serviceGroups.length === 0) {
        // Create default group with the new monitor
        updatedGroups = [
          {
            id: DEFAULT_GROUP_ID,
            name: "All Services",
            type: "group",
            children: [
              {
                id: newMonitor.id,
                name: newMonitor.name,
                type: "service",
                monitorId: newMonitor.id,
              }
            ],
          }
        ];
      } else {
        // Add monitor to existing "All Services" group (or first group if not found)
        updatedGroups = serviceGroups.map(group => {
          if (group.id === DEFAULT_GROUP_ID || group.name === "All Services") {
            return {
              ...group,
              children: [
                ...(group.children || []),
                {
                  id: newMonitor.id,
                  name: newMonitor.name,
                  type: "service" as const,
                  monitorId: newMonitor.id,
                }
              ]
            };
          }
          return group;
        });

        // If "All Services" group doesn't exist, add monitor to first group
        const allServicesExists = updatedGroups.some(
          g => g.id === DEFAULT_GROUP_ID || g.name === "All Services"
        );

        if (!allServicesExists && updatedGroups.length > 0) {
          updatedGroups[0] = {
            ...updatedGroups[0],
            children: [
              ...(updatedGroups[0].children || []),
              {
                id: newMonitor.id,
                name: newMonitor.name,
                type: "service" as const,
                monitorId: newMonitor.id,
              }
            ]
          };
        }
      }

      try {
        await serviceGroupApi.update(updatedGroups);
        queryClient.invalidateQueries({ queryKey: serviceGroupKeys.list() });
      } catch (error) {
        console.error("Failed to update service groups:", error);
        // Still invalidate to show the monitor in the list
        queryClient.invalidateQueries({ queryKey: serviceGroupKeys.list() });
      }

      toast.success(`Monitor "${newMonitor.name}" erstellt`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });
}

/**
 * Update an existing monitor
 */
export function useUpdateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMonitorInput }) =>
      monitorApi.update(id, data),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: monitorKeys.detail(id) });

      // Snapshot previous value with proper type
      const previousMonitor = queryClient.getQueryData<MonitorWithHistory>(monitorKeys.detail(id));

      // Optimistically update the cache
      if (previousMonitor) {
        queryClient.setQueryData<MonitorWithHistory>(monitorKeys.detail(id), {
          ...previousMonitor,
          ...data,
        });
      }

      return { previousMonitor };
    },

    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousMonitor) {
        queryClient.setQueryData(monitorKeys.detail(id), context.previousMonitor);
      }
      toast.error(`Fehler beim Aktualisieren: ${err.message}`);
    },

    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: monitorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: monitorKeys.lists() });
    },

    onSuccess: (updatedMonitor) => {
      toast.success(`Monitor "${updatedMonitor?.name}" aktualisiert`);
    },
  });
}

/**
 * Delete a monitor
 */
export function useDeleteMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => monitorApi.delete(id),

    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: monitorKeys.detail(id) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: monitorKeys.lists() });
      // Invalidate service groups (they contain monitor references)
      queryClient.invalidateQueries({ queryKey: serviceGroupKeys.list() });
      toast.success("Monitor gelöscht");
    },

    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });
}

/**
 * Pause/Resume a monitor (convenience mutation)
 */
export function useToggleMonitorPause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      monitorApi.update(id, { status: paused ? "paused" : "pending" }),

    onSuccess: (_, { paused }) => {
      queryClient.invalidateQueries({ queryKey: monitorKeys.lists() });
      toast.success(paused ? "Monitor pausiert" : "Monitor fortgesetzt");
    },

    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

/**
 * Update service groups (persists tree structure changes)
 */
export function useUpdateServiceGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groups: ServiceGroup[]) => serviceGroupApi.update(groups),

    // Optimistic update for instant UI feedback
    onMutate: async (newGroups) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: serviceGroupKeys.list() });

      // Snapshot previous value
      const previousGroups = queryClient.getQueryData<ServiceGroup[]>(serviceGroupKeys.list());

      // Optimistically update the cache
      queryClient.setQueryData(serviceGroupKeys.list(), newGroups);

      return { previousGroups };
    },

    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousGroups) {
        queryClient.setQueryData(serviceGroupKeys.list(), context.previousGroups);
      }
      toast.error(`Fehler beim Speichern: ${err.message}`);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: serviceGroupKeys.list() });
    },
  });
}
