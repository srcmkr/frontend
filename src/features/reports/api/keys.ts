/**
 * Report Query Key Factory
 *
 * Hierarchical key structure for cache invalidation.
 */

import type { ReportPeriodType, ReportPeriod } from "@/types";

export const reportKeys = {
  all: ["reports"] as const,
  periods: () => [...reportKeys.all, "periods"] as const,
  periodsByType: (type: ReportPeriodType) => [...reportKeys.periods(), type] as const,
  sla: () => [...reportKeys.all, "sla"] as const,
  slaReport: (
    monitorId: string,
    period: ReportPeriod,
    slaTarget?: number,
    maxResponseTime?: number
  ) =>
    [
      ...reportKeys.sla(),
      monitorId,
      period.type,
      period.year,
      period.value,
      slaTarget,
      maxResponseTime,
    ] as const,
};
