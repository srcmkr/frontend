import {
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "./api-client";

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Handle auth errors globally
        if (error instanceof ApiError && error.isAuthError) {
          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }

        // Only show toast for queries that have already succeeded before
        // (background refetch failures)
        if (query.state.data !== undefined) {
          if (error instanceof ApiError) {
            toast.error(error.message);
          } else if (error instanceof Error) {
            toast.error(error.message);
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        // Handle auth errors globally
        if (error instanceof ApiError && error.isAuthError) {
          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000, // 10 seconds
        refetchInterval: 30 * 1000, // 30 seconds polling
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof ApiError) {
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  // Server-side: always create a new query client
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // Browser-side: reuse the same query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
