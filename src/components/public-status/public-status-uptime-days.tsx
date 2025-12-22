"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import type { Monitor } from "@/types";
import { generateDailyUptimeData, type DayUptimeData } from "@/lib/public-status-utils";

interface PublicStatusUptimeDaysProps {
  monitor: Monitor;
  days: number;
  className?: string;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export function PublicStatusUptimeDays({
  monitor,
  days,
  className,
}: PublicStatusUptimeDaysProps) {
  const locale = useLocale();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);

  // Generate daily uptime data
  const uptimeData = useMemo(
    () => generateDailyUptimeData(monitor, days),
    [monitor, days]
  );

  // Responsive: show fewer days on mobile
  // We'll show all days but let CSS handle visibility
  const displayDays = uptimeData.slice(-Math.min(days, 90));

  const getBarColor = (data: DayUptimeData) => {
    if (data.status === "no-data") return "bg-muted";
    if (data.uptime >= 99.9) return "bg-green-500";
    if (data.uptime >= 99) return "bg-green-400";
    if (data.uptime >= 95) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const hoveredData = hoveredIndex !== null ? displayDays[hoveredIndex] : null;

  return (
    <div className={cn("flex items-center", className)}>
      {/* Mobile: show only 30 days */}
      <div className="flex gap-[1px] sm:hidden">
        {displayDays.slice(-30).map((data, index) => (
          <div
            key={index}
            className={cn(
              "w-[3px] h-3 rounded-[1px] cursor-default transition-all",
              getBarColor(data),
              hoveredIndex === index + (displayDays.length - 30) && "ring-1 ring-foreground/50 scale-110"
            )}
            onMouseEnter={(e) => handleMouseEnter(index + (displayDays.length - 30), e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      {/* Desktop: show all days (up to 90) */}
      <div className="hidden sm:flex gap-[1px]">
        {displayDays.map((data, index) => (
          <div
            key={index}
            className={cn(
              "w-[2px] h-3 rounded-[1px] cursor-default transition-all",
              getBarColor(data),
              hoveredIndex === index && "ring-1 ring-foreground/50 scale-110"
            )}
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      {/* Tooltip via Portal */}
      {hoveredData &&
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
            <div className="font-medium">{formatDate(hoveredData.date)}</div>
            {hoveredData.status === "no-data" ? (
              <div className="text-muted-foreground">{locale.startsWith("de") ? "Keine Daten" : "No data"}</div>
            ) : (
              <div
                className={cn(
                  "font-semibold",
                  hoveredData.uptime >= 99.9
                    ? "text-green-500"
                    : hoveredData.uptime >= 95
                      ? "text-yellow-500"
                      : "text-red-500"
                )}
              >
                {hoveredData.uptime.toFixed(2)}% Uptime
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
