"use client";

import { useTranslations } from "next-intl";
import { StatusIndicator } from "./status-indicator";
import type { Monitor } from "@/types";

interface StatsOverviewProps {
  monitors: Monitor[];
}

export function StatsOverview({ monitors }: StatsOverviewProps) {
  const t = useTranslations("monitors");

  const upMonitors = monitors.filter((m) => m.status === "up").length;
  const downMonitors = monitors.filter((m) => m.status === "down").length;

  const avgUptime24h =
    monitors.length > 0
      ? monitors.reduce((sum, m) => sum + m.uptime24h, 0) / monitors.length
      : 0;

  const avgResponseTime =
    monitors.filter((m) => m.lastResponseTime !== null).length > 0
      ? monitors
          .filter((m) => m.lastResponseTime !== null)
          .reduce((sum, m) => sum + (m.lastResponseTime ?? 0), 0) /
        monitors.filter((m) => m.lastResponseTime !== null).length
      : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Services Up */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="p-4 h-full flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{upMonitors}</div>
            <div className="text-sm text-muted-foreground">{t("stats.servicesUp")}</div>
          </div>
          <StatusIndicator status="up" size="lg" />
        </div>
      </div>

      {/* Services Down */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="p-4 h-full flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-red-600">{downMonitors}</div>
            <div className="text-sm text-muted-foreground">{t("stats.servicesDown")}</div>
          </div>
          {downMonitors > 0 && <StatusIndicator status="down" size="lg" />}
        </div>
      </div>

      {/* Avg. Uptime */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="p-4 h-full flex items-center">
          <div>
            <div
              className={`text-2xl font-bold ${
                avgUptime24h >= 99.9
                  ? "text-green-600"
                  : avgUptime24h >= 99
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {avgUptime24h.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">{t("stats.avgUptime")}</div>
          </div>
        </div>
      </div>

      {/* Avg. Response Time */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="p-4 h-full flex items-center">
          <div>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <div className="text-sm text-muted-foreground">{t("stats.avgResponseTime")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
