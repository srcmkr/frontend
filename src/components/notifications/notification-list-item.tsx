"use client";

import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Wrench,
  Clock,
  Check,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IncidentSeverityBadge } from "@/components/incidents/incident-severity-badge";
import { formatLastCheck } from "@/lib/format-utils";
import type { SystemNotification, SystemNotificationType } from "@/types";

interface NotificationListItemProps {
  notification: SystemNotification;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const TYPE_CONFIG: Record<
  SystemNotificationType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  monitor_down: {
    icon: ArrowDownCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
  monitor_up: {
    icon: ArrowUpCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  incident_created: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
  incident_updated: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  incident_resolved: {
    icon: Check,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  maintenance_scheduled: {
    icon: Clock,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  maintenance_started: {
    icon: Wrench,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  maintenance_completed: {
    icon: Check,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
};

const TYPE_LABELS: Record<SystemNotificationType, string> = {
  monitor_down: "Monitor",
  monitor_up: "Monitor",
  incident_created: "Incident",
  incident_updated: "Incident",
  incident_resolved: "Incident",
  maintenance_scheduled: "Wartung",
  maintenance_started: "Wartung",
  maintenance_completed: "Wartung",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days} Tage`;
}

export function NotificationListItem({
  notification,
  isExpanded,
  onToggleExpand,
  onMarkAsRead,
  onDelete,
}: NotificationListItemProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  const handleNavigate = () => {
    if (notification.relatedMonitorId) {
      router.push(`/monitors?id=${notification.relatedMonitorId}`);
    } else if (notification.relatedIncidentId) {
      router.push(`/incidents?id=${notification.relatedIncidentId}`);
    }
    if (!notification.read) {
      onMarkAsRead();
    }
  };

  return (
    <div
      className={cn(
        "border-b last:border-b-0 transition-colors",
        !notification.read && "bg-primary/5 border-l-4 border-l-primary"
      )}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left p-4 hover:bg-accent/50 transition-colors flex items-start gap-3"
      >
        {/* Icon */}
        <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-sm leading-tight",
                !notification.read && "font-semibold"
              )}
            >
              {notification.title}
            </h4>
            {notification.severity && (
              <IncidentSeverityBadge
                severity={notification.severity}
                size="sm"
                showLabel={false}
              />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formatLastCheck(notification.timestamp)}</span>
            <span className="text-border">|</span>
            <span>{TYPE_LABELS[notification.type]}</span>
          </div>
        </div>

        {/* Expand indicator */}
        <div className="shrink-0 mt-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-14">
          <p className="text-sm text-muted-foreground mb-4">
            {notification.message}
          </p>

          {notification.metadata?.duration && (
            <p className="text-xs text-muted-foreground mb-4">
              Dauer: {formatDuration(notification.metadata.duration)}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {(notification.relatedMonitorId ||
              notification.relatedIncidentId) && (
              <Button size="sm" variant="outline" onClick={handleNavigate}>
                <ExternalLink className="h-3 w-3 mr-1" />
                {notification.relatedMonitorId
                  ? "Monitor ansehen"
                  : "Incident ansehen"}
              </Button>
            )}

            {!notification.read && (
              <Button size="sm" variant="ghost" onClick={onMarkAsRead}>
                <Check className="h-3 w-3 mr-1" />
                Als gelesen
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Löschen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
