"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusIndicator } from "./status-indicator";
import { formatResponseTime } from "@/lib/format-utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CheckResult } from "@/types";

// Separate type for detailed check data (loaded on demand)
export interface CheckDetails {
  dnsTime?: number;
  tcpTime?: number;
  tlsTime?: number;
  ttfb?: number;
  transferTime?: number;
  ipAddress?: string;
  tlsVersion?: string;
  certificateExpiry?: string;
  headers?: Record<string, string>;
}

// Basic check info that's always loaded
export interface BasicCheckResult {
  id: string;
  monitorId: string;
  status: "up" | "down";
  responseTime: number;
  statusCode?: number;
  message?: string;
  checkedAt: string;
}

interface MonitorRecentChecksProps {
  checks: BasicCheckResult[];
  onLoadDetails?: (checkId: string) => Promise<CheckDetails>;
  className?: string;
}

type StatusFilter = "all" | "up" | "down";

const PAGE_SIZE = 20;

export function MonitorRecentChecks({
  checks,
  onLoadDetails,
  className,
}: MonitorRecentChecksProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCheck, setSelectedCheck] = useState<BasicCheckResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsCache, setDetailsCache] = useState<Record<string, CheckDetails>>({});

  // Filter and sort checks (newest first)
  const filteredChecks = useMemo(() => {
    const sorted = [...checks].sort(
      (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    );

    if (statusFilter === "all") return sorted;
    return sorted.filter((check) => check.status === statusFilter);
  }, [checks, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredChecks.length / PAGE_SIZE);
  const paginatedChecks = filteredChecks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Counts for filter badges
  const upCount = checks.filter((c) => c.status === "up").length;
  const downCount = checks.filter((c) => c.status === "down").length;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const formatShortDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
      time: date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const formatCertExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysLeft} Tage`;
  };

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle click to open modal with lazy loading
  const handleCheckClick = async (check: BasicCheckResult) => {
    setSelectedCheck(check);

    // Load details if not cached and callback provided
    if (onLoadDetails && !detailsCache[check.id]) {
      setLoadingDetails(true);
      try {
        const details = await onLoadDetails(check.id);
        setDetailsCache((prev) => ({ ...prev, [check.id]: details }));
      } catch (error) {
        console.error("Failed to load check details:", error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedCheck(null);
  };

  const selectedDetails = selectedCheck ? detailsCache[selectedCheck.id] : null;

  if (checks.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="font-semibold text-sm">Check-Verlauf</h3>
        <p className="text-sm text-muted-foreground">Keine Checks vorhanden</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-sm">Check-Verlauf</h3>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Alle ({checks.length})
            </SelectItem>
            <SelectItem value="up">
              Erfolgreich ({upCount})
            </SelectItem>
            <SelectItem value="down">
              Fehlgeschlagen ({downCount})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Check list */}
      <div className="space-y-1">
        {paginatedChecks.map((check) => {
          const { date, time } = formatShortDateTime(check.checkedAt);

          return (
            <button
              key={check.id}
              onClick={() => handleCheckClick(check)}
              className={cn(
                "w-full flex items-center gap-3 py-2 px-2 text-sm rounded-md transition-colors",
                "hover:bg-muted/50 cursor-pointer"
              )}
            >
              {/* Date/Time */}
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs shrink-0">
                <span className="w-12">{date}</span>
                <span className="w-16">{time}</span>
              </div>

              {/* Status */}
              <StatusIndicator
                status={check.status === "up" ? "up" : "down"}
                size="sm"
              />

              {/* Response time */}
              <span
                className={cn(
                  "font-mono text-xs w-14 text-right",
                  check.status === "down" ? "text-red-600" : "text-muted-foreground"
                )}
              >
                {formatResponseTime(check.responseTime)}
              </span>

              {/* Status code + message */}
              <span
                className={cn(
                  "text-xs flex-1 text-left truncate",
                  check.status === "down" ? "text-red-600" : "text-muted-foreground"
                )}
              >
                {check.statusCode} {check.message}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {(currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredChecks.length)} von{" "}
            {filteredChecks.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedCheck} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusIndicator
                status={selectedCheck?.status === "up" ? "up" : "down"}
                size="sm"
              />
              Check Details
            </DialogTitle>
          </DialogHeader>

          {selectedCheck && (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Zeitpunkt</span>
                  <span className="font-mono">
                    {formatDateTime(selectedCheck.checkedAt).date}{" "}
                    {formatDateTime(selectedCheck.checkedAt).time}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Status</span>
                  <span className={cn(
                    "font-medium",
                    selectedCheck.status === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {selectedCheck.statusCode} {selectedCheck.message}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Response Time</span>
                  <span className="font-mono">
                    {formatResponseTime(selectedCheck.responseTime)}
                  </span>
                </div>
              </div>

              {/* Loading state */}
              {loadingDetails && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Lade Details...
                </div>
              )}

              {/* Details loaded */}
              {!loadingDetails && selectedDetails && (
                <>
                  {/* Timing breakdown */}
                  {selectedCheck.status === "up" && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Timing Breakdown
                      </h4>
                      <div className="space-y-1.5">
                        <TimingBar
                          label="DNS Lookup"
                          value={selectedDetails.dnsTime}
                          total={selectedCheck.responseTime}
                          color="bg-blue-500"
                        />
                        <TimingBar
                          label="TCP Connect"
                          value={selectedDetails.tcpTime}
                          total={selectedCheck.responseTime}
                          color="bg-green-500"
                        />
                        <TimingBar
                          label="TLS Handshake"
                          value={selectedDetails.tlsTime}
                          total={selectedCheck.responseTime}
                          color="bg-purple-500"
                        />
                        <TimingBar
                          label="Time to First Byte"
                          value={selectedDetails.ttfb}
                          total={selectedCheck.responseTime}
                          color="bg-orange-500"
                        />
                        <TimingBar
                          label="Content Transfer"
                          value={selectedDetails.transferTime}
                          total={selectedCheck.responseTime}
                          color="bg-cyan-500"
                        />
                        <div className="flex items-center justify-between text-sm pt-1 border-t">
                          <span className="font-medium">Total</span>
                          <span className="font-mono font-semibold">
                            {selectedCheck.responseTime}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Connection details */}
                  {(selectedDetails.ipAddress || selectedDetails.tlsVersion || selectedDetails.certificateExpiry) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Verbindung
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDetails.ipAddress && (
                          <div>
                            <span className="text-muted-foreground block text-xs">IP-Adresse</span>
                            <span className="font-mono">{selectedDetails.ipAddress}</span>
                          </div>
                        )}
                        {selectedDetails.tlsVersion && (
                          <div>
                            <span className="text-muted-foreground block text-xs">TLS Version</span>
                            <span className="font-mono">{selectedDetails.tlsVersion}</span>
                          </div>
                        )}
                        {selectedDetails.certificateExpiry && (
                          <div>
                            <span className="text-muted-foreground block text-xs">Zertifikat läuft ab</span>
                            <span className="font-mono">
                              in {formatCertExpiry(selectedDetails.certificateExpiry)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* No details available */}
              {!loadingDetails && !selectedDetails && !onLoadDetails && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Keine weiteren Details verfügbar
                </div>
              )}

              {/* Error details for failed checks */}
              {selectedCheck.status === "down" && selectedCheck.message && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-md p-3 text-sm">
                  <span className="font-medium">Fehler: </span>
                  {selectedCheck.message}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Timing bar component for visual breakdown
function TimingBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value?: number;
  total: number;
  color: string;
}) {
  if (value === undefined) return null;

  const percentage = Math.min((value / total) * 100, 100);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}ms</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
