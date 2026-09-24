import { ApiResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string | null> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    try {
      let response = await this.send(path, options, this.getToken());

      if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/refresh" && this.getToken()) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) response = await this.send(path, options, refreshedToken);
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${options.method || "GET"} ${path}:`, error.message);
      throw error;
    }
  }

  private static send(path: string, options: RequestInit, token: string | null): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else headers.delete("Authorization");
    return fetch(path, { ...options, headers });
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return null;
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (!response.ok) throw new Error("Refresh token inválido o expirado");
          const result = await response.json();
          const auth = result.data;
          if (!auth?.token || !auth?.refreshToken) throw new Error("Respuesta de renovación inválida");
          localStorage.setItem("token", auth.token);
          localStorage.setItem("refreshToken", auth.refreshToken);
          return auth.token as string;
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/login") window.location.assign("/login");
          return null;
        }
      })().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
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
}
