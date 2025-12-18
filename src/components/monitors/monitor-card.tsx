"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { ResponseTimeSparkline } from "@/components/charts/response-time-sparkline";
import type { Monitor } from "@/types";

interface MonitorCardProps {
  monitor: Monitor;
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  // Generate fake sparkline data for demo
  const sparklineData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: monitor.lastResponseTime
      ? monitor.lastResponseTime + Math.random() * 50 - 25
      : 0,
  }));

  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  return (
    <Link href={`/monitors/${monitor.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{monitor.name}</h3>
                <StatusBadge status={monitor.status} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {monitor.url}
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <div className="text-muted-foreground text-xs">Response</div>
                <div className="font-mono">
                  {formatResponseTime(monitor.lastResponseTime)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-muted-foreground text-xs">24h</div>
                <div
                  className={
                    monitor.uptime24h >= 99.9
                      ? "text-green-600"
                      : monitor.uptime24h >= 99
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {formatUptime(monitor.uptime24h)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-muted-foreground text-xs">7d</div>
                <div
                  className={
                    monitor.uptime7d >= 99.9
                      ? "text-green-600"
                      : monitor.uptime7d >= 99
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {formatUptime(monitor.uptime7d)}
                </div>
              </div>

              <div className="w-24 hidden md:block">
                <ResponseTimeSparkline data={sparklineData} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
