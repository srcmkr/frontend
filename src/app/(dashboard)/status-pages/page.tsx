"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPageSplitView } from "@/components/status-pages/status-page-split-view";
import {
  getStatusPages,
  createStatusPage,
  updateStatusPage,
  deleteStatusPage,
} from "@/mocks/status-pages";
import { getMockMonitors, generateMockUptimeHistory } from "@/mocks/monitors";
import type { StatusPage, StatusPageFormData, Monitor } from "@/types";

export default function StatusPagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedPageId = searchParams.get("id");

  // Status pages state (TODO: Replace with React Query)
  const [statusPages, setStatusPages] = useState<StatusPage[]>(() =>
    getStatusPages()
  );

  // Monitors for displaying in detail panel
  const [monitors] = useState<Monitor[]>(() =>
    getMockMonitors().map((m) => ({
      ...m,
      uptimeHistory: generateMockUptimeHistory(m.uptime24h),
    }))
  );

  // Handle status page selection
  const handleSelectPage = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/status-pages?id=${id}`, { scroll: false });
      } else {
        router.push("/status-pages", { scroll: false });
      }
    },
    [router]
  );

  // Handle create
  const handleCreate = useCallback((data: StatusPageFormData) => {
    const newPage = createStatusPage(data);
    setStatusPages(getStatusPages());
    // Select the new page
    router.push(`/status-pages?id=${newPage.id}`, { scroll: false });
  }, [router]);

  // Handle update
  const handleUpdate = useCallback(
    (id: string, data: Partial<StatusPage>) => {
      updateStatusPage(id, data);
      setStatusPages(getStatusPages());
    },
    []
  );

  // Handle delete
  const handleDelete = useCallback((id: string) => {
    deleteStatusPage(id);
    setStatusPages(getStatusPages());
  }, []);

  // Trigger create mode from header button
  const handleCreateClick = useCallback(() => {
    router.push("/status-pages?mode=create", { scroll: false });
  }, [router]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statusseiten</h1>
          <p className="text-muted-foreground">
            Öffentliche und private Statusseiten verwalten
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="uppercase tracking-wide"
        >
          <Plus className="h-4 w-4 mr-1" />
          Statusseite erstellen
        </Button>
      </div>

      {/* Split View */}
      <StatusPageSplitView
        statusPages={statusPages}
        monitors={monitors}
        selectedPageId={selectedPageId}
        onSelectPage={handleSelectPage}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
