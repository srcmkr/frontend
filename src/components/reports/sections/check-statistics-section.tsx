"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CheckStatistics } from "@/types";

interface CheckStatisticsSectionProps {
  data: CheckStatistics;
  className?: string;
}

export function CheckStatisticsSection({ data, className }: CheckStatisticsSectionProps) {
  const locale = useLocale();
  const t = useTranslations("reports.checkStatistics");

  // Aggregate to max 30 days for chart
  const aggregatedData = () => {
    const checks = data.checksByDay;
    if (checks.length <= 30) return checks;

    const step = Math.ceil(checks.length / 30);
    const aggregated = [];

    for (let i = 0; i < checks.length; i += step) {
      const slice = checks.slice(i, Math.min(i + step, checks.length));
      const total = slice.reduce((sum, d) => sum + d.total, 0);
      const successful = slice.reduce((sum, d) => sum + d.successful, 0);
      const failed = slice.reduce((sum, d) => sum + d.failed, 0);

      aggregated.push({
        date: slice[0].date,
        total,
        successful,
        failed,
        successRate: total > 0 ? (successful / total) * 100 : 100,
      });
    }

    return aggregated;
  };

  const chartData = aggregatedData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99.9) return "text-green-600";
    if (rate >= 95) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("totalChecks")}</p>
          <p className="text-2xl font-bold font-mono">{formatNumber(data.totalChecks)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("successful")}</p>
          <p className="text-2xl font-bold font-mono text-green-600">
            {formatNumber(data.successfulChecks)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("failed")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            data.failedChecks > 0 ? "text-red-600" : "text-green-600"
          )}>
            {formatNumber(data.failedChecks)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("successRate")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            getSuccessRateColor(data.successRate)
          )}>
            {data.successRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Daily Success Rate */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">{t("checksPerDay")}</p>
        <p className="text-2xl font-bold font-mono">{formatNumber(data.checksPerDay)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("checksPerHour", { count: Math.round(data.checksPerDay / 24) })}
        </p>
      </div>

      {/* Failed Checks Chart */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("failedChecksChart")}</h4>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                width={40}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const chartEntry = payload[0].payload;
                  return (
                    <div className="bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-xs">
                      <p className="font-medium">{formatDate(String(label))}</p>
                      <p>{t("tooltip.failed", { count: chartEntry.failed })}</p>
                      <p>{t("tooltip.successful", { count: chartEntry.successful })}</p>
                      <p>{t("tooltip.successRate", { rate: chartEntry.successRate?.toFixed(2) })}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="failed" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.failed > 0 ? "#ef4444" : "#22c55e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success Rate Distribution */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("successRateDistribution")}</h4>
        <div className="relative">
          <div className="h-6 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all flex items-center justify-end pr-2"
              style={{ width: `${data.successRate}%` }}
            >
              {data.successRate > 20 && (
                <span className="text-xs font-medium text-white">
                  {data.successRate.toFixed(2)}%
                </span>
              )}
            </div>
            <div
              className="h-full bg-red-500 transition-all flex items-center justify-start pl-2"
              style={{ width: `${100 - data.successRate}%` }}
            >
              {(100 - data.successRate) > 10 && (
                <span className="text-xs font-medium text-white">
                  {(100 - data.successRate).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500"></span>
            <span className="text-muted-foreground">{t("legend.successful")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500"></span>
            <span className="text-muted-foreground">{t("legend.failed")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
