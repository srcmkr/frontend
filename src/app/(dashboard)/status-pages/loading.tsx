import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Status Pages page.
 * Matches the StatusPageSplitView layout with list panel (left) and detail panel (right).
 */
export default function StatusPagesLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Split View Container */}
      <div className="flex h-[calc(100vh-220px)] min-h-[400px] gap-4">
        {/* Left Panel - Status Page List */}
        <div className="w-full lg:w-[400px] lg:shrink-0 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col">
          {/* Search Header */}
          <div className="p-3 space-y-2 border-b">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Status Page List Items */}
          <div className="flex-1 overflow-hidden p-2 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border space-y-2"
              >
                {/* Title Row */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>

                {/* Slug */}
                <Skeleton className="h-4 w-32" />

                {/* Meta Row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 p-2 border-t">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Right Panel - Status Page Detail */}
        <div className="flex-1 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 hidden lg:flex flex-col">
          {/* Detail Header */}
          <div className="p-4 border-b space-y-4">
            {/* Title and Actions */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            {/* Groups & Monitors Card */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-4 border-b">
                <Skeleton className="h-5 w-36" />
              </div>

              {/* Group Items */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b last:border-b-0">
                  {/* Group Header */}
                  <div className="p-3 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Monitor Items */}
                  <div className="px-3 py-2 space-y-2">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2 pl-6">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Customizations Card */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
