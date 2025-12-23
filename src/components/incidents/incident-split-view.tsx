"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IncidentListPanel } from "./incident-list-panel";
import { IncidentDetailPanel } from "./incident-detail-panel";
import { IncidentEditPanel } from "./incident-edit-panel";
import { useIncidentActions } from "@/features/incidents/hooks/use-incident-actions";
import type { ExtendedIncident, Monitor, IncidentType, IncidentFormData } from "@/types";
import type { IncidentFormValues } from "@/lib/validations/incident";

type ViewMode = "view" | "edit" | "create";

interface IncidentSplitViewProps {
  /** List of incidents to display */
  incidents: ExtendedIncident[];
  /** Available monitors for incident forms */
  monitors: Monitor[];
  /** Currently selected incident ID */
  selectedIncidentId: string | null;
  /** Callback when incident selection changes */
  onSelectIncident: (id: string | null) => void;
  className?: string;
}

export function IncidentSplitView({
  incidents,
  monitors,
  selectedIncidentId,
  onSelectIncident,
  className,
}: IncidentSplitViewProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Action hook - handles mutations directly, no callbacks needed
  const { createIncident, updateIncident } = useIncidentActions();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [createConfig, setCreateConfig] = useState<{
    type?: IncidentType;
    isHistorical?: boolean;
  }>({});

  // Handle URL params for create/edit mode
  useEffect(() => {
    const slug = params.slug as string[] | undefined;
    const mode = searchParams.get("mode");
    const type = searchParams.get("type") as IncidentType | null;
    const historical = searchParams.get("historical") === "true";

    // Check if we're in create mode (/incidents/create)
    if (slug?.[0] === "create") {
      setViewMode("create");
      setCreateConfig({
        type: type || "incident",
        isHistorical: historical,
      });
    } else if (mode === "edit" && selectedIncidentId) {
      // Edit mode via query parameter (/incidents/[id]?mode=edit)
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  }, [params, searchParams, selectedIncidentId]);

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId]
  );

  const handleBack = () => {
    onSelectIncident(null);
  };

  const handleEditClick = useCallback(
    (incident: ExtendedIncident) => {
      router.push(`/incidents/${incident.id}?mode=edit`, { scroll: false });
    },
    [router]
  );

  const handleCancelEdit = useCallback(() => {
    if (selectedIncidentId) {
      router.push(`/incidents/${selectedIncidentId}`, { scroll: false });
    } else {
      router.push("/incidents", { scroll: false });
    }
  }, [router, selectedIncidentId]);

  const handleSave = useCallback(
    async (data: IncidentFormValues): Promise<void> => {
      // Convert form values to the correct type
      // resolvedAt needs conversion: undefined -> undefined (for IncidentFormData)
      const formData: IncidentFormData = {
        title: data.title,
        type: data.type,
        severity: data.severity,
        cause: data.cause,
        description: data.description,
        affectedMonitors: data.affectedMonitors,
        status: data.status,
        startedAt: data.startedAt,
        resolvedAt: data.resolvedAt,
      };

      if (viewMode === "edit" && selectedIncident) {
        // Update existing - convert resolvedAt: undefined -> null for ExtendedIncident
        updateIncident(selectedIncident.id, {
          ...formData,
          resolvedAt: formData.resolvedAt ?? null,
        });
        router.push(`/incidents/${selectedIncident.id}`, { scroll: false });
      } else if (viewMode === "create") {
        // Create new - hook handles mutation and navigation
        createIncident(formData);
      }
    },
    [viewMode, selectedIncident, createIncident, updateIncident, router]
  );

  // Determine what to show in the right panel
  const showEditPanel = viewMode === "edit" || viewMode === "create";

  return (
    <div className={cn("flex h-[calc(100vh-220px)] min-h-[400px] gap-4", className)}>
      {/* Left Panel - Incident List */}
      <div
        className={cn(
          "overflow-hidden",
          "w-full lg:w-[400px] lg:shrink-0",
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          (selectedIncidentId || showEditPanel) && "hidden lg:block"
        )}
      >
        <IncidentListPanel
          incidents={incidents}
          monitors={monitors}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={onSelectIncident}
          className="h-full"
        />
      </div>

      {/* Right Panel - Incident Details or Edit Panel */}
      <div
        className={cn(
          "flex-1",
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          !selectedIncidentId && !showEditPanel && "hidden lg:flex"
        )}
      >
        {showEditPanel ? (
          <IncidentEditPanel
            incident={viewMode === "edit" ? selectedIncident ?? undefined : undefined}
            monitors={monitors}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            initialType={createConfig.type}
            isHistorical={createConfig.isHistorical}
            className="w-full"
          />
        ) : (
          <IncidentDetailPanel
            incident={selectedIncident}
            monitors={monitors}
            onBack={handleBack}
            onEdit={handleEditClick}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
