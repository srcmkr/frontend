"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IncidentListPanel } from "./incident-list-panel";
import { IncidentDetailPanel } from "./incident-detail-panel";
import { IncidentEditPanel } from "./incident-edit-panel";
import { IncidentResolveDialog } from "./incident-resolve-dialog";
import type { ExtendedIncident, Monitor, IncidentFormData, IncidentType } from "@/types";
import type { IncidentFormValues } from "@/lib/validations/incident";

type ViewMode = "view" | "edit" | "create";

interface IncidentSplitViewProps {
  incidents: ExtendedIncident[];
  monitors: Monitor[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  onIncidentCreate?: (data: IncidentFormData) => void;
  onIncidentUpdate?: (incidentId: string, updates: Partial<ExtendedIncident>) => void;
  onIncidentDelete?: (incidentId: string) => void;
  onIncidentResolve?: (incidentId: string, message: string) => void;
  onAddUpdate?: (incidentId: string, message: string) => void;
  onEditUpdate?: (incidentId: string, updateId: string, newMessage: string) => void;
  onDeleteUpdate?: (incidentId: string, updateId: string) => void;
  className?: string;
}

export function IncidentSplitView({
  incidents,
  monitors,
  selectedIncidentId,
  onSelectIncident,
  onIncidentCreate,
  onIncidentUpdate,
  onIncidentDelete,
  onIncidentResolve,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  className,
}: IncidentSplitViewProps) {
  const t = useTranslations("incidents");
  const searchParams = useSearchParams();
  const router = useRouter();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [createConfig, setCreateConfig] = useState<{
    type?: IncidentType;
    isHistorical?: boolean;
  }>({});

  // Dialog states
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToResolve, setIncidentToResolve] = useState<ExtendedIncident | null>(null);
  const [incidentToDelete, setIncidentToDelete] = useState<ExtendedIncident | null>(null);

  // Handle URL params for create/edit mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    const type = searchParams.get("type") as IncidentType | null;
    const historical = searchParams.get("historical") === "true";

    if (mode === "create") {
      setViewMode("create");
      setCreateConfig({
        type: type || "incident",
        isHistorical: historical,
      });
    } else if (mode === "edit" && selectedIncidentId) {
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  }, [searchParams, selectedIncidentId]);

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId]
  );

  const handleBack = () => {
    onSelectIncident(null);
  };

  const handleEditClick = useCallback(
    (incident: ExtendedIncident) => {
      router.push(`/incidents?id=${incident.id}&mode=edit`, { scroll: false });
    },
    [router]
  );

  const handleCancelEdit = useCallback(() => {
    if (selectedIncidentId) {
      router.push(`/incidents?id=${selectedIncidentId}`, { scroll: false });
    } else {
      router.push("/incidents", { scroll: false });
    }
  }, [router, selectedIncidentId]);

  const handleResolveClick = useCallback((incident: ExtendedIncident) => {
    setIncidentToResolve(incident);
    setResolveDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((incident: ExtendedIncident) => {
    setIncidentToDelete(incident);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (onIncidentDelete && incidentToDelete) {
      onIncidentDelete(incidentToDelete.id);
      if (selectedIncidentId === incidentToDelete.id) {
        onSelectIncident(null);
      }
    }
    setDeleteDialogOpen(false);
    setIncidentToDelete(null);
  }, [onIncidentDelete, incidentToDelete, selectedIncidentId, onSelectIncident]);

  const handleSave = useCallback(
    async (data: IncidentFormValues) => {
      if (viewMode === "edit" && selectedIncident) {
        // Update existing
        onIncidentUpdate?.(selectedIncident.id, data as Partial<ExtendedIncident>);
        router.push(`/incidents?id=${selectedIncident.id}`, { scroll: false });
      } else if (viewMode === "create") {
        // Create new
        onIncidentCreate?.(data as IncidentFormData);
        // Parent will navigate to the new incident
      }
    },
    [viewMode, selectedIncident, onIncidentCreate, onIncidentUpdate, router]
  );

  const handleResolve = useCallback(
    async (incidentId: string, message: string) => {
      if (onIncidentResolve) {
        onIncidentResolve(incidentId, message);
      }
    },
    [onIncidentResolve]
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
            onEdit={onIncidentUpdate ? handleEditClick : undefined}
            onResolve={onIncidentResolve ? handleResolveClick : undefined}
            onDelete={onIncidentDelete ? handleDeleteClick : undefined}
            onAddUpdate={onAddUpdate}
            onEditUpdate={onEditUpdate}
            onDeleteUpdate={onDeleteUpdate}
            className="w-full"
          />
        )}
      </div>

      {/* Resolve Dialog */}
      {incidentToResolve && (
        <IncidentResolveDialog
          incident={incidentToResolve}
          open={resolveDialogOpen}
          onOpenChange={(open) => {
            setResolveDialogOpen(open);
            if (!open) setIncidentToResolve(null);
          }}
          onResolve={handleResolve}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setIncidentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t("dialogs.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.deleteDescription", { name: incidentToDelete?.title ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialogs.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("dialogs.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
