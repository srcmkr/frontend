/**
 * Reports Feature Public API
 *
 * Re-exports everything that should be accessible from outside this feature.
 */

// API hooks
export { useReportPeriods, useSLAReport } from "./api/queries";

// API functions (for direct calls like refresh)
export { reportApi } from "./api/report-api";

// Query keys (for manual cache operations)
export { reportKeys } from "./api/keys";
