"use client";

import { useState, useCallback, useEffect } from "react";
import { Download, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SLAReportPeriodSelector } from "./sla-report-period-selector";
import { SLAReportContent } from "./sla-report-content";
import { useReportPeriods, useSLAReport } from "@/features/reports";
import type { Monitor, ReportPeriod, ReportPeriodType } from "@/types";

interface SLAReportDialogProps {
  monitor: Monitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SLAReportDialog({
  monitor,
  open,
  onOpenChange,
}: SLAReportDialogProps) {
  // Period selection state
  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod | null>(null);

  // SLA target state - initialize from monitor config
  const [slaTarget, setSlaTarget] = useState(monitor.slaTarget);
  const [maxResponseTime, setMaxResponseTime] = useState(monitor.maxResponseTime);

  // PDF export state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch available periods using React Query
  const { data: periods = [] } = useReportPeriods(periodType);

  // Set initial period when periods are loaded
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0]);
    }
  }, [periods, selectedPeriod]);

  // Reset selected period when period type changes
  useEffect(() => {
    if (periods.length > 0) {
      setSelectedPeriod(periods[0]);
    }
  }, [periodType, periods]);

  // Fetch SLA report using React Query
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useSLAReport(monitor.id, selectedPeriod, slaTarget, maxResponseTime);

  // Handle period type change
  const handlePeriodTypeChange = useCallback((type: ReportPeriodType) => {
    setPeriodType(type);
    setSelectedPeriod(null);
  }, []);

  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    if (!report) return;

    setIsExporting(true);

    try {
      // Dynamic import for PDF generation
      const { pdf } = await import("@react-pdf/renderer");
      const { SLAReportPDF } = await import("./pdf/sla-report-pdf");

      const blob = await pdf(<SLAReportPDF report={report} />).toBlob();
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `SLA-Report_${monitor.name}_${selectedPeriod?.label.replace(/\s/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
      // Fallback: show error message
      alert("PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsExporting(false);
    }
  }, [report, monitor.name, selectedPeriod?.label]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle className="text-xl">SLA Report</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {monitor.name}
          </p>
        </DialogHeader>

        {/* Toolbar with period selector, SLA target, and export */}
        <div className="shrink-0 flex flex-wrap items-center gap-3 pb-4 border-b">
          {/* Period Selector */}
          <SLAReportPeriodSelector
            periodType={periodType}
            onPeriodTypeChange={handlePeriodTypeChange}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* SLA Target Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                SLA: {slaTarget}% / {maxResponseTime}ms
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                {/* Availability Target */}
                <div className="space-y-2">
                  <Label htmlFor="sla-target">SLA-Ziel Verfügbarkeit (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sla-target"
                      type="number"
                      min="90"
                      max="100"
                      step="0.01"
                      value={slaTarget}
                      onChange={(e) => setSlaTarget(parseFloat(e.target.value) || 99.9)}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[99.9, 99.95, 99.99].map((target) => (
                      <Button
                        key={target}
                        variant="outline"
                        size="sm"
                        onClick={() => setSlaTarget(target)}
                        className={cn(
                          "text-xs",
                          slaTarget === target && "bg-primary text-primary-foreground"
                        )}
                      >
                        {target}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Response Time Target */}
                <div className="space-y-2">
                  <Label htmlFor="max-response">Max. Antwortzeit (ms)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="max-response"
                      type="number"
                      min="50"
                      max="10000"
                      step="50"
                      value={maxResponseTime}
                      onChange={(e) => setMaxResponseTime(parseInt(e.target.value) || 500)}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[200, 500, 1000, 2000].map((target) => (
                      <Button
                        key={target}
                        variant="outline"
                        size="sm"
                        onClick={() => setMaxResponseTime(target)}
                        className={cn(
                          "text-xs",
                          maxResponseTime === target && "bg-primary text-primary-foreground"
                        )}
                      >
                        {target}ms
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export PDF Button */}
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting || !report || reportLoading}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportiere...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </>
            )}
          </Button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {reportLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
          ) : reportError ? (
            <div className="flex items-center justify-center h-40 text-destructive">
              Fehler beim Laden des Reports: {reportError.message}
            </div>
          ) : report ? (
            <SLAReportContent report={report} />
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Wählen Sie einen Zeitraum aus
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-3 border-t text-xs text-muted-foreground text-center">
          Report generiert am{" "}
          {new Date().toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
