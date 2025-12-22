"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusPageGroup, Monitor } from "@/types";
import { getMonitorsForGroup, calculateGroupStatus } from "@/lib/public-status-utils";
import { PublicStatusMonitorRow } from "./public-status-monitor-row";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PublicStatusGroupsProps {
  groups: StatusPageGroup[];
  monitors: Monitor[];
  uptimeHistoryDays: number;
  showUptimeHistory: boolean;
}

const groupStatusConfig = {
  up: {
    icon: CheckCircle2,
    color: "text-green-500",
    label: "Alle funktionieren",
  },
  partial: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    label: "Teilweise beeinträchtigt",
  },
  down: {
    icon: XCircle,
    color: "text-red-500",
    label: "Ausfall",
  },
};

export function PublicStatusGroups({
  groups,
  monitors,
  uptimeHistoryDays,
  showUptimeHistory,
}: PublicStatusGroupsProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(groups.map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Sort groups by order
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  // Get monitors that aren't in any group
  const groupedMonitorIds = new Set(groups.flatMap((g) => g.monitors));
  const ungroupedMonitors = monitors.filter(
    (m) => !groupedMonitorIds.has(m.id)
  );

  return (
    <div className="space-y-2.5">
      {/* Grouped monitors */}
      {sortedGroups.map((group) => {
        const groupMonitors = getMonitorsForGroup(group.monitors, monitors);
        const groupStatus = calculateGroupStatus(groupMonitors);
        const statusConfig = groupStatusConfig[groupStatus];
        const StatusIcon = statusConfig.icon;
        const isOpen = openGroups.has(group.id);
        const upCount = groupMonitors.filter((m) => m.status === "up").length;

        return (
          <div
            key={group.id}
            className="rounded-lg border bg-card overflow-hidden"
          >
            <Collapsible
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {upCount}/{groupMonitors.length}
                    </span>
                  </div>
                  <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t divide-y">
                  {groupMonitors.map((monitor) => (
                    <PublicStatusMonitorRow
                      key={monitor.id}
                      monitor={monitor}
                      uptimeHistoryDays={uptimeHistoryDays}
                      showUptimeHistory={showUptimeHistory}
                    />
                  ))}
                  {groupMonitors.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      Keine Monitore in dieser Gruppe
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}

      {/* Ungrouped monitors */}
      {ungroupedMonitors.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              Weitere Services
            </span>
          </div>
          <div className="divide-y">
            {ungroupedMonitors.map((monitor) => (
              <PublicStatusMonitorRow
                key={monitor.id}
                monitor={monitor}
                uptimeHistoryDays={uptimeHistoryDays}
                showUptimeHistory={showUptimeHistory}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
