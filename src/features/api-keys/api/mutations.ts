import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiKey, deleteApiKey } from "./api-key-api";
import { apiKeyKeys } from "./queries";
import type { CreateApiKeyRequest } from "@/types";

/**
 * Hook to create a new API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

/**
 * Hook to delete an API key
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}
