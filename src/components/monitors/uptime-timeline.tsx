"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { UptimeSegment } from "@/types";

interface UptimeTimelineProps {
  segments?: UptimeSegment[];
  uptime: number;
  className?: string;
}

interface TooltipData {
  segment: UptimeSegment;
  x: number;
  y: number;
}

export function UptimeTimeline({
  segments,
  uptime,
  className,
}: UptimeTimelineProps) {
  const t = useTranslations("monitors.timeline");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

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
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes
    const formatTime = (d: Date) =>
      d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleMouseEnter = (segment: UptimeSegment, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      segment,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Generate placeholder segments if none provided (48 segments = 30 min each)
  const displaySegments = segments && segments.length > 0
    ? segments
    : Array.from({ length: 48 }, (_, i) => ({
        timestamp: new Date(Date.now() - (47 - i) * 30 * 60 * 1000).toISOString(),
        status: "no-data" as const,
        uptime: 0,
        totalChecks: 0,
        failedChecks: 0,
      }));

  const getUptimeColor = (value: number) => {
    if (value >= 99.9) return "text-green-600";
    if (value >= 99) return "text-green-500";
    if (value >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Timeline header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("hoursAgo")}</span>
        <span>{t("now")}</span>
      </div>

      {/* Responsive segment grid */}
      <div
        ref={containerRef}
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${displaySegments.length}, minmax(0, 1fr))`,
        }}
      >
        {displaySegments.map((segment, index) => (
          <div
            key={index}
            className={cn(
              "h-8 rounded-sm cursor-default transition-all hover:scale-y-110 hover:brightness-110",
              getSegmentColor(segment),
              tooltip?.segment === segment && "ring-2 ring-foreground/30"
            )}
            onMouseEnter={(e) => handleMouseEnter(segment, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      {/* Uptime percentage */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("uptime24h")}
        </span>
        <span className={cn("text-lg font-semibold tabular-nums", getUptimeColor(uptime))}>
          {uptime.toFixed(2)}%
        </span>
      </div>

      {/* Tooltip */}
      {tooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-popover text-popover-foreground border rounded-lg shadow-lg px-3 py-2 text-xs whitespace-nowrap -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            <div className="font-medium mb-1">
              {formatDate(tooltip.segment.timestamp)}
            </div>
            <div className="text-muted-foreground mb-1">
              {formatTimeRange(tooltip.segment.timestamp)}
            </div>
            {tooltip.segment.status === "no-data" ? (
              <div className="text-muted-foreground">{t("noData")}</div>
            ) : (
              <>
                <div
                  className={cn(
                    "font-semibold",
                    tooltip.segment.uptime === 100
                      ? "text-green-500"
                      : tooltip.segment.uptime >= 95
                        ? "text-yellow-500"
                        : "text-red-500"
                  )}
                >
                  {t("uptimePercent", { percent: tooltip.segment.uptime.toFixed(1) })}
                </div>
                {tooltip.segment.failedChecks > 0 && (
                  <div className="text-red-400 mt-0.5">
                    {t("failedChecks", { failed: tooltip.segment.failedChecks, total: tooltip.segment.totalChecks })}
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
