// Monitor Types
export type MonitorType = "http" | "tcp" | "ping" | "dns";
export type MonitorStatus = "up" | "down" | "pending" | "paused";

// Segment for hourly uptime visualization
export interface UptimeSegment {
  timestamp: string;
  status: "up" | "down" | "partial" | "no-data";
  uptime: number; // 0-100
  totalChecks: number;
  failedChecks: number;
}

export interface Monitor {
  id: string;
  name: string;
  type: MonitorType;
  url: string;
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  status: MonitorStatus;
  lastCheck: string | null;
  lastResponseTime: number | null;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  uptimeHistory?: UptimeSegment[]; // 24h hourly segments
  createdAt: string;
  updatedAt: string;
}

export interface MonitorFormData {
  name: string;
  type: MonitorType;
  url: string;
  interval: number;
  timeout: number;
  retries: number;
}

// Check Result Types
export interface CheckResult {
  id: string;
  monitorId: string;
  status: "up" | "down";
  responseTime: number;
  statusCode?: number;
  message?: string;
  checkedAt: string;
}

// Incident Types
export type IncidentStatus = "ongoing" | "resolved";

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  status: IncidentStatus;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null; // seconds
  cause: string;
}

// Notification Types
export type NotificationChannelType = "email" | "webhook";

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  enabled: boolean;
  config: EmailConfig | WebhookConfig;
  createdAt: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  toEmails: string[];
  useTls: boolean;
}

export interface WebhookConfig {
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
}

// Status Page Types
export interface StatusPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  monitors: string[]; // monitor IDs
  isPublic: boolean;
  customCss?: string;
  createdAt: string;
}

// Maintenance Window Types
export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  monitors: string[]; // monitor IDs
  startAt: string;
  endAt: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Service Group Types (for hierarchical organization)
export interface ServiceGroup {
  id: string;
  name: string;
  type: "group" | "service";
  children?: ServiceGroup[];
  monitorId?: string; // Only if type === "service"
  collapsed?: boolean;
}

// Flattened tree item for dnd-kit
export interface FlattenedServiceGroup extends ServiceGroup {
  parentId: string | null;
  depth: number;
  index: number;
}

// Chart Data Types
export interface ResponseTimeDataPoint {
  timestamp: string;
  responseTime: number;
  status: "up" | "down";
}

export interface UptimeDataPoint {
  date: string;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
}
