"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitorSplitView } from "@/components/monitors/monitor-split-view";
import {
  useMonitors,
  useServiceGroups,
  useCreateMonitor,
  useUpdateMonitor,
  useDeleteMonitor,
  useUpdateServiceGroups,
} from "@/features/monitors";
import type { Monitor, ServiceGroup } from "@/types";

export default function MonitorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("monitors");

  const selectedMonitorId = searchParams.get("id");

  // Fetch monitors using React Query
  const {
    data: monitors = [],
    isLoading: monitorsLoading,
    error: monitorsError,
  } = useMonitors();

  // Fetch service groups using React Query
  const { data: serviceGroups = [] } = useServiceGroups();

  // Mutations
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();
  const deleteMonitor = useDeleteMonitor();
  const updateServiceGroups = useUpdateServiceGroups();

  // Handle creating new monitor
  const handleCreateClick = useCallback(() => {
    router.push("/monitors?mode=create", { scroll: false });
  }, [router]);

  // Handle monitor creation
  const handleMonitorCreate = useCallback(
    (data: Partial<Monitor>) => {
      createMonitor.mutate(data as Parameters<typeof createMonitor.mutate>[0], {
        onSuccess: (newMonitor) => {
          router.push(`/monitors?id=${newMonitor.id}`, { scroll: false });
        },
      });
    },
    [createMonitor, router]
  );

  // Handle monitor updates
  const handleMonitorUpdate = useCallback(
    (monitorId: string, updates: Partial<Monitor>) => {
      updateMonitor.mutate({ id: monitorId, data: updates });
    },
    [updateMonitor]
  );

  // Handle monitor deletion
  const handleMonitorDelete = useCallback(
    (monitorId: string) => {
      deleteMonitor.mutate(monitorId, {
        onSuccess: () => {
          if (selectedMonitorId === monitorId) {
            router.push("/monitors", { scroll: false });
          }
        },
      });
    },
    [deleteMonitor, selectedMonitorId, router]
  );

  // Handle service groups change (persisted via mutation)
  const handleServiceGroupsChange = useCallback(
    (groups: ServiceGroup[]) => {
      updateServiceGroups.mutate(groups);
    },
    [updateServiceGroups]
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

  // Loading state
  if (monitorsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex h-[calc(100vh-220px)] min-h-[400px] gap-4">
          <Skeleton className="w-full lg:w-[400px] lg:shrink-0 rounded-2xl" />
          <Skeleton className="flex-1 rounded-2xl hidden lg:block" />
        </div>
      </div>
    );
  }

  // Error handling is done by error.tsx - throw to trigger error boundary
  if (monitorsError) {
    throw monitorsError;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="uppercase tracking-wide"
          disabled={createMonitor.isPending}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("addMonitor")}
        </Button>
      </div>

      {/* Split View */}
      <MonitorSplitView
        monitors={monitors}
        serviceGroups={serviceGroups}
        selectedMonitorId={selectedMonitorId}
        onSelectMonitor={handleSelectMonitor}
        onServiceGroupsChange={handleServiceGroupsChange}
        onMonitorUpdate={handleMonitorUpdate}
        onMonitorCreate={handleMonitorCreate}
        onMonitorDelete={handleMonitorDelete}
      />
    </div>
  );
}
