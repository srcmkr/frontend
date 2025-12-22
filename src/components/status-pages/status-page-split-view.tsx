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
import type { StatusPage, Monitor, StatusPageFormData } from "@/types";

type ViewMode = "view" | "edit" | "create";

interface StatusPageSplitViewProps {
  statusPages: StatusPage[];
  monitors: Monitor[];
  selectedPageId: string | null;
  onSelectPage: (id: string | null) => void;
  onCreate?: (data: StatusPageFormData) => void;
  onUpdate?: (id: string, data: Partial<StatusPage>) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function StatusPageSplitView({
  statusPages,
  monitors,
  selectedPageId,
  onSelectPage,
  onCreate,
  onUpdate,
  onDelete,
  className,
}: StatusPageSplitViewProps) {
  const t = useTranslations("statusPages");
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const handleCreate = useCallback(() => {
    router.push("/status-pages?mode=create", { scroll: false });
  }, [router]);

  const handleCancelEdit = useCallback(() => {
    if (selectedPageId) {
      router.push(`/status-pages?id=${selectedPageId}`, { scroll: false });
    } else {
      router.push("/status-pages", { scroll: false });
    }
  }, [router, selectedPageId]);

  const handleSave = useCallback(
    async (data: StatusPageFormData) => {
      if (viewMode === "edit" && selectedPage) {
        // Update existing
        onUpdate?.(selectedPage.id, data);
        router.push(`/status-pages?id=${selectedPage.id}`, { scroll: false });
      } else if (viewMode === "create") {
        // Create new
        onCreate?.(data);
        // The parent will navigate to the new page after creation
      }
    },
    [viewMode, selectedPage, onCreate, onUpdate, router]
  );

  const handleDeleteClick = useCallback((statusPage: StatusPage) => {
    setPageToDelete(statusPage);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pageToDelete) {
      onDelete?.(pageToDelete.id);
      if (selectedPageId === pageToDelete.id) {
        onSelectPage(null);
      }
    }
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  }, [pageToDelete, selectedPageId, onSelectPage, onDelete]);

  // Determine what to show in the right panel
  const showEditPanel = viewMode === "edit" || viewMode === "create";
  const showDetailPanel = viewMode === "view" && selectedPageId;
  const showEmptyState = viewMode === "view" && !selectedPageId;

  return (
    <div className={cn("flex h-[calc(100vh-220px)] min-h-[400px] gap-4", className)}>
      {/* Left Panel - Floating Status Page List */}
      <div
        className={cn(
          "overflow-hidden",
          "w-full lg:w-[400px] lg:shrink-0",
          // Floating card style
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
          // Matching floating style
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
