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
import type { AvailabilityMetrics } from "@/types";

interface AvailabilitySectionProps {
  data: AvailabilityMetrics;
  className?: string;
}

type ViewMode = "daily" | "weekly" | "monthly";

export function AvailabilitySection({
  data,
  className,
}: AvailabilitySectionProps) {
  const t = useTranslations("reports.availability");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 95) return "text-amber-600";
    return "text-red-600";
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
          <p className="text-xs text-muted-foreground mb-1">{t("available")}</p>
          <p className="text-2xl font-bold font-mono">
            {data.uptimeHours}h {data.uptimeMinutes}m
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("downtime")}</p>
          <p className="text-2xl font-bold font-mono text-red-600">
            {data.downtimeHours}h {data.downtimeMinutes}m
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
