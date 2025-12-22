/**
 * Incident API Functions
 *
 * Raw API calls for incident operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type {
  ExtendedIncident,
  IncidentFormData,
  IncidentUpdate,
  IncidentStats,
} from "@/types";

// Input type for creating an incident update
export interface CreateIncidentUpdateInput {
  message: string;
  createdBy?: string;
}

// Input type for editing an incident update
export interface EditIncidentUpdateInput {
  message: string;
}

/**
 * Incident API endpoints
 */
export const incidentApi = {
  /**
   * Get all incidents (extended with updates)
   */
  getAll: () => apiClient.get<ExtendedIncident[]>("/incidents"),

  /**
   * Get a single incident by ID
   */
  getById: (id: string) => apiClient.get<ExtendedIncident>(`/incidents/${id}`),

  /**
   * Create a new incident
   */
  create: (data: IncidentFormData) =>
    apiClient.post<ExtendedIncident>("/incidents", data),

  /**
   * Update an existing incident
   */
  update: (id: string, data: Partial<ExtendedIncident>) =>
    apiClient.patch<ExtendedIncident>(`/incidents/${id}`, data),

  /**
   * Delete an incident
   */
  delete: (id: string) => apiClient.delete<void>(`/incidents/${id}`),

  /**
   * Resolve an incident
   */
  resolve: (id: string, message: string) =>
    apiClient.post<ExtendedIncident>(`/incidents/${id}/resolve`, { message }),

  /**
   * Get incident statistics
   */
  getStats: () => apiClient.get<IncidentStats>("/incidents/stats"),

  /**
   * Add an update to an incident
   */
  addUpdate: (incidentId: string, data: CreateIncidentUpdateInput) =>
    apiClient.post<IncidentUpdate>(`/incidents/${incidentId}/updates`, data),

  /**
   * Edit an incident update
   */
  editUpdate: (incidentId: string, updateId: string, data: EditIncidentUpdateInput) =>
    apiClient.patch<IncidentUpdate>(
      `/incidents/${incidentId}/updates/${updateId}`,
      data
    ),

  /**
   * Delete an incident update
   */
  deleteUpdate: (incidentId: string, updateId: string) =>
    apiClient.delete<void>(`/incidents/${incidentId}/updates/${updateId}`),
};
