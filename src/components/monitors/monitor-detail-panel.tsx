"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MonitorDetailHeader } from "./monitor-detail-header";
import { MonitorUptimeStats } from "./monitor-uptime-stats";
import { MonitorRecentChecks } from "./monitor-recent-checks";
import { ResponseTimeChart } from "./response-time-chart";
import { SLAReportDialog } from "@/components/reports";
import { useMonitorCheckResults } from "@/features/monitors/api/queries";
import type { Monitor } from "@/types";

interface MonitorDetailPanelProps {
  monitor: Monitor | null;
  onBack?: () => void;
  onEdit?: (monitor: Monitor) => void;
  onTogglePause?: (monitor: Monitor) => void;
  onDelete?: (monitor: Monitor) => void;
  className?: string;
}

export function MonitorDetailPanel({
  monitor,
  onBack,
  onEdit,
  onTogglePause,
  onDelete,
  className,
}: MonitorDetailPanelProps) {
  const t = useTranslations("monitors");
  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Fetch check results from API
  const { data: checkResults = [] } = useMonitorCheckResults(monitor?.id ?? null, 24);

  // Load check details from the checkResults array
  const handleLoadDetails = useCallback(
    async (checkId: string) => {
      const check = checkResults.find((c) => c.id === checkId);
      return check ?? null;
    },
    [checkResults]
  );

  // Open report dialog
  const handleGenerateReport = useCallback(() => {
    setReportDialogOpen(true);
  }, []);

  if (!monitor) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-muted-foreground",
          className
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium">{t("detail.noMonitorSelected")}</p>
          <p className="text-sm mt-1">{t("detail.selectFromList")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full overflow-y-auto p-4 lg:p-6", className)}>
      <div className="space-y-6">
        {/* Header with actions menu */}
        <MonitorDetailHeader
          monitor={monitor}
          onBack={onBack}
          onEdit={() => onEdit?.(monitor)}
          onTogglePause={() => onTogglePause?.(monitor)}
          onDelete={() => onDelete?.(monitor)}
          onGenerateReport={handleGenerateReport}
        />

        {/* SLA Report Dialog */}
        <SLAReportDialog
          monitor={monitor}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />

        <Separator />

        {/* Response Time Chart */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-3">
              {t("detail.responseTime")}
            </h3>
            <ResponseTimeChart checks={checkResults} />
          </CardContent>
        </Card>

        {/* Uptime Stats */}
        <Card>
          <CardContent className="pt-4">
            <MonitorUptimeStats monitor={monitor} />
          </CardContent>
        </Card>

        {/* Recent Checks */}
        <Card>
          <CardContent className="pt-4">
            <MonitorRecentChecks
              checks={checkResults}
              onLoadDetails={handleLoadDetails}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
