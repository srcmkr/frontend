"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MonitorStatus } from "@/types";

interface StatusBadgeProps {
  status: MonitorStatus;
  className?: string;
}

const statusVariants: Record<
  MonitorStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  up: "default",
  down: "destructive",
  pending: "secondary",
  paused: "outline",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("monitors");

  return (
    <Badge
      variant={statusVariants[status]}
      className={cn(
        status === "up" && "bg-green-500 hover:bg-green-500/80",
        className
      )}
    >
      {t(`status.${status}`)}
    </Badge>
  );
}
