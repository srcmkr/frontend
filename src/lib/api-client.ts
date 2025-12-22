/**
 * API Client with Mock/Real switching
 *
 * This client provides a unified interface for all API calls.
 * In development, it routes requests through the mock adapter.
 * In production, it makes real HTTP requests to the backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

/**
 * Custom error class for API errors with status code and optional error code
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

/**
 * Core request function that handles both mock and real API calls
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, unknown> }
): Promise<T> {
  // Build URL with query params
  let url = endpoint;
  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Mock mode: delegate to mock adapter
  if (USE_MOCKS) {
    const { mockAdapter } = await import("./mock-adapter");
    return mockAdapter.handle<T>(url, options);
  }

  // Real API request
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.message ?? "Request failed",
      error.code
    );
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * API client with typed methods for all HTTP verbs
 */
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
