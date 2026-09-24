import { ApiResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string | null> | null = null;
  private static sessionExpiredHandler: (() => void) | null = null;
  private static sessionExpired = false;

  static setSessionExpiredHandler(handler: (() => void) | null): void {
    this.sessionExpiredHandler = handler;
  }

  static resetSessionExpiration(): void {
    this.sessionExpired = false;
  }

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static async readResponse<T>(response: Response): Promise<ApiResponseDto<T> | undefined> {
    const responseText = await response.text();
    if (!responseText) return undefined;

    try {
      return JSON.parse(responseText) as ApiResponseDto<T>;
    } catch {
      return undefined;
    }
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          });
          const data = await this.readResponse<{ token: string }>(response);
          const token = response.ok ? data?.data?.token : null;

          if (token && typeof window !== "undefined") {
            localStorage.setItem("token", token);
          }
          return token || null;
        } catch {
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private static expireSession(): void {
    if (this.sessionExpired) return;
    this.sessionExpired = true;

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    this.sessionExpiredHandler?.();
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    hasRetried = false,
  ): Promise<ApiResponseDto<T>> {
    // The browser only calls the Next.js BFF on the current origin.
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
      });

      const data = await this.readResponse<T>(response);
      const isAuthenticationEndpoint = url.startsWith("/api/auth/login") || url.startsWith("/api/auth/refresh");

      if (response.status === 401 && !hasRetried && !isAuthenticationEndpoint) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          return this.request<T>(endpoint, options, true);
        }
        this.expireSession();
      }

      if (response.status === 401 && hasRetried && !isAuthenticationEndpoint) {
        this.expireSession();
      }

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Successful responses without a body (for example 204) are supported.
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
