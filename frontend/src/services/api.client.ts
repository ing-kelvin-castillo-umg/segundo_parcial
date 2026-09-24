import type { ApiResponseDto, RefreshResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static clearSessionAndRedirect(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  private static async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        const data = await response.json() as ApiResponseDto<RefreshResponseDto>;

        if (!response.ok || !data.data?.token) {
          throw new Error(data.message || "No fue posible renovar la sesión");
        }

        localStorage.setItem("token", data.data.token);
        return data.data.token;
      })().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    allowRefresh = true,
  ): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
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
        credentials: "same-origin",
      });

      const isAuthRequest = url === "/api/auth/login" || url === "/api/auth/refresh";
      if (response.status === 401 && allowRefresh && !isAuthRequest) {
        try {
          await this.refreshAccessToken();
          return this.request<T>(endpoint, options, false);
        } catch (refreshError) {
          this.clearSessionAndRedirect();
          throw refreshError;
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
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static patch<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
