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

// Action hooks (for components to call mutations directly)
export { useMonitorActions } from "./hooks/use-monitor-actions";

// Query keys (for manual cache operations)
export { monitorKeys, serviceGroupKeys } from "./api/keys";

// API types
export type {
  MonitorWithHistory,
  BasicCheckResult,
  CreateMonitorInput,
  UpdateMonitorInput,
} from "./api/monitor-api";
