import type {
  Monitor,
  CheckResult,
  Incident,
  ExtendedIncident,
  IncidentUpdate,
  IncidentStats,
  IncidentFormData,
  IncidentSeverity,
  UptimeSegment,
  ServiceGroup,
  ReportPeriod,
  ReportPeriodType,
  SLAReport,
  MonitorDetailedStats,
  ExecutiveSummary,
  AvailabilityMetrics,
  PerformanceMetrics,
  IncidentAnalysis,
  CheckStatistics,
  TechnicalDetails,
  CalendarHeatmapDay,
  DailyAvailability,
  WeeklyAvailability,
  MonthlyAvailability,
  SLABreach,
  ResponseTimeTrendPoint,
  DegradationIncident,
  IncidentTimelineEntry,
  RootCauseCategory,
  ChecksByDayEntry,
  CertificateEntry,
  TLSVersionEntry,
  IPAddressChange,
} from "@/types";

// Mutable copy for runtime updates
let mutableMockMonitors: Monitor[] | null = null;

// Get current mock monitors (creates mutable copy on first access)
export function getMockMonitors(): Monitor[] {
  if (mutableMockMonitors === null) {
    mutableMockMonitors = JSON.parse(JSON.stringify(mockMonitors)) as Monitor[];
  }
  return mutableMockMonitors as Monitor[];
}

// Update a mock monitor by ID
export function updateMockMonitor(
  monitorId: string,
  updates: Partial<Monitor>
): Monitor | null {
  const monitors = getMockMonitors();
  const index = monitors.findIndex((m) => m.id === monitorId);
  if (index === -1) return null;

  const updatedMonitor: Monitor = {
    ...monitors[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  monitors[index] = updatedMonitor;
  return updatedMonitor;
}

// Reset mock monitors to initial state
export function resetMockMonitors(): void {
  mutableMockMonitors = null;
}

// Create a new mock monitor
export function createMockMonitor(data: Partial<Monitor>): Monitor {
  const monitors = getMockMonitors();
  const newMonitor: Monitor = {
    id: `mon-${Date.now()}`,
    name: data.name || "New Monitor",
    type: data.type || "http",
    url: data.url || "",
    interval: data.interval || 60,
    timeout: data.timeout || 10,
    retries: data.retries || 3,
    status: "pending",
    lastCheck: new Date().toISOString(),
    lastResponseTime: 0,
    uptime24h: 100,
    uptime7d: 100,
    uptime30d: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaTarget: data.slaTarget || 99.9,
    maxResponseTime: data.maxResponseTime || 500,
    ...data,
  };
  monitors.push(newMonitor);
  return newMonitor;
}

// Delete a mock monitor by ID
export function deleteMockMonitor(monitorId: string): boolean {
  const monitors = getMockMonitors();
  const index = monitors.findIndex((m) => m.id === monitorId);
  if (index === -1) return false;
  monitors.splice(index, 1);
  return true;
}

// Original mock data (kept for backwards compatibility)
export const mockMonitors: Monitor[] = [
  {
    id: "1",
    name: "Production API",
    type: "http",
    url: "https://api.example.com/health",
    interval: 30,
    timeout: 10,
    retries: 3,
    status: "up",
    lastCheck: new Date().toISOString(),
    lastResponseTime: 145,
    uptime24h: 99.98,
    uptime7d: 99.95,
    uptime30d: 99.92,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: new Date().toISOString(),
    slaTarget: 99.9,
    maxResponseTime: 500,
  },
  {
    id: "2",
    name: "Website",
    type: "http",
    url: "https://www.example.com",
    interval: 60,
    timeout: 15,
    retries: 2,
    status: "up",
    lastCheck: new Date().toISOString(),
    lastResponseTime: 320,
    uptime24h: 100,
    uptime7d: 99.99,
    uptime30d: 99.97,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: new Date().toISOString(),
    slaTarget: 99.95,
    maxResponseTime: 1000,
  },
  {
    id: "3",
    name: "Database Server",
    type: "tcp",
    url: "db.example.com:5432",
    interval: 30,
    timeout: 5,
    retries: 3,
    status: "up",
    lastCheck: new Date().toISOString(),
    lastResponseTime: 12,
    uptime24h: 100,
    uptime7d: 100,
    uptime30d: 99.99,
    createdAt: "2024-02-01T12:00:00Z",
    updatedAt: new Date().toISOString(),
    slaTarget: 99.99,
    maxResponseTime: 100,
  },
  {
    id: "4",
    name: "Mail Server",
    type: "tcp",
    url: "mail.example.com:587",
    interval: 60,
    timeout: 10,
    retries: 2,
    status: "down",
    lastCheck: new Date().toISOString(),
    lastResponseTime: null,
    uptime24h: 95.5,
    uptime7d: 98.2,
    uptime30d: 99.1,
    createdAt: "2024-01-20T14:00:00Z",
    updatedAt: new Date().toISOString(),
    slaTarget: 99.5,
    maxResponseTime: 500,
  },
  {
    id: "5",
    name: "CDN Endpoint",
    type: "http",
    url: "https://cdn.example.com/test.txt",
    interval: 120,
    timeout: 20,
    retries: 2,
    status: "up",
    lastCheck: new Date().toISOString(),
    lastResponseTime: 45,
    uptime24h: 100,
    uptime7d: 100,
    uptime30d: 100,
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: new Date().toISOString(),
    slaTarget: 99.9,
    maxResponseTime: 200,
  },
  {
    id: "6",
    name: "DNS Check",
    type: "dns",
    url: "example.com",
    interval: 300,
    timeout: 10,
    retries: 2,
    status: "pending",
    lastCheck: null,
    lastResponseTime: null,
    uptime24h: 0,
    uptime7d: 0,
    uptime30d: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaTarget: 99.9,
    maxResponseTime: 100,
  },
];

// Basic check result type (without detailed timing info)
export interface BasicCheckResult {
  id: string;
  monitorId: string;
  status: "up" | "down";
  responseTime: number;
  statusCode?: number;
  message?: string;
  checkedAt: string;
}

// Detailed check info (loaded on demand)
export interface CheckDetailsData {
  dnsTime?: number;
  tcpTime?: number;
  tlsTime?: number;
  ttfb?: number;
  transferTime?: number;
  ipAddress?: string;
  tlsVersion?: string;
  certificateExpiry?: string;
}

// Generate mock check results for a monitor (last 24 hours) - basic info only
export function generateMockCheckResults(
  monitorId: string,
  hours: number = 24
): BasicCheckResult[] {
  const results: BasicCheckResult[] = [];
  const now = new Date();
  const interval = 30; // seconds

  const checksCount = (hours * 60 * 60) / interval;

  for (let i = 0; i < checksCount; i++) {
    const checkedAt = new Date(now.getTime() - i * interval * 1000);
    const isDown = Math.random() < 0.005; // 0.5% chance of being down
    const baseResponseTime = Math.floor(100 + Math.random() * 200);

    results.push({
      id: `${monitorId}-${i}`,
      monitorId,
      status: isDown ? "down" : "up",
      responseTime: isDown ? 0 : baseResponseTime,
      statusCode: isDown ? 503 : 200,
      message: isDown ? "Connection timeout" : "OK",
      checkedAt: checkedAt.toISOString(),
    });
  }

  return results.reverse();
}

// Simulate loading detailed check info (would be an API call in production)
export async function loadCheckDetails(checkId: string): Promise<CheckDetailsData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

  // Generate realistic timing breakdown
  const dnsTime = Math.floor(5 + Math.random() * 20);
  const tcpTime = Math.floor(10 + Math.random() * 30);
  const tlsTime = Math.floor(20 + Math.random() * 50);
  const ttfb = Math.floor(30 + Math.random() * 80);
  const transferTime = Math.floor(5 + Math.random() * 20);

  return {
    dnsTime,
    tcpTime,
    tlsTime,
    ttfb,
    transferTime,
    ipAddress: "203.0.113.42",
    tlsVersion: "TLS 1.3",
    certificateExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Generate mock uptime history (48 segments, each 30 minutes)
export function generateMockUptimeHistory(
  baseUptime: number = 99.9
): UptimeSegment[] {
  const segments: UptimeSegment[] = [];
  const now = new Date();

  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 min intervals
    const checksPerSegment = 60; // 30s interval = 60 checks per 30 min

    // Random variation based on baseUptime
    let uptime: number;
    let failedChecks: number;
    let status: UptimeSegment["status"];

    const random = Math.random();

    if (baseUptime >= 99.9) {
      // Very stable - mostly 100%, rare minor issues
      if (random < 0.85) {
        uptime = 100;
        failedChecks = 0;
        status = "up";
      } else if (random < 0.95) {
        uptime = 99 + Math.random();
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      } else {
        uptime = 97 + Math.random() * 2;
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      }
    } else if (baseUptime >= 95) {
      // Some issues
      if (random < 0.6) {
        uptime = 100;
        failedChecks = 0;
        status = "up";
      } else if (random < 0.85) {
        uptime = 95 + Math.random() * 5;
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      } else {
        uptime = 80 + Math.random() * 15;
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      }
    } else {
      // Problematic service
      if (random < 0.3) {
        uptime = 100;
        failedChecks = 0;
        status = "up";
      } else if (random < 0.6) {
        uptime = 90 + Math.random() * 10;
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      } else if (random < 0.9) {
        uptime = 70 + Math.random() * 20;
        failedChecks = Math.floor((100 - uptime) * checksPerSegment / 100);
        status = "partial";
      } else {
        uptime = 0;
        failedChecks = checksPerSegment;
        status = "down";
      }
    }

    segments.push({
      timestamp: timestamp.toISOString(),
      status,
      uptime: Math.round(uptime * 100) / 100,
      totalChecks: checksPerSegment,
      failedChecks,
    });
  }

  return segments;
}

export const mockIncidents: Incident[] = [
  {
    id: "inc-1",
    monitorId: "4",
    monitorName: "Mail Server",
    status: "ongoing",
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    resolvedAt: null,
    duration: null,
    cause: "Connection refused on port 587",
  },
  {
    id: "inc-2",
    monitorId: "1",
    monitorName: "Production API",
    status: "resolved",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    resolvedAt: new Date(
      Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000
    ).toISOString(),
    duration: 15 * 60, // 15 minutes
    cause: "High latency detected (>5000ms)",
  },
  {
    id: "inc-3",
    monitorId: "2",
    monitorName: "Website",
    status: "resolved",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    resolvedAt: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000
    ).toISOString(),
    duration: 5 * 60, // 5 minutes
    cause: "HTTP 502 Bad Gateway",
  },
];

// ============================================
// Extended Incidents with full features
// ============================================

const initialExtendedIncidents: ExtendedIncident[] = [
  {
    id: "inc-1",
    monitorId: "4",
    monitorName: "Mail Server",
    status: "ongoing",
    severity: "critical",
    type: "incident",
    title: "Mail Server nicht erreichbar",
    description: "Der Mail Server antwortet nicht auf Port 587. Ausgehende E-Mails sind betroffen.",
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolvedAt: null,
    duration: null,
    cause: "Connection refused on port 587",
    affectedMonitors: ["4"],
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    acknowledgedBy: "Max Mustermann",
    updates: [
      {
        id: "upd-1-1",
        incidentId: "inc-1",
        status: "ongoing",
        message: "Incident automatisch erkannt. Verbindung zum Mail Server auf Port 587 fehlgeschlagen.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-1-2",
        incidentId: "inc-1",
        status: "ongoing",
        message: "Team wurde benachrichtigt. Untersuchung läuft.",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
      {
        id: "upd-1-3",
        incidentId: "inc-1",
        status: "ongoing",
        message: "Ursache identifiziert: Firewall-Regel blockiert eingehende Verbindungen. Fix wird vorbereitet.",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-2",
    monitorId: "1",
    monitorName: "Production API",
    status: "ongoing",
    severity: "major",
    type: "incident",
    title: "API Latenz erhöht",
    description: "Die Antwortzeiten der Production API sind deutlich erhöht.",
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    resolvedAt: null,
    duration: null,
    cause: "High latency detected (>2000ms)",
    affectedMonitors: ["1"],
    acknowledgedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    acknowledgedBy: "Anna Schmidt",
    updates: [
      {
        id: "upd-2-1",
        incidentId: "inc-2",
        status: "ongoing",
        message: "Erhöhte Latenz erkannt. Durchschnittliche Antwortzeit über 2000ms.",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-2-2",
        incidentId: "inc-2",
        status: "ongoing",
        message: "Datenbank-Performance wird untersucht.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-3",
    monitorId: "5",
    monitorName: "CDN Endpoint",
    status: "resolved",
    severity: "minor",
    type: "incident",
    title: "CDN Cache-Probleme",
    description: "Temporäre Cache-Invalidierung führte zu erhöhter Origin-Last.",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
    duration: 20 * 60,
    cause: "Cache invalidation storm",
    affectedMonitors: ["5"],
    acknowledgedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    acknowledgedBy: "System",
    updates: [
      {
        id: "upd-3-1",
        incidentId: "inc-3",
        status: "ongoing",
        message: "Erhöhte Anfragen an Origin-Server erkannt.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-3-2",
        incidentId: "inc-3",
        status: "resolved",
        message: "Cache wurde wiederhergestellt. Alle Systeme funktionieren normal.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
    ],
  },
  {
    id: "inc-4",
    monitorId: "2",
    monitorName: "Website",
    status: "resolved",
    severity: "major",
    type: "incident",
    title: "Website nicht erreichbar",
    description: "Die Hauptwebsite war für ca. 5 Minuten nicht erreichbar.",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    duration: 5 * 60,
    cause: "HTTP 502 Bad Gateway",
    affectedMonitors: ["2"],
    acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    acknowledgedBy: "Max Mustermann",
    updates: [
      {
        id: "upd-4-1",
        incidentId: "inc-4",
        status: "ongoing",
        message: "Website liefert HTTP 502 Fehler.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-4-2",
        incidentId: "inc-4",
        status: "resolved",
        message: "Webserver wurde neugestartet. Website ist wieder erreichbar.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-5",
    monitorId: "3",
    monitorName: "Database Primary",
    status: "resolved",
    severity: "critical",
    type: "incident",
    title: "Datenbankausfall",
    description: "Die primäre Datenbank war nicht erreichbar. Failover auf Replica wurde durchgeführt.",
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    duration: 45 * 60,
    cause: "Primary database unreachable",
    affectedMonitors: ["3", "1"],
    acknowledgedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    acknowledgedBy: "Anna Schmidt",
    updates: [
      {
        id: "upd-5-1",
        incidentId: "inc-5",
        status: "ongoing",
        message: "Primäre Datenbank nicht erreichbar. Abhängige Services betroffen.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-5-2",
        incidentId: "inc-5",
        status: "ongoing",
        message: "Failover auf Replica-Datenbank eingeleitet.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
      {
        id: "upd-5-3",
        incidentId: "inc-5",
        status: "ongoing",
        message: "Replica übernimmt. Performance wird überwacht.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
      {
        id: "upd-5-4",
        incidentId: "inc-5",
        status: "resolved",
        message: "Primäre Datenbank wiederhergestellt und synchronisiert.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-6",
    monitorId: "1",
    monitorName: "Production API",
    status: "resolved",
    severity: "info",
    type: "maintenance",
    title: "Geplante Wartung: API Update",
    description: "Deployment der neuen API-Version v2.5.0 mit Performance-Verbesserungen.",
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    duration: 30 * 60,
    cause: "Scheduled maintenance",
    affectedMonitors: ["1"],
    acknowledgedAt: null,
    acknowledgedBy: null,
    updates: [
      {
        id: "upd-6-1",
        incidentId: "inc-6",
        status: "ongoing",
        message: "Wartungsfenster gestartet. API wird aktualisiert.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
      {
        id: "upd-6-2",
        incidentId: "inc-6",
        status: "resolved",
        message: "API v2.5.0 erfolgreich deployed. Wartung abgeschlossen.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-7",
    monitorId: "6",
    monitorName: "DNS Primary",
    status: "resolved",
    severity: "minor",
    type: "incident",
    title: "DNS Auflösung verzögert",
    description: "DNS-Anfragen wurden langsamer beantwortet als gewöhnlich.",
    startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    duration: 15 * 60,
    cause: "DNS resolution slow",
    affectedMonitors: ["6"],
    acknowledgedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    acknowledgedBy: "System",
    updates: [
      {
        id: "upd-7-1",
        incidentId: "inc-7",
        status: "ongoing",
        message: "DNS-Antwortzeiten erhöht.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-7-2",
        incidentId: "inc-7",
        status: "resolved",
        message: "DNS-Performance normalisiert.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
    ],
  },
  {
    id: "inc-8",
    monitorId: "2",
    monitorName: "Website",
    status: "resolved",
    severity: "info",
    type: "maintenance",
    title: "SSL-Zertifikat Erneuerung",
    description: "Planmäßige Erneuerung des SSL-Zertifikats für die Hauptwebsite.",
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    duration: 10 * 60,
    cause: "Certificate renewal",
    affectedMonitors: ["2"],
    acknowledgedAt: null,
    acknowledgedBy: null,
    updates: [
      {
        id: "upd-8-1",
        incidentId: "inc-8",
        status: "ongoing",
        message: "SSL-Zertifikat wird erneuert. Kurze Unterbrechungen möglich.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
      {
        id: "upd-8-2",
        incidentId: "inc-8",
        status: "resolved",
        message: "Neues SSL-Zertifikat erfolgreich installiert. Gültig bis 2026.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-9",
    monitorId: "1",
    monitorName: "Production API",
    status: "resolved",
    severity: "major",
    type: "incident",
    title: "Erhöhte Fehlerrate bei API-Anfragen",
    description: "Die API lieferte bei ca. 15% der Anfragen HTTP 500 Fehler zurück.",
    startedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
    duration: 35 * 60,
    cause: "Memory leak in service",
    affectedMonitors: ["1"],
    acknowledgedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    acknowledgedBy: "Anna Schmidt",
    updates: [
      {
        id: "upd-9-1",
        incidentId: "inc-9",
        status: "ongoing",
        message: "Erhöhte HTTP 500 Fehlerrate erkannt.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-9-2",
        incidentId: "inc-9",
        status: "ongoing",
        message: "Memory Leak im Authentication-Service identifiziert. Rolling Restart wird eingeleitet.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
      {
        id: "upd-9-3",
        incidentId: "inc-9",
        status: "resolved",
        message: "Alle Services neu gestartet. Fehlerrate wieder normal.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
        createdBy: "Anna Schmidt",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-10",
    monitorId: "5",
    monitorName: "CDN Endpoint",
    status: "resolved",
    severity: "minor",
    type: "announcement",
    title: "Neue CDN Edge-Locations",
    description: "Ankündigung: Wir erweitern unser CDN um 3 neue Edge-Locations in Europa.",
    startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 1 * 60 * 1000).toISOString(),
    duration: 1 * 60,
    cause: "Infrastructure expansion",
    affectedMonitors: ["5"],
    acknowledgedAt: null,
    acknowledgedBy: null,
    updates: [
      {
        id: "upd-10-1",
        incidentId: "inc-10",
        status: "resolved",
        message: "Neue Edge-Locations in Frankfurt, Amsterdam und Paris sind jetzt aktiv. Verbesserte Latenzzeiten für europäische Nutzer.",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
  {
    id: "inc-11",
    monitorId: "4",
    monitorName: "Mail Server",
    status: "resolved",
    severity: "critical",
    type: "incident",
    title: "SMTP-Authentifizierung fehlgeschlagen",
    description: "E-Mail-Versand war aufgrund eines Zertifikatsproblems nicht möglich.",
    startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    duration: 50 * 60,
    cause: "SMTP authentication failed",
    affectedMonitors: ["4"],
    acknowledgedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
    acknowledgedBy: "Max Mustermann",
    updates: [
      {
        id: "upd-11-1",
        incidentId: "inc-11",
        status: "ongoing",
        message: "SMTP-Server lehnt Verbindungen ab. Authentifizierungsfehler.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "System",
        isAutomatic: true,
      },
      {
        id: "upd-11-2",
        incidentId: "inc-11",
        status: "ongoing",
        message: "TLS-Zertifikat des Mail-Servers ist abgelaufen. Erneuerung wird eingeleitet.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
      {
        id: "upd-11-3",
        incidentId: "inc-11",
        status: "ongoing",
        message: "Neues Zertifikat installiert. Warten auf DNS-Propagation.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
      {
        id: "upd-11-4",
        incidentId: "inc-11",
        status: "resolved",
        message: "Mail-Server funktioniert wieder. Alle ausstehenden E-Mails werden zugestellt.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
        createdBy: "Max Mustermann",
        isAutomatic: false,
      },
    ],
  },
];

// Mutable copy for runtime updates
let mutableExtendedIncidents: ExtendedIncident[] | null = null;

// Get current extended incidents (creates mutable copy on first access)
export function getExtendedIncidents(): ExtendedIncident[] {
  if (mutableExtendedIncidents === null) {
    mutableExtendedIncidents = JSON.parse(JSON.stringify(initialExtendedIncidents)) as ExtendedIncident[];
  }
  return mutableExtendedIncidents;
}

// Create a new incident
let incidentCounter = 100;
export function createIncident(data: IncidentFormData): ExtendedIncident {
  const incidents = getExtendedIncidents();
  const monitor = getMockMonitors().find((m) => data.affectedMonitors.includes(m.id));

  const resolvedAt = data.status === "resolved" ? (data.resolvedAt || new Date().toISOString()) : null;
  const duration = resolvedAt
    ? Math.floor((new Date(resolvedAt).getTime() - new Date(data.startedAt).getTime()) / 1000)
    : null;

  const newIncident: ExtendedIncident = {
    id: `inc-${++incidentCounter}`,
    monitorId: data.affectedMonitors[0] || "",
    monitorName: monitor?.name || "Unknown",
    status: data.status,
    severity: data.severity,
    type: data.type,
    title: data.title,
    description: data.description,
    cause: data.cause,
    affectedMonitors: data.affectedMonitors,
    startedAt: data.startedAt,
    resolvedAt,
    duration,
    acknowledgedAt: null,
    acknowledgedBy: null,
    updates: [
      {
        id: `upd-${incidentCounter}-1`,
        incidentId: `inc-${incidentCounter}`,
        status: data.status,
        message: `${data.type === "maintenance" ? "Wartung" : data.type === "announcement" ? "Ankündigung" : "Incident"} erstellt: ${data.cause}`,
        createdAt: new Date().toISOString(),
        createdBy: "Benutzer",
        isAutomatic: false,
      },
    ],
  };

  incidents.unshift(newIncident);
  return newIncident;
}

// Update an existing incident
export function updateIncident(
  incidentId: string,
  updates: Partial<ExtendedIncident>
): ExtendedIncident | null {
  const incidents = getExtendedIncidents();
  const index = incidents.findIndex((i) => i.id === incidentId);
  if (index === -1) return null;

  const updatedIncident: ExtendedIncident = {
    ...incidents[index],
    ...updates,
  };

  incidents[index] = updatedIncident;
  return updatedIncident;
}

// Delete an incident
export function deleteIncident(incidentId: string): boolean {
  const incidents = getExtendedIncidents();
  const index = incidents.findIndex((i) => i.id === incidentId);
  if (index === -1) return false;

  incidents.splice(index, 1);
  return true;
}

// Add an update to an incident
let updateCounter = 1000;
export function addIncidentUpdate(
  incidentId: string,
  message: string,
  createdBy: string
): IncidentUpdate | null {
  const incidents = getExtendedIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return null;

  const newUpdate: IncidentUpdate = {
    id: `upd-${++updateCounter}`,
    incidentId,
    status: incident.status,
    message,
    createdAt: new Date().toISOString(),
    createdBy,
    isAutomatic: false,
  };

  incident.updates.unshift(newUpdate);
  return newUpdate;
}

// Edit an incident update
export function editIncidentUpdate(
  incidentId: string,
  updateId: string,
  newMessage: string
): IncidentUpdate | null {
  const incidents = getExtendedIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return null;

  const update = incident.updates.find((u) => u.id === updateId);
  if (!update) return null;

  update.message = newMessage;
  return update;
}

// Delete an incident update
export function deleteIncidentUpdate(
  incidentId: string,
  updateId: string
): boolean {
  const incidents = getExtendedIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return false;

  const index = incident.updates.findIndex((u) => u.id === updateId);
  if (index === -1) return false;

  incident.updates.splice(index, 1);
  return true;
}

// Resolve an incident
export function resolveIncident(
  incidentId: string,
  message: string
): ExtendedIncident | null {
  const incidents = getExtendedIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return null;

  const now = new Date();
  const startedAt = new Date(incident.startedAt);
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

  incident.status = "resolved";
  incident.resolvedAt = now.toISOString();
  incident.duration = durationSeconds;

  const resolveUpdate: IncidentUpdate = {
    id: `upd-${++updateCounter}`,
    incidentId,
    status: "resolved",
    message,
    createdAt: now.toISOString(),
    createdBy: "Benutzer",
    isAutomatic: false,
  };

  incident.updates.unshift(resolveUpdate);
  return incident;
}

// Calculate incident statistics
export function calculateIncidentStats(incidents: ExtendedIncident[]): IncidentStats {
  const ongoing = incidents.filter((i) => i.status === "ongoing");
  const resolved = incidents.filter((i) => i.status === "resolved");

  // Calculate MTTR from resolved incidents
  const totalResolveDuration = resolved.reduce((sum, i) => sum + (i.duration || 0), 0);
  const mttrMinutes = resolved.length > 0
    ? Math.round(totalResolveDuration / resolved.length / 60)
    : 0;

  // Calculate severity distribution
  const bySeverity: Record<IncidentSeverity, number> = {
    info: incidents.filter((i) => i.severity === "info").length,
    minor: incidents.filter((i) => i.severity === "minor").length,
    major: incidents.filter((i) => i.severity === "major").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };

  return {
    totalOngoing: ongoing.length,
    totalResolved: resolved.length,
    mttrMinutes,
    bySeverity,
  };
}

// Reset extended incidents to initial state
export function resetExtendedIncidents(): void {
  mutableExtendedIncidents = null;
}

// Mutable copy for service groups
let mutableServiceGroups: ServiceGroup[] | null = null;

// Get current service groups (creates mutable copy on first access)
export function getServiceGroups(): ServiceGroup[] {
  if (mutableServiceGroups === null) {
    mutableServiceGroups = JSON.parse(JSON.stringify(mockServiceGroups)) as ServiceGroup[];
  }
  return mutableServiceGroups;
}

// Update service groups (replaces entire tree)
export function updateServiceGroups(groups: ServiceGroup[]): ServiceGroup[] {
  mutableServiceGroups = JSON.parse(JSON.stringify(groups)) as ServiceGroup[];
  return mutableServiceGroups;
}

// Reset service groups to initial state
export function resetServiceGroups(): void {
  mutableServiceGroups = null;
}

// Mock service groups with hierarchical structure
export const mockServiceGroups: ServiceGroup[] = [
  {
    id: "group-public",
    name: "Öffentliche Seiten",
    type: "group",
    children: [
      {
        id: "service-website",
        name: "Website",
        type: "service",
        monitorId: "2",
      },
      {
        id: "service-cdn",
        name: "CDN Endpoint",
        type: "service",
        monitorId: "5",
      },
      {
        id: "group-api",
        name: "API Services",
        type: "group",
        children: [
          {
            id: "service-api",
            name: "Production API",
            type: "service",
            monitorId: "1",
          },
          {
            id: "group-api-internal",
            name: "Internal APIs",
            type: "group",
            children: [
              {
                id: "service-dns",
                name: "DNS Check",
                type: "service",
                monitorId: "6",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "group-infrastructure",
    name: "Infrastruktur",
    type: "group",
    children: [
      {
        id: "service-db",
        name: "Database Server",
        type: "service",
        monitorId: "3",
      },
      {
        id: "service-mail",
        name: "Mail Server",
        type: "service",
        monitorId: "4",
      },
    ],
  },
];

// ============================================
// SLA Report Mock Data Generators
// ============================================

const MONTH_NAMES_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

const DAY_NAMES_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const ROOT_CAUSES = [
  "Netzwerk-Timeout",
  "Server nicht erreichbar",
  "SSL/TLS Fehler",
  "DNS Auflösung fehlgeschlagen",
  "HTTP 5xx Fehler",
  "Hohe Latenz",
  "Verbindung abgelehnt",
  "Zertifikat abgelaufen",
];

// Generate available report periods based on type
export function generateReportPeriods(type: ReportPeriodType): ReportPeriod[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const periods: ReportPeriod[] = [];

  switch (type) {
    case "year":
      for (let year = currentYear; year >= currentYear - 2; year--) {
        periods.push({
          type: "year",
          year,
          value: 1,
          label: `${year}`,
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        });
      }
      break;

    case "half-year":
      for (let year = currentYear; year >= currentYear - 1; year--) {
        const maxHalf = year === currentYear ? (currentMonth <= 6 ? 1 : 2) : 2;
        for (let half = maxHalf; half >= 1; half--) {
          periods.push({
            type: "half-year",
            year,
            value: half,
            label: `H${half} ${year}`,
            startDate: `${year}-${half === 1 ? "01" : "07"}-01`,
            endDate: `${year}-${half === 1 ? "06" : "12"}-${half === 1 ? "30" : "31"}`,
          });
        }
      }
      break;

    case "quarter":
      for (let year = currentYear; year >= currentYear - 1; year--) {
        const maxQuarter = year === currentYear ? Math.ceil(currentMonth / 3) : 4;
        for (let quarter = maxQuarter; quarter >= 1; quarter--) {
          const startMonth = (quarter - 1) * 3 + 1;
          const endMonth = quarter * 3;
          const lastDay = new Date(year, endMonth, 0).getDate();
          periods.push({
            type: "quarter",
            year,
            value: quarter,
            label: `Q${quarter} ${year}`,
            startDate: `${year}-${String(startMonth).padStart(2, "0")}-01`,
            endDate: `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`,
          });
        }
      }
      break;

    case "month":
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        periods.push({
          type: "month",
          year,
          value: month,
          label: `${MONTH_NAMES_DE[month - 1]} ${year}`,
          startDate: `${year}-${String(month).padStart(2, "0")}-01`,
          endDate: `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
        });
      }
      break;
  }

  return periods;
}

// Calculate days in period
function getDaysInPeriod(period: ReportPeriod): number {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// Generate executive summary
function generateExecutiveSummary(
  baseUptime: number,
  slaTarget: number,
  maxResponseTime: number,
  daysInPeriod: number,
  avgResponseTime: number
): ExecutiveSummary {
  const overallAvailability = baseUptime + (Math.random() - 0.5) * 0.5;
  const totalMinutesInPeriod = daysInPeriod * 24 * 60;
  const downtimeMinutes = Math.round(totalMinutesInPeriod * (1 - overallAvailability / 100));

  const hours = Math.floor(downtimeMinutes / 60);
  const minutes = downtimeMinutes % 60;
  const formattedDowntime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  const trendValue = (Math.random() - 0.5) * 2;

  return {
    overallAvailability: Math.round(overallAvailability * 1000) / 1000,
    slaTarget,
    maxResponseTime,
    slaCompliant: overallAvailability >= slaTarget,
    responseTimeCompliant: avgResponseTime <= maxResponseTime,
    totalDowntimeMinutes: downtimeMinutes,
    totalDowntimeFormatted: formattedDowntime,
    trendVsPreviousPeriod: Math.round(trendValue * 100) / 100,
    trendDirection: trendValue > 0.1 ? "up" : trendValue < -0.1 ? "down" : "stable",
  };
}

// Generate daily availability breakdown
function generateDailyAvailability(period: ReportPeriod, baseUptime: number): DailyAvailability[] {
  const days: DailyAvailability[] = [];
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayUptime = baseUptime + (Math.random() - 0.3) * 3;
    const clampedUptime = Math.min(100, Math.max(90, dayUptime));
    const checksPerDay = 2880; // 30s interval
    const failedChecks = Math.round(checksPerDay * (1 - clampedUptime / 100));

    days.push({
      date: d.toISOString().split("T")[0],
      dayOfWeek: DAY_NAMES_DE[d.getDay()],
      uptime: Math.round(clampedUptime * 100) / 100,
      totalChecks: checksPerDay,
      failedChecks,
      downtimeMinutes: Math.round(1440 * (1 - clampedUptime / 100)),
    });
  }

  return days;
}

// Generate weekly availability
function generateWeeklyAvailability(dailyData: DailyAvailability[]): WeeklyAvailability[] {
  const weeks: WeeklyAvailability[] = [];
  let weekNum = 1;

  for (let i = 0; i < dailyData.length; i += 7) {
    const weekDays = dailyData.slice(i, Math.min(i + 7, dailyData.length));
    const totalChecks = weekDays.reduce((sum, d) => sum + d.totalChecks, 0);
    const failedChecks = weekDays.reduce((sum, d) => sum + d.failedChecks, 0);

    weeks.push({
      weekNumber: weekNum++,
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
      uptime: Math.round((1 - failedChecks / totalChecks) * 10000) / 100,
      totalChecks,
      failedChecks,
    });
  }

  return weeks;
}

// Generate monthly availability
function generateMonthlyAvailability(dailyData: DailyAvailability[]): MonthlyAvailability[] {
  const monthlyMap = new Map<string, DailyAvailability[]>();

  dailyData.forEach(day => {
    const [year, month] = day.date.split("-");
    const key = `${year}-${month}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, []);
    }
    monthlyMap.get(key)!.push(day);
  });

  const months: MonthlyAvailability[] = [];
  monthlyMap.forEach((days, key) => {
    const [year, month] = key.split("-").map(Number);
    const totalChecks = days.reduce((sum, d) => sum + d.totalChecks, 0);
    const failedChecks = days.reduce((sum, d) => sum + d.failedChecks, 0);

    months.push({
      month,
      year,
      label: MONTH_NAMES_DE[month - 1],
      uptime: Math.round((1 - failedChecks / totalChecks) * 10000) / 100,
      totalChecks,
      failedChecks,
    });
  });

  return months.sort((a, b) => a.year - b.year || a.month - b.month);
}

// Generate SLA breaches
function generateSLABreaches(dailyData: DailyAvailability[], slaTarget: number): SLABreach[] {
  const breaches: SLABreach[] = [];

  dailyData.forEach(day => {
    if (day.uptime < slaTarget) {
      const severity = day.uptime < 95 ? "critical" : day.uptime < 99 ? "major" : "minor";
      breaches.push({
        date: day.date,
        duration: day.downtimeMinutes,
        cause: ROOT_CAUSES[Math.floor(Math.random() * ROOT_CAUSES.length)],
        severity,
      });
    }
  });

  return breaches;
}

// Generate availability metrics
function generateAvailabilityMetrics(
  period: ReportPeriod,
  baseUptime: number,
  slaTarget: number
): AvailabilityMetrics {
  const dailyBreakdown = generateDailyAvailability(period, baseUptime);
  const totalMinutes = dailyBreakdown.length * 24 * 60;
  const totalDowntimeMinutes = dailyBreakdown.reduce((sum, d) => sum + d.downtimeMinutes, 0);
  const uptimeMinutes = totalMinutes - totalDowntimeMinutes;

  const slaBreaches = generateSLABreaches(dailyBreakdown, slaTarget);

  return {
    uptimePercentage: Math.round((uptimeMinutes / totalMinutes) * 10000) / 100,
    uptimeHours: Math.floor(uptimeMinutes / 60),
    uptimeMinutes: uptimeMinutes % 60,
    downtimeHours: Math.floor(totalDowntimeMinutes / 60),
    downtimeMinutes: totalDowntimeMinutes % 60,
    dailyBreakdown,
    weeklyBreakdown: generateWeeklyAvailability(dailyBreakdown),
    monthlyBreakdown: generateMonthlyAvailability(dailyBreakdown),
    slaBreachCount: slaBreaches.length,
    slaBreaches,
  };
}

// Generate performance metrics
function generatePerformanceMetrics(
  period: ReportPeriod,
  baseResponseTime: number
): PerformanceMetrics {
  const variation = baseResponseTime * 0.3;
  const avg = baseResponseTime + (Math.random() - 0.5) * variation;
  const median = avg * (0.9 + Math.random() * 0.2);

  const responseTimes = Array.from({ length: 1000 }, () =>
    baseResponseTime + (Math.random() - 0.5) * variation * 2
  ).sort((a, b) => a - b);

  // Generate trend data
  const daysInPeriod = getDaysInPeriod(period);
  const trendData: ResponseTimeTrendPoint[] = [];
  const start = new Date(period.startDate);

  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dayAvg = baseResponseTime + (Math.random() - 0.5) * variation;
    trendData.push({
      date: date.toISOString().split("T")[0],
      average: Math.round(dayAvg),
      p95: Math.round(dayAvg * 1.5 + Math.random() * 50),
    });
  }

  // Generate degradation incidents
  const degradations: DegradationIncident[] = [];
  const degradationCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < degradationCount; i++) {
    const randomDay = Math.floor(Math.random() * daysInPeriod);
    const date = new Date(start);
    date.setDate(date.getDate() + randomDay);
    degradations.push({
      date: date.toISOString().split("T")[0],
      duration: Math.floor(15 + Math.random() * 120),
      averageResponseTime: Math.round(baseResponseTime * 3 + Math.random() * baseResponseTime * 2),
      threshold: Math.round(baseResponseTime * 2),
    });
  }

  return {
    averageResponseTime: Math.round(avg),
    medianResponseTime: Math.round(median),
    p90ResponseTime: Math.round(responseTimes[899]),
    p95ResponseTime: Math.round(responseTimes[949]),
    p99ResponseTime: Math.round(responseTimes[989]),
    minResponseTime: Math.round(responseTimes[0]),
    maxResponseTime: Math.round(responseTimes[999]),
    responseTimeTrend: trendData,
    degradationIncidents: degradations,
  };
}

// Generate incident analysis
function generateIncidentAnalysis(
  period: ReportPeriod,
  baseUptime: number
): IncidentAnalysis {
  const daysInPeriod = getDaysInPeriod(period);
  const incidentProbability = (100 - baseUptime) / 10;
  const incidentCount = Math.floor(incidentProbability * daysInPeriod / 30);

  const incidents: IncidentTimelineEntry[] = [];
  const start = new Date(period.startDate);

  for (let i = 0; i < incidentCount; i++) {
    const randomDay = Math.floor(Math.random() * daysInPeriod);
    const date = new Date(start);
    date.setDate(date.getDate() + randomDay);
    const duration = Math.floor(5 + Math.random() * 120);
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);

    const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const endHour = hour + Math.floor(duration / 60);
    const endMinute = (minute + duration) % 60;
    const endTime = `${String(endHour % 24).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    const severity = duration > 60 ? "critical" : duration > 30 ? "major" : "minor";

    incidents.push({
      id: `inc-report-${i}`,
      date: date.toISOString().split("T")[0],
      startTime,
      endTime,
      duration,
      cause: ROOT_CAUSES[Math.floor(Math.random() * ROOT_CAUSES.length)],
      status: "resolved",
      severity,
    });
  }

  // Sort by date
  incidents.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate MTBF and MTTR
  const totalDurationMinutes = incidents.reduce((sum, inc) => sum + inc.duration, 0);
  const mttr = incidentCount > 0 ? Math.round(totalDurationMinutes / incidentCount) : 0;
  const hoursInPeriod = daysInPeriod * 24;
  const mtbf = incidentCount > 1 ? Math.round(hoursInPeriod / incidentCount) : hoursInPeriod;

  const longestIncident = incidents.reduce((max, inc) =>
    inc.duration > max.duration ? inc : max,
    { duration: 0, date: "" }
  );

  // Severity distribution
  const severityDist = {
    minor: incidents.filter(i => i.severity === "minor").length,
    major: incidents.filter(i => i.severity === "major").length,
    critical: incidents.filter(i => i.severity === "critical").length,
  };

  // Root cause categories
  const causeCounts = new Map<string, number>();
  incidents.forEach(inc => {
    causeCounts.set(inc.cause, (causeCounts.get(inc.cause) || 0) + 1);
  });

  const rootCauseCategories: RootCauseCategory[] = Array.from(causeCounts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / incidentCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalIncidents: incidentCount,
    mtbf,
    mttr,
    longestOutage: longestIncident.duration,
    longestOutageDate: longestIncident.date || period.startDate,
    incidentTimeline: incidents,
    severityDistribution: severityDist,
    rootCauseCategories,
  };
}

// Generate check statistics
function generateCheckStatistics(
  period: ReportPeriod,
  baseUptime: number
): CheckStatistics {
  const daysInPeriod = getDaysInPeriod(period);
  const checksPerDay = 2880;
  const totalChecks = daysInPeriod * checksPerDay;
  const failureRate = (100 - baseUptime) / 100;
  const failedChecks = Math.round(totalChecks * failureRate);
  const successfulChecks = totalChecks - failedChecks;

  const checksByDay: ChecksByDayEntry[] = [];
  const start = new Date(period.startDate);

  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dayFailureRate = failureRate + (Math.random() - 0.5) * 0.02;
    const dayFailed = Math.round(checksPerDay * Math.max(0, dayFailureRate));

    checksByDay.push({
      date: date.toISOString().split("T")[0],
      total: checksPerDay,
      successful: checksPerDay - dayFailed,
      failed: dayFailed,
    });
  }

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    successRate: Math.round((successfulChecks / totalChecks) * 10000) / 100,
    checksPerDay,
    checksByDay,
  };
}

// Generate technical details
function generateTechnicalDetails(period: ReportPeriod): TechnicalDetails {
  const daysInPeriod = getDaysInPeriod(period);
  const start = new Date(period.startDate);

  // Certificate history (monthly snapshots)
  const certHistory: CertificateEntry[] = [];
  const certExpiryBase = new Date();
  certExpiryBase.setDate(certExpiryBase.getDate() + 90);

  for (let i = 0; i < Math.min(daysInPeriod / 30, 12); i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    const expiryDate = new Date(certExpiryBase);
    expiryDate.setMonth(expiryDate.getMonth() - i);

    certHistory.push({
      date: date.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
      daysUntilExpiry: Math.round((expiryDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)),
      issuer: "Let's Encrypt Authority X3",
    });
  }

  // TLS version history
  const tlsHistory: TLSVersionEntry[] = [
    { date: period.startDate, version: "TLS 1.3" },
  ];

  // IP address changes
  const ipChanges: IPAddressChange[] = [];
  const ipChangeCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < ipChangeCount; i++) {
    const randomDay = Math.floor(Math.random() * daysInPeriod);
    const date = new Date(start);
    date.setDate(date.getDate() + randomDay);
    ipChanges.push({
      date: date.toISOString().split("T")[0],
      previousIP: `203.0.113.${40 + i}`,
      newIP: `203.0.113.${41 + i}`,
    });
  }

  return {
    certificateHistory: certHistory,
    tlsVersionHistory: tlsHistory,
    ipAddressChanges: ipChanges.sort((a, b) => a.date.localeCompare(b.date)),
    dnsResolutionStats: {
      averageTime: Math.round(10 + Math.random() * 20),
      minTime: Math.round(3 + Math.random() * 5),
      maxTime: Math.round(50 + Math.random() * 100),
      p95Time: Math.round(25 + Math.random() * 30),
    },
  };
}

// Generate calendar heatmap
function generateCalendarHeatmap(
  period: ReportPeriod,
  baseUptime: number
): CalendarHeatmapDay[] {
  const days: CalendarHeatmapDay[] = [];
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const uptime = baseUptime + (Math.random() - 0.3) * 5;
    const clampedUptime = Math.min(100, Math.max(0, uptime));

    let level: 0 | 1 | 2 | 3 | 4;
    if (clampedUptime >= 99.9) level = 4;
    else if (clampedUptime >= 99) level = 3;
    else if (clampedUptime >= 95) level = 2;
    else if (clampedUptime >= 90) level = 1;
    else level = 0;

    days.push({
      date: d.toISOString().split("T")[0],
      uptime: Math.round(clampedUptime * 100) / 100,
      level,
    });
  }

  return days;
}

// Main function to generate complete SLA report
export function generateSLAReport(
  monitor: Monitor,
  period: ReportPeriod,
  slaTarget?: number,
  maxResponseTime?: number
): SLAReport {
  const baseUptime = monitor.uptime30d;
  const baseResponseTime = monitor.lastResponseTime || 150;
  const daysInPeriod = getDaysInPeriod(period);

  // Use monitor's configured values as defaults
  const effectiveSlaTarget = slaTarget ?? monitor.slaTarget;
  const effectiveMaxResponseTime = maxResponseTime ?? monitor.maxResponseTime;

  const performanceMetrics = generatePerformanceMetrics(period, baseResponseTime);

  return {
    monitorId: monitor.id,
    monitorName: monitor.name,
    monitorUrl: monitor.url,
    monitorType: monitor.type,
    period,
    generatedAt: new Date().toISOString(),
    slaTarget: effectiveSlaTarget,
    maxResponseTime: effectiveMaxResponseTime,
    executiveSummary: generateExecutiveSummary(
      baseUptime,
      effectiveSlaTarget,
      effectiveMaxResponseTime,
      daysInPeriod,
      performanceMetrics.averageResponseTime
    ),
    availability: generateAvailabilityMetrics(period, baseUptime, effectiveSlaTarget),
    performance: performanceMetrics,
    incidents: generateIncidentAnalysis(period, baseUptime),
    checks: generateCheckStatistics(period, baseUptime),
    technical: generateTechnicalDetails(period),
    calendarHeatmap: generateCalendarHeatmap(period, baseUptime),
  };
}

// Generate detailed stats for header display
export function generateMonitorDetailedStats(monitor: Monitor): MonitorDetailedStats {
  const certExpiry = new Date();
  certExpiry.setDate(certExpiry.getDate() + 90 + Math.floor(Math.random() * 30));
  const daysLeft = Math.ceil((certExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const baseResponse = monitor.lastResponseTime || 150;

  return {
    lastCheck: monitor.lastCheck,
    lastResponseTime: monitor.lastResponseTime,
    currentIpAddress: "203.0.113.42",
    tlsVersion: "TLS 1.3",
    certificateExpiry: certExpiry.toISOString(),
    certificateDaysLeft: daysLeft,
    avgResponseTime24h: Math.round(baseResponse * (0.9 + Math.random() * 0.2)),
    avgResponseTime7d: Math.round(baseResponse * (0.85 + Math.random() * 0.3)),
    p95ResponseTime: Math.round(baseResponse * 1.5 + Math.random() * 50),
    p99ResponseTime: Math.round(baseResponse * 2 + Math.random() * 100),
    totalIncidents30d: Math.floor((100 - monitor.uptime30d) * 2),
    mttr: Math.round(5 + Math.random() * 25),
    outagesCount30d: Math.floor((100 - monitor.uptime30d) * 1.5),
    longestOutage30d: Math.round(10 + Math.random() * 60),
  };
}
