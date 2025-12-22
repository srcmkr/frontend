"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentTypeBadge } from "./incident-type-badge";
import type { ExtendedIncident } from "@/types";

interface IncidentListItemProps {
  incident: ExtendedIncident;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

function formatRelativeTime(
  dateString: string,
  locale: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return t("justNow");
  if (diffMin < 60) return t("minutesAgo", { minutes: diffMin });
  if (diffHour < 24) return t("hoursAgo", { hours: diffHour });
  if (diffDay === 1) return t("yesterday");
  if (diffDay < 7) return t("daysAgo", { days: diffDay });

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

function formatDuration(
  seconds: number,
  t: (key: string, values?: Record<string, number>) => string
): string {
  if (seconds < 60) return t("seconds", { count: seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0
      ? t("hoursMinutes", { hours, minutes: remainingMinutes })
      : t("hours", { count: hours });
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0
    ? t("daysHours", { days, hours: remainingHours })
    : t("days", { count: days });
}

function getOngoingDuration(
  startedAt: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return formatDuration(diffSeconds, t);
}

export function IncidentListItem({
  incident,
  isSelected,
  onSelect,
  className,
}: IncidentListItemProps) {
  const locale = useLocale();
  const t = useTranslations("incidents.relativeTime");
  const tDuration = useTranslations("common.duration");
  const isOngoing = incident.status === "ongoing";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-transparent",
        isOngoing && !isSelected && "bg-red-50/50 dark:bg-red-950/10",
        className
      )}
    >
      {/* Header: Severity + Title */}
      <div className="flex items-start gap-2 mb-1.5">
        <IncidentSeverityBadge
          severity={incident.severity}
          size="sm"
          showLabel={false}
          className="mt-0.5 shrink-0"
        />
        <h4 className="font-medium text-sm leading-tight line-clamp-2">
          {incident.title}
        </h4>
      </div>

      {/* Meta: Type, Monitor, Time */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
        <IncidentTypeBadge type={incident.type} size="sm" showLabel={false} />
        <span className="truncate max-w-[120px]">{incident.monitorName}</span>
        <span className="text-border">|</span>
        {isOngoing ? (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {t("since")} {getOngoingDuration(incident.startedAt, tDuration as unknown as (key: string, values?: Record<string, number>) => string)}
          </span>
        ) : (
          <span>
            {formatRelativeTime(incident.startedAt, locale, t as unknown as (key: string, values?: Record<string, number>) => string)}
            {incident.duration && (
              <span className="text-muted-foreground/70">
                {" "}
                ({formatDuration(incident.duration, tDuration as unknown as (key: string, values?: Record<string, number>) => string)})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Cause preview */}
      <p className="text-xs text-muted-foreground mt-1.5 ml-4 line-clamp-1 italic">
        &quot;{incident.cause}&quot;
      </p>
    </button>
  );
}
