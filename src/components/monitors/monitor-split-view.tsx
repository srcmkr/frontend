"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
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
import { MonitorListPanel } from "./monitor-list-panel";
import { MonitorDetailPanel } from "./monitor-detail-panel";
import { MonitorEditPanel } from "./monitor-edit-panel";
import { useMonitorActions } from "@/features/monitors/hooks/use-monitor-actions";
import type { Monitor, ServiceGroup } from "@/types";
import type { CreateMonitorInput } from "@/features/monitors";

type ViewMode = "view" | "edit" | "create";

interface MonitorSplitViewProps {
  /** List of monitors to display */
  monitors: Monitor[];
  /** Service groups for tree organization */
  serviceGroups: ServiceGroup[];
  /** Currently selected monitor ID */
  selectedMonitorId: string | null;
  /** Callback when monitor selection changes */
  onSelectMonitor: (id: string | null) => void;
  className?: string;
}

export function MonitorSplitView({
  monitors,
  serviceGroups,
  selectedMonitorId,
  onSelectMonitor,
  className,
}: MonitorSplitViewProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("monitors.dialogs");

  // Action hook - handles mutations directly, no callbacks needed
  const { createMonitor, updateMonitor, deleteMonitor, togglePause, updateServiceGroups, isPending } =
    useMonitorActions();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  // Handle URL params for create/edit mode
  useEffect(() => {
    const slug = params.slug as string[] | undefined;
    const mode = searchParams.get("mode");

    // Check if we're in create mode (/monitors/create)
    if (slug?.[0] === "create") {
      setViewMode("create");
    } else if (mode === "edit" && selectedMonitorId) {
      // Edit mode via query parameter (/monitors/[id]?mode=edit)
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  }, [params, searchParams, selectedMonitorId]);

  const selectedMonitor = useMemo(
    () => monitors.find((m) => m.id === selectedMonitorId) ?? null,
    [monitors, selectedMonitorId]
  );

  const handleBack = () => {
    onSelectMonitor(null);
  };

  const handleEdit = useCallback(
    (monitor: Monitor) => {
      router.push(`/monitors/${monitor.id}?mode=edit`, { scroll: false });
    },
    [router]
  );

  const handleCancelEdit = useCallback(() => {
    if (selectedMonitorId) {
      router.push(`/monitors/${selectedMonitorId}`, { scroll: false });
    } else {
      router.push("/monitors", { scroll: false });
    }
  }, [router, selectedMonitorId]);

  const handleSaveMonitor = useCallback(
    (monitorId: string | null, data: Partial<Monitor>) => {
      if (viewMode === "edit" && monitorId) {
        updateMonitor(monitorId, data);
        router.push(`/monitors/${monitorId}`, { scroll: false });
      } else if (viewMode === "create") {
        createMonitor(data as CreateMonitorInput);
      }
    },
    [viewMode, updateMonitor, createMonitor, router]
  );

  const handleTogglePause = useCallback(
    (monitor: Monitor) => {
      togglePause(monitor.id, monitor.status !== "paused");
    },
    [togglePause]
  );

  const handleDeleteClick = useCallback((monitor: Monitor) => {
    setMonitorToDelete(monitor);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (monitorToDelete) {
      deleteMonitor(monitorToDelete.id, { currentId: selectedMonitorId });
      if (selectedMonitorId === monitorToDelete.id) {
        onSelectMonitor(null);
      }
    }
    setDeleteDialogOpen(false);
    setMonitorToDelete(null);
  }, [monitorToDelete, selectedMonitorId, onSelectMonitor, deleteMonitor]);

  // Determine what to show in the right panel
  const showEditPanel = viewMode === "edit" || viewMode === "create";

  return (
    <div className={cn("flex h-[calc(100vh-220px)] min-h-[400px] gap-4", className)}>
      {/* Left Panel - Floating Monitor List */}
      <div
        className={cn(
          "overflow-hidden",
          "w-full lg:w-[400px] lg:shrink-0",
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
          onServiceGroupsChange={updateServiceGroups}
          className="h-full"
        />
      </div>

      {/* Right Panel - Monitor Details or Edit Panel */}
      <div
        className={cn(
          "flex-1",
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
              {t("deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: monitorToDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending.delete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
