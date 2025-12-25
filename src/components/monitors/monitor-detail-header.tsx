"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronLeft,
  Pencil,
  Pause,
  Play,
  Trash2,
  FileBarChart,
  Clock,
  Zap,
  Globe,
  Shield,
  AlertTriangle,
  Target,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { formatResponseTime, formatLastCheck } from "@/lib/format-utils";
import { useMonitorDetailedStats } from "@/features/monitors/api/queries";
import type { Monitor, MonitorDetailedStats } from "@/types";

interface MonitorDetailHeaderProps {
  monitor: Monitor;
  onBack?: () => void;
  onEdit?: () => void;
  onTogglePause?: () => void;
  onDelete?: () => void;
  onGenerateReport?: () => void;
}

interface StatItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  warning?: boolean;
  className?: string;
}

function StatItem({ label, value, icon, warning, className }: StatItemProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon && (
        <span className={cn("text-muted-foreground", warning && "text-yellow-600")}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={cn(
          "text-sm font-medium font-mono truncate",
          warning && "text-yellow-600"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function MonitorDetailHeader({
  monitor,
  onBack,
  onEdit,
  onTogglePause,
  onDelete,
  onGenerateReport,
}: MonitorDetailHeaderProps) {
  const t = useTranslations("monitors.detail");
  const isPaused = monitor.status === "paused";

  // Fetch detailed stats from API endpoint GET /api/monitors/:id/stats
  const { data: statsData } = useMonitorDetailedStats(monitor.id);

  // Use real stats if available, otherwise use fallback values
  const stats = useMemo(
    () => ({
      lastCheck: statsData?.lastCheck || monitor.lastCheck || new Date().toISOString(),
      lastResponseTime: statsData?.lastResponseTime ?? 0,
      currentIpAddress: statsData?.currentIpAddress ?? null,
      certificateDaysLeft: statsData?.certificateDaysLeft ?? null,
      avgResponseTime24h: statsData?.avgResponseTime24h ?? 0,
      p95ResponseTime: statsData?.p95ResponseTime ?? 0,
      totalIncidents30d: statsData?.totalIncidents30d ?? 0,
      mttr: statsData?.mttr ?? 0,
    }),
    [monitor, statsData]
  );

  const certWarning = stats.certificateDaysLeft !== null && stats.certificateDaysLeft < 30;

  return (
    <div className="space-y-2">
      {/* Mobile back button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="lg:hidden -ml-2 mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
      )}

      {/* Title row with actions */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold">{monitor.name}</h2>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              {t("actions")}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTogglePause}>
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t("resume")}
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {t("pause")}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onGenerateReport}>
              <FileBarChart className="h-4 w-4 mr-2" />
              {t("generateReport")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* URL */}
      <p className="text-sm text-muted-foreground truncate">{monitor.url}</p>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <StatusBadge status={monitor.status} />
        <Badge variant="outline" className="uppercase text-xs">
          {monitor.type}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t("interval")}: {monitor.interval}s
        </span>
      </div>

      {/* SLA Requirements */}
      <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t">
        <StatItem
          label={t("slaTarget")}
          value={`${monitor.slaTarget}%`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatItem
          label={t("maxResponseTime")}
          value={`${monitor.maxResponseTime}ms`}
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      {/* Stats Grid - Row 1: Basic Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-2 border-t">
        <StatItem
          label={t("lastCheck")}
          value={formatLastCheck(stats.lastCheck)}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatItem
          label={t("responseTime")}
          value={formatResponseTime(stats.lastResponseTime)}
          icon={<Zap className="h-4 w-4" />}
        />
        <StatItem
          label={t("ipAddress")}
          value={stats.currentIpAddress || "-"}
          icon={<Globe className="h-4 w-4" />}
        />
        <StatItem
          label={t("certificate")}
          value={stats.certificateDaysLeft ? t("daysLeft", { days: stats.certificateDaysLeft }) : "-"}
          icon={certWarning ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          warning={certWarning}
        />
      </div>

      {/* Stats Grid - Row 2: Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <StatItem
          label={t("avgResponse24h")}
          value={`${stats.avgResponseTime24h}ms`}
        />
        <StatItem
          label={t("p95Response")}
          value={`${stats.p95ResponseTime}ms`}
        />
        <StatItem
          label={t("incidents30d")}
          value={stats.totalIncidents30d.toString()}
        />
        <StatItem
          label={t("mttr")}
          value={`${stats.mttr}min`}
        />
      </div>
    </div>
  );
}
