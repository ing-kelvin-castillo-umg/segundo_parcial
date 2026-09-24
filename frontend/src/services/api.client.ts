import { ApiResponseDto } from "@/dtos/auth.dto";

// Keep browser requests relative so they always pass through Next.js' BFF.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const REFRESH_ENDPOINT = "/api/auth/refresh";
const LOGIN_ENDPOINT = "/api/auth/login";
const LOGOUT_ENDPOINT = "/api/auth/logout";

interface ApiRequestOptions extends RequestInit {
  _retry?: boolean;
}

interface RefreshResponse {
  token: string;
  refreshToken?: string;
}

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private static refreshPromise: Promise<string | null> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  private static clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:logout"));
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private static async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const payload = (await response.json()) as ApiResponseDto<RefreshResponse> | RefreshResponse;
      const data = "data" in payload ? payload.data : payload;
      if (!data?.token) return null;

      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: data.token }));
      return data.token;
    } catch {
      return null;
    }
  }

  static async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();
    const { _retry = false, ...requestOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(requestOptions.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (
        response.status === 401 &&
        !_retry &&
        endpoint !== REFRESH_ENDPOINT &&
        endpoint !== LOGIN_ENDPOINT &&
        endpoint !== LOGOUT_ENDPOINT
      ) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.request<T>(endpoint, { ...options, _retry: true });
        }

        this.clearSession();
      }

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMsg, response.status);
      }

      return data as ApiResponseDto<T>;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error(`[API ERROR] ${requestOptions.method || "GET"} ${url}:`, message);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
