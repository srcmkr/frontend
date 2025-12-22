"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverallStatus } from "@/lib/public-status-utils";
import { getStatusDisplayInfo, formatRelativeTime } from "@/lib/public-status-utils";

interface PublicStatusHeaderProps {
  title: string;
  description: string;
  logo?: string;
  primaryColor?: string;
  overallStatus: OverallStatus;
  lastUpdated: string;
}

const statusIcons = {
  operational: CheckCircle2,
  partial_outage: AlertTriangle,
  major_outage: XCircle,
  maintenance: Wrench,
};

export function PublicStatusHeader({
  title,
  description,
  logo,
  overallStatus,
  lastUpdated,
}: PublicStatusHeaderProps) {
  const t = useTranslations("publicStatus");
  const statusInfo = getStatusDisplayInfo(overallStatus);
  const StatusIcon = statusIcons[overallStatus];

  return (
    <div className="space-y-4">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        {logo && (
          <img
            src={logo}
            alt={`${title} Logo`}
            className="h-10 w-10 object-contain rounded-lg"
          />
        )}
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Overall Status Banner */}
      <div
        className={cn(
          "rounded-lg border p-4",
          statusInfo.bgLight,
          statusInfo.borderColor
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              statusInfo.bgColor
            )}
          >
            <StatusIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className={cn("text-lg font-semibold", statusInfo.textColor)}>
              {statusInfo.labelDe}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("lastUpdated", { time: formatRelativeTime(lastUpdated, "de") })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
