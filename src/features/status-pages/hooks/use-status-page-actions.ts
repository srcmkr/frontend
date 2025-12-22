/**
 * Hook for status page CRUD actions
 *
 * Provides create, update, and delete operations for status pages.
 * Components call this hook directly instead of receiving callbacks via props.
 * Handles navigation after mutations automatically.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  useCreateStatusPage,
  useUpdateStatusPage,
  useDeleteStatusPage,
} from "../api/mutations";
import type { StatusPageFormData, StatusPage } from "@/types";

interface CreateOptions {
  /** Navigate to the new status page after creation. Defaults to true. */
  navigateOnSuccess?: boolean;
}

interface DeleteOptions {
  /** Current selected status page ID. If deleted ID matches, navigates to /status-pages */
  currentId?: string | null;
}

export function useStatusPageActions() {
  const router = useRouter();
  const createMutation = useCreateStatusPage();
  const updateMutation = useUpdateStatusPage();
  const deleteMutation = useDeleteStatusPage();

  return {
    /**
     * Create a new status page
     * Navigates to the new status page by default
     */
    createStatusPage: (data: StatusPageFormData, options?: CreateOptions) =>
      createMutation.mutate(data, {
        onSuccess: (newStatusPage) => {
          if (options?.navigateOnSuccess !== false) {
            router.push(`/status-pages?id=${newStatusPage.id}`, { scroll: false });
          }
        },
      }),

    /**
     * Update an existing status page
     */
    updateStatusPage: (id: string, data: Partial<StatusPage>) =>
      updateMutation.mutate({ id, data }),

    /**
     * Delete a status page
     * If the deleted status page is currently selected, navigates to /status-pages
     */
    deleteStatusPage: (id: string, options?: DeleteOptions) =>
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (options?.currentId === id) {
            router.push("/status-pages", { scroll: false });
          }
        },
      }),

    /**
     * Loading states for UI feedback
     */
    isPending: {
      create: createMutation.isPending,
      update: updateMutation.isPending,
      delete: deleteMutation.isPending,
      any:
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending,
    },
  };
}
