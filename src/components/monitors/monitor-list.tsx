"use client";

import { useTranslations } from "next-intl";
import { MonitorCard } from "./monitor-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Monitor } from "@/types";

interface MonitorListProps {
  monitors: Monitor[];
  isLoading?: boolean;
}

export function MonitorList({ monitors, isLoading }: MonitorListProps) {
  const t = useTranslations("monitors.emptyState");

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
        <p className="text-muted-foreground">{t("title")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("description")}
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
