"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
import { StatusPageListPanel } from "./status-page-list-panel";
import { StatusPageDetailPanel } from "./status-page-detail-panel";
import { StatusPageEditPanel } from "./status-page-edit-panel";
import { useStatusPageActions } from "@/features/status-pages/hooks/use-status-page-actions";
import type { StatusPage, Monitor, StatusPageFormData } from "@/types";

type ViewMode = "view" | "edit" | "create";

interface StatusPageSplitViewProps {
  /** List of status pages to display */
  statusPages: StatusPage[];
  /** Available monitors for status page forms */
  monitors: Monitor[];
  /** Currently selected status page ID */
  selectedPageId: string | null;
  /** Callback when status page selection changes */
  onSelectPage: (id: string | null) => void;
  className?: string;
}

export function StatusPageSplitView({
  statusPages,
  monitors,
  selectedPageId,
  onSelectPage,
  className,
}: StatusPageSplitViewProps) {
  const t = useTranslations("statusPages");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Action hook - handles mutations directly, no callbacks needed
  const { createStatusPage, updateStatusPage, deleteStatusPage, isPending } =
    useStatusPageActions();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<StatusPage | null>(null);

  // Handle URL params for create/edit mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "create") {
      setViewMode("create");
    } else if (mode === "edit" && selectedPageId) {
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  }, [searchParams, selectedPageId]);

  const selectedPage = useMemo(
    () => statusPages.find((sp) => sp.id === selectedPageId) ?? null,
    [statusPages, selectedPageId]
  );

  const existingSlugs = useMemo(
    () => statusPages.filter((sp) => sp.id !== selectedPageId).map((sp) => sp.slug),
    [statusPages, selectedPageId]
  );

  const handleBack = () => {
    onSelectPage(null);
  };

  const handleEdit = useCallback(
    (statusPage: StatusPage) => {
      router.push(`/status-pages?id=${statusPage.id}&mode=edit`, { scroll: false });
    },
    [router]
  );

  const handleCancelEdit = useCallback(() => {
    if (selectedPageId) {
      router.push(`/status-pages?id=${selectedPageId}`, { scroll: false });
    } else {
      router.push("/status-pages", { scroll: false });
    }
  }, [router, selectedPageId]);

  const handleSave = useCallback(
    (data: StatusPageFormData) => {
      if (viewMode === "edit" && selectedPage) {
        // Update existing - hook handles the mutation
        updateStatusPage(selectedPage.id, data);
        router.push(`/status-pages?id=${selectedPage.id}`, { scroll: false });
      } else if (viewMode === "create") {
        // Create new - hook handles mutation and navigation
        createStatusPage(data);
      }
    },
    [viewMode, selectedPage, createStatusPage, updateStatusPage, router]
  );

  const handleDeleteClick = useCallback((statusPage: StatusPage) => {
    setPageToDelete(statusPage);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pageToDelete) {
      deleteStatusPage(pageToDelete.id, { currentId: selectedPageId });
      if (selectedPageId === pageToDelete.id) {
        onSelectPage(null);
      }
    }
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  }, [pageToDelete, selectedPageId, onSelectPage, deleteStatusPage]);

  // Determine what to show in the right panel
  const showEditPanel = viewMode === "edit" || viewMode === "create";

  return (
    <div className={cn("flex h-[calc(100vh-220px)] min-h-[400px] gap-4", className)}>
      {/* Left Panel - Floating Status Page List */}
      <div
        className={cn(
          "overflow-hidden",
          "w-full lg:w-[400px] lg:shrink-0",
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          (selectedPageId || showEditPanel) && "hidden lg:block"
        )}
      >
        <StatusPageListPanel
          statusPages={statusPages}
          selectedPageId={selectedPageId}
          onSelectPage={onSelectPage}
          className="h-full"
        />
      </div>

      {/* Right Panel - Status Page Details or Edit Panel */}
      <div
        className={cn(
          "flex-1",
          "rounded-2xl",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          !selectedPageId && !showEditPanel && "hidden lg:flex"
        )}
      >
        {showEditPanel ? (
          <StatusPageEditPanel
            statusPage={viewMode === "edit" ? selectedPage : null}
            monitors={monitors}
            existingSlugs={existingSlugs}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            className="w-full"
          />
        ) : (
          <StatusPageDetailPanel
            statusPage={selectedPage}
            monitors={monitors}
            onBack={handleBack}
            onEdit={handleEdit}
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
          if (!open) setPageToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t("dialogs.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.deleteDescription", {
                name: pageToDelete?.title ?? "",
                slug: pageToDelete?.slug ?? ""
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialogs.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending.delete}
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
