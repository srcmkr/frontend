"use client";

import { cn } from "@/lib/utils";
import { UptimeTimeline } from "./uptime-timeline";
import type { Monitor } from "@/types";

interface MonitorUptimeStatsProps {
  monitor: Monitor;
  className?: string;
}

export function MonitorUptimeStats({
  monitor,
  className,
}: MonitorUptimeStatsProps) {
  const getUptimeColor = (value: number) => {
    if (value >= 99.9) return "text-green-600";
    if (value >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-sm">Uptime</h3>

      {/* Full-width timeline visualization */}
      <UptimeTimeline
        segments={monitor.uptimeHistory}
        uptime={monitor.uptime24h}
      />

      {/* Uptime summary stats for longer periods */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">7 Tage</span>
          <span className={cn("text-lg font-semibold tabular-nums", getUptimeColor(monitor.uptime7d))}>
            {monitor.uptime7d.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">30 Tage</span>
          <span className={cn("text-lg font-semibold tabular-nums", getUptimeColor(monitor.uptime30d))}>
            {monitor.uptime30d.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
