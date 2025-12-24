import { apiClient } from "@/lib/api-client";
import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from "@/types";

/**
 * Get all API keys for the current user
 */
export async function getAllApiKeys(): Promise<ApiKey[]> {
  return apiClient.get<ApiKey[]>("/api-keys");
}

/**
 * Create a new API key
 */
export async function createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  return apiClient.post<CreateApiKeyResponse>("/api-keys", data);
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id: string): Promise<void> {
  return apiClient.delete(`/api-keys/${id}`);
}
