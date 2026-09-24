import { ApiResponseDto, RefreshTokenResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "";

export class ApiClient {
  private static isRefreshing = false;
  private static refreshSubscribers: ((token: string) => void)[] = [];

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

  private static setToken(token: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  private static onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private static addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private static async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.addRefreshSubscriber(() => resolve(true));
      });
    }

    this.isRefreshing = true;
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.isRefreshing = false;
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = (await response.json()) as ApiResponseDto<RefreshTokenResponseDto>;
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        this.setToken(accessToken, newRefreshToken);
        this.onRefreshed(accessToken);
        this.isRefreshing = false;
        return true;
      } else {
        // Refresh token is invalid or expired, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login?redirect=expired";
        }
        this.isRefreshing = false;
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login?redirect=error";
      }
      this.isRefreshing = false;
      return false;
    }
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
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
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If we get a 401, try to refresh the token
      if (response.status === 401 && !url.includes("/auth/")) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with the new token
          const newToken = this.getToken();
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          }
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
