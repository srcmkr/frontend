"use client";

import { Wrench, Clock, Calendar } from "lucide-react";
import type { StatusPageMaintenance, StatusPageGroup } from "@/types";
import { formatMaintenanceTime } from "@/lib/public-status-utils";
import { Badge } from "@/components/ui/badge";

interface PublicStatusMaintenanceProps {
  maintenances: StatusPageMaintenance[];
  groups: StatusPageGroup[];
}

export function PublicStatusMaintenance({
  maintenances,
  groups,
}: PublicStatusMaintenanceProps) {
  const getGroupNames = (groupIds: string[]) => {
    return groupIds
      .map((id) => groups.find((g) => g.id === id)?.name || id)
      .join(", ");
  };

  const getTimeUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `in ${diffDays} Tag${diffDays === 1 ? "" : "en"}`;
    if (diffHours > 0) return `in ${diffHours} Stunde${diffHours === 1 ? "" : "n"}`;
    return `in ${diffMins} Minute${diffMins === 1 ? "" : "n"}`;
  };

  const inProgress = maintenances.filter((m) => m.status === "in_progress");
  const scheduled = maintenances.filter((m) => m.status === "scheduled");

  if (maintenances.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-500" />
            Laufende Wartung
          </h2>
          {inProgress.map((maintenance) => (
            <div
              key={maintenance.id}
              className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {maintenance.title}
                    </h3>
                    <Badge variant="default" className="bg-blue-500 text-xs">
                      In Bearbeitung
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {maintenance.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatMaintenanceTime(
                        maintenance.scheduledStart,
                        maintenance.scheduledEnd,
                        "de"
                      )}
                    </span>
                  </div>
                  {maintenance.affectedGroups.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Betroffene Gruppen: {getGroupNames(maintenance.affectedGroups)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            Geplante Wartungen
          </h2>
          {scheduled.map((maintenance) => {
            const timeUntil = getTimeUntil(maintenance.scheduledStart);

            return (
              <div
                key={maintenance.id}
                className="rounded-lg border bg-card p-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium">{maintenance.title}</h3>
                      {timeUntil && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                          {timeUntil}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {maintenance.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatMaintenanceTime(
                          maintenance.scheduledStart,
                          maintenance.scheduledEnd,
                          "de"
                        )}
                      </span>
                    </div>
                    {maintenance.affectedGroups.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Betroffene Gruppen: {getGroupNames(maintenance.affectedGroups)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
