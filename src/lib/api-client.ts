/**
 * API Client
 *
 * This client provides a unified interface for all API calls.
 * It makes HTTP requests to the backend API.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

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
    return this.status === 401; // Only 401 Unauthorized redirects to login, not 403 Forbidden
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

/**
 * Get auth token from cookie
 */
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
  return match ? match[1] : null;
}

/**
 * Core request function that handles API calls
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

  // Get auth token from cookie
  const authToken = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add Authorization header if token exists
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // API request
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
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

// =============================================================================
// System API Types & Methods
// =============================================================================

export interface SystemStatusDto {
  isInitialized: boolean;
  needsSetup: boolean;
  version: string;
}

export interface SetupRequest {
  // Admin Account
  email: string;
  password: string;
  fullName: string;

  // System Branding (optional)
  systemName?: string;
  logoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
}

/**
 * Get system initialization status
 */
export async function getSystemStatus(): Promise<SystemStatusDto> {
  return apiClient.get<SystemStatusDto>("/system/status");
}

/**
 * Login with email and password
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", request);
}

/**
 * Setup initial admin account and complete system initialization
 */
export async function setupAdmin(
  request: SetupRequest
): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/system/setup", request);
}
