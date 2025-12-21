"use client";

import {
  ChevronDown,
  ChevronLeft,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Lock,
  Calendar,
  Layers,
  Activity,
  Network,
  Megaphone,
  Wrench,
} from "lucide-react";
import { useState } from "react";
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
import type { StatusPage } from "@/types";

interface StatusPageDetailHeaderProps {
  statusPage: StatusPage;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

interface StatItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

function StatItem({ label, value, icon, className }: StatItemProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusPageDetailHeader({
  statusPage,
  onBack,
  onEdit,
  onDelete,
  onPreview,
}: StatusPageDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const relativePath = `/status/${statusPage.slug}`;
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${relativePath}`
      : relativePath;

  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mobile back button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="lg:hidden -ml-2 mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      )}

      {/* Title row with actions */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold">{statusPage.title}</h2>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              Aktionen
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPreview}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Vorschau öffnen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Slug with copy button */}
      <div className="flex items-center gap-2">
        <code className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
          {fullUrl}
        </code>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleCopySlug}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Badge
          variant={statusPage.isPublic ? "default" : "secondary"}
          className={cn(
            statusPage.isPublic
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}
        >
          {statusPage.isPublic ? (
            <>
              <Globe className="h-3 w-3 mr-1" />
              Öffentlich
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Privat
            </>
          )}
        </Badge>
        {statusPage.passwordProtection && (
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <Lock className="h-3 w-3 mr-1" />
            Passwortgeschützt
          </Badge>
        )}
        {statusPage.ipWhitelistEnabled && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            <Network className="h-3 w-3 mr-1" />
            IP-Whitelist ({statusPage.ipWhitelist.length})
          </Badge>
        )}
        {statusPage.showUptimeHistory && (
          <Badge variant="outline" className="text-xs">
            Uptime ({statusPage.uptimeHistoryDays} Tage)
          </Badge>
        )}
        {statusPage.showIncidents && (
          <Badge variant="outline" className="text-xs">
            Incidents ({statusPage.incidentHistoryDays} Tage)
          </Badge>
        )}
        {statusPage.announcements.filter(a => a.enabled).length > 0 && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
            <Megaphone className="h-3 w-3 mr-1" />
            {statusPage.announcements.filter(a => a.enabled).length} Ankündigung{statusPage.announcements.filter(a => a.enabled).length !== 1 ? "en" : ""}
          </Badge>
        )}
        {statusPage.scheduledMaintenances.filter(m => m.status === "scheduled" || m.status === "in_progress").length > 0 && (
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
            <Wrench className="h-3 w-3 mr-1" />
            {statusPage.scheduledMaintenances.filter(m => m.status === "scheduled" || m.status === "in_progress").length} Wartung{statusPage.scheduledMaintenances.filter(m => m.status === "scheduled" || m.status === "in_progress").length !== 1 ? "en" : ""}
          </Badge>
        )}
      </div>

      {/* Description */}
      {statusPage.description && (
        <p className="text-sm text-muted-foreground">{statusPage.description}</p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-2 border-t">
        <StatItem
          label="Monitors"
          value={statusPage.monitors.length.toString()}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatItem
          label="Gruppen"
          value={statusPage.groups.length.toString()}
          icon={<Layers className="h-4 w-4" />}
        />
        <StatItem
          label="Erstellt"
          value={formatDate(statusPage.createdAt)}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatItem
          label="Aktualisiert"
          value={formatDate(statusPage.updatedAt)}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
