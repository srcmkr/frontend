"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import type { PerformanceMetrics } from "@/types";

interface PerformanceSectionProps {
  data: PerformanceMetrics;
  className?: string;
}

export function PerformanceSection({ data, className }: PerformanceSectionProps) {
  const locale = useLocale();
  const t = useTranslations("reports.performance");

  // Aggregate trend data to show max ~30 points for readability
  const aggregatedTrend = () => {
    const trend = data.responseTimeTrend;
    if (trend.length <= 30) return trend;

    const step = Math.ceil(trend.length / 30);
    const aggregated = [];

    for (let i = 0; i < trend.length; i += step) {
      const slice = trend.slice(i, Math.min(i + step, trend.length));
      const avgAverage = Math.round(
        slice.reduce((sum, p) => sum + p.average, 0) / slice.length
      );
      const avgP95 = Math.round(
        slice.reduce((sum, p) => sum + p.p95, 0) / slice.length
      );
      aggregated.push({
        date: slice[0].date,
        average: avgAverage,
        p95: avgP95,
      });
    }

    return aggregated;
  };

  const chartData = aggregatedTrend();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("average")}</p>
          <p className="text-2xl font-bold font-mono">{data.averageResponseTime}ms</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("median")}</p>
          <p className="text-2xl font-bold font-mono">{data.medianResponseTime}ms</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("minMax")}</p>
          <p className="text-2xl font-bold font-mono">
            {data.minResponseTime} / {data.maxResponseTime}ms
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("degradations")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            data.degradationIncidents.length > 0 ? "text-amber-600" : "text-green-600"
          )}>
            {data.degradationIncidents.length}
          </p>
        </div>
      </div>

      {/* Percentiles */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("percentiles")}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">P90</p>
            <p className="text-xl font-bold font-mono">{data.p90ResponseTime}ms</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">P95</p>
            <p className="text-xl font-bold font-mono">{data.p95ResponseTime}ms</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">P99</p>
            <p className="text-xl font-bold font-mono">{data.p99ResponseTime}ms</p>
          </div>
        </div>
      </div>

      {/* Response Time Trend Chart */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("responseTimeTrend")}</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={(v) => `${v}ms`}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                width={50}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-xs">
                      <p className="font-medium">{formatDate(String(label))}</p>
                      <p>{t("tooltip.average", { value: payload[0]?.value })}</p>
                      <p>{t("tooltip.p95", { value: payload[1]?.value })}</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="hsl(var(--chart-1))"
                fill="url(#avgGradient)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="p95"
                stroke="hsl(var(--chart-2))"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[hsl(var(--chart-1))]" />
            <span>{t("legend.average")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[hsl(var(--chart-2))]" style={{ borderStyle: "dashed" }} />
            <span>{t("legend.p95")}</span>
          </div>
        </div>
      </div>

      {/* Degradation Incidents */}
      {data.degradationIncidents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("degradationIncidents")}</h4>
          <div className="space-y-2">
            {data.degradationIncidents.map((incident, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-amber-200 dark:border-amber-800/50"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-amber-700 dark:text-amber-400">
                    {t("slow")}
                  </Badge>
                  <span className="font-mono text-sm">{incident.date}</span>
                  <span className="text-sm text-muted-foreground">
                    {t("duration", { duration: incident.duration })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-amber-600">
                    {incident.averageResponseTime}ms
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {t("threshold", { threshold: incident.threshold })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
