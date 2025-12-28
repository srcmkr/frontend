"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { StatusIndicator } from "./status-indicator";
import { formatResponseTime } from "@/lib/format-utils";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import type { CheckResult } from "@/types";
import { useDeleteCheck } from "@/features/monitors/api/mutations";

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
  const t = useTranslations("monitors.detail");
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCheck, setSelectedCheck] = useState<BasicCheckResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsCache, setDetailsCache] = useState<Record<string, CheckDetails>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkToDelete, setCheckToDelete] = useState<BasicCheckResult | null>(null);
  const deleteCheckMutation = useDeleteCheck();

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
      date: date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const formatShortDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
      }),
      time: date.toLocaleTimeString(locale, {
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
    return t("daysLeft", { days: daysLeft });
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

  const handleDeleteClick = (check: BasicCheckResult) => {
    setCheckToDelete(check);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (checkToDelete) {
      await deleteCheckMutation.mutateAsync({
        monitorId: checkToDelete.monitorId,
        checkId: checkToDelete.id,
      });
      setSelectedCheck(null);
      setDeleteDialogOpen(false);
      setCheckToDelete(null);
    }
  };

  const selectedDetails = selectedCheck ? detailsCache[selectedCheck.id] : null;

  if (checks.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="font-semibold text-sm">{t("checkHistory")}</h3>
        <p className="text-sm text-muted-foreground">{t("noChecks")}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-sm">{t("checkHistory")}</h3>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("all")} ({checks.length})
            </SelectItem>
            <SelectItem value="up">
              {t("successful")} ({upCount})
            </SelectItem>
            <SelectItem value="down">
              {t("failed")} ({downCount})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Check table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {t("date")}
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {t("time")}
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {t("status")}
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {t("responseTime")}
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">
                  {t("details")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedChecks.map((check, index) => {
                const { date, time } = formatShortDateTime(check.checkedAt);

                return (
                  <tr
                    key={check.id}
                    onClick={() => handleCheckClick(check)}
                    className={cn(
                      "border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors",
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {date}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {time}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIndicator
                          status={check.status === "up" ? "up" : "down"}
                          size="sm"
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          check.status === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {check.status === "up" ? t("successful") : t("failed")}
                        </span>
                      </div>
                    </td>
                    <td className={cn(
                      "px-4 py-3 text-sm font-mono text-right whitespace-nowrap",
                      check.status === "down" ? "text-red-600 dark:text-red-400 font-semibold" : "text-foreground"
                    )}>
                      {formatResponseTime(check.responseTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={cn(
                        "truncate max-w-[300px]",
                        check.status === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                      )}
                      title={check.message}
                      >
                        {check.statusCode && (
                          <span className="font-mono mr-2">{check.statusCode}</span>
                        )}
                        {check.message}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {(currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredChecks.length)} {t("of")}{" "}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusIndicator
                status={selectedCheck?.status === "up" ? "up" : "down"}
                size="sm"
              />
              {t("checkDetails")}
            </DialogTitle>
          </DialogHeader>

          {selectedCheck && (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">{t("timestamp")}</span>
                  <span className="font-mono">
                    {formatDateTime(selectedCheck.checkedAt).date}{" "}
                    {formatDateTime(selectedCheck.checkedAt).time}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">{t("status")}</span>
                  <span className={cn(
                    "font-medium break-words",
                    selectedCheck.status === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {selectedCheck.statusCode} {selectedCheck.message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-xs">{t("responseTime")}</span>
                    <span className="font-mono">
                      {formatResponseTime(selectedCheck.responseTime)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(selectedCheck)}
                    disabled={deleteCheckMutation.isPending}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    {t("delete")}
                  </button>
                </div>
              </div>

              {/* Loading state */}
              {loadingDetails && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("loadingDetails")}
                </div>
              )}

              {/* Details loaded */}
              {!loadingDetails && selectedDetails && (
                <>
                  {/* Timing breakdown */}
                  {selectedCheck.status === "up" && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("timingBreakdown")}
                      </h4>
                      <div className="space-y-1.5">
                        <TimingBar
                          label={t("dnsLookup")}
                          value={selectedDetails.dnsTime}
                          total={selectedCheck.responseTime}
                          color="bg-blue-500"
                        />
                        <TimingBar
                          label={t("tcpConnect")}
                          value={selectedDetails.tcpTime}
                          total={selectedCheck.responseTime}
                          color="bg-green-500"
                        />
                        <TimingBar
                          label={t("tlsHandshake")}
                          value={selectedDetails.tlsTime}
                          total={selectedCheck.responseTime}
                          color="bg-purple-500"
                        />
                        <TimingBar
                          label={t("ttfb")}
                          value={selectedDetails.ttfb}
                          total={selectedCheck.responseTime}
                          color="bg-orange-500"
                        />
                        <TimingBar
                          label={t("contentTransfer")}
                          value={selectedDetails.transferTime}
                          total={selectedCheck.responseTime}
                          color="bg-cyan-500"
                        />
                        <div className="flex items-center justify-between text-sm pt-1 border-t">
                          <span className="font-medium">{t("total")}</span>
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
                        {t("connection")}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDetails.ipAddress && (
                          <div>
                            <span className="text-muted-foreground block text-xs">{t("ipAddress")}</span>
                            <span className="font-mono">{selectedDetails.ipAddress}</span>
                          </div>
                        )}
                        {selectedDetails.tlsVersion && (
                          <div>
                            <span className="text-muted-foreground block text-xs">{t("tlsVersion")}</span>
                            <span className="font-mono">{selectedDetails.tlsVersion}</span>
                          </div>
                        )}
                        {selectedDetails.certificateExpiry && (
                          <div>
                            <span className="text-muted-foreground block text-xs">{t("certificateExpires")}</span>
                            <span className="font-mono">
                              {t("in")} {formatCertExpiry(selectedDetails.certificateExpiry)}
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
                  {t("noDetailsAvailable")}
                </div>
              )}

              {/* Error details for failed checks */}
              {selectedCheck.status === "down" && selectedCheck.message && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-md p-3 text-sm break-words">
                  <span className="font-medium">{t("error")}: </span>
                  {selectedCheck.message}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Check Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteCheckTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteCheckDescription", {
                timestamp: checkToDelete ? formatDateTime(checkToDelete.checkedAt).date : "",
                time: checkToDelete ? formatDateTime(checkToDelete.checkedAt).time : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteCheckMutation.isPending}
            >
              {deleteCheckMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
