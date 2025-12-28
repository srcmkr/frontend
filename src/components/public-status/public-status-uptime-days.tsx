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

  // Show all configured days (up to 365)
  const displayDays = uptimeData.slice(-Math.min(days, 365));

  // Calculate dynamic bar sizing and rows based on number of days
  const { barSizing, rows } = useMemo(() => {
    const dayCount = displayDays.length;

    // Helper function to split array into chunks
    const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    };

    // Mobile: max 20 days per row, fixed height
    const mobileDaysPerRow = 20;
    const mobileRows = chunkArray(displayDays, mobileDaysPerRow);

    // Desktop: calculate days per row and bar width based on total days
    let desktopDaysPerRow: number;
    let desktopBarWidth: string;
    let desktopGap: string;

    if (dayCount <= 30) {
      desktopDaysPerRow = 30;
      desktopBarWidth = "w-3";
      desktopGap = "gap-1";
    } else if (dayCount <= 60) {
      desktopDaysPerRow = 30;
      desktopBarWidth = "w-2";
      desktopGap = "gap-0.5";
    } else if (dayCount <= 90) {
      desktopDaysPerRow = 30;
      desktopBarWidth = "w-1.5";
      desktopGap = "gap-0.5";
    } else if (dayCount <= 180) {
      desktopDaysPerRow = 45;
      desktopBarWidth = "w-1.5";
      desktopGap = "gap-0.5";
    } else {
      // 181-365 days: smaller bars
      desktopDaysPerRow = 60;
      desktopBarWidth = "w-1";
      desktopGap = "gap-[1px]";
    }

    const desktopRows = chunkArray(displayDays, desktopDaysPerRow);

    return {
      barSizing: {
        mobile: { width: "w-1.5", height: "h-7", gap: "gap-0.5" },
        desktop: { width: desktopBarWidth, height: "h-7", gap: desktopGap },
      },
      rows: {
        mobile: mobileRows,
        desktop: desktopRows,
      },
    };
  }, [displayDays]);

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
    <div className={cn("flex flex-col", className)}>
      {/* Mobile: multi-row layout with max 20 days per row */}
      <div className="flex flex-col gap-1 sm:hidden">
        {rows.mobile.map((rowData, rowIndex) => {
          const rowStartIndex = rowIndex * 20;
          return (
            <div key={rowIndex} className={cn("flex", barSizing.mobile.gap)}>
              {rowData.map((data, colIndex) => {
                const globalIndex = rowStartIndex + colIndex;
                return (
                  <div
                    key={globalIndex}
                    className={cn(
                      barSizing.mobile.width,
                      barSizing.mobile.height,
                      "rounded-sm cursor-pointer transition-all hover:scale-110",
                      getBarColor(data),
                      hoveredIndex === globalIndex && "ring-2 ring-foreground/50 scale-110"
                    )}
                    onMouseEnter={(e) => handleMouseEnter(globalIndex, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop: multi-row layout with dynamic days per row */}
      <div className="hidden sm:flex sm:flex-col sm:gap-1.5">
        {rows.desktop.map((rowData, rowIndex) => {
          const rowStartIndex = rowIndex * rowData.length;
          return (
            <div key={rowIndex} className={cn("flex", barSizing.desktop.gap)}>
              {rowData.map((data, colIndex) => {
                const globalIndex = rowIndex === 0 ? colIndex : rows.desktop.slice(0, rowIndex).reduce((sum, row) => sum + row.length, 0) + colIndex;
                return (
                  <div
                    key={globalIndex}
                    className={cn(
                      barSizing.desktop.width,
                      barSizing.desktop.height,
                      "rounded-sm cursor-pointer transition-all hover:scale-110 hover:shadow-sm",
                      getBarColor(data),
                      hoveredIndex === globalIndex && "ring-2 ring-foreground/50 scale-110"
                    )}
                    onMouseEnter={(e) => handleMouseEnter(globalIndex, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>
          );
        })}
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
