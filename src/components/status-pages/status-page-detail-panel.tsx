"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/monitors/status-indicator";
import { StatusPageDetailHeader } from "./status-page-detail-header";
import type { StatusPage, Monitor, StatusPageGroup } from "@/types";

interface StatusPageDetailPanelProps {
  statusPage: StatusPage | null;
  monitors: Monitor[];
  onBack?: () => void;
  onEdit?: (statusPage: StatusPage) => void;
  onDelete?: (statusPage: StatusPage) => void;
  className?: string;
}

interface GroupSectionProps {
  group: StatusPageGroup;
  monitors: Monitor[];
  defaultExpanded?: boolean;
}

function GroupSection({ group, monitors, defaultExpanded = true }: GroupSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const groupMonitors = monitors.filter((m) => group.monitors.includes(m.id));
  const allUp = groupMonitors.every((m) => m.status === "up");
  const anyDown = groupMonitors.some((m) => m.status === "down");

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{group.name}</span>
          <span className="text-xs text-muted-foreground">
            ({groupMonitors.length} {groupMonitors.length === 1 ? "Monitor" : "Monitors"})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {anyDown ? (
            <span className="text-xs text-red-600 font-medium">Probleme</span>
          ) : allUp ? (
            <span className="text-xs text-green-600 font-medium">Alle aktiv</span>
          ) : (
            <span className="text-xs text-muted-foreground">Gemischt</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="divide-y">
          {groupMonitors.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground italic">
              Keine Monitors in dieser Gruppe
            </p>
          ) : (
            groupMonitors.map((monitor) => (
              <div
                key={monitor.id}
                className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <StatusIndicator status={monitor.status} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{monitor.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {monitor.url}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">
                    {monitor.uptime24h.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">24h Uptime</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function StatusPageDetailPanel({
  statusPage,
  monitors,
  onBack,
  onEdit,
  onDelete,
  className,
}: StatusPageDetailPanelProps) {
  if (!statusPage) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full text-center p-8",
          className
        )}
      >
        <p className="text-muted-foreground mb-2">
          Wähle eine Statusseite aus der Liste
        </p>
        <p className="text-xs text-muted-foreground">
          oder erstelle eine neue Statusseite
        </p>
      </div>
    );
  }

  const handlePreview = () => {
    window.open(`/status/${statusPage.slug}`, "_blank");
  };

  // Get unassigned monitors (in monitors array but not in any group)
  const assignedMonitorIds = new Set(
    statusPage.groups.flatMap((g) => g.monitors)
  );
  const unassignedMonitors = monitors.filter(
    (m) => statusPage.monitors.includes(m.id) && !assignedMonitorIds.has(m.id)
  );

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <StatusPageDetailHeader
          statusPage={statusPage}
          onBack={onBack}
          onEdit={() => onEdit?.(statusPage)}
          onDelete={() => onDelete?.(statusPage)}
          onPreview={handlePreview}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Groups & Monitors */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Gruppen & Monitors</CardTitle>
              <Button variant="ghost" size="sm" onClick={handlePreview}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Vorschau
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusPage.groups.length === 0 && unassignedMonitors.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Keine Gruppen oder Monitors konfiguriert
              </p>
            ) : (
              <>
                {/* Groups */}
                {statusPage.groups
                  .sort((a, b) => a.order - b.order)
                  .map((group) => (
                    <GroupSection
                      key={group.id}
                      group={group}
                      monitors={monitors}
                    />
                  ))}

                {/* Unassigned Monitors */}
                {unassignedMonitors.length > 0 && (
                  <div className="border rounded-lg overflow-hidden border-dashed">
                    <div className="p-3 bg-muted/30">
                      <span className="text-sm text-muted-foreground italic">
                        Nicht zugewiesene Monitors ({unassignedMonitors.length})
                      </span>
                    </div>
                    <div className="divide-y">
                      {unassignedMonitors.map((monitor) => (
                        <div
                          key={monitor.id}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center gap-3">
                            <StatusIndicator status={monitor.status} size="sm" />
                            <div>
                              <p className="text-sm font-medium">{monitor.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {monitor.url}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono">
                              {monitor.uptime24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Custom Styling Info */}
        {(statusPage.customCss || statusPage.primaryColor || statusPage.logo) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Anpassungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statusPage.logo && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Logo:</span>
                  <span className="truncate max-w-[250px]">{statusPage.logo}</span>
                </div>
              )}
              {statusPage.primaryColor && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Primärfarbe:</span>
                  <div
                    className="h-5 w-5 rounded border"
                    style={{ backgroundColor: statusPage.primaryColor }}
                  />
                  <span className="font-mono text-xs">{statusPage.primaryColor}</span>
                </div>
              )}
              {statusPage.customCss && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Custom CSS:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-32">
                    {statusPage.customCss}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
