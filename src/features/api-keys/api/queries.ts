import { useQuery } from "@tanstack/react-query";
import { getAllApiKeys } from "./api-key-api";

/**
 * Query keys for API keys
 */
export const apiKeyKeys = {
  all: ["api-keys"] as const,
  lists: () => [...apiKeyKeys.all, "list"] as const,
  list: () => [...apiKeyKeys.lists()] as const,
};

/**
 * Hook to fetch all API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: getAllApiKeys,
  });
}
