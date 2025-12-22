"use client";

import { cn } from "@/lib/utils";
import type { Monitor } from "@/types";
import { StatusIndicator } from "@/components/monitors/status-indicator";
import { PublicStatusUptimeDays } from "./public-status-uptime-days";

interface PublicStatusMonitorRowProps {
  monitor: Monitor;
  uptimeHistoryDays: number;
  showUptimeHistory: boolean;
}

const statusLabels = {
  up: "Funktioniert",
  down: "Ausfall",
  pending: "Ausstehend",
  paused: "Pausiert",
};

export function PublicStatusMonitorRow({
  monitor,
  uptimeHistoryDays,
  showUptimeHistory,
}: PublicStatusMonitorRowProps) {
  const uptime = monitor.uptime30d;

  const getUptimeColor = (value: number) => {
    if (value >= 99.9) return "text-green-600";
    if (value >= 99) return "text-green-500";
    if (value >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2">
      {/* Monitor info */}
      <div className="flex items-center gap-2 min-w-0 sm:w-40 shrink-0">
        <StatusIndicator status={monitor.status} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{monitor.name}</p>
        </div>
      </div>

      {/* Uptime history visualization */}
      {showUptimeHistory && (
        <div className="flex-1 flex items-center justify-end gap-2">
          <PublicStatusUptimeDays
            monitor={monitor}
            days={uptimeHistoryDays}
          />
          <span
            className={cn(
              "text-xs font-medium tabular-nums w-14 text-right shrink-0",
              getUptimeColor(uptime)
            )}
          >
            {uptime.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Simple uptime display when history is disabled */}
      {!showUptimeHistory && (
        <div className="flex-1 flex justify-end">
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              getUptimeColor(uptime)
            )}
          >
            {uptime.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
