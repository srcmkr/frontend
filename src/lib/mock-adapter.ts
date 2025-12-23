/**
 * Mock Adapter for Development
 *
 * Routes API requests to mock data handlers during development.
 * Simulates network latency and can optionally simulate errors.
 */

import type {
  Monitor,
  ExtendedIncident,
  StatusPage,
  StatusPageFormData,
  CheckResult,
  MonitorDetailedStats,
  ReportPeriod,
  SLAReport,
  IncidentFormData,
} from "@/types";

// Lazy imports to avoid circular dependencies
const getMocks = async () => {
  const [monitors, statusPages, settings] = await Promise.all([
    import("@/mocks/monitors"),
    import("@/mocks/status-pages"),
    import("@/mocks/settings"),
  ]);
  return { monitors, statusPages, settings };
};

// Simulate network latency
const delay = (ms = 150) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 100));

// Simulate occasional errors for testing error states
// Set to 0 to disable, or increase for stress testing
const ERROR_RATE = 0;
const maybeError = () => {
  if (ERROR_RATE > 0 && Math.random() < ERROR_RATE) {
    throw new Error("Simulated network error");
  }
};

type RouteParams = Record<string, string>;
type RouteHandler = (
  params: RouteParams,
  body?: unknown,
  query?: URLSearchParams
) => Promise<unknown>;

interface RouteMatch {
  handler: RouteHandler;
  params: RouteParams;
}

// Route definitions
const createRoutes = (
  mocks: Awaited<ReturnType<typeof getMocks>>
): Record<string, Record<string, RouteHandler>> => ({
  GET: {
    // System
    "/system/status": async () => {
      await delay();
      return {
        isInitialized: true,
        needsSetup: false,
        version: "1.0.0",
      };
    },

    // Monitors
    "/monitors": async () => {
      await delay();
      return mocks.monitors.getMockMonitors().map((m) => ({
        ...m,
        uptimeHistory: mocks.monitors.generateMockUptimeHistory(m.uptime24h),
      }));
    },
    "/monitors/:id": async ({ id }) => {
      await delay();
      const monitor = mocks.monitors.getMockMonitors().find((m) => m.id === id);
      if (!monitor) throw new Error("Monitor not found");
      return {
        ...monitor,
        uptimeHistory: mocks.monitors.generateMockUptimeHistory(monitor.uptime24h),
      };
    },
    "/monitors/:id/checks": async ({ id }, _, query) => {
      await delay();
      const hours = parseInt(query?.get("hours") ?? "24", 10);
      return mocks.monitors.generateMockCheckResults(id, hours);
    },
    "/monitors/:id/stats": async ({ id }) => {
      await delay();
      const monitor = mocks.monitors.getMockMonitors().find((m) => m.id === id);
      if (!monitor) throw new Error("Monitor not found");
      return mocks.monitors.generateMonitorDetailedStats(monitor);
    },

    // Service Groups
    "/service-groups": async () => {
      await delay();
      return mocks.monitors.getServiceGroups();
    },

    // Incidents
    "/incidents": async () => {
      await delay();
      return mocks.monitors.getExtendedIncidents();
    },
    "/incidents/stats": async () => {
      await delay();
      const incidents = mocks.monitors.getExtendedIncidents();
      return mocks.monitors.calculateIncidentStats(incidents);
    },
    "/incidents/:id": async ({ id }) => {
      await delay();
      const incidents = mocks.monitors.getExtendedIncidents();
      const incident = incidents.find((i) => i.id === id);
      if (!incident) throw new Error("Incident not found");
      return incident;
    },

    // Status Pages
    "/status-pages": async () => {
      await delay();
      return mocks.statusPages.getStatusPages();
    },
    "/status-pages/:id": async ({ id }) => {
      await delay();
      const pages = mocks.statusPages.getStatusPages();
      const page = pages.find((p) => p.id === id);
      if (!page) throw new Error("Status page not found");
      return page;
    },
    "/status-pages/slug/:slug": async ({ slug }) => {
      await delay();
      return mocks.statusPages.getStatusPageBySlug(slug);
    },

    // Reports
    "/reports/periods": async (_, __, query) => {
      await delay();
      const type = (query?.get("type") ?? "month") as "month" | "quarter" | "half-year" | "year";
      return mocks.monitors.generateReportPeriods(type);
    },
    "/reports/sla/:monitorId": async ({ monitorId }, _, query) => {
      await delay(500); // Reports take longer
      const monitor = mocks.monitors.getMockMonitors().find((m) => m.id === monitorId);
      if (!monitor) throw new Error("Monitor not found");

      const periodType = (query?.get("type") as ReportPeriod["type"]) ?? "month";
      const year = parseInt(query?.get("year") ?? new Date().getFullYear().toString(), 10);
      const value = parseInt(query?.get("value") ?? "1", 10);

      // Calculate startDate and endDate based on period type
      let startDate: string;
      let endDate: string;
      let label: string;

      const MONTH_NAMES_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

      switch (periodType) {
        case "year":
          startDate = `${year}-01-01`;
          endDate = `${year}-12-31`;
          label = `${year}`;
          break;
        case "half-year":
          startDate = `${year}-${value === 1 ? "01" : "07"}-01`;
          endDate = `${year}-${value === 1 ? "06" : "12"}-${value === 1 ? "30" : "31"}`;
          label = `H${value} ${year}`;
          break;
        case "quarter":
          const startMonth = (value - 1) * 3 + 1;
          const endMonth = value * 3;
          const lastDay = new Date(year, endMonth, 0).getDate();
          startDate = `${year}-${String(startMonth).padStart(2, "0")}-01`;
          endDate = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
          label = `Q${value} ${year}`;
          break;
        case "month":
          const lastDayOfMonth = new Date(year, value, 0).getDate();
          startDate = `${year}-${String(value).padStart(2, "0")}-01`;
          endDate = `${year}-${String(value).padStart(2, "0")}-${lastDayOfMonth}`;
          label = `${MONTH_NAMES_DE[value - 1]} ${year}`;
          break;
        default:
          throw new Error(`Unknown period type: ${periodType}`);
      }

      const period: ReportPeriod = {
        type: periodType,
        year,
        value,
        label,
        startDate,
        endDate,
      };

      const slaTarget = query?.get("slaTarget")
        ? parseFloat(query.get("slaTarget")!)
        : undefined;
      const maxResponseTime = query?.get("maxResponseTime")
        ? parseInt(query.get("maxResponseTime")!, 10)
        : undefined;
      return mocks.monitors.generateSLAReport(monitor, period, slaTarget, maxResponseTime);
    },

    // Settings
    "/settings/api-keys": async () => {
      await delay();
      return mocks.settings.mockApiKeys;
    },
    "/settings/notification-channels": async () => {
      await delay();
      return mocks.settings.mockNotificationChannels;
    },
    "/settings/users": async () => {
      await delay();
      return mocks.settings.mockUsers;
    },
  },

  POST: {
    // System
    "/system/setup": async (_, body) => {
      await delay(500);
      const request = body as {
        email: string;
        password: string;
        fullName: string;
        systemName?: string;
        logoUrl?: string;
      };
      return {
        token: "mock-jwt-token-" + Date.now(),
        email: request.email,
        fullName: request.fullName,
      };
    },

    // Monitors
    "/monitors": async (_, body) => {
      await delay(300);
      return mocks.monitors.createMockMonitor(body as Partial<Monitor>);
    },

    // Incidents
    "/incidents": async (_, body) => {
      await delay(300);
      return mocks.monitors.createIncident(body as IncidentFormData);
    },
    "/incidents/:id/updates": async ({ id }, body) => {
      await delay(200);
      const update = body as { message: string; createdBy?: string };
      return mocks.monitors.addIncidentUpdate(id, update.message, update.createdBy ?? "System");
    },
    "/incidents/:id/resolve": async ({ id }, body) => {
      await delay(200);
      const data = body as { message?: string } | undefined;
      return mocks.monitors.resolveIncident(id, data?.message ?? "Issue resolved");
    },

    // Status Pages
    "/status-pages": async (_, body) => {
      await delay(300);
      return mocks.statusPages.createStatusPage(body as StatusPageFormData);
    },
    "/status-pages/generate-slug": async (_, body) => {
      await delay(100);
      const { name } = body as { name: string };
      return { slug: mocks.statusPages.generateSlug(name) };
    },
  },

  PUT: {
    // Monitors
    "/monitors/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.monitors.updateMockMonitor(id, body as Partial<Monitor>);
    },

    // Service Groups
    "/service-groups": async (_, body) => {
      await delay(300);
      return mocks.monitors.updateServiceGroups(body as import("@/types").ServiceGroup[]);
    },

    // Incidents
    "/incidents/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.monitors.updateIncident(id, body as Partial<ExtendedIncident>);
    },

    // Status Pages
    "/status-pages/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.statusPages.updateStatusPage(id, body as Partial<StatusPage>);
    },
  },

  PATCH: {
    // Monitors
    "/monitors/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.monitors.updateMockMonitor(id, body as Partial<Monitor>);
    },

    // Incidents
    "/incidents/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.monitors.updateIncident(id, body as Partial<ExtendedIncident>);
    },
    "/incidents/:incidentId/updates/:updateId": async (
      { incidentId, updateId },
      body
    ) => {
      await delay(200);
      const { message } = body as { message: string };
      return mocks.monitors.editIncidentUpdate(incidentId, updateId, message);
    },

    // Status Pages
    "/status-pages/:id": async ({ id }, body) => {
      await delay(300);
      return mocks.statusPages.updateStatusPage(id, body as Partial<StatusPage>);
    },
  },

  DELETE: {
    // Monitors
    "/monitors/:id": async ({ id }) => {
      await delay(300);
      mocks.monitors.deleteMockMonitor(id);
      return undefined;
    },

    // Incidents
    "/incidents/:id": async ({ id }) => {
      await delay(300);
      mocks.monitors.deleteIncident(id);
      return undefined;
    },
    "/incidents/:incidentId/updates/:updateId": async ({
      incidentId,
      updateId,
    }) => {
      await delay(200);
      mocks.monitors.deleteIncidentUpdate(incidentId, updateId);
      return undefined;
    },

    // Status Pages
    "/status-pages/:id": async ({ id }) => {
      await delay(300);
      mocks.statusPages.deleteStatusPage(id);
      return undefined;
    },
  },
});

/**
 * Match a URL against route patterns and extract parameters
 */
function matchRoute(
  method: string,
  url: string,
  routes: Record<string, Record<string, RouteHandler>>
): RouteMatch | null {
  const methodRoutes = routes[method];
  if (!methodRoutes) return null;

  // Parse URL and query string
  const [path] = url.split("?");

  for (const [pattern, handler] of Object.entries(methodRoutes)) {
    const params: RouteParams = {};
    const patternParts = pattern.split("/");
    const urlParts = path.split("/");

    if (patternParts.length !== urlParts.length) continue;

    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        // Parameter - extract value
        params[patternParts[i].slice(1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        // Static segment doesn't match
        match = false;
        break;
      }
    }

    if (match) {
      return { handler, params };
    }
  }

  return null;
}

/**
 * Mock adapter that handles API requests during development
 */
export const mockAdapter = {
  async handle<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const method = options?.method ?? "GET";
    const body = options?.body ? JSON.parse(options.body as string) : undefined;

    // Parse query string
    const [path, queryString] = endpoint.split("?");
    const query = queryString ? new URLSearchParams(queryString) : undefined;

    // Load mocks and create routes
    const mocks = await getMocks();
    const routes = createRoutes(mocks);

    // Find matching route
    const match = matchRoute(method, path, routes);

    if (!match) {
      console.warn(`[MockAdapter] No handler for: ${method} ${endpoint}`);
      throw new Error(`Mock not implemented: ${method} ${endpoint}`);
    }

    // Simulate potential errors
    maybeError();

    // Execute handler
    const result = await match.handler(match.params, body, query);
    return result as T;
  },
};
