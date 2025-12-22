"use client";

import { useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import type { CheckResult } from "@/types";

interface ResponseTimeChartProps {
  checks: CheckResult[];
  className?: string;
}

export function ResponseTimeChart({ checks, className }: ResponseTimeChartProps) {
  const t = useTranslations("monitors");
  const locale = useLocale();
  // Aggregate checks into 5-minute buckets for smoother visualization
  const data = aggregateChecks(checks, locale).slice(-48); // Last 4 hours worth of 5-min buckets

  if (data.length === 0) {
    return (
      <div className={cn("h-[180px] flex items-center justify-center text-muted-foreground text-sm", className)}>
        {t("chart.noData")}
      </div>
    );
  }

  return (
    <div className={cn("h-[180px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
            tickMargin={8}
            className="text-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
            tickFormatter={(v) => `${v}ms`}
            width={45}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-xs">
                  <div className="font-medium">{data.time}</div>
                  <div className="text-muted-foreground">
                    {data.responseTime}ms (avg)
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#responseGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function aggregateChecks(checks: CheckResult[], locale: string) {
  if (checks.length === 0) return [];

  const buckets = new Map<string, { times: number[]; timestamp: Date }>();
  const bucketSize = 5 * 60 * 1000; // 5 minutes

  checks.forEach((check) => {
    const timestamp = new Date(check.checkedAt);
    const bucketTime = new Date(
      Math.floor(timestamp.getTime() / bucketSize) * bucketSize
    );
    const key = bucketTime.toISOString();

    if (!buckets.has(key)) {
      buckets.set(key, { times: [], timestamp: bucketTime });
    }
    if (check.responseTime > 0) {
      buckets.get(key)!.times.push(check.responseTime);
    }
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((bucket) => ({
      time: bucket.timestamp.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      responseTime:
        bucket.times.length > 0
          ? Math.round(
              bucket.times.reduce((a, b) => a + b, 0) / bucket.times.length
            )
          : 0,
    }));
}
