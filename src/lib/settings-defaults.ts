/**
 * Default settings and configuration options
 * These constants define the default values for various settings
 */

import type {
  MonitoringSettingsFormData,
  NotificationSettingsFormData,
  DataSettingsFormData,
  StatusPageSettingsFormData,
  SystemSettingsFormData,
} from "@/lib/validations/settings";

// ============================================================================
// Monitoring Defaults
// ============================================================================

export const DEFAULT_MONITORING_SETTINGS: MonitoringSettingsFormData = {
  defaultInterval: 60,
  defaultTimeout: 10,
  defaultRetries: 3,
  defaultSlaTarget: 99.9,
  defaultMaxResponseTime: 500,
} as const;

// ============================================================================
// Notification Defaults
// ============================================================================

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsFormData = {
  failureThreshold: 3,
} as const;

// ============================================================================
// Data Defaults
// ============================================================================

export const DEFAULT_DATA_SETTINGS: DataSettingsFormData = {
  retentionDays: 730, // 2 years
} as const;

// ============================================================================
// Status Page Defaults
// ============================================================================

export const DEFAULT_STATUS_PAGE_SETTINGS: StatusPageSettingsFormData = {
  defaultLogo: undefined,
  defaultPrimaryColor: "#10b981",
  defaultUptimeHistoryDays: 90,
  defaultIncidentHistoryDays: 90,
} as const;

// ============================================================================
// System Defaults
// ============================================================================

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsFormData = {
  timezone: "Europe/Berlin",
} as const;

// ============================================================================
// Options Arrays
// ============================================================================

/**
 * Available monitoring interval options (in seconds)
 */
export const INTERVAL_OPTIONS = [
  { value: 10, label: "10 Sekunden" },
  { value: 30, label: "30 Sekunden" },
  { value: 60, label: "1 Minute" },
  { value: 120, label: "2 Minuten" },
  { value: 300, label: "5 Minuten" },
  { value: 600, label: "10 Minuten" },
  { value: 900, label: "15 Minuten" },
  { value: 1800, label: "30 Minuten" },
  { value: 3600, label: "1 Stunde" },
] as const;

/**
 * Available data retention options (in days)
 */
export const RETENTION_OPTIONS = [
  { value: 30, label: "30 Tage" },
  { value: 90, label: "90 Tage" },
  { value: 180, label: "6 Monate" },
  { value: 365, label: "1 Jahr" },
  { value: 730, label: "2 Jahre" },
  { value: 1825, label: "5 Jahre" },
  { value: 3650, label: "10 Jahre" },
] as const;

/**
 * Common timezone options
 */
export const COMMON_TIMEZONES = [
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Zurich", label: "Zürich (CET/CEST)" },
  { value: "Europe/Vienna", label: "Wien (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapur (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "UTC", label: "UTC" },
] as const;
