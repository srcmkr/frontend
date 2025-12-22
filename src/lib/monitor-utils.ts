import type { Monitor } from "@/types";
import type { MonitorFilterState, GroupBy, SortBy, SortOrder } from "@/components/monitors/monitor-filters";

export function filterMonitors(
  monitors: Monitor[],
  filters: MonitorFilterState
): Monitor[] {
  return monitors.filter((monitor) => {
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesName = monitor.name.toLowerCase().includes(search);
      const matchesUrl = monitor.url.toLowerCase().includes(search);
      if (!matchesName && !matchesUrl) return false;
    }

    // Status filter
    if (filters.status !== "all" && monitor.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && monitor.type !== filters.type) {
      return false;
    }

    return true;
  });
}

export function sortMonitors(
  monitors: Monitor[],
  sortBy: SortBy,
  sortOrder: SortOrder
): Monitor[] {
  const sorted = [...monitors].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        const statusOrder = { down: 0, pending: 1, paused: 2, up: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case "uptime":
        comparison = a.uptime24h - b.uptime24h;
        break;
      case "responseTime":
        const aTime = a.lastResponseTime ?? Infinity;
        const bTime = b.lastResponseTime ?? Infinity;
        comparison = aTime - bTime;
        break;
      case "lastCheck":
        const aDate = a.lastCheck ? new Date(a.lastCheck).getTime() : 0;
        const bDate = b.lastCheck ? new Date(b.lastCheck).getTime() : 0;
        comparison = aDate - bDate;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export interface MonitorGroup {
  key: string;
  title: string;
  monitors: Monitor[];
}

export function groupMonitors(
  monitors: Monitor[],
  groupBy: GroupBy
): MonitorGroup[] {
  if (groupBy === "none") {
    return [{ key: "all", title: "", monitors }];
  }

  const groups = new Map<string, Monitor[]>();

  monitors.forEach((monitor) => {
    const key = groupBy === "status" ? monitor.status : monitor.type;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(monitor);
  });

  // Define order for groups
  const statusOrder = ["down", "up", "pending", "paused"];
  const typeOrder = ["http", "tcp", "ping", "dns"];
  const order = groupBy === "status" ? statusOrder : typeOrder;

  const titleKeys: Record<string, string> = {
    // Status keys - map to monitors.status.* translations
    down: "status.down",
    up: "status.up",
    pending: "status.pending",
    paused: "status.paused",
    // Type keys - map to monitors.types.* translations
    http: "types.http",
    tcp: "types.tcp",
    ping: "types.ping",
    dns: "types.dns",
  };

  return order
    .filter((key) => groups.has(key))
    .map((key) => ({
      key,
      title: titleKeys[key] || key,
      monitors: groups.get(key)!,
    }));
}

export function processMonitors(
  monitors: Monitor[],
  filters: MonitorFilterState
): MonitorGroup[] {
  // 1. Filter
  const filtered = filterMonitors(monitors, filters);

  // 2. Sort
  const sorted = sortMonitors(filtered, filters.sortBy, filters.sortOrder);

  // 3. Group
  const grouped = groupMonitors(sorted, filters.groupBy);

  return grouped;
}
