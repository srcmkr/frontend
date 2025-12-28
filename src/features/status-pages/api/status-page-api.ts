/**
 * Status Page API Functions
 *
 * Raw API calls for status page operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { StatusPage, StatusPageFormData } from "@/types";

/**
 * Status Page API endpoints
 */
export const statusPageApi = {
  /**
   * Get all status pages
   */
  getAll: () => apiClient.get<StatusPage[]>("/status-pages"),

  /**
   * Get a single status page by ID
   */
  getById: (id: string) => apiClient.get<StatusPage>(`/status-pages/${id}`),

  /**
   * Get a status page by its slug (for public view)
   */
  getBySlug: (slug: string) =>
    apiClient.get<StatusPage>(`/status-pages/${slug}`),

  /**
   * Create a new status page
   */
  create: (data: StatusPageFormData) =>
    apiClient.post<StatusPage>("/status-pages", data),

  /**
   * Update an existing status page
   */
  update: (id: string, data: Partial<StatusPage>) =>
    apiClient.patch<StatusPage>(`/status-pages/${id}`, data),

  /**
   * Delete a status page
   */
  delete: (id: string) => apiClient.delete<void>(`/status-pages/${id}`),

  /**
   * Generate a unique slug from a title
   */
  generateSlug: (name: string) =>
    apiClient.post<{ slug: string }>("/status-pages/generate-slug", { name }),

  /**
   * Update groups and monitors for a status page
   */
  updateGroups: (
    id: string,
    groups: Array<{
      id?: string;
      name: string;
      sortOrder: number;
      monitorIds: string[];
    }>
  ) => apiClient.put<void>(`/status-pages/${id}/groups`, { groups }),

  /**
   * Get client IP address (for testing IP whitelist)
   */
  getClientIp: () => apiClient.get<{ ipAddress: string }>("/status-pages/client-ip"),
};
