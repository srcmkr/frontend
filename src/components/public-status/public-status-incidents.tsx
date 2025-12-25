"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import type { ExtendedIncident, Monitor } from "@/types";
import { groupIncidentsByDate } from "@/lib/public-status-utils";
import { IncidentSeverityBadge } from "@/components/incidents/incident-severity-badge";

interface PublicStatusIncidentsProps {
  incidents: ExtendedIncident[];
  monitors: Monitor[];
}

export function PublicStatusIncidents({
  incidents,
  monitors,
}: PublicStatusIncidentsProps) {
  const t = useTranslations("publicStatus");
  const locale = useLocale();

  // Group incidents by date
  const groupedIncidents = useMemo(
    () => groupIncidentsByDate(incidents, locale),
    [incidents, locale]
  );

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours}h ${mins}min`;
  };

  const getMonitorNames = (monitorIds: string[]) => {
    return monitorIds
      .map((id) => monitors.find((m) => m.id === id)?.name || id)
      .join(", ");
  };

  if (incidents.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-base font-semibold">{t("incidentHistory")}</h2>
        <div className="rounded-lg border bg-card p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("noIncidentsMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">{t("incidentHistory")}</h2>

      <div className="space-y-4">
        {Array.from(groupedIncidents.entries()).map(([date, dateIncidents]) => (
          <div key={date} className="space-y-2">
            {/* Date header */}
            <h3 className="text-xs font-medium text-muted-foreground border-b pb-1.5">
              {date}
            </h3>

            {/* Incidents for this date */}
            <div className="space-y-2">
              {dateIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Status icon */}
                    <div className="mt-0.5">
                      {incident.status === "ongoing" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{incident.title}</span>
                        <IncidentSeverityBadge severity={incident.severity} />
                      </div>

                      {incident.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {incident.description}
                        </p>
                      )}

                      {/* Affected monitors */}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {t("affectedServices")}: {getMonitorNames(incident.affectedMonitorIds)}
                      </p>

                      {/* Time and duration */}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(incident.startedAt)}
                          {incident.resolvedAt && ` - ${formatTime(incident.resolvedAt)}`}
                        </span>
                        {incident.duration && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            incident.duration > 3600
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : incident.duration > 1800
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                : "bg-muted"
                          )}>
                            {formatDuration(incident.duration)}
                          </span>
                        )}
                      </div>

                      {/* Latest update */}
                      {incident.updates.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("lastUpdate")}:
                          </p>
                          <p className="text-xs">
                            {incident.updates[0].message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
