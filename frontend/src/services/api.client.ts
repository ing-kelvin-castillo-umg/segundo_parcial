import { ApiResponseDto } from "@/dtos/auth.dto";

// Las solicitudes del navegador pasan por los Route Handlers de Next.js.
// La dirección del backend solo existe dentro de la red de Docker.
const API_BASE_URL = "";

export class ApiClient {
  private static refreshRequest: Promise<boolean> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, retried = false): Promise<ApiResponseDto<T>> {
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

      const data = await response.json();

      if (response.status === 401 && !retried && endpoint !== "/api/auth/refresh" && endpoint !== "/api/auth/login") {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
      }

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

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  private static async refreshAccessToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (!this.refreshRequest) {
      this.refreshRequest = this.requestRefreshToken().finally(() => {
        this.refreshRequest = null;
      });
    }
    return this.refreshRequest;
  }

  private static async requestRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      this.endExpiredSession();
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const payload = (await response.json()) as ApiResponseDto<{ token: string; refreshToken: string }>;
      if (!response.ok || !payload.success || !payload.data?.token || !payload.data?.refreshToken) {
        this.endExpiredSession();
        return false;
      }

      localStorage.setItem("token", payload.data.token);
      localStorage.setItem("refreshToken", payload.data.refreshToken);
      return true;
    } catch {
      this.endExpiredSession();
      return false;
    }
  }

  private static endExpiredSession(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.assign("/login?reason=session-expired");
  }
}
