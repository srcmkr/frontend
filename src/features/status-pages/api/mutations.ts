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
    mutationFn: async (data: StatusPageFormData) => {
      // Create the status page first
      const newStatusPage = await statusPageApi.create(data);

      // Then update groups if there are any
      if (data.groups && data.groups.length > 0) {
        await statusPageApi.updateGroups(
          newStatusPage.id,
          data.groups.map((g) => ({
            id: g.id,
            name: g.name,
            sortOrder: g.order, // Frontend uses "order", backend expects "sortOrder"
            monitorIds: g.monitors.filter((id): id is string => id != null), // monitors is already string[]
          }))
        );
      }

      return newStatusPage;
    },
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StatusPage>;
    }) => {
      // Update the status page first
      const updatedStatusPage = await statusPageApi.update(id, data);

      // Then update groups if provided
      if (data.groups !== undefined) {
        await statusPageApi.updateGroups(
          id,
          data.groups.map((g) => ({
            id: g.id,
            name: g.name,
            sortOrder: g.order, // Frontend uses "order", backend expects "sortOrder"
            monitorIds: g.monitors.filter((id): id is string => id != null), // monitors is already string[]
          }))
        );
      }

      return updatedStatusPage;
    },

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: statusPageKeys.detail(id) });

      const previousStatusPage = queryClient.getQueryData(
        statusPageKeys.detail(id)
      );

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
        queryClient.setQueryData(
          statusPageKeys.detail(id),
          context.previousStatusPage
        );
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
