import type {
  Monitor,
  StatusPageAnnouncement,
  StatusPageMaintenance,
  ExtendedIncident,
} from "@/types";

export type OverallStatus =
  | "operational"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

/**
 * Calculate the overall status from monitors and maintenances
 */
export function calculateOverallStatus(
  monitors: Monitor[],
  maintenances: StatusPageMaintenance[]
): OverallStatus {
  // Check if any maintenance is in progress
  const hasActiveMaintenance = maintenances.some(
    (m) => m.status === "in_progress"
  );
  if (hasActiveMaintenance) {
    return "maintenance";
  }

  if (monitors.length === 0) {
    return "operational";
  }

  const downCount = monitors.filter((m) => m.status === "down").length;
  const totalCount = monitors.length;

  if (downCount === 0) {
    return "operational";
  }

  if (downCount / totalCount > 0.5) {
    return "major_outage";
  }

  return "partial_outage";
}

/**
 * Get status display info (text and colors)
 */
export function getStatusDisplayInfo(status: OverallStatus) {
  const statusInfo = {
    operational: {
      labelEn: "All Systems Operational",
      labelDe: "Alle Systeme funktionieren",
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      bgLight: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
    partial_outage: {
      labelEn: "Partial System Outage",
      labelDe: "Teilweiser Systemausfall",
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgLight: "bg-yellow-50 dark:bg-yellow-950/30",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    major_outage: {
      labelEn: "Major System Outage",
      labelDe: "Schwerer Systemausfall",
      bgColor: "bg-red-500",
      textColor: "text-red-500",
      bgLight: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
    },
    maintenance: {
      labelEn: "Under Maintenance",
      labelDe: "Wartungsarbeiten",
      bgColor: "bg-blue-500",
      textColor: "text-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  };

  return statusInfo[status];
}

/**
 * Filter active announcements based on enabled status and time window
 */
export function getActiveAnnouncements(
  announcements: StatusPageAnnouncement[]
): StatusPageAnnouncement[] {
  const now = new Date();

  return announcements
    .filter((a) => {
      if (!a.enabled) return false;

      // Check time window
      if (a.startAt && new Date(a.startAt) > now) return false;
      if (a.endAt && new Date(a.endAt) < now) return false;

      return true;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Get active maintenances (scheduled or in_progress)
 */
export function getActiveMaintenances(
  maintenances: StatusPageMaintenance[]
): StatusPageMaintenance[] {
  return maintenances
    .filter((m) => m.status === "scheduled" || m.status === "in_progress")
    .sort(
      (a, b) =>
        new Date(a.scheduledStart).getTime() -
        new Date(b.scheduledStart).getTime()
    );
}

/**
 * Get upcoming maintenances (within next 7 days)
 */
export function getUpcomingMaintenances(
  maintenances: StatusPageMaintenance[]
): StatusPageMaintenance[] {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return maintenances
    .filter((m) => {
      if (m.status !== "scheduled") return false;
      const start = new Date(m.scheduledStart);
      return start >= now && start <= weekFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledStart).getTime() -
        new Date(b.scheduledStart).getTime()
    );
}

/**
 * Filter incidents within the history days
 */
export function filterIncidentsByDays(
  incidents: ExtendedIncident[],
  days: number
): ExtendedIncident[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return incidents
    .filter((inc) => new Date(inc.startedAt) >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}

/**
 * Group incidents by date
 */
export function groupIncidentsByDate(
  incidents: ExtendedIncident[],
  locale: string = "en-US"
): Map<string, ExtendedIncident[]> {
  const groups = new Map<string, ExtendedIncident[]>();

  for (const incident of incidents) {
    const date = new Date(incident.startedAt).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(incident);
  }

  return groups;
}

/**
 * Format relative time for "Last updated"
 */
export function formatRelativeTime(dateString: string, lang: "en" | "de" = "de"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === "de") {
    if (diffMins < 1) return "gerade eben";
    if (diffMins < 60) return `vor ${diffMins} Minute${diffMins === 1 ? "" : "n"}`;
    if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours === 1 ? "" : "n"}`;
    if (diffDays === 1) return "gestern";
    return `vor ${diffDays} Tagen`;
  }

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

/**
 * Format maintenance time range
 */
export function formatMaintenanceTime(
  start: string,
  end: string,
  lang: "en" | "de" = "de"
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const locale = lang === "de" ? "de-DE" : "en-US";
  const startDateStr = startDate.toLocaleDateString(locale, dateOptions);
  const startTimeStr = startDate.toLocaleTimeString(locale, timeOptions);
  const endTimeStr = endDate.toLocaleTimeString(locale, timeOptions);

  // Check if same day
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`;
  }

  const endDateStr = endDate.toLocaleDateString(locale, dateOptions);
  return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
}

/**
 * Generate mock daily uptime data for visualization
 */
export interface DayUptimeData {
  date: string;
  uptime: number;
  status: "up" | "down" | "partial" | "no-data";
}

export function generateDailyUptimeData(
  monitor: Monitor,
  days: number
): DayUptimeData[] {
  const data: DayUptimeData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate mock uptime based on monitor's current stats
    // In production, this would come from historical data
    let uptime: number;
    let status: DayUptimeData["status"];

    if (i === 0) {
      // Today - use current status
      uptime = monitor.status === "up" ? 100 : monitor.status === "down" ? 0 : 50;
      status = monitor.status === "up" ? "up" : monitor.status === "down" ? "down" : "partial";
    } else {
      // Historical - simulate based on monitor's uptime stats
      const baseUptime = monitor.uptime30d;
      const variance = (Math.random() - 0.5) * 5; // +/- 2.5%
      uptime = Math.max(0, Math.min(100, baseUptime + variance));

      if (uptime >= 99.9) {
        status = "up";
      } else if (uptime >= 95) {
        status = "partial";
      } else if (uptime > 0) {
        status = "down";
      } else {
        status = "no-data";
      }
    }

    data.push({
      date: date.toISOString(),
      uptime: Math.round(uptime * 100) / 100,
      status,
    });
  }

  return data;
}

/**
 * Get monitors for a specific group
 */
export function getMonitorsForGroup(
  groupMonitorIds: string[],
  allMonitors: Monitor[]
): Monitor[] {
  return groupMonitorIds
    .map((id) => allMonitors.find((m) => m.id === id))
    .filter((m): m is Monitor => m !== undefined);
}

/**
 * Calculate group status based on its monitors
 */
export function calculateGroupStatus(monitors: Monitor[]): "up" | "partial" | "down" {
  if (monitors.length === 0) return "up";

  const upCount = monitors.filter((m) => m.status === "up").length;

  if (upCount === monitors.length) return "up";
  if (upCount === 0) return "down";
  return "partial";
}

/**
 * Check password authentication from session storage
 */
export function isAuthenticated(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`status-auth-${slug}`) === "authenticated";
}

/**
 * Set authentication in session storage
 */
export function setAuthenticated(slug: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`status-auth-${slug}`, "authenticated");
}

/**
 * Validate password
 */
export function validatePassword(input: string, expected: string): boolean {
  return input === expected;
}
