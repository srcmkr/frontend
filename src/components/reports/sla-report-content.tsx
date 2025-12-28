"use client";

import { Separator } from "@/components/ui/separator";
import { ExecutiveSummary } from "./sections/executive-summary";
import { AvailabilitySection } from "./sections/availability-section";
import { PerformanceSection } from "./sections/performance-section";
import { IncidentSection } from "./sections/incident-section";
import { CheckStatisticsSection } from "./sections/check-statistics-section";
import { TechnicalDetailsSection } from "./sections/technical-details-section";
import type { SLAReport } from "@/types";

interface SLAReportContentProps {
  report: SLAReport;
}

export function SLAReportContent({ report }: SLAReportContentProps) {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <ExecutiveSummary data={report.executiveSummary} />

      <Separator />

      {/* Availability */}
      <AvailabilitySection
        data={report.availability}
        period={report.period}
        slaTarget={report.slaTarget}
      />

      <Separator />

      {/* Performance */}
      <PerformanceSection data={report.performance} />

      <Separator />

      {/* Incidents */}
      <IncidentSection data={report.incidents} />

      <Separator />

      {/* Check Statistics */}
      <CheckStatisticsSection data={report.checks} />

      <Separator />

      {/* Technical Details */}
      <TechnicalDetailsSection data={report.technical} />
    </div>
  );
}
