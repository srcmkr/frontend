"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { SetupGuard } from "@/components/providers/SetupGuard";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SetupGuard>
        {children}
      </SetupGuard>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
