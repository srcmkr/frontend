import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Settings page.
 * Matches the tabbed settings layout with form content areas.
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Settings Card with Tabs */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { width: "w-28" },
              { width: "w-32" },
              { width: "w-20" },
              { width: "w-16" },
              { width: "w-20" },
              { width: "w-32" },
              { width: "w-24" },
            ].map((tab, i) => (
              <Skeleton
                key={i}
                className={`h-9 ${tab.width} rounded-md shrink-0`}
              />
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 space-y-8">
          {/* Section 1: Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t" />

          {/* Section 2: Table/List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              {/* Table Header */}
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>

              {/* Table Rows */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center gap-4 border-t"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t" />

          {/* Section 3: Additional Settings */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />

            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
