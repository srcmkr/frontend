"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPageSplitView } from "@/components/status-pages/status-page-split-view";
import { useStatusPages } from "@/features/status-pages";
import { useMonitors } from "@/features/monitors";

export default function StatusPagesPage() {
  const t = useTranslations("statusPages");
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedPageId = searchParams.get("id");

  // Fetch status pages using React Query
  const {
    data: statusPages = [],
    isLoading: statusPagesLoading,
    error: statusPagesError,
  } = useStatusPages();

  // Fetch monitors (read-only, for display in detail panel)
  const { data: monitors = [] } = useMonitors();

  // Handle status page selection
  const handleSelectPage = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/status-pages?id=${id}`, { scroll: false });
      } else {
        router.push("/status-pages", { scroll: false });
      }
    },
    [router]
  );

  // Trigger create mode from header button
  const handleCreateClick = useCallback(() => {
    router.push("/status-pages?mode=create", { scroll: false });
  }, [router]);

  // Loading state
  if (statusPagesLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="flex h-[calc(100vh-220px)] min-h-[400px] gap-4">
          <Skeleton className="w-full lg:w-[400px] lg:shrink-0 rounded-2xl" />
          <Skeleton className="flex-1 rounded-2xl hidden lg:block" />
        </div>
      </div>
    );
  }

  // Error handling is done by error.tsx - throw to trigger error boundary
  if (statusPagesError) {
    throw statusPagesError;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="uppercase tracking-wide"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("createStatusPage")}
        </Button>
      </div>

      {/* Split View - mutations handled internally via hooks */}
      <StatusPageSplitView
        statusPages={statusPages}
        monitors={monitors}
        selectedPageId={selectedPageId}
        onSelectPage={handleSelectPage}
      />
    </div>
  );
}
