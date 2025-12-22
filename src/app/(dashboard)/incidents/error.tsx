"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function IncidentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Incidents error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <ErrorState
        title="Fehler beim Laden der Incidents"
        message={error.message || "Die Incident-Daten konnten nicht geladen werden."}
        onRetry={reset}
      />
    </div>
  );
}
