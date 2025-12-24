// Monitor Types
export type MonitorType = "http" | "tcp" | "ping" | "dns";
export type MonitorStatus = "pending" | "up" | "down" | "degraded" | "paused" | "maintenance";

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
  // SLA Configuration
  slaTarget: number; // Target uptime percentage (e.g., 99.9)
  maxResponseTime: number; // Maximum acceptable response time in ms
}

// HTTP Methods
export type HttpMethod = "GET" | "POST" | "HEAD" | "PUT" | "PATCH" | "DELETE";

// DNS Record Types
export type DnsRecordType = "A" | "AAAA" | "MX" | "CNAME" | "TXT" | "NS";

// Authentication Types
export type AuthType = "none" | "basic" | "bearer";

// HTTP-specific configuration
export interface HttpMonitorConfig {
  method: HttpMethod;
  expectedStatusCodes: string; // "200" or "200,201" or "200-299"
  headers: Record<string, string>;
  body?: string;
  checkKeyword?: string;
  verifyCertificate: boolean;
  certExpiryWarningDays: number;
  authType: AuthType;
  authUsername?: string;
  authPassword?: string;
  authToken?: string;
  followRedirects: boolean;
}

// TCP-specific configuration
export interface TcpMonitorConfig {
  host: string;
  port: number;
}

// DNS-specific configuration
export interface DnsMonitorConfig {
  domain: string;
  recordType: DnsRecordType;
  expectedResult?: string;
  dnsServer?: string;
}

// Ping-specific configuration
export interface PingMonitorConfig {
  host: string;
  packetCount: number;
}

// Extended Monitor with type-specific config
export interface MonitorConfig {
  http?: HttpMonitorConfig;
  tcp?: TcpMonitorConfig;
  dns?: DnsMonitorConfig;
  ping?: PingMonitorConfig;
}

export interface MonitorFormData {
  name: string;
  type: MonitorType;
  url: string;
  interval: number;
  timeout: number;
  retries: number;
  slaTarget: number;
  maxResponseTime: number;
  enabled: boolean;
  config?: MonitorConfig;
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
  // Extended technical details
  dnsTime?: number;
  tcpTime?: number;
  tlsTime?: number;
  ttfb?: number; // Time to first byte
  transferTime?: number;
  ipAddress?: string;
  tlsVersion?: string;
  certificateExpiry?: string;
  headers?: Record<string, string>;
}

// Incident Types
export type IncidentStatus = "ongoing" | "resolved";
export type IncidentSeverity = "info" | "minor" | "major" | "critical";
export type IncidentType = "incident" | "maintenance" | "announcement";

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

// Extended Incident with full features
export interface IncidentUpdate {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  message: string;
  createdAt: string;
  createdBy: string;
  isAutomatic: boolean;
}

export interface ExtendedIncident extends Incident {
  severity: IncidentSeverity;
  type: IncidentType;
  title: string;
  description?: string;
  affectedMonitors: string[];
  updates: IncidentUpdate[];
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
}

// Incident Filter State
export interface IncidentFilterState {
  search: string;
  status: IncidentStatus | "all";
  severity: IncidentSeverity | "all";
  type: IncidentType | "all";
  monitorId: string | "all";
  dateRange: { from: Date | null; to: Date | null };
  sortBy: "startedAt" | "severity" | "duration" | "status";
  sortOrder: "asc" | "desc";
}

// Incident Statistics
export interface IncidentStats {
  totalOngoing: number;
  totalResolved: number;
  mttrMinutes: number;
  bySeverity: Record<IncidentSeverity, number>;
}

// Incident Form Data
export interface IncidentFormData {
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  cause: string;
  description?: string;
  affectedMonitors: string[];
  status: IncidentStatus;
  startedAt: string;
  resolvedAt?: string;
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
  apiKey: string;
  fromEmail: string;
  toEmails: string[];
}

export interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
}

// Status Page Announcement Types
export type AnnouncementType = "info" | "warning" | "maintenance" | "success";

export interface StatusPageAnnouncement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  enabled: boolean;
  pinned: boolean; // Oben fixiert anzeigen
  startAt?: string; // Zeitgesteuert: Start
  endAt?: string; // Zeitgesteuert: Ende
  createdAt: string;
}

// Scheduled Maintenance for Status Page
export interface StatusPageMaintenance {
  id: string;
  title: string;
  description: string;
  affectedGroups: string[]; // Group IDs die betroffen sind
  scheduledStart: string;
  scheduledEnd: string;
  notifyBefore: number; // Minuten vor Start benachrichtigen (0 = keine)
  autoStart: boolean; // Automatisch in Wartungsmodus wechseln
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
}

// Status Page Types
export interface StatusPageGroup {
  id: string;
  name: string;
  monitors: string[]; // Monitor-IDs in dieser Gruppe
  order: number; // Reihenfolge
}

export type StatusPageTheme = "system" | "basic" | "dark" | "forest" | "slate" | "kiwi";

export interface StatusPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  monitors: string[]; // monitor IDs (flach)
  groups: StatusPageGroup[]; // Eigene Gruppierung pro Status-Page
  isPublic: boolean;
  customCss?: string;
  logo?: string;
  primaryColor?: string;
  theme?: StatusPageTheme; // Theme für öffentliche Status-Seite (system = Besucher-Präferenz)
  showUptimeHistory: boolean; // Uptime-Bars anzeigen
  uptimeHistoryDays: number; // Standard: 90
  showIncidents: boolean; // Incident-Sektion anzeigen
  incidentHistoryDays: number; // Standard: 90
  // Erweiterte Zugriffsoptionen
  passwordProtection: boolean;
  password?: string; // Nur gesetzt wenn passwordProtection = true
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[]; // Liste von IP-Adressen/CIDR-Ranges
  // Ankündigungen & Wartung
  announcements: StatusPageAnnouncement[];
  scheduledMaintenances: StatusPageMaintenance[];
  showMaintenanceCalendar: boolean; // Wartungskalender anzeigen
  showPoweredByBranding: boolean; // Show "Powered by Kiwi Status" footer
  createdAt: string;
  updatedAt: string;
}

export interface StatusPageFormData {
  title: string;
  slug: string;
  description: string;
  monitors: string[];
  groups: StatusPageGroup[];
  isPublic: boolean;
  customCss?: string;
  logo?: string;
  primaryColor?: string;
  theme?: StatusPageTheme;
  showUptimeHistory: boolean;
  uptimeHistoryDays: number;
  showIncidents: boolean;
  incidentHistoryDays: number;
  // Erweiterte Zugriffsoptionen
  passwordProtection: boolean;
  password?: string;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  // Ankündigungen & Wartung
  announcements: StatusPageAnnouncement[];
  scheduledMaintenances: StatusPageMaintenance[];
  showMaintenanceCalendar: boolean;
  showPoweredByBranding: boolean;
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

// ============================================
// SLA Report Types
// ============================================

export type ReportPeriodType = "year" | "half-year" | "quarter" | "month";

export interface ReportPeriod {
  type: ReportPeriodType;
  year: number;
  value: number; // 1-12 for months, 1-4 for quarters, 1-2 for half-years, 1 for year
  label: string; // e.g., "Januar 2024", "Q1 2024", "H1 2024"
  startDate: string;
  endDate: string;
}

// Executive Summary
export interface ExecutiveSummary {
  overallAvailability: number;
  slaTarget: number;
  maxResponseTime: number;
  slaCompliant: boolean;
  responseTimeCompliant: boolean;
  totalDowntimeMinutes: number;
  totalDowntimeFormatted: string;
  trendVsPreviousPeriod: number;
  trendDirection: "up" | "down" | "stable";
}

// Availability Metrics
export interface DailyAvailability {
  date: string;
  dayOfWeek: string;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
  downtimeMinutes: number;
}

export interface WeeklyAvailability {
  weekNumber: number;
  startDate: string;
  endDate: string;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
}

export interface MonthlyAvailability {
  month: number;
  year: number;
  label: string;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
}

export interface SLABreach {
  date: string;
  duration: number;
  cause: string;
  severity: "minor" | "major" | "critical";
}

export interface AvailabilityMetrics {
  uptimePercentage: number;
  uptimeHours: number;
  uptimeMinutes: number;
  downtimeHours: number;
  downtimeMinutes: number;
  dailyBreakdown: DailyAvailability[];
  weeklyBreakdown: WeeklyAvailability[];
  monthlyBreakdown: MonthlyAvailability[];
  slaBreachCount: number;
  slaBreaches: SLABreach[];
}

// Performance Metrics
export interface ResponseTimeTrendPoint {
  date: string;
  average: number;
  p95: number;
}

export interface DegradationIncident {
  date: string;
  duration: number;
  averageResponseTime: number;
  threshold: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  medianResponseTime: number;
  p90ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  responseTimeTrend: ResponseTimeTrendPoint[];
  degradationIncidents: DegradationIncident[];
}

// Incident Analysis
export interface IncidentTimelineEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  cause: string;
  status: "resolved" | "ongoing";
  severity: "minor" | "major" | "critical";
}

export interface SeverityDistribution {
  minor: number;
  major: number;
  critical: number;
}

export interface RootCauseCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface IncidentAnalysis {
  totalIncidents: number;
  mtbf: number;
  mttr: number;
  longestOutage: number;
  longestOutageDate: string;
  incidentTimeline: IncidentTimelineEntry[];
  severityDistribution: SeverityDistribution;
  rootCauseCategories: RootCauseCategory[];
}

// Check Statistics
export interface ChecksByDayEntry {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

export interface CheckStatistics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  successRate: number;
  checksPerDay: number;
  checksByDay: ChecksByDayEntry[];
}

// Technical Details
export interface CertificateEntry {
  date: string;
  expiryDate: string;
  daysUntilExpiry: number;
  issuer: string;
}

export interface TLSVersionEntry {
  date: string;
  version: string;
}

export interface IPAddressChange {
  date: string;
  previousIP: string;
  newIP: string;
}

export interface DNSResolutionStats {
  averageTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
}

export interface TechnicalDetails {
  certificateHistory: CertificateEntry[];
  tlsVersionHistory: TLSVersionEntry[];
  ipAddressChanges: IPAddressChange[];
  dnsResolutionStats: DNSResolutionStats;
}

// Calendar Heatmap
export interface CalendarHeatmapDay {
  date: string;
  uptime: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// Complete SLA Report
export interface SLAReport {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  monitorType: MonitorType;
  period: ReportPeriod;
  generatedAt: string;
  slaTarget: number;
  maxResponseTime: number;
  executiveSummary: ExecutiveSummary;
  availability: AvailabilityMetrics;
  performance: PerformanceMetrics;
  incidents: IncidentAnalysis;
  checks: CheckStatistics;
  technical: TechnicalDetails;
  calendarHeatmap: CalendarHeatmapDay[];
}

// Extended Header Stats
export interface MonitorDetailedStats {
  lastCheck: string | null;
  lastResponseTime: number | null;
  currentIpAddress: string | null;
  tlsVersion: string | null;
  certificateExpiry: string | null;
  certificateDaysLeft: number | null;
  avgResponseTime24h: number;
  avgResponseTime7d: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalIncidents30d: number;
  mttr: number;
  outagesCount30d: number;
  longestOutage30d: number;
}

// ============================================
// System Notification Types
// ============================================

export type SystemNotificationType =
  | "monitor_down"
  | "monitor_up"
  | "incident_created"
  | "incident_updated"
  | "incident_resolved"
  | "maintenance_scheduled"
  | "maintenance_started"
  | "maintenance_completed";

export interface SystemNotification {
  id: string;
  type: SystemNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity?: IncidentSeverity;
  relatedMonitorId?: string;
  relatedIncidentId?: string;
  metadata?: {
    monitorName?: string;
    incidentTitle?: string;
    duration?: number; // seconds
  };
}

export interface NotificationFilterState {
  search: string;
  readStatus: "all" | "unread" | "read";
  type: "all" | "monitor" | "incident" | "maintenance";
}

// ============================================
// User Types
// ============================================

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

// ============================================
// API Key Types
// ============================================

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string; // e.g., "sk_live_abc***...xyz"
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string | null;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // Full API key - shown only once!
  keyPreview: string;
  createdAt: string;
  expiresAt: string | null;
}
