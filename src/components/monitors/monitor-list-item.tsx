"use client";

import { cn } from "@/lib/utils";
import { StatusIndicator } from "./status-indicator";
import { formatResponseTime } from "@/lib/format-utils";
import type { Monitor } from "@/types";

interface MonitorListItemProps {
  monitor: Monitor;
  selected: boolean;
  onClick: () => void;
}

export function MonitorListItem({
  monitor,
  selected,
  onClick,
}: MonitorListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
        "hover:bg-accent/50",
        selected && "bg-accent"
      )}
    >
      <StatusIndicator status={monitor.status} size="sm" />

      <div className="flex-1 min-w-0">
        <span className="block truncate text-sm font-medium">
          {monitor.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground uppercase">
          {monitor.type}
        </span>
      </div>

      <span
        className={cn(
          "text-sm font-mono tabular-nums",
          monitor.lastResponseTime === null
            ? "text-muted-foreground"
            : monitor.lastResponseTime > 500
              ? "text-yellow-600"
              : "text-muted-foreground"
        )}
      >
        {formatResponseTime(monitor.lastResponseTime)}
      </span>
    </button>
  );
}
