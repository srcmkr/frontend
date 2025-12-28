"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AvailabilityMetrics, ReportPeriod } from "@/types";

interface AvailabilitySectionProps {
  data: AvailabilityMetrics;
  period: ReportPeriod;
  slaTarget: number;
  className?: string;
}

type ViewMode = "daily" | "weekly" | "monthly";

export function AvailabilitySection({
  data,
  period,
  slaTarget,
  className,
}: AvailabilitySectionProps) {
  const t = useTranslations("reports.availability");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  /**
   * Calculate total hours in the reporting period
   */
  const calculatePeriodHours = () => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const now = new Date();

    // Use actual end time if period is not yet complete
    const actualEnd = end > now ? now : end;
    const diffMs = actualEnd.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  /**
   * Calculate allowed downtime based on SLA target and period
   * SLA 99.9% = 0.1% allowed downtime
   */
  const calculateAllowedDowntime = () => {
    const periodHours = calculatePeriodHours();
    const allowedDowntimePercent = 100 - slaTarget;
    const allowedDowntimeHours = (periodHours * allowedDowntimePercent) / 100;
    return allowedDowntimeHours;
  };

  const allowedDowntimeHours = calculateAllowedDowntime();
  const actualDowntimeHours = data.downtimeHours + data.downtimeMinutes / 60;
  const isWithinSla = actualDowntimeHours <= allowedDowntimeHours;

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 95) return "text-amber-600";
    return "text-red-600";
  };

  /**
   * Format duration in a human-readable way
   * - Less than 1 hour: show only minutes (e.g., "45m")
   * - 1-24 hours: show hours and minutes (e.g., "2h 30m")
   * - More than 24 hours: show days and hours (e.g., "3d 5h")
   */
  const formatDuration = (hours: number, minutes: number) => {
    const totalMinutes = Math.round(hours * 60 + minutes);

    if (totalMinutes < 1) {
      return "< 1m";
    }

    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalHours < 24) {
      return remainingMinutes > 0
        ? `${totalHours}h ${remainingMinutes}m`
        : `${totalHours}h`;
    }

    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    return remainingHours > 0
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("uptime")}</p>
          <p className={cn("text-2xl font-bold font-mono", getUptimeColor(data.uptimePercentage))}>
            {data.uptimePercentage.toFixed(2)}%
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("totalUptime")}</p>
          <p className="text-2xl font-bold font-mono text-green-600">
            {formatDuration(data.uptimeHours, 0)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("totalDowntime")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            data.downtimeMinutes > 0 ? "text-red-600" : "text-green-600"
          )}>
            {formatDuration(data.downtimeHours, 0)}
          </p>
          <p className={cn(
            "text-xs mt-1",
            isWithinSla ? "text-muted-foreground" : "text-red-600"
          )}>
            {t("allowedDowntime", { allowed: formatDuration(allowedDowntimeHours, 0), sla: slaTarget })}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("slaBreaches")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            data.slaBreachCount > 0 ? "text-red-600" : "text-green-600"
          )}>
            {data.slaBreachCount}
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode(mode)}
            className="rounded-md"
          >
            {t(`viewMode.${mode}`)}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>{t("table.period")}</TableHead>
              <TableHead className="text-right">{t("table.uptime")}</TableHead>
              <TableHead className="text-right">{t("table.checks")}</TableHead>
              <TableHead className="text-right">{t("table.failed")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewMode === "daily" &&
              data.dailyBreakdown.slice(0, 31).map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-mono text-sm">
                    {day.dayOfWeek}, {day.date}
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", getUptimeColor(day.uptime))}>
                    {day.uptime.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">{day.totalChecks}</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono",
                    day.failedChecks > 0 && "text-red-600"
                  )}>
                    {day.failedChecks}
                  </TableCell>
                </TableRow>
              ))}
            {viewMode === "weekly" &&
              data.weeklyBreakdown.map((week) => (
                <TableRow key={week.weekNumber}>
                  <TableCell className="font-mono text-sm">
                    {t("weekPrefix")} {week.weekNumber} ({week.startDate} - {week.endDate})
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", getUptimeColor(week.uptime))}>
                    {week.uptime.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">{week.totalChecks}</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono",
                    week.failedChecks > 0 && "text-red-600"
                  )}>
                    {week.failedChecks}
                  </TableCell>
                </TableRow>
              ))}
            {viewMode === "monthly" &&
              data.monthlyBreakdown.map((month) => (
                <TableRow key={`${month.year}-${month.month}`}>
                  <TableCell className="font-mono text-sm">
                    {month.label} {month.year}
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", getUptimeColor(month.uptime))}>
                    {month.uptime.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">{month.totalChecks}</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono",
                    month.failedChecks > 0 && "text-red-600"
                  )}>
                    {month.failedChecks}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* SLA Breaches */}
      {data.slaBreaches.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("slaBreachesTitle")}</h4>
          <div className="space-y-2">
            {data.slaBreaches.slice(0, 10).map((breach, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-red-200 dark:border-red-800/50"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={breach.severity === "critical" ? "destructive" : "secondary"}
                  >
                    {t(`severity.${breach.severity}`)}
                  </Badge>
                  <span className="font-mono text-sm">{breach.date}</span>
                  <span className="text-sm text-muted-foreground">{breach.cause}</span>
                </div>
                <span className="font-mono text-sm text-red-600">{breach.duration}min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
