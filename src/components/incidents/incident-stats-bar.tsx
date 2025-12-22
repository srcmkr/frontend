"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentStats } from "@/types";

interface IncidentStatsBarProps {
  stats: IncidentStats;
  className?: string;
}

export function IncidentStatsBar({ stats, className }: IncidentStatsBarProps) {
  const t = useTranslations("incidents");
  const tDuration = useTranslations("common.duration");

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-sm px-3 py-2 bg-muted/50 rounded-lg",
        className
      )}
    >
      {/* Active incidents */}
      <div className="flex items-center gap-1.5">
        <AlertTriangle
          className={cn(
            "h-4 w-4",
            stats.totalOngoing > 0 ? "text-red-500" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "font-medium",
            stats.totalOngoing > 0 ? "text-red-600 dark:text-red-400" : ""
          )}
        >
          {stats.totalOngoing} {t("stats.active")}
        </span>
      </div>

      <span className="text-border">|</span>

      {/* Resolved incidents */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>{stats.totalResolved} {t("stats.resolved")}</span>
      </div>

      <span className="text-border">|</span>

      {/* MTTR */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          {t("metrics.mttr")}:{" "}
          <span className="font-medium text-foreground">
            {stats.mttrMinutes > 0 ? tDuration("minutes", { count: stats.mttrMinutes }) : "-"}
          </span>
        </span>
      </div>

      {/* Severity breakdown (compact) */}
      <div className="flex items-center gap-2 ml-auto text-xs">
        {stats.bySeverity.critical > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {stats.bySeverity.critical}
          </span>
        )}
        {stats.bySeverity.major > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {stats.bySeverity.major}
          </span>
        )}
        {stats.bySeverity.minor > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            {stats.bySeverity.minor}
          </span>
        )}
        {stats.bySeverity.info > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {stats.bySeverity.info}
          </span>
        )}
      </div>
    </div>
  );
}
