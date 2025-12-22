import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Monitors page.
 * Matches the MonitorSplitView layout with list panel (left) and detail panel (right).
 */
export default function MonitorsLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Split View Container */}
      <div className="flex h-[calc(100vh-220px)] min-h-[400px] gap-4">
        {/* Left Panel - Monitor List */}
        <div className="w-full lg:w-[400px] lg:shrink-0 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col">
          {/* Search Header */}
          <div className="p-3 space-y-2 border-b">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Tree Items */}
          <div className="flex-1 overflow-hidden p-2 space-y-1">
            {/* Group 1 */}
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-9 w-[calc(100%-1rem)] rounded-lg" />
              <Skeleton className="h-9 w-[calc(100%-1rem)] rounded-lg" />
            </div>

            {/* Group 2 */}
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-9 w-[calc(100%-1rem)] rounded-lg" />
              <Skeleton className="h-9 w-[calc(100%-1rem)] rounded-lg" />
              <Skeleton className="h-9 w-[calc(100%-1rem)] rounded-lg" />
            </div>

            {/* Ungrouped items */}
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Panel - Monitor Detail */}
        <div className="flex-1 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 hidden lg:flex flex-col">
          {/* Detail Header */}
          <div className="p-6 space-y-4 border-b">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* URL */}
            <Skeleton className="h-4 w-64" />

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>

            {/* Stats Grid 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden p-6 space-y-6">
            {/* Response Time Chart */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-[180px] w-full" />
            </div>

            {/* Uptime Stats */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-[2px]">
                {[...Array(24)].map((_, i) => (
                  <Skeleton key={i} className="h-8 flex-1 rounded-sm" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
