"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <ErrorState
        title="Dashboard-Fehler"
        message={error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        onRetry={reset}
      />
    </div>
  );
}
