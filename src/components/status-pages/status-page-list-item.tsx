"use client";

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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin}m`;
  if (diffHour < 24) return `vor ${diffHour}h`;
  if (diffDay === 1) return "gestern";
  if (diffDay < 7) return `vor ${diffDay}d`;

  return date.toLocaleDateString("de-DE", {
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
              Öffentlich
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 mr-0.5" />
              Privat
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
          {monitorCount} {monitorCount === 1 ? "Monitor" : "Monitors"}
        </span>
        <span className="text-border">|</span>
        <span>
          {groupCount} {groupCount === 1 ? "Gruppe" : "Gruppen"}
        </span>
        <span className="text-border">|</span>
        <span>{formatRelativeTime(statusPage.updatedAt)}</span>
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
