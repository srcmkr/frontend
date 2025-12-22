/**
 * Report API Functions
 *
 * Raw API calls for report operations.
 * These are used by query hooks and can be tested independently.
 */

import { apiClient } from "@/lib/api-client";
import type { ReportPeriod, ReportPeriodType, SLAReport } from "@/types";

/**
 * Report API endpoints
 */
export const reportApi = {
  /**
   * Get available report periods by type
   */
  getPeriods: (type: ReportPeriodType) =>
    apiClient.get<ReportPeriod[]>("/reports/periods", { type }),

  /**
   * Generate SLA report for a monitor
   */
  getSLAReport: (
    monitorId: string,
    period: ReportPeriod,
    slaTarget?: number,
    maxResponseTime?: number
  ) =>
    apiClient.get<SLAReport>(`/reports/sla/${monitorId}`, {
      type: period.type,
      year: period.year,
      value: period.value,
      slaTarget,
      maxResponseTime,
    }),
};
