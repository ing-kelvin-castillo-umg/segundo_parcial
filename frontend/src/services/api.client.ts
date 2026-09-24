import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string | null> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static isAuthEndpoint(endpoint: string): boolean {
    return endpoint.includes("/api/auth/login") || endpoint.includes("/api/auth/refresh");
  }

  private static isAccessTokenNearExpiry(token: string): boolean {
    try {
      const payload = token.split(".")[1];
      if (!payload) return true;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const claims = JSON.parse(window.atob(normalized));
      return typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now() + 30_000;
    } catch {
      return true;
    }
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (!response.ok) return null;

      const result = (await response.json()) as ApiResponseDto<AuthResponseDto>;
      if (!result.data?.token || !result.data.refreshToken) return null;

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      return result.data.token;
    })()
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private static expireSession(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  private static async send(url: string, options: RequestInit, token: string | null): Promise<Response> {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return fetch(url, { ...options, headers, cache: "no-store" });
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const authEndpoint = this.isAuthEndpoint(endpoint);

    try {
      let token = this.getToken();
      if (!authEndpoint && token && this.isAccessTokenNearExpiry(token)) {
        token = await this.refreshAccessToken();
        if (!token) {
          this.expireSession();
          throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        }
      }

      let response = await this.send(url, options, token);
      if (response.status === 401 && !authEndpoint) {
        token = await this.refreshAccessToken();
        if (!token) {
          this.expireSession();
          throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        }
        response = await this.send(url, options, token);
        if (response.status === 401) {
          this.expireSession();
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

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
