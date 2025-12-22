import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Notifications page.
 * Matches the notification list layout with filters and paginated items.
 */
export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Notification List Container */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Notification Items */}
        <div className="divide-y">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-4 flex items-start gap-4"
            >
              {/* Icon */}
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-20 shrink-0" />
                </div>

                {/* Meta Row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* Expand Icon */}
              <Skeleton className="h-5 w-5 shrink-0" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 p-4 border-t">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}
