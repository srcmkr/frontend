"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitorSplitView } from "@/components/monitors/monitor-split-view";
import { useMonitors, useServiceGroups } from "@/features/monitors";

export default function MonitorsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("monitors");

  // Extract monitor ID from slug parameter
  // URL patterns: /monitors, /monitors/create, /monitors/[id]
  const slug = params.slug as string[] | undefined;
  const selectedMonitorId = slug?.[0] && slug[0] !== 'create' ? slug[0] : null;

  // Fetch monitors using React Query
  const {
    data: monitors = [],
    isLoading: monitorsLoading,
    error: monitorsError,
  } = useMonitors();

  // Fetch service groups using React Query
  const { data: serviceGroups = [] } = useServiceGroups();

  // Handle creating new monitor
  const handleCreateClick = useCallback(() => {
    router.push("/monitors/create", { scroll: false });
  }, [router]);

  const handleSelectMonitor = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/monitors/${id}`, { scroll: false });
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
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("addMonitor")}
        </Button>
      </div>

      {/* Split View - mutations handled internally via hooks */}
      <MonitorSplitView
        monitors={monitors}
        serviceGroups={serviceGroups}
        selectedMonitorId={selectedMonitorId}
        onSelectMonitor={handleSelectMonitor}
      />
    </div>
  );
}
