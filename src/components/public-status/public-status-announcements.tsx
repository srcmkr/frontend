"use client";

import { useTranslations } from "next-intl";
import { Info, AlertTriangle, Wrench, CheckCircle, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import type { StatusPageAnnouncement } from "@/types";

interface PublicStatusAnnouncementsProps {
  announcements: StatusPageAnnouncement[];
}

const announcementConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    titleColor: "text-blue-700 dark:text-blue-300",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700 dark:text-amber-300",
  },
  maintenance: {
    icon: Wrench,
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-500",
    titleColor: "text-orange-700 dark:text-orange-300",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-500",
    titleColor: "text-green-700 dark:text-green-300",
  },
};

export function PublicStatusAnnouncements({
  announcements,
}: PublicStatusAnnouncementsProps) {
  const t = useTranslations("publicStatus");
  const locale = useLocale();

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold">{t("announcements")}</h2>
      <div className="space-y-2">
        {announcements.map((announcement) => {
          const config = announcementConfig[announcement.type];
          const Icon = config.icon;

          return (
            <div
              key={announcement.id}
              className={cn(
                "rounded-lg border p-3",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-medium", config.titleColor)}>
                      {announcement.title}
                    </h3>
                    {announcement.pinned && (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                    {announcement.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    {new Date(announcement.createdAt).toLocaleDateString(locale, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
