import type { Monitor, CheckResult, Incident, UptimeSegment, ServiceGroup } from "@/types";

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
  },
];

// Generate mock check results for a monitor (last 24 hours)
export function generateMockCheckResults(
  monitorId: string,
  hours: number = 24
): CheckResult[] {
  const results: CheckResult[] = [];
  const now = new Date();
  const interval = 30; // seconds

  const checksCount = (hours * 60 * 60) / interval;

  for (let i = 0; i < checksCount; i++) {
    const checkedAt = new Date(now.getTime() - i * interval * 1000);
    const isDown = Math.random() < 0.005; // 0.5% chance of being down

    results.push({
      id: `${monitorId}-${i}`,
      monitorId,
      status: isDown ? "down" : "up",
      responseTime: isDown ? 0 : Math.floor(100 + Math.random() * 200),
      statusCode: isDown ? 503 : 200,
      message: isDown ? "Connection timeout" : "OK",
      checkedAt: checkedAt.toISOString(),
    });
  }

  return results.reverse();
}

// Generate mock uptime history (24 segments, each 1 hour)
export function generateMockUptimeHistory(
  baseUptime: number = 99.9
): UptimeSegment[] {
  const segments: UptimeSegment[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const checksPerSegment = 120; // 30s interval = 120 checks per hour

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
