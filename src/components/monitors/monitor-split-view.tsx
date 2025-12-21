"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { MonitorListPanel } from "./monitor-list-panel";
import { MonitorDetailPanel } from "./monitor-detail-panel";
import { MonitorEditPanel } from "./monitor-edit-panel";
import type { Monitor, ServiceGroup } from "@/types";

type ViewMode = "view" | "edit" | "create";

interface MonitorSplitViewProps {
  monitors: Monitor[];
  serviceGroups: ServiceGroup[];
  selectedMonitorId: string | null;
  onSelectMonitor: (id: string | null) => void;
  onServiceGroupsChange?: (groups: ServiceGroup[]) => void;
  onMonitorUpdate?: (monitorId: string, updates: Partial<Monitor>) => void;
  onMonitorCreate?: (data: Partial<Monitor>) => void;
  onMonitorDelete?: (monitorId: string) => void;
  className?: string;
}

export function MonitorSplitView({
  monitors,
  serviceGroups,
  selectedMonitorId,
  onSelectMonitor,
  onServiceGroupsChange,
  onMonitorUpdate,
  onMonitorCreate,
  onMonitorDelete,
  className,
}: MonitorSplitViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  // Handle URL params for create/edit mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "create") {
      setViewMode("create");
    } else if (mode === "edit" && selectedMonitorId) {
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  }, [searchParams, selectedMonitorId]);

  const selectedMonitor = useMemo(
    () => monitors.find((m) => m.id === selectedMonitorId) ?? null,
    [monitors, selectedMonitorId]
  );

  const handleBack = () => {
    onSelectMonitor(null);
  };

  const handleEdit = useCallback(
    (monitor: Monitor) => {
      router.push(`/monitors?id=${monitor.id}&mode=edit`, { scroll: false });
    },
    [router]
  );

  const handleCancelEdit = useCallback(() => {
    if (selectedMonitorId) {
      router.push(`/monitors?id=${selectedMonitorId}`, { scroll: false });
    } else {
      router.push("/monitors", { scroll: false });
    }
  }, [router, selectedMonitorId]);

  const handleSaveMonitor = useCallback(
    async (monitorId: string | null, data: Partial<Monitor>) => {
      if (viewMode === "edit" && monitorId && onMonitorUpdate) {
        onMonitorUpdate(monitorId, data);
        router.push(`/monitors?id=${monitorId}`, { scroll: false });
      } else if (viewMode === "create" && onMonitorCreate) {
        onMonitorCreate(data);
        // Parent will navigate to the new monitor
      }
    },
    [viewMode, onMonitorUpdate, onMonitorCreate, router]
  );

  const handleTogglePause = (monitor: Monitor) => {
    if (onMonitorUpdate) {
      onMonitorUpdate(monitor.id, {
        status: monitor.status === "paused" ? "up" : "paused",
      });
    }
  };

  const handleDeleteClick = useCallback((monitor: Monitor) => {
    setMonitorToDelete(monitor);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (monitorToDelete) {
      onMonitorDelete?.(monitorToDelete.id);
      if (selectedMonitorId === monitorToDelete.id) {
        onSelectMonitor(null);
      }
    }
    setDeleteDialogOpen(false);
    setMonitorToDelete(null);
  }, [monitorToDelete, selectedMonitorId, onSelectMonitor, onMonitorDelete]);

  // Determine what to show in the right panel
  const showEditPanel = viewMode === "edit" || viewMode === "create";

  return (
    <div className={cn("flex h-[calc(100vh-220px)] min-h-[400px] gap-4", className)}>
      {/* Left Panel - Floating Monitor List */}
      <div
        className={cn(
          "overflow-hidden",
          "w-full lg:w-[400px] lg:shrink-0",
          // Floating card style
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          (selectedMonitorId || showEditPanel) && "hidden lg:block"
        )}
      >
        <MonitorListPanel
          monitors={monitors}
          serviceGroups={serviceGroups}
          selectedMonitorId={selectedMonitorId}
          onSelectMonitor={onSelectMonitor}
          onServiceGroupsChange={onServiceGroupsChange}
          className="h-full"
        />
      </div>

      {/* Right Panel - Monitor Details or Edit Panel */}
      <div
        className={cn(
          "flex-1",
          // Matching floating style
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          !selectedMonitorId && !showEditPanel && "hidden lg:flex"
        )}
      >
        {showEditPanel ? (
          <MonitorEditPanel
            monitor={viewMode === "edit" ? selectedMonitor ?? undefined : undefined}
            onSave={handleSaveMonitor}
            onCancel={handleCancelEdit}
            className="w-full"
          />
        ) : (
          <MonitorDetailPanel
            monitor={selectedMonitor}
            onBack={handleBack}
            onEdit={handleEdit}
            onTogglePause={handleTogglePause}
            onDelete={handleDeleteClick}
            className="w-full"
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setMonitorToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Monitor löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du &quot;{monitorToDelete?.name}&quot; wirklich löschen?
              Alle zugehörigen Daten und Statistiken werden unwiderruflich entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
