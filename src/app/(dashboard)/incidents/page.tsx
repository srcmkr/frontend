"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, AlertTriangle, Wrench, Megaphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IncidentSplitView } from "@/components/incidents/incident-split-view";
import { useIncidents } from "@/features/incidents";
import { useMonitors } from "@/features/monitors";

export default function IncidentsPage() {
  const t = useTranslations("incidents");
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedIncidentId = searchParams.get("id");

  // Fetch incidents using React Query
  const {
    data: incidents = [],
    isLoading: incidentsLoading,
    error: incidentsError,
  } = useIncidents();

  // Fetch monitors (read-only, for monitor selector in forms)
  const { data: monitors = [] } = useMonitors();

  // Handlers for creating different incident types from dropdown (via URL)
  const handleCreateIncident = useCallback(() => {
    router.push("/incidents?mode=create&type=incident", { scroll: false });
  }, [router]);

  const handleCreateMaintenance = useCallback(() => {
    router.push("/incidents?mode=create&type=maintenance", { scroll: false });
  }, [router]);

  const handleCreateAnnouncement = useCallback(() => {
    router.push("/incidents?mode=create&type=announcement", { scroll: false });
  }, [router]);

  const handleCreateHistorical = useCallback(() => {
    router.push("/incidents?mode=create&type=incident&historical=true", { scroll: false });
  }, [router]);

  // Handle selecting an incident
  const handleSelectIncident = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/incidents?id=${id}`, { scroll: false });
      } else {
        router.push("/incidents", { scroll: false });
      }
    },
    [router]
  );

  // Loading state
  if (incidentsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
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
  if (incidentsError) {
    throw incidentsError;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="uppercase tracking-wide">
              <Plus className="h-4 w-4 mr-1" />
              {t("createIncident")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCreateIncident}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("createOptions.incident")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateMaintenance}>
              <Wrench className="h-4 w-4 mr-2" />
              {t("createOptions.maintenance")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateAnnouncement}>
              <Megaphone className="h-4 w-4 mr-2" />
              {t("createOptions.announcement")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateHistorical}>
              <Clock className="h-4 w-4 mr-2" />
              {t("createOptions.historical")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Split View - mutations handled internally via hooks */}
      <IncidentSplitView
        incidents={incidents}
        monitors={monitors}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={handleSelectIncident}
      />
    </div>
  );
}
