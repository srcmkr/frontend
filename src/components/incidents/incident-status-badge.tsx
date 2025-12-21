"use client";

import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/types";

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  IncidentStatus,
  {
    label: string;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
    borderLight: string;
    borderDark: string;
    dotColor: string;
    pulse?: boolean;
  }
> = {
  ongoing: {
    label: "Aktiv",
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-950/30",
    textLight: "text-red-700",
    textDark: "dark:text-red-300",
    borderLight: "border-red-200",
    borderDark: "dark:border-red-800",
    dotColor: "bg-red-500",
    pulse: true,
  },
  resolved: {
    label: "Behoben",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-950/30",
    textLight: "text-green-700",
    textDark: "dark:text-green-300",
    borderLight: "border-green-200",
    borderDark: "dark:border-green-800",
    dotColor: "bg-green-500",
  },
};

export function IncidentStatusBadge({
  status,
  size = "md",
  showLabel = true,
  className,
}: IncidentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wide",
        config.bgLight,
        config.bgDark,
        config.textLight,
        config.textDark,
        config.borderLight,
        config.borderDark,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          config.dotColor,
          config.pulse && "animate-pulse"
        )}
      />
      {showLabel && config.label}
    </span>
  );
}
