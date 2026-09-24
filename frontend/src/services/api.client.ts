import { ApiResponseDto } from "@/dtos/auth.dto";

const AUTH_ENDPOINTS_WITHOUT_REFRESH = new Set([
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

let refreshPromise: Promise<boolean> | null = null;
let sessionGeneration = 0;

export class ApiClient {
  private static async refreshSession(): Promise<boolean> {
    if (!refreshPromise) {
      refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      })
        .then((response) => {
          if (response.ok) {
            sessionGeneration += 1;
            return true;
          }
          return false;
        })
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  }

  private static redirectAfterSessionExpiration(): void {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
      window.location.assign("/login");
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    hasRetried = false,
    generationAtStart = sessionGeneration,
  ): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
    });

    if (response.status === 401 && !hasRetried && !AUTH_ENDPOINTS_WITHOUT_REFRESH.has(url.split("?")[0])) {
      const refreshed = generationAtStart !== sessionGeneration ? true : await this.refreshSession();

      if (refreshed) {
        return this.request<T>(endpoint, options, true, sessionGeneration);
      }

      this.redirectAfterSessionExpiration();
    }

    const responseText = await response.text();
    let data: unknown = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText) as unknown;
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : `Error HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!responseText) {
      return { success: true, message: "", data: undefined as T };
    }

    return data as ApiResponseDto<T>;
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body?: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
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
