"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentTypeBadge } from "./incident-type-badge";
import type { ExtendedIncident } from "@/types";

interface IncidentTimelineViewProps {
  incidents: ExtendedIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  className?: string;
}

interface DayGroup {
  label: string;
  date: Date;
  incidents: ExtendedIncident[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getOngoingDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return formatDuration(diffSeconds);
}

function getDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const incidentDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (incidentDate.getTime() === today.getTime()) {
    return "Heute";
  }
  if (incidentDate.getTime() === yesterday.getTime()) {
    return "Gestern";
  }

  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupIncidentsByDay(incidents: ExtendedIncident[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  // Sort incidents by startedAt descending
  const sorted = [...incidents].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  for (const incident of sorted) {
    const date = new Date(incident.startedAt);
    const dateKey = date.toISOString().split("T")[0];

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        label: getDayLabel(date),
        date,
        incidents: [],
      });
    }

    groups.get(dateKey)!.incidents.push(incident);
  }

  return Array.from(groups.values());
}

export function IncidentTimelineView({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  className,
}: IncidentTimelineViewProps) {
  const dayGroups = useMemo(() => groupIncidentsByDay(incidents), [incidents]);

  if (incidents.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <p className="text-muted-foreground">Keine Incidents in diesem Zeitraum</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {dayGroups.map((group) => (
        <div key={group.date.toISOString()}>
          {/* Day header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {group.label}
            </h3>
          </div>

          {/* Timeline */}
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

            {/* Incidents */}
            <div className="space-y-3">
              {group.incidents.map((incident) => {
                const isOngoing = incident.status === "ongoing";
                const isSelected = incident.id === selectedIncidentId;
                const time = new Date(incident.startedAt).toLocaleTimeString(
                  "de-DE",
                  { hour: "2-digit", minute: "2-digit" }
                );

                return (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => onSelectIncident(incident.id)}
                    className={cn(
                      "relative w-full text-left group",
                      "flex items-start gap-3 p-3 rounded-lg border transition-all",
                      "hover:border-primary/50 hover:bg-accent/50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-transparent bg-card/50"
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-[-18px] top-4 h-3 w-3 rounded-full border-2 bg-background",
                        isOngoing
                          ? "border-red-500"
                          : "border-green-500",
                        isOngoing && "animate-pulse"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute inset-0.5 rounded-full",
                          isOngoing ? "bg-red-500" : "bg-green-500"
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Time and badges */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {time}
                        </span>
                        <IncidentSeverityBadge
                          severity={incident.severity}
                          size="sm"
                        />
                        <IncidentTypeBadge
                          type={incident.type}
                          size="sm"
                          showLabel={false}
                        />
                      </div>

                      {/* Title */}
                      <h4 className="font-medium text-sm line-clamp-1 mb-0.5">
                        {incident.title}
                      </h4>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-[150px]">
                          {incident.monitorName}
                        </span>
                        {isOngoing ? (
                          <span className="text-red-600 dark:text-red-400">
                            seit {getOngoingDuration(incident.startedAt)}
                          </span>
                        ) : (
                          incident.duration && (
                            <span>Dauer: {formatDuration(incident.duration)}</span>
                          )
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
