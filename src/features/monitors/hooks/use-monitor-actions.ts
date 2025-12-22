/**
 * Hook for monitor CRUD actions
 *
 * Provides create, update, delete, and pause/resume operations for monitors.
 * Components call this hook directly instead of receiving callbacks via props.
 * Handles navigation after mutations automatically.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  useCreateMonitor,
  useUpdateMonitor,
  useDeleteMonitor,
  useToggleMonitorPause,
  useUpdateServiceGroups,
} from "../api/mutations";
import type { CreateMonitorInput, UpdateMonitorInput } from "../api/monitor-api";
import type { ServiceGroup } from "@/types";

interface CreateOptions {
  /** Navigate to the new monitor after creation. Defaults to true. */
  navigateOnSuccess?: boolean;
}

interface DeleteOptions {
  /** Current selected monitor ID. If deleted ID matches, navigates to /monitors */
  currentId?: string | null;
}

export function useMonitorActions() {
  const router = useRouter();
  const createMutation = useCreateMonitor();
  const updateMutation = useUpdateMonitor();
  const deleteMutation = useDeleteMonitor();
  const togglePauseMutation = useToggleMonitorPause();
  const updateServiceGroupsMutation = useUpdateServiceGroups();

  return {
    /**
     * Create a new monitor
     * Navigates to the new monitor by default
     */
    createMonitor: (data: CreateMonitorInput, options?: CreateOptions) =>
      createMutation.mutate(data, {
        onSuccess: (newMonitor) => {
          if (options?.navigateOnSuccess !== false) {
            router.push(`/monitors?id=${newMonitor.id}`, { scroll: false });
          }
        },
      }),

    /**
     * Update an existing monitor
     */
    updateMonitor: (id: string, data: UpdateMonitorInput) =>
      updateMutation.mutate({ id, data }),

    /**
     * Delete a monitor
     * If the deleted monitor is currently selected, navigates to /monitors
     */
    deleteMonitor: (id: string, options?: DeleteOptions) =>
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (options?.currentId === id) {
            router.push("/monitors", { scroll: false });
          }
        },
      }),

    /**
     * Toggle monitor pause state
     */
    togglePause: (id: string, paused: boolean) =>
      togglePauseMutation.mutate({ id, paused }),

    /**
     * Update service groups (tree structure)
     */
    updateServiceGroups: (groups: ServiceGroup[]) =>
      updateServiceGroupsMutation.mutate(groups),

    /**
     * Loading states for UI feedback
     */
    isPending: {
      create: createMutation.isPending,
      update: updateMutation.isPending,
      delete: deleteMutation.isPending,
      togglePause: togglePauseMutation.isPending,
      updateGroups: updateServiceGroupsMutation.isPending,
      any:
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        togglePauseMutation.isPending ||
        updateServiceGroupsMutation.isPending,
    },
  };
}
