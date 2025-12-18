"use client";

import { StatusIndicator } from "./status-indicator";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import type { Monitor } from "@/types";

interface StatsOverviewProps {
  monitors: Monitor[];
}

// Generate mock trend data for the last 24 data points
function generateTrendData(baseValue: number, variance: number = 0.1) {
  return Array.from({ length: 24 }, (_, i) => ({
    index: i,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * variance),
  }));
}

export function StatsOverview({ monitors }: StatsOverviewProps) {
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

  // Generate chart data
  const upTrendData = generateTrendData(upMonitors, 0.2);
  const downTrendData = Array.from({ length: 24 }, (_, i) => ({
    index: i,
    value: Math.random() < 0.3 ? Math.floor(Math.random() * 2) : 0,
  }));
  const uptimeTrendData = generateTrendData(avgUptime24h, 0.02);
  const responseTrendData = generateTrendData(avgResponseTime, 0.3);

  const uptimeColor =
    avgUptime24h >= 99.9 ? "#22c55e" : avgUptime24h >= 99 ? "#eab308" : "#ef4444";

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Services Up */}
      <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={upTrendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="upGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#upGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 p-4 h-full flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{upMonitors}</div>
            <div className="text-sm text-muted-foreground">Services Up</div>
          </div>
          <StatusIndicator status="up" size="lg" />
        </div>
      </div>

      {/* Services Down */}
      <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={downTrendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="downGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="value"
                fill="url(#downGradient)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 p-4 h-full flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-red-600">{downMonitors}</div>
            <div className="text-sm text-muted-foreground">Services Down</div>
          </div>
          {downMonitors > 0 && <StatusIndicator status="down" size="lg" />}
        </div>
      </div>

      {/* Avg. Uptime */}
      <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uptimeTrendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={uptimeColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={uptimeColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={uptimeColor}
                strokeWidth={2}
                fill="url(#uptimeGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 p-4 h-full flex items-center">
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
            <div className="text-sm text-muted-foreground">Avg. Uptime (24h)</div>
          </div>
        </div>
      </div>

      {/* Avg. Response Time */}
      <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-36">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTrendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#responseGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 p-4 h-full flex items-center">
          <div>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <div className="text-sm text-muted-foreground">Avg. Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
