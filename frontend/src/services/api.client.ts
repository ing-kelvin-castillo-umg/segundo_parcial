import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "";
const REFRESH_ENDPOINT = "/api/auth/refresh";
const AUTH_ENDPOINTS = new Set(["/api/auth/login", REFRESH_ENDPOINT]);
const REFRESH_THRESHOLD_SECONDS = 10;

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  private static decodeJwtPayload(token: string): { exp?: number } | null {
    try {
      const payload = token.split(".")[1];
      const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(normalizedPayload));
    } catch {
      return null;
    }
  }

  private static isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const secondsUntilExpiration = payload.exp - Math.floor(Date.now() / 1000);
    return secondsUntilExpiration <= REFRESH_THRESHOLD_SECONDS;
  }

  private static saveAuthData(data: AuthResponseDto): void {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        fullName: data.fullName || data.username,
        email: data.email,
        roles: data.roles || [],
        enabled: true,
      })
    );
    window.dispatchEvent(new Event("auth-session-refreshed"));
  }

  private static clearAuthData(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-session-expired"));
  }

  private static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      this.clearAuthData();
      return null;
    }

    const authData = data.data as AuthResponseDto;
    this.saveAuthData(authData);
    console.info("[AUTH] Token JWT renovado correctamente mediante /api/auth/refresh");
    return authData.token;
  }

  private static async getValidToken(endpoint: string): Promise<string | null> {
    const token = this.getToken();
    if (!token || AUTH_ENDPOINTS.has(endpoint)) return token;

    if (this.isTokenExpiringSoon(token)) {
      return this.refreshAccessToken();
    }

    return token;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
  ): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = await this.getValidToken(endpoint);

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

      const data = await response.json().catch(() => null);

      if (response.status === 401 && retryOnUnauthorized && !AUTH_ENDPOINTS.has(endpoint)) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          return this.request<T>(endpoint, options, false);
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
}
