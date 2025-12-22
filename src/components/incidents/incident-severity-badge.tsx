"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/types";

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const SEVERITY_CONFIG: Record<
  IncidentSeverity,
  {
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
    borderLight: string;
    borderDark: string;
    pulse?: boolean;
  }
> = {
  info: {
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    textLight: "text-blue-700",
    textDark: "dark:text-blue-300",
    borderLight: "border-blue-200",
    borderDark: "dark:border-blue-800",
  },
  minor: {
    bgLight: "bg-yellow-50",
    bgDark: "dark:bg-yellow-950/30",
    textLight: "text-yellow-700",
    textDark: "dark:text-yellow-300",
    borderLight: "border-yellow-200",
    borderDark: "dark:border-yellow-800",
  },
  major: {
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/30",
    textLight: "text-orange-700",
    textDark: "dark:text-orange-300",
    borderLight: "border-orange-300",
    borderDark: "dark:border-orange-800",
  },
  critical: {
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-950/30",
    textLight: "text-red-700",
    textDark: "dark:text-red-300",
    borderLight: "border-red-400",
    borderDark: "dark:border-red-800",
    pulse: true,
  },
};

export function IncidentSeverityBadge({
  severity,
  size = "md",
  showLabel = true,
  className,
}: IncidentSeverityBadgeProps) {
  const t = useTranslations("incidents");
  const config = SEVERITY_CONFIG[severity];

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
      {/* Severity dot */}
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          severity === "info" && "bg-blue-500",
          severity === "minor" && "bg-yellow-500",
          severity === "major" && "bg-orange-500",
          severity === "critical" && "bg-red-500",
          config.pulse && "animate-pulse"
        )}
      />
      {showLabel && t(`severity.${severity}`)}
    </span>
  );
}
