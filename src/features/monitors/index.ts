/**
 * Monitors Feature Public API
 *
 * Re-exports everything that should be accessible from outside this feature.
 */

// API hooks
export {
  useMonitors,
  useMonitorsSuspense,
  useMonitor,
  useMonitorCheckResults,
  useMonitorDetailedStats,
  useServiceGroups,
} from "./api/queries";

export {
  useCreateMonitor,
  useUpdateMonitor,
  useDeleteMonitor,
  useToggleMonitorPause,
  useUpdateServiceGroups,
} from "./api/mutations";

// Query keys (for manual cache operations)
export { monitorKeys, serviceGroupKeys } from "./api/keys";

// API types
export type {
  MonitorWithHistory,
  BasicCheckResult,
  CreateMonitorInput,
  UpdateMonitorInput,
} from "./api/monitor-api";
