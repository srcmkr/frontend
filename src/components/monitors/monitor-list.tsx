"use client";

import { MonitorCard } from "./monitor-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Monitor } from "@/types";

interface MonitorListProps {
  monitors: Monitor[];
  isLoading?: boolean;
}

export function MonitorList({ monitors, isLoading }: MonitorListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No monitors configured yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first monitor to start tracking uptime.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monitors.map((monitor) => (
        <MonitorCard key={monitor.id} monitor={monitor} />
      ))}
    </div>
  );
}
