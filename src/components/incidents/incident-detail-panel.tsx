"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  Pencil,
  CheckCircle,
  Trash2,
  Clock,
  Calendar,
  Server,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentStatusBadge } from "./incident-status-badge";
import { IncidentTypeBadge } from "./incident-type-badge";
import { IncidentUpdatesList } from "./incident-updates-list";
import type { ExtendedIncident, Monitor } from "@/types";

interface IncidentDetailPanelProps {
  incident: ExtendedIncident | null;
  monitors: Monitor[];
  onBack?: () => void;
  onEdit?: (incident: ExtendedIncident) => void;
  onResolve?: (incident: ExtendedIncident) => void;
  onDelete?: (incident: ExtendedIncident) => void;
  onAddUpdate?: (incidentId: string, message: string) => void;
  onEditUpdate?: (incidentId: string, updateId: string, newMessage: string) => void;
  onDeleteUpdate?: (incidentId: string, updateId: string) => void;
  className?: string;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} Sekunden`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} Minuten`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours} Stunden ${remainingMinutes} Minuten`
      : `${hours} Stunden`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0
    ? `${days} Tage ${remainingHours} Stunden`
    : `${days} Tage`;
}

function getOngoingDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return formatDuration(diffSeconds);
}

export function IncidentDetailPanel({
  incident,
  monitors,
  onBack,
  onEdit,
  onResolve,
  onDelete,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  className,
}: IncidentDetailPanelProps) {
  const affectedMonitorObjects = useMemo(() => {
    if (!incident) return [];
    return monitors.filter((m) => incident.affectedMonitors.includes(m.id));
  }, [incident, monitors]);

  // Empty state
  if (!incident) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full",
          className
        )}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-medium text-lg mb-1">Kein Vorfall ausgewählt</h3>
          <p className="text-muted-foreground text-sm">
            Wähle einen Vorfall aus der Liste aus, um Details anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  const isOngoing = incident.status === "ongoing";

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          {/* Back button (mobile) */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden -ml-2"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isOngoing && onResolve && (
              <Button
                size="sm"
                onClick={() => onResolve(incident)}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Beheben
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(incident)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                )}
                {!isOngoing && onResolve && (
                  <DropdownMenuItem onClick={() => onResolve(incident)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als behoben markieren
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(incident)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and badges */}
        <h1 className="text-xl font-semibold mb-3">{incident.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <IncidentSeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
          <IncidentTypeBadge type={incident.type} />
        </div>

        {/* Time info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Gestartet: {formatDateTime(incident.startedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {isOngoing ? (
              <span className="text-red-600 dark:text-red-400 font-medium">
                Dauer: {getOngoingDuration(incident.startedAt)} (laufend)
              </span>
            ) : (
              <span>
                Dauer:{" "}
                {incident.duration
                  ? formatDuration(incident.duration)
                  : "Unbekannt"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content (scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Affected Services */}
        <section>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Betroffene Services
          </h3>
          <div className="space-y-2">
            {affectedMonitorObjects.length > 0 ? (
              affectedMonitorObjects.map((monitor) => (
                <div
                  key={monitor.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      monitor.status === "up"
                        ? "bg-green-500"
                        : monitor.status === "down"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{monitor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {monitor.url}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {monitor.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Monitore zugeordnet
              </p>
            )}
          </div>
        </section>

        {/* Cause */}
        <section>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Ursache
          </h3>
          <p className="text-sm">{incident.cause}</p>
        </section>

        {/* Description */}
        {incident.description && (
          <section>
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Beschreibung
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {incident.description}
            </p>
          </section>
        )}

        {/* Timeline */}
        <section>
          <IncidentUpdatesList
            updates={incident.updates}
            onAddUpdate={
              onAddUpdate
                ? (message) => onAddUpdate(incident.id, message)
                : undefined
            }
            onEditUpdate={
              onEditUpdate
                ? (updateId, newMessage) => onEditUpdate(incident.id, updateId, newMessage)
                : undefined
            }
            onDeleteUpdate={
              onDeleteUpdate
                ? (updateId) => onDeleteUpdate(incident.id, updateId)
                : undefined
            }
            canAddUpdate={!!onAddUpdate}
          />
        </section>
      </div>
    </div>
  );
}
