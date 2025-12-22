"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "../status-indicator";
import { formatResponseTime } from "@/lib/format-utils";
import type { Monitor, FlattenedServiceGroup } from "@/types";

const INDENTATION_WIDTH = 20;

export interface ServiceItemContentProps {
  item: FlattenedServiceGroup;
  depth: number;
  monitor: Monitor | undefined;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  canDrag?: boolean;
  dragHandleProps?: Record<string, unknown>;
  ghost?: boolean;
  clone?: boolean;
}

export function ServiceItemContent({
  item,
  depth,
  monitor,
  isSelected,
  onSelect,
  canDrag,
  dragHandleProps,
  ghost,
  clone,
}: ServiceItemContentProps) {
  const indentPx = depth * INDENTATION_WIDTH;

  return (
    <button
      onClick={() => monitor && onSelect?.(monitor.id)}
      className={cn(
        "w-full flex items-center gap-2 py-2 px-3 transition-colors text-left",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        ghost && "opacity-30",
        clone && "shadow-lg rounded-md border bg-card"
      )}
      style={{ paddingLeft: `${8 + indentPx}px` }}
    >
      {/* Drag handle */}
      {canDrag && (
        <div
          {...dragHandleProps}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0 p-0.5"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Spacer for alignment with groups (when no drag handle) */}
      {!canDrag && <div className="w-4 shrink-0" />}

      <StatusIndicator status={monitor?.status ?? "pending"} size="sm" />

      <span className="flex-1 text-sm truncate">{item.name}</span>

      <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
        {formatResponseTime(monitor?.lastResponseTime ?? null)}
      </span>
    </button>
  );
}
