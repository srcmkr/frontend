"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ExecutiveSummary as ExecutiveSummaryType } from "@/types";

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryType;
  className?: string;
}

export function ExecutiveSummary({ data, className }: ExecutiveSummaryProps) {
  const t = useTranslations("reports.executiveSummary");

  const TrendIcon =
    data.trendDirection === "up"
      ? TrendingUp
      : data.trendDirection === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    data.trendDirection === "up"
      ? "text-green-600"
      : data.trendDirection === "down"
        ? "text-red-600"
        : "text-muted-foreground";

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* SLA Requirements Overview */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("slaTarget")}</span>
          <span className="font-mono font-semibold">{data.slaTarget}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("maxResponseTime")}</span>
          <span className="font-mono font-semibold">{data.maxResponseTime}ms</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* SLA Availability Compliance */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">{t("availability")}</p>
          <Badge
            variant={data.slaCompliant ? "default" : "destructive"}
            className={cn(
              "text-sm font-semibold",
              data.slaCompliant && "bg-green-600 hover:bg-green-700"
            )}
          >
            {data.slaCompliant ? t("met") : t("violated")}
          </Badge>
        </div>

        {/* Response Time Compliance */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">{t("responseTime")}</p>
          <Badge
            variant={data.responseTimeCompliant ? "default" : "destructive"}
            className={cn(
              "text-sm font-semibold",
              data.responseTimeCompliant && "bg-green-600 hover:bg-green-700"
            )}
          >
            {data.responseTimeCompliant ? t("met") : t("violated")}
          </Badge>
        </div>

        {/* Overall Availability */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("availability")}</p>
          <p
            className={cn(
              "text-2xl font-bold font-mono",
              data.overallAvailability >= data.slaTarget
                ? "text-green-600"
                : "text-red-600"
            )}
          >
            {data.overallAvailability.toFixed(3)}%
          </p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                data.overallAvailability >= data.slaTarget ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(data.overallAvailability, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Downtime */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("downtime")}</p>
          <p className="text-2xl font-bold font-mono">
            {data.totalDowntimeFormatted}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.totalDowntimeMinutes} {t("totalMinutes")}
          </p>
        </div>

        {/* Trend */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("trendVsPrevious")}</p>
          <div className="flex items-center gap-2">
            <TrendIcon className={cn("h-5 w-5", trendColor)} />
            <span className={cn("text-2xl font-bold font-mono", trendColor)}>
              {data.trendVsPreviousPeriod > 0 ? "+" : ""}
              {data.trendVsPreviousPeriod.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
