import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Incidents page.
 * Matches the IncidentSplitView layout with list panel (left) and detail panel (right).
 */
export default function IncidentsLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Split View Container */}
      <div className="flex h-[calc(100vh-220px)] min-h-[400px] gap-4">
        {/* Left Panel - Incident List */}
        <div className="w-full lg:w-[400px] lg:shrink-0 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col">
          {/* Search Header */}
          <div className="p-3 space-y-2 border-b">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Incident List Items */}
          <div className="flex-1 overflow-hidden p-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border space-y-2"
              >
                {/* Title Row */}
                <div className="flex items-start gap-2">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-5 flex-1" />
                </div>

                {/* Meta Row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Cause Preview */}
                <Skeleton className="h-3 w-3/4" />
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

        {/* Right Panel - Incident Detail */}
        <div className="flex-1 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 hidden lg:flex flex-col">
          {/* Detail Header */}
          <div className="p-4 border-b space-y-4">
            {/* Title */}
            <Skeleton className="h-7 w-64" />

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Time Info Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden p-4 space-y-6">
            {/* Affected Services */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Cause */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Timeline */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Timeline Items */}
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
