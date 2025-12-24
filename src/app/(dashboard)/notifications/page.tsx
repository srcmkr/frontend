"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NotificationList,
  NotificationFilters,
  NotificationEmptyState,
} from "@/components/notifications";
import { useNotifications } from "@/features/notifications/api/queries";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/features/notifications/api/mutations";
import type { NotificationFilterState } from "@/types";

const ITEMS_PER_PAGE = 10;

const defaultFilters: NotificationFilterState = {
  search: "",
  readStatus: "all",
  type: "all",
};

export default function NotificationsPage() {
  const t = useTranslations("notifications");

  // Fetch notifications
  const { data: notifications = [], isLoading } = useNotifications();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const [filters, setFilters] =
    useState<NotificationFilterState>(defaultFilters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Read status filter
      if (filters.readStatus === "unread" && n.read) return false;
      if (filters.readStatus === "read" && !n.read) return false;

      // Type filter
      if (filters.type !== "all") {
        if (filters.type === "monitor" && !n.type.startsWith("monitor_"))
          return false;
        if (filters.type === "incident" && !n.type.startsWith("incident_"))
          return false;
        if (
          filters.type === "maintenance" &&
          !n.type.startsWith("maintenance_")
        )
          return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [notifications, filters]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.readStatus !== "all" ||
      filters.type !== "all"
    );
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const showPagination = filteredNotifications.length > ITEMS_PER_PAGE;

  // Ensure currentPage is valid
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  if (validCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(validCurrentPage);
  }

  const paginatedNotifications = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, validCurrentPage]);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
    setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
            {unreadCount > 0 && (
              <span className="ml-2 text-primary font-medium">
                {t("unreadCount", { count: unreadCount })}
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            {t("markAllAsRead")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <NotificationFilters filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <NotificationEmptyState hasFilters={hasActiveFilters} />
      ) : (
        <>
          <NotificationList
            notifications={paginatedNotifications}
            expandedId={expandedId}
            onExpandedIdChange={setExpandedId}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {t("pagination.pageOf", { current: validCurrentPage, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={validCurrentPage === totalPages}
              >
                {t("pagination.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
