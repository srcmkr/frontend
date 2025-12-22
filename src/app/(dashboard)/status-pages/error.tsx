"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function StatusPagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Status pages error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <ErrorState
        title="Fehler beim Laden der Status-Seiten"
        message={error.message || "Die Status-Seiten konnten nicht geladen werden."}
        onRetry={reset}
      />
    </div>
  );
}
