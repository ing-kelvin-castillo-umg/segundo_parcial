import { ApiResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "";

let refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null;

async function refreshAccessToken(): Promise<{ token: string; refreshToken: string }> {
  if (!refreshPromise) {
    const { AuthService } = await import("./auth.service");
    refreshPromise = AuthService.refresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !isRetry && !endpoint.includes("/api/auth/")) {
        try {
          await refreshAccessToken();
          return this.request<T>(endpoint, options, true);
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login?reason=session_expired";
          }
          throw new Error("Sesión expirada");
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, error.message);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  }

  static put<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
