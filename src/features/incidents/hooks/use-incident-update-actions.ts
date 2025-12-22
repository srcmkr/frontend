/**
 * Hook for incident update (timeline) actions
 *
 * Provides CRUD operations for incident timeline updates.
 * Components call this hook directly instead of receiving callbacks via props.
 */

"use client";

import {
  useAddIncidentUpdate,
  useEditIncidentUpdate,
  useDeleteIncidentUpdate,
} from "../api/mutations";

interface UseIncidentUpdateActionsOptions {
  incidentId: string;
}

export function useIncidentUpdateActions({
  incidentId,
}: UseIncidentUpdateActionsOptions) {
  const addMutation = useAddIncidentUpdate();
  const editMutation = useEditIncidentUpdate();
  const deleteMutation = useDeleteIncidentUpdate();

  return {
    /**
     * Add a new update to the incident timeline
     */
    addUpdate: (message: string) =>
      addMutation.mutate({ incidentId, data: { message } }),

    /**
     * Edit an existing update message
     */
    editUpdate: (updateId: string, newMessage: string) =>
      editMutation.mutate({
        incidentId,
        updateId,
        data: { message: newMessage },
      }),

    /**
     * Delete an update from the timeline
     */
    deleteUpdate: (updateId: string) =>
      deleteMutation.mutate({ incidentId, updateId }),

    /**
     * Loading states for UI feedback
     */
    isPending: {
      add: addMutation.isPending,
      edit: editMutation.isPending,
      delete: deleteMutation.isPending,
      any: addMutation.isPending || editMutation.isPending || deleteMutation.isPending,
    },
  };
}
