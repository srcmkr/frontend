/**
 * Report Query Hooks
 *
 * TanStack Query hooks for fetching report data.
 * Provides caching, background refetching, and loading/error states.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { reportKeys } from "./keys";
import { reportApi } from "./report-api";
import type { ReportPeriod, ReportPeriodType } from "@/types";

/**
 * Fetch available report periods by type
 */
export function useReportPeriods(type: ReportPeriodType) {
  return useQuery({
    queryKey: reportKeys.periodsByType(type),
    queryFn: () => reportApi.getPeriods(type),
  });
}

/**
 * Fetch SLA report for a monitor
 */
export function useSLAReport(
  monitorId: string | null,
  period: ReportPeriod | null,
  slaTarget?: number,
  maxResponseTime?: number
) {
  return useQuery({
    queryKey: reportKeys.slaReport(
      monitorId ?? "",
      period ?? { type: "month", year: 0, value: 0, label: "", startDate: "", endDate: "" },
      slaTarget,
      maxResponseTime
    ),
    queryFn: () => reportApi.getSLAReport(monitorId!, period!, slaTarget, maxResponseTime),
    enabled: !!monitorId && !!period,
    // Reports can be cached longer since historical data doesn't change
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
