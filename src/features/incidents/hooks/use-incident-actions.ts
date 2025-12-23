/**
 * Hook for incident CRUD actions
 *
 * Provides create, update, delete, and resolve operations for incidents.
 * Components call this hook directly instead of receiving callbacks via props.
 * Handles navigation after mutations automatically.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  useResolveIncident,
} from "../api/mutations";
import type { IncidentFormData, ExtendedIncident } from "@/types";

interface CreateOptions {
  /** Navigate to the new incident after creation. Defaults to true. */
  navigateOnSuccess?: boolean;
}

interface DeleteOptions {
  /** Current selected incident ID. If deleted ID matches, navigates to /incidents */
  currentId?: string | null;
}

export function useIncidentActions() {
  const router = useRouter();
  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident();
  const deleteMutation = useDeleteIncident();
  const resolveMutation = useResolveIncident();

  return {
    /**
     * Create a new incident
     * Navigates to the new incident by default
     */
    createIncident: (data: IncidentFormData, options?: CreateOptions) =>
      createMutation.mutate(data, {
        onSuccess: (newIncident) => {
          if (options?.navigateOnSuccess !== false) {
            router.push(`/incidents/${newIncident.id}`, { scroll: false });
          }
        },
      }),

    /**
     * Update an existing incident
     */
    updateIncident: (id: string, data: Partial<ExtendedIncident>) =>
      updateMutation.mutate({ id, data }),

    /**
     * Delete an incident
     * If the deleted incident is currently selected, navigates to /incidents
     */
    deleteIncident: (id: string, options?: DeleteOptions) =>
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (options?.currentId === id) {
            router.push("/incidents", { scroll: false });
          }
        },
      }),

    /**
     * Resolve an incident with a resolution message
     */
    resolveIncident: (id: string, message: string) =>
      resolveMutation.mutate({ id, message }),

    /**
     * Loading states for UI feedback
     */
    isPending: {
      create: createMutation.isPending,
      update: updateMutation.isPending,
      delete: deleteMutation.isPending,
      resolve: resolveMutation.isPending,
      any:
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        resolveMutation.isPending,
    },
  };
}
