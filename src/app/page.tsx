"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { FolderPlus, LayoutList, Network, Plus, MoreHorizontal, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonitorTable } from "@/components/monitors/monitor-table";
import { StatsOverview } from "@/components/monitors/stats-overview";
import { ServiceTree } from "@/components/monitors/service-tree";
import {
  MonitorFilters,
  defaultFilters,
  type MonitorFilterState,
} from "@/components/monitors/monitor-filters";
import { mockMonitors, mockIncidents, generateMockUptimeHistory, mockServiceGroups } from "@/mocks/monitors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/monitors/status-indicator";
import { processMonitors } from "@/lib/monitor-utils";
import type { ServiceGroup } from "@/types";

type ViewMode = "table" | "tree";

export default function DashboardPage() {
  const [filters, setFilters] = useState<MonitorFilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>(mockServiceGroups);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleAddGroup = useCallback(() => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: ServiceGroup = {
      id: newGroupId,
      name: "Neue Gruppe",
      type: "group",
      children: [],
    };
    setServiceGroups((prev) => [...prev, newGroup]);
    setEditingItemId(newGroupId);
  }, []);

  // TODO: Replace with React Query
  const monitors = useMemo(
    () =>
      mockMonitors.map((m) => ({
        ...m,
        uptimeHistory: generateMockUptimeHistory(m.uptime24h),
      })),
    []
  );

  const incidents = mockIncidents.filter((i) => i.status === "ongoing");

  // Process monitors with filters, sorting, and grouping
  const monitorGroups = useMemo(
    () => processMonitors(monitors, filters),
    [monitors, filters]
  );

  const filteredCount = monitorGroups.reduce(
    (sum, group) => sum + group.monitors.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all monitored services
          </p>
        </div>
        <Link href="/monitors/new">
          <Button className="uppercase tracking-wide">Add Monitor</Button>
        </Link>
      </div>

      {/* Stats */}
      <StatsOverview monitors={monitors} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monitors Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Monitors</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredCount === monitors.length
                        ? `${monitors.length} Services`
                        : `${filteredCount} von ${monitors.length} Services`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewMode === "tree" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={handleAddGroup}
                      >
                        <FolderPlus className="h-4 w-4 mr-1" />
                        Neue Gruppe
                      </Button>
                    )}
                    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                      <Button
                        variant={viewMode === "tree" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setViewMode("tree")}
                      >
                        <Network className="h-4 w-4 mr-1" />
                        Gruppen
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setViewMode("table")}
                      >
                        <LayoutList className="h-4 w-4 mr-1" />
                        Liste
                      </Button>
                    </div>
                  </div>
                </div>
                {viewMode === "table" && (
                  <MonitorFilters filters={filters} onFiltersChange={setFilters} />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === "tree" ? (
                <ServiceTree
                  items={serviceGroups}
                  monitors={monitors}
                  onItemsChange={setServiceGroups}
                  editingItemId={editingItemId}
                  onEditingItemIdChange={setEditingItemId}
                />
              ) : monitorGroups.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Keine Monitors gefunden
                </div>
              ) : (
                <div className="divide-y">
                  {monitorGroups.map((group) => (
                    <MonitorTable
                      key={group.key}
                      monitors={group.monitors}
                      title={group.title}
                      embedded
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Incidents */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Incidents</CardTitle>
                <Button size="sm" className="uppercase tracking-wide">
                  <Plus className="h-4 w-4 mr-1" />
                  New Incident
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active incidents
                </p>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                  >
                    <StatusIndicator status="down" size="sm" showPulse />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {incident.monitorName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {incident.cause}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started{" "}
                        {formatDuration(
                          Date.now() - new Date(incident.startedAt).getTime()
                        )}{" "}
                        ago
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ignore
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockIncidents.slice(0, 5).map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <StatusIndicator
                      status={incident.status === "ongoing" ? "down" : "up"}
                      size="sm"
                      showPulse={false}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="truncate">{incident.monitorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {incident.status === "resolved"
                        ? `Resolved ${formatDuration(incident.duration ?? 0)}`
                        : "Ongoing"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
