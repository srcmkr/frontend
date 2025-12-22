"use client";

import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StatusPage } from "@/types";

interface StatusPageListItemProps {
  statusPage: StatusPage;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

interface RelativeTimeTranslations {
  justNow: string;
  minutesAgo: (count: number) => string;
  hoursAgo: (count: number) => string;
  yesterday: string;
  daysAgo: (count: number) => string;
}

function formatRelativeTime(
  dateString: string,
  translations: RelativeTimeTranslations,
  locale: string
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return translations.justNow;
  if (diffMin < 60) return translations.minutesAgo(diffMin);
  if (diffHour < 24) return translations.hoursAgo(diffHour);
  if (diffDay === 1) return translations.yesterday;
  if (diffDay < 7) return translations.daysAgo(diffDay);

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function StatusPageListItem({
  statusPage,
  isSelected,
  onSelect,
  className,
}: StatusPageListItemProps) {
  const t = useTranslations("statusPages");
  const locale = useLocale();

  const relativeTimeTranslations: RelativeTimeTranslations = {
    justNow: t("list.justNow"),
    minutesAgo: (count: number) => t("list.minutesAgo", { count }),
    hoursAgo: (count: number) => t("list.hoursAgo", { count }),
    yesterday: t("list.yesterday"),
    daysAgo: (count: number) => t("list.daysAgo", { count }),
  };

  const monitorCount = statusPage.monitors.length;
  const groupCount = statusPage.groups.length;

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
        className
      )}
    >
      {/* Header: Title + Visibility Badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-medium text-sm leading-tight line-clamp-1">
          {statusPage.title}
        </h4>
        <Badge
          variant={statusPage.isPublic ? "default" : "secondary"}
          className={cn(
            "shrink-0 text-[10px] px-1.5 py-0",
            statusPage.isPublic
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}
        >
          {statusPage.isPublic ? (
            <>
              <Globe className="h-3 w-3 mr-0.5" />
              {t("list.public")}
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 mr-0.5" />
              {t("list.private")}
            </>
          )}
        </Badge>
      </div>

      {/* Slug */}
      <p className="text-xs text-muted-foreground mb-2 font-mono">
        /status/{statusPage.slug}
      </p>

      {/* Meta: Monitor count, Groups, Last updated */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          {t("list.monitors", { count: monitorCount })}
        </span>
        <span className="text-border">|</span>
        <span>
          {t("list.groups", { count: groupCount })}
        </span>
        <span className="text-border">|</span>
        <span>{formatRelativeTime(statusPage.updatedAt, relativeTimeTranslations, locale)}</span>
      </div>

      {/* Description preview */}
      {statusPage.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic">
          {statusPage.description}
        </p>
      )}
    </button>
  );
}
