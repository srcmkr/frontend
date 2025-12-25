/**
 * Monitor API Functions
 *
 * Raw API calls for monitor operations.
 * These are used by query/mutation hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type {
  Monitor,
  UptimeSegment,
  MonitorDetailedStats,
  ServiceGroup,
  CheckResult,
} from "@/types";

// Extended monitor type with uptime history
export interface MonitorWithHistory extends Monitor {
  uptimeHistory: UptimeSegment[];
}

// Basic check result for charts
export interface BasicCheckResult {
  timestamp: string;
  status: "up" | "down";
  responseTime: number | null;
}

// Input type for creating a monitor
export interface CreateMonitorInput {
  name: string;
  description?: string;
  type: Monitor["type"];
  url: string;
  checkIntervalSeconds?: number;
  timeoutSeconds?: number;
  maxRetries?: number;
  httpConfig?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    expectedStatusCode?: number;
  };
  slaTarget?: number;
  maxResponseTime?: number;
}

// Input type for updating a monitor
export type UpdateMonitorInput = Partial<CreateMonitorInput> & {
  status?: Monitor["status"];
};

/**
 * Monitor API endpoints
 */
export const monitorApi = {
  /**
   * Get all monitors with uptime history
   */
  getAll: () => apiClient.get<MonitorWithHistory[]>("/monitors"),

  /**
   * Get a single monitor by ID
   */
  getById: (id: string) => apiClient.get<MonitorWithHistory>(`/monitors/${id}`),

  /**
   * Create a new monitor
   */
  create: (data: CreateMonitorInput) =>
    apiClient.post<Monitor>("/monitors", data),

  /**
   * Update an existing monitor
   */
  update: (id: string, data: UpdateMonitorInput) =>
    apiClient.patch<Monitor>(`/monitors/${id}`, data),

  /**
   * Delete a monitor
   */
  delete: (id: string) => apiClient.delete<void>(`/monitors/${id}`),

  /**
   * Get check results for a monitor
   */
  getCheckResults: (id: string, hours = 24) => {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    return apiClient.get<CheckResult[]>(`/monitors/${id}/checks`, {
      from: from.toISOString(),
      to: to.toISOString(),
      limit: 1000,
    });
  },

  /**
   * Get detailed statistics for a monitor
   */
  getDetailedStats: (id: string) =>
    apiClient.get<MonitorDetailedStats>(`/monitors/${id}/stats`),
};

/**
 * Service Group API endpoints
 */
export const serviceGroupApi = {
  /**
   * Get all service groups
   */
  getAll: () => apiClient.get<ServiceGroup[]>("/service-groups"),

  /**
   * Update all service groups (replaces entire tree)
   */
  update: (groups: ServiceGroup[]) =>
    apiClient.put<ServiceGroup[]>("/service-groups", { groups }),
};
