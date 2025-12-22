/**
 * Incident Mutation Hooks
 *
 * TanStack Query mutations for modifying incident data.
 * Includes optimistic updates and cache invalidation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { incidentKeys } from "./keys";
import {
  incidentApi,
  type CreateIncidentUpdateInput,
  type EditIncidentUpdateInput,
} from "./incident-api";
import type { IncidentFormData, ExtendedIncident } from "@/types";

/**
 * Create a new incident
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IncidentFormData) => incidentApi.create(data),
    onSuccess: (newIncident) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
      const typeLabel =
        newIncident.type === "maintenance"
          ? "Wartung"
          : newIncident.type === "announcement"
            ? "Ankündigung"
            : "Incident";
      toast.success(`${typeLabel} "${newIncident.title}" erstellt`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });
}

/**
 * Update an existing incident
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExtendedIncident> }) =>
      incidentApi.update(id, data),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: incidentKeys.detail(id) });

      const previousIncident = queryClient.getQueryData(incidentKeys.detail(id));

      if (previousIncident) {
        queryClient.setQueryData(incidentKeys.detail(id), (old: unknown) => ({
          ...(old as object),
          ...data,
        }));
      }

      return { previousIncident };
    },

    onError: (err, { id }, context) => {
      if (context?.previousIncident) {
        queryClient.setQueryData(incidentKeys.detail(id), context.previousIncident);
      }
      toast.error(`Fehler beim Aktualisieren: ${err.message}`);
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
    },

    onSuccess: (updatedIncident) => {
      toast.success(`Incident "${updatedIncident?.title}" aktualisiert`);
    },
  });
}

/**
 * Delete an incident
 */
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incidentApi.delete(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
      toast.success("Incident gelöscht");
    },

    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });
}

/**
 * Resolve an incident
 */
export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      incidentApi.resolve(id, message),

    onSuccess: (resolvedIncident) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(resolvedIncident.id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
      toast.success(`"${resolvedIncident.title}" als gelöst markiert`);
    },

    onError: (error) => {
      toast.error(`Fehler beim Lösen: ${error.message}`);
    },
  });
}

/**
 * Add an update to an incident
 */
export function useAddIncidentUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      incidentId,
      data,
    }: {
      incidentId: string;
      data: CreateIncidentUpdateInput;
    }) => incidentApi.addUpdate(incidentId, data),

    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      toast.success("Update hinzugefügt");
    },

    onError: (error) => {
      toast.error(`Fehler beim Hinzufügen: ${error.message}`);
    },
  });
}

/**
 * Edit an incident update
 */
export function useEditIncidentUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      incidentId,
      updateId,
      data,
    }: {
      incidentId: string;
      updateId: string;
      data: EditIncidentUpdateInput;
    }) => incidentApi.editUpdate(incidentId, updateId, data),

    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      toast.success("Update bearbeitet");
    },

    onError: (error) => {
      toast.error(`Fehler beim Bearbeiten: ${error.message}`);
    },
  });
}

/**
 * Delete an incident update
 */
export function useDeleteIncidentUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      incidentId,
      updateId,
    }: {
      incidentId: string;
      updateId: string;
    }) => incidentApi.deleteUpdate(incidentId, updateId),

    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      toast.success("Update gelöscht");
    },

    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });
}
