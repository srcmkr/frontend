"use client";

import { AlertTriangle, Wrench, Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { IncidentType } from "@/types";

interface IncidentTypeBadgeProps {
  type: IncidentType;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const TYPE_CONFIG: Record<
  IncidentType,
  {
    icon: React.ElementType;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
  }
> = {
  incident: {
    icon: AlertTriangle,
    bgLight: "bg-slate-100",
    bgDark: "dark:bg-slate-800/50",
    textLight: "text-slate-700",
    textDark: "dark:text-slate-300",
  },
  maintenance: {
    icon: Wrench,
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/30",
    textLight: "text-purple-700",
    textDark: "dark:text-purple-300",
  },
  announcement: {
    icon: Megaphone,
    bgLight: "bg-cyan-50",
    bgDark: "dark:bg-cyan-950/30",
    textLight: "text-cyan-700",
    textDark: "dark:text-cyan-300",
  },
};

export function IncidentTypeBadge({
  type,
  size = "md",
  showLabel = true,
  className,
}: IncidentTypeBadgeProps) {
  const t = useTranslations("incidents");
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium",
        config.bgLight,
        config.bgDark,
        config.textLight,
        config.textDark,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && t(`types.${type}`)}
    </span>
  );
}
