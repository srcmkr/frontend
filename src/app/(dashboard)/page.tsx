"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FolderPlus,
  LayoutList,
  Network,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Wrench,
  Megaphone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonitorTable } from "@/components/monitors/monitor-table";
import { StatsOverview } from "@/components/monitors/stats-overview";
import { ServiceTree } from "@/components/monitors/service-tree";
import {
  MonitorFilters,
  defaultFilters,
  type MonitorFilterState,
} from "@/components/monitors/monitor-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/monitors/status-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { processMonitors } from "@/lib/monitor-utils";
import { useMonitors, useServiceGroups } from "@/features/monitors";
import { useIncidents } from "@/features/incidents";
import type { ServiceGroup } from "@/types";

type ViewMode = "table" | "tree";

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations("common.dashboard");
  const [filters, setFilters] = useState<MonitorFilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Fetch monitors using React Query
  const {
    data: monitors = [],
    isLoading: monitorsLoading,
    error: monitorsError,
  } = useMonitors();

  // Fetch service groups using React Query
  const { data: fetchedServiceGroups } = useServiceGroups();

  // Local state for service groups (for editing)
  const [localServiceGroups, setLocalServiceGroups] = useState<ServiceGroup[] | null>(null);
  const serviceGroups = localServiceGroups ?? fetchedServiceGroups ?? [];

  const handleAddGroup = useCallback(() => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: ServiceGroup = {
      id: newGroupId,
      name: t("newGroup"),
      type: "group",
      children: [],
    };
    setLocalServiceGroups((prev) => [...(prev ?? serviceGroups), newGroup]);
    setEditingItemId(newGroupId);
  }, [serviceGroups, t]);

  const handleServiceGroupsChange = useCallback((groups: ServiceGroup[]) => {
    setLocalServiceGroups(groups);
  }, []);

  // Fetch incidents using React Query
  const { data: allIncidents = [] } = useIncidents();
  const incidents = useMemo(
    () => allIncidents.filter((i) => i.status === "ongoing"),
    [allIncidents]
  );

  // Process monitors with filters, sorting, and grouping
  const monitorGroups = useMemo(
    () => processMonitors(monitors, filters),
    [monitors, filters]
  );

  const filteredCount = monitorGroups.reduce(
    (sum, group) => sum + group.monitors.length,
    0
  );

  // Helper to get services count text
  const getServicesCountText = () => {
    if (monitorsLoading) return t("loading");
    if (filteredCount === monitors.length) {
      return t("servicesCount", { count: monitors.length });
    }
    return t("servicesFiltered", { filtered: filteredCount, total: monitors.length });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          onClick={() => router.push("/monitors?mode=create")}
          className="uppercase tracking-wide"
        >
          {t("addMonitor")}
        </Button>
      </div>

      {/* Stats */}
      {monitorsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <StatsOverview monitors={monitors} />
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monitors Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("monitors")}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getServicesCountText()}
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
                        {t("newGroup")}
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
                        {t("groups")}
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setViewMode("table")}
                      >
                        <LayoutList className="h-4 w-4 mr-1" />
                        {t("list")}
                      </Button>
                    </div>
                  </div>
                </div>
                {viewMode === "table" && (
                  <MonitorFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {monitorsLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : monitorsError ? (
                <div className="py-8 text-center text-destructive">
                  {t("errorLoading")}
                </div>
              ) : viewMode === "tree" ? (
                <ServiceTree
                  items={serviceGroups}
                  monitors={monitors}
                  onItemsChange={handleServiceGroupsChange}
                  editingItemId={editingItemId}
                  onEditingItemIdChange={setEditingItemId}
                />
              ) : monitorGroups.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  {t("noMonitors")}
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
                <CardTitle className="text-base">{t("activeIncidents")}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="uppercase tracking-wide">
                      <Plus className="h-4 w-4 mr-1" />
                      {t("new")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/incidents?mode=create&type=incident")
                      }
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t("incident")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/incidents?mode=create&type=maintenance")
                      }
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      {t("scheduledMaintenance")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/incidents?mode=create&type=announcement")
                      }
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      {t("announcement")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          "/incidents?mode=create&type=incident&historical=true"
                        )
                      }
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {t("historicalEntry")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noActiveIncidents")}
                </p>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60"
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
                        {t("since", {
                          duration: formatDuration(
                            Date.now() - new Date(incident.startedAt).getTime()
                          ),
                        })}
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
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/incidents?id=${incident.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/incidents?id=${incident.id}&mode=edit`
                            )
                          }
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            router.push(
                              `/incidents?id=${incident.id}&mode=delete`
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
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
              <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allIncidents.slice(0, 5).map((incident) => (
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
                        ? t("resolvedAfter", {
                            duration: formatDuration(incident.duration ?? 0),
                          })
                        : t("ongoing")}
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
