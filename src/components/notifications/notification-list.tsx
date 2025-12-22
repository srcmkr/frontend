"use client";

import { NotificationListItem } from "./notification-list-item";
import type { SystemNotification } from "@/types";

interface NotificationListProps {
  notifications: SystemNotification[];
  expandedId: string | null;
  onExpandedIdChange: (id: string | null) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationList({
  notifications,
  expandedId,
  onExpandedIdChange,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  return (
    <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          notification={notification}
          isExpanded={expandedId === notification.id}
          onToggleExpand={() =>
            onExpandedIdChange(
              expandedId === notification.id ? null : notification.id
            )
          }
          onMarkAsRead={() => onMarkAsRead(notification.id)}
          onDelete={() => onDelete(notification.id)}
        />
      ))}
    </div>
  );
}
