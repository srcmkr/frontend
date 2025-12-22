import type {
  MonitoringSettingsFormData,
  NotificationSettingsFormData,
  DataSettingsFormData,
  StatusPageSettingsFormData,
  SystemSettingsFormData,
} from "@/lib/validations/settings";

// Monitoring Defaults
export const defaultMonitoringSettings: MonitoringSettingsFormData = {
  defaultInterval: 60,
  defaultTimeout: 10,
  defaultRetries: 3,
  defaultSlaTarget: 99.9,
  defaultMaxResponseTime: 500,
};

// Notification Defaults
export const defaultNotificationSettings: NotificationSettingsFormData = {
  failureThreshold: 3,
};

// Data Defaults
export const defaultDataSettings: DataSettingsFormData = {
  retentionDays: 730, // 2 years
};

// Status Page Defaults
export const defaultStatusPageSettings: StatusPageSettingsFormData = {
  defaultLogo: undefined,
  defaultPrimaryColor: "#10b981",
  defaultUptimeHistoryDays: 90,
  defaultIncidentHistoryDays: 90,
};

// System Defaults
export const defaultSystemSettings: SystemSettingsFormData = {
  timezone: "Europe/Berlin",
};

// Notification Channel Types
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  toEmails: string[];
}

export interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "webhook";
  enabled: boolean;
  config: EmailConfig | WebhookConfig;
  createdAt: string;
}

// Mock Notification Channels
export const mockNotificationChannels: NotificationChannel[] = [
  {
    id: "ch-1",
    name: "Admin E-Mail",
    type: "email",
    enabled: true,
    config: {
      apiKey: "re_****...abcd",
      fromEmail: "alerts@status.example.com",
      toEmails: ["admin@example.com", "ops@example.com"],
    },
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "ch-2",
    name: "Discord Webhook",
    type: "webhook",
    enabled: true,
    config: {
      url: "https://discord.com/api/webhooks/1234567890/abcdef",
      headers: { "Content-Type": "application/json" },
    },
    createdAt: "2024-02-01T14:30:00Z",
  },
  {
    id: "ch-3",
    name: "Slack Alerts",
    type: "webhook",
    enabled: false,
    config: {
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX",
    },
    createdAt: "2024-03-10T09:15:00Z",
  },
];

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsed: string | null;
}

// Mock API Keys
export const mockApiKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Grafana Integration",
    keyPreview: "sk_live_****...7f3a",
    createdAt: "2024-01-20T08:00:00Z",
    lastUsed: "2024-12-20T15:30:00Z",
  },
  {
    id: "key-2",
    name: "CI/CD Pipeline",
    keyPreview: "sk_live_****...9b2c",
    createdAt: "2024-03-05T11:00:00Z",
    lastUsed: null,
  },
];

// Database Statistics
export interface DatabaseStats {
  totalChecks: number;
  totalMonitors: number;
  totalIncidents: number;
  databaseSize: string;
  oldestRecord: string;
}

export const mockDatabaseStats: DatabaseStats = {
  totalChecks: 2547893,
  totalMonitors: 6,
  totalIncidents: 47,
  databaseSize: "1.2 GB",
  oldestRecord: "2024-01-01T00:00:00Z",
};

// System Info
export interface SystemInfo {
  version: string;
  buildDate: string;
  license: string;
  nodeVersion: string;
}

export const mockSystemInfo: SystemInfo = {
  version: "1.0.0-beta",
  buildDate: "2024-12-20",
  license: "Elastic License 2.0",
  nodeVersion: "20.10.0",
};

// Common Timezones
export const commonTimezones = [
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
];

// Retention Options
export const retentionOptions = [
  { value: 30, label: "30 Tage" },
  { value: 90, label: "90 Tage" },
  { value: 180, label: "6 Monate" },
  { value: 365, label: "1 Jahr" },
  { value: 730, label: "2 Jahre" },
  { value: 1825, label: "5 Jahre" },
  { value: 3650, label: "10 Jahre" },
];

// Interval Options
export const intervalOptions = [
  { value: 10, label: "10 Sekunden" },
  { value: 30, label: "30 Sekunden" },
  { value: 60, label: "1 Minute" },
  { value: 120, label: "2 Minuten" },
  { value: 300, label: "5 Minuten" },
  { value: 600, label: "10 Minuten" },
  { value: 900, label: "15 Minuten" },
  { value: 1800, label: "30 Minuten" },
  { value: 3600, label: "1 Stunde" },
];
