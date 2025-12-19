"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { UptimeSegment } from "@/types";

interface UptimeBarProps {
  uptime: number;
  segments?: UptimeSegment[];
  showLabel?: boolean;
  className?: string;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export function UptimeBar({
  uptime,
  segments,
  showLabel = true,
  className,
}: UptimeBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);

  const getUptimeColor = (value: number) => {
    if (value >= 99.9) return "text-green-600";
    if (value >= 99) return "text-green-500";
    if (value >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  const getSegmentColor = (segment: UptimeSegment) => {
    if (segment.status === "no-data") return "bg-muted";
    if (segment.status === "down") return "bg-red-500";
    if (segment.status === "partial") return "bg-yellow-500";
    if (segment.uptime >= 99.9) return "bg-green-500";
    if (segment.uptime >= 99) return "bg-green-400";
    if (segment.uptime >= 95) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatTimeRange = (timestamp: string) => {
    const start = new Date(timestamp);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatTime = (d: Date) =>
      d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIndex(index);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  // Fallback to simple progress bar if no segments provided
  if (!segments || segments.length === 0) {
    const getColor = (value: number) => {
      if (value >= 99.9) return "bg-green-500";
      if (value >= 99) return "bg-green-400";
      if (value >= 95) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getColor(uptime))}
            style={{ width: `${Math.min(uptime, 100)}%` }}
          />
        </div>
        {showLabel && (
          <span
            className={cn(
              "text-xs font-medium w-14 text-right",
              getUptimeColor(uptime)
            )}
          >
            {uptime.toFixed(2)}%
          </span>
        )}
      </div>
    );
  }

  const hoveredSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      <div className="flex justify-end">
        <div className="flex gap-[2px] h-5">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={cn(
                "w-[7px] shrink-0 h-full rounded-sm cursor-default transition-all",
                getSegmentColor(segment),
                hoveredIndex === index && "ring-1 ring-foreground/50"
              )}
              onMouseEnter={(e) => handleMouseEnter(index, e)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium w-14 text-right tabular-nums",
            getUptimeColor(uptime)
          )}
        >
          {uptime.toFixed(2)}%
        </span>
      )}

      {/* Tooltip via Portal */}
      {hoveredSegment &&
        tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-xs whitespace-nowrap -translate-x-1/2"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <div className="font-medium">
              {formatDate(hoveredSegment.timestamp)},{" "}
              {formatTimeRange(hoveredSegment.timestamp)}
            </div>
            {hoveredSegment.status === "no-data" ? (
              <div className="text-muted-foreground">Keine Daten</div>
            ) : (
              <>
                <div
                  className={cn(
                    "font-semibold",
                    hoveredSegment.uptime === 100
                      ? "text-green-500"
                      : hoveredSegment.uptime >= 95
                        ? "text-yellow-500"
                        : "text-red-500"
                  )}
                >
                  {hoveredSegment.uptime.toFixed(1)}% Uptime
                </div>
                {hoveredSegment.failedChecks > 0 && (
                  <div className="text-red-400">
                    {hoveredSegment.failedChecks}/{hoveredSegment.totalChecks}{" "}
                    Checks fehlgeschlagen
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
