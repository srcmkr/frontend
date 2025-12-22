"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface PublicStatusSkeletonProps {
  title: string;
  description?: string;
  logo?: string;
  groupCount?: number;
}

/**
 * Realistic skeleton for the public status page
 * Shows a believable loading state that doesn't reveal actual data
 */
export function PublicStatusSkeleton({
  title,
  description,
  logo,
  groupCount = 3,
}: PublicStatusSkeletonProps) {
  return (
    <div className="public-status-page min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header skeleton - shows real title but fake status */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              {logo ? (
                <div className="h-10 w-10 rounded-lg bg-muted" />
              ) : null}
              <div className="flex-1">
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fake status banner */}
          <div className="px-4 py-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Service groups skeleton */}
        <div className="space-y-3">
          {Array.from({ length: groupCount }).map((_, groupIndex) => (
            <div
              key={groupIndex}
              className="rounded-lg border bg-card overflow-hidden"
            >
              {/* Group header */}
              <div className="px-3 py-2 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
              </div>

              {/* Monitor rows */}
              <div className="divide-y">
                {Array.from({ length: 2 + (groupIndex % 2) }).map((_, monitorIndex) => (
                  <div
                    key={monitorIndex}
                    className="px-3 py-2.5 flex items-center gap-3"
                  >
                    {/* Status dot */}
                    <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />

                    {/* Monitor name */}
                    <Skeleton className="h-4 w-32" />

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Uptime bars (fake 90-day visualization) */}
                    <div className="hidden sm:flex gap-[1px]">
                      {Array.from({ length: 45 }).map((_, barIndex) => (
                        <Skeleton
                          key={barIndex}
                          className="w-[2px] h-3 rounded-[1px]"
                        />
                      ))}
                    </div>

                    {/* Mobile: fewer bars */}
                    <div className="flex sm:hidden gap-[1px]">
                      {Array.from({ length: 20 }).map((_, barIndex) => (
                        <Skeleton
                          key={barIndex}
                          className="w-[3px] h-3 rounded-[1px]"
                        />
                      ))}
                    </div>

                    {/* Uptime percentage */}
                    <Skeleton className="h-3 w-12 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Incident history skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="rounded-lg border bg-card p-5 text-center">
            <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-center py-4">
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
}
