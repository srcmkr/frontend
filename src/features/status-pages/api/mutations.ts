/**
 * Status Page Mutation Hooks
 *
 * TanStack Query mutations for modifying status page data.
 * Includes optimistic updates and cache invalidation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { statusPageKeys } from "./keys";
import { statusPageApi } from "./status-page-api";
import type { StatusPageFormData, StatusPage } from "@/types";

/**
 * Create a new status page
 */
export function useCreateStatusPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StatusPageFormData) => statusPageApi.create(data),
    onSuccess: (newStatusPage) => {
      queryClient.invalidateQueries({ queryKey: statusPageKeys.lists() });
      toast.success(`Statusseite "${newStatusPage.title}" erstellt`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });
}

/**
 * Update an existing status page
 */
export function useUpdateStatusPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StatusPage> }) =>
      statusPageApi.update(id, data),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: statusPageKeys.detail(id) });

      const previousStatusPage = queryClient.getQueryData(statusPageKeys.detail(id));

      if (previousStatusPage) {
        queryClient.setQueryData(statusPageKeys.detail(id), (old: unknown) => ({
          ...(old as object),
          ...data,
        }));
      }

      return { previousStatusPage };
    },

    onError: (err, { id }, context) => {
      if (context?.previousStatusPage) {
        queryClient.setQueryData(statusPageKeys.detail(id), context.previousStatusPage);
      }
      toast.error(`Fehler beim Aktualisieren: ${err.message}`);
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: statusPageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: statusPageKeys.lists() });
    },

    onSuccess: (updatedStatusPage) => {
      toast.success(`Statusseite "${updatedStatusPage?.title}" aktualisiert`);
    },
  });
}

/**
 * Delete a status page
 */
export function useDeleteStatusPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => statusPageApi.delete(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: statusPageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: statusPageKeys.lists() });
      toast.success("Statusseite gelöscht");
    },

    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });
}

/**
 * Generate a slug from a name
 */
export function useGenerateSlug() {
  return useMutation({
    mutationFn: (name: string) => statusPageApi.generateSlug(name),
    // No toast - this is a utility mutation
  });
}
