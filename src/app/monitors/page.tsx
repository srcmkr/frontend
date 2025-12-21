"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonitorSplitView } from "@/components/monitors/monitor-split-view";
import { getMockMonitors, updateMockMonitor, createMockMonitor, deleteMockMonitor, mockServiceGroups, generateMockUptimeHistory } from "@/mocks/monitors";
import type { Monitor } from "@/types";

export default function MonitorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedMonitorId = searchParams.get("id");

  // Service groups state (TODO: Replace with React Query mutation)
  const [serviceGroups, setServiceGroups] = useState(mockServiceGroups);

  // Monitors state with uptime history (TODO: Replace with React Query)
  const [monitors, setMonitors] = useState<Monitor[]>(() =>
    getMockMonitors().map((m) => ({
      ...m,
      uptimeHistory: generateMockUptimeHistory(m.uptime24h),
    }))
  );

  // Handle creating new monitor
  const handleCreateClick = useCallback(() => {
    router.push("/monitors?mode=create", { scroll: false });
  }, [router]);

  // Handle monitor creation
  const handleMonitorCreate = useCallback(
    (data: Partial<Monitor>) => {
      const newMonitor = createMockMonitor(data);
      setMonitors((prev) => [
        ...prev,
        { ...newMonitor, uptimeHistory: generateMockUptimeHistory(100) },
      ]);
      router.push(`/monitors?id=${newMonitor.id}`, { scroll: false });
    },
    [router]
  );

  // Handle monitor updates
  const handleMonitorUpdate = useCallback(
    (monitorId: string, updates: Partial<Monitor>) => {
      const updated = updateMockMonitor(monitorId, updates);
      if (updated) {
        setMonitors((prev) =>
          prev.map((m) =>
            m.id === monitorId
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          )
        );
      }
    },
    []
  );

  // Handle monitor deletion
  const handleMonitorDelete = useCallback(
    (monitorId: string) => {
      deleteMockMonitor(monitorId);
      setMonitors((prev) => prev.filter((m) => m.id !== monitorId));
      if (selectedMonitorId === monitorId) {
        router.push("/monitors", { scroll: false });
      }
    },
    [selectedMonitorId, router]
  );

  const handleSelectMonitor = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/monitors?id=${id}`, { scroll: false });
      } else {
        router.push("/monitors", { scroll: false });
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitors</h1>
          <p className="text-muted-foreground">
            Überwachung aller Services
          </p>
        </div>
        <Button onClick={handleCreateClick} className="uppercase tracking-wide">
          <Plus className="h-4 w-4 mr-1" />
          Monitor hinzufügen
        </Button>
      </div>

      {/* Split View */}
      <MonitorSplitView
        monitors={monitors}
        serviceGroups={serviceGroups}
        selectedMonitorId={selectedMonitorId}
        onSelectMonitor={handleSelectMonitor}
        onServiceGroupsChange={setServiceGroups}
        onMonitorUpdate={handleMonitorUpdate}
        onMonitorCreate={handleMonitorCreate}
        onMonitorDelete={handleMonitorDelete}
      />
    </div>
  );
}
