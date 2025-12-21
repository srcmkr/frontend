import type { StatusPage, StatusPageFormData, StatusPageGroup, StatusPageAnnouncement, StatusPageMaintenance } from "@/types";

// Initial mock data
const initialStatusPages: StatusPage[] = [
  {
    id: "sp-1",
    slug: "public-status",
    title: "System Status",
    description: "Öffentliche Statusseite für alle Services",
    monitors: ["1", "2", "3", "4", "5"],
    groups: [
      { id: "g-1", name: "Core Services", monitors: ["1", "2"], order: 0 },
      { id: "g-2", name: "Infrastruktur", monitors: ["3", "4"], order: 1 },
      { id: "g-3", name: "CDN & DNS", monitors: ["5", "6"], order: 2 },
    ],
    isPublic: true,
    showUptimeHistory: true,
    uptimeHistoryDays: 90,
    showIncidents: true,
    incidentHistoryDays: 90,
    passwordProtection: false,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    announcements: [
      {
        id: "ann-1",
        title: "Neue API Version verfügbar",
        message: "Ab dem 15. Januar 2025 ist die API v2.0 verfügbar. Bitte migrieren Sie bis zum 1. März 2025.",
        type: "info",
        enabled: true,
        pinned: true,
        createdAt: "2024-12-20T10:00:00Z",
      },
    ],
    scheduledMaintenances: [
      {
        id: "maint-1",
        title: "Datenbank-Upgrade",
        description: "Upgrade der PostgreSQL-Datenbank auf Version 16. Erwartete Ausfallzeit: 30 Minuten.",
        affectedGroups: ["g-2"],
        scheduledStart: "2025-01-10T02:00:00Z",
        scheduledEnd: "2025-01-10T04:00:00Z",
        notifyBefore: 1440, // 24 Stunden
        autoStart: true,
        status: "scheduled",
        createdAt: "2024-12-18T14:00:00Z",
      },
    ],
    showMaintenanceCalendar: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-12-20T15:30:00Z",
  },
  {
    id: "sp-2",
    slug: "api-status",
    title: "API Status",
    description: "Status der Production API für Entwickler",
    monitors: ["1"],
    groups: [{ id: "g-4", name: "API Endpoints", monitors: ["1"], order: 0 }],
    isPublic: true,
    primaryColor: "#6366f1",
    showUptimeHistory: true,
    uptimeHistoryDays: 60,
    showIncidents: true,
    incidentHistoryDays: 30,
    passwordProtection: false,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    announcements: [],
    scheduledMaintenances: [],
    showMaintenanceCalendar: false,
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-12-18T12:00:00Z",
  },
  {
    id: "sp-3",
    slug: "intern",
    title: "Interne Infrastruktur",
    description: "Private Statusseite für das interne Team",
    monitors: ["3", "4", "6"],
    groups: [
      { id: "g-5", name: "Datenbanken", monitors: ["3"], order: 0 },
      { id: "g-6", name: "Kommunikation", monitors: ["4"], order: 1 },
      { id: "g-7", name: "Netzwerk", monitors: ["6"], order: 2 },
    ],
    isPublic: false,
    showUptimeHistory: true,
    uptimeHistoryDays: 90,
    showIncidents: true,
    incidentHistoryDays: 90,
    passwordProtection: true,
    password: "intern2024",
    ipWhitelistEnabled: true,
    ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
    announcements: [
      {
        id: "ann-2",
        title: "Wartungsarbeiten am Wochenende",
        message: "Am kommenden Wochenende finden Wartungsarbeiten an der Netzwerk-Infrastruktur statt.",
        type: "maintenance",
        enabled: true,
        pinned: false,
        startAt: "2025-01-04T00:00:00Z",
        endAt: "2025-01-05T23:59:00Z",
        createdAt: "2024-12-19T08:00:00Z",
      },
    ],
    scheduledMaintenances: [
      {
        id: "maint-2",
        title: "Netzwerk-Wartung",
        description: "Firmware-Update für alle Switches und Router.",
        affectedGroups: ["g-7"],
        scheduledStart: "2025-01-04T22:00:00Z",
        scheduledEnd: "2025-01-05T06:00:00Z",
        notifyBefore: 2880, // 48 Stunden
        autoStart: true,
        status: "scheduled",
        createdAt: "2024-12-15T10:00:00Z",
      },
    ],
    showMaintenanceCalendar: true,
    createdAt: "2024-03-10T14:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
  },
  {
    id: "sp-4",
    slug: "cdn",
    title: "CDN Status",
    description: "Status des Content Delivery Networks",
    monitors: ["5"],
    groups: [{ id: "g-8", name: "CDN Endpoints", monitors: ["5"], order: 0 }],
    isPublic: true,
    logo: "https://example.com/cdn-logo.png",
    primaryColor: "#10b981",
    showUptimeHistory: true,
    uptimeHistoryDays: 30,
    showIncidents: false,
    incidentHistoryDays: 30,
    passwordProtection: false,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    announcements: [],
    scheduledMaintenances: [],
    showMaintenanceCalendar: false,
    createdAt: "2024-04-05T11:00:00Z",
    updatedAt: "2024-12-10T16:00:00Z",
  },
];

// Mutable copy for runtime updates
let mutableStatusPages: StatusPage[] | null = null;

// Get current status pages (creates mutable copy on first access)
export function getStatusPages(): StatusPage[] {
  if (mutableStatusPages === null) {
    mutableStatusPages = JSON.parse(
      JSON.stringify(initialStatusPages)
    ) as StatusPage[];
  }
  return mutableStatusPages;
}

// Get a single status page by ID
export function getStatusPageById(id: string): StatusPage | null {
  const statusPages = getStatusPages();
  return statusPages.find((sp) => sp.id === id) || null;
}

// Get a single status page by slug
export function getStatusPageBySlug(slug: string): StatusPage | null {
  const statusPages = getStatusPages();
  return statusPages.find((sp) => sp.slug === slug) || null;
}

// Generate a URL-friendly slug from a title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (match) => {
      const map: Record<string, string> = {
        ä: "ae",
        ö: "oe",
        ü: "ue",
        ß: "ss",
      };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Check if a slug is unique
export function isSlugUnique(slug: string, excludeId?: string): boolean {
  const statusPages = getStatusPages();
  return !statusPages.some((sp) => sp.slug === slug && sp.id !== excludeId);
}

// Create a new status page
let statusPageCounter = 100;
export function createStatusPage(data: StatusPageFormData): StatusPage {
  const statusPages = getStatusPages();

  // Generate unique group IDs
  const groupsWithIds: StatusPageGroup[] = data.groups.map((g, index) => ({
    ...g,
    id: g.id || `g-${Date.now()}-${index}`,
    order: g.order ?? index,
  }));

  const newStatusPage: StatusPage = {
    id: `sp-${++statusPageCounter}`,
    slug: data.slug,
    title: data.title,
    description: data.description,
    monitors: data.monitors,
    groups: groupsWithIds,
    isPublic: data.isPublic,
    customCss: data.customCss,
    logo: data.logo,
    primaryColor: data.primaryColor,
    showUptimeHistory: data.showUptimeHistory,
    uptimeHistoryDays: data.uptimeHistoryDays,
    showIncidents: data.showIncidents,
    incidentHistoryDays: data.incidentHistoryDays,
    passwordProtection: data.passwordProtection,
    password: data.password,
    ipWhitelistEnabled: data.ipWhitelistEnabled,
    ipWhitelist: data.ipWhitelist,
    announcements: data.announcements,
    scheduledMaintenances: data.scheduledMaintenances,
    showMaintenanceCalendar: data.showMaintenanceCalendar,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  statusPages.unshift(newStatusPage);
  return newStatusPage;
}

// Update an existing status page
export function updateStatusPage(
  id: string,
  updates: Partial<StatusPage>
): StatusPage | null {
  const statusPages = getStatusPages();
  const index = statusPages.findIndex((sp) => sp.id === id);
  if (index === -1) return null;

  const updatedStatusPage: StatusPage = {
    ...statusPages[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  statusPages[index] = updatedStatusPage;
  return updatedStatusPage;
}

// Delete a status page
export function deleteStatusPage(id: string): boolean {
  const statusPages = getStatusPages();
  const index = statusPages.findIndex((sp) => sp.id === id);
  if (index === -1) return false;

  statusPages.splice(index, 1);
  return true;
}

// Add a group to a status page
let groupCounter = 1000;
export function addGroupToStatusPage(
  statusPageId: string,
  name: string,
  monitors: string[] = []
): StatusPageGroup | null {
  const statusPages = getStatusPages();
  const statusPage = statusPages.find((sp) => sp.id === statusPageId);
  if (!statusPage) return null;

  const newGroup: StatusPageGroup = {
    id: `g-${++groupCounter}`,
    name,
    monitors,
    order: statusPage.groups.length,
  };

  statusPage.groups.push(newGroup);
  statusPage.updatedAt = new Date().toISOString();
  return newGroup;
}

// Update a group within a status page
export function updateGroupInStatusPage(
  statusPageId: string,
  groupId: string,
  updates: Partial<StatusPageGroup>
): StatusPageGroup | null {
  const statusPages = getStatusPages();
  const statusPage = statusPages.find((sp) => sp.id === statusPageId);
  if (!statusPage) return null;

  const groupIndex = statusPage.groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return null;

  statusPage.groups[groupIndex] = {
    ...statusPage.groups[groupIndex],
    ...updates,
  };
  statusPage.updatedAt = new Date().toISOString();
  return statusPage.groups[groupIndex];
}

// Delete a group from a status page
export function deleteGroupFromStatusPage(
  statusPageId: string,
  groupId: string
): boolean {
  const statusPages = getStatusPages();
  const statusPage = statusPages.find((sp) => sp.id === statusPageId);
  if (!statusPage) return false;

  const groupIndex = statusPage.groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return false;

  statusPage.groups.splice(groupIndex, 1);
  // Re-order remaining groups
  statusPage.groups.forEach((g, i) => {
    g.order = i;
  });
  statusPage.updatedAt = new Date().toISOString();
  return true;
}

// Reorder groups within a status page
export function reorderGroupsInStatusPage(
  statusPageId: string,
  groupIds: string[]
): boolean {
  const statusPages = getStatusPages();
  const statusPage = statusPages.find((sp) => sp.id === statusPageId);
  if (!statusPage) return false;

  const reorderedGroups: StatusPageGroup[] = [];
  for (const groupId of groupIds) {
    const group = statusPage.groups.find((g) => g.id === groupId);
    if (group) {
      reorderedGroups.push({ ...group, order: reorderedGroups.length });
    }
  }

  if (reorderedGroups.length !== statusPage.groups.length) return false;

  statusPage.groups = reorderedGroups;
  statusPage.updatedAt = new Date().toISOString();
  return true;
}

// Reset status pages to initial state
export function resetStatusPages(): void {
  mutableStatusPages = null;
}

// Get monitors that are not assigned to any group in a status page
export function getUnassignedMonitors(
  statusPageId: string,
  allMonitorIds: string[]
): string[] {
  const statusPage = getStatusPageById(statusPageId);
  if (!statusPage) return allMonitorIds;

  const assignedMonitorIds = new Set(
    statusPage.groups.flatMap((g) => g.monitors)
  );
  return allMonitorIds.filter((id) => !assignedMonitorIds.has(id));
}
