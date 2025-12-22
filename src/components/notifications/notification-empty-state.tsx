"use client";

import { BellOff } from "lucide-react";

interface NotificationEmptyStateProps {
  hasFilters: boolean;
}

export function NotificationEmptyState({
  hasFilters,
}: NotificationEmptyStateProps) {
  return (
    <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <BellOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {hasFilters ? "Keine Treffer" : "Keine Benachrichtigungen"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {hasFilters
          ? "Es wurden keine Benachrichtigungen gefunden, die deinen Filterkriterien entsprechen."
          : "Es gibt keine neuen Systemereignisse. Benachrichtigungen erscheinen hier, wenn Monitore ihren Status ändern oder Incidents erstellt werden."}
      </p>
    </div>
  );
}
