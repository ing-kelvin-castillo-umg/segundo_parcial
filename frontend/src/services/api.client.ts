import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    allowRefresh = true,
  ): Promise<ApiResponseDto<T>> {
    // El navegador solo llama al BFF de Next.js en su mismo origen.
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

      const data = await response.json();

      const isLoginOrRefresh = endpoint === "/api/auth/login" || endpoint === "/api/auth/refresh";
      if (response.status === 401 && allowRefresh && !isLoginOrRefresh && this.getRefreshToken()) {
        await this.refreshAccessToken();
        return this.request<T>(endpoint, options, false);
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

  static async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.expireSession();
        throw new Error("No existe un refresh token activo");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponseDto<AuthResponseDto>;

      if (!response.ok || !payload.data?.token || !payload.data?.refreshToken) {
        this.expireSession();
        throw new Error(payload.message || "No fue posible renovar la sesión");
      }

      localStorage.setItem("token", payload.data.token);
      localStorage.setItem("refreshToken", payload.data.refreshToken);
      window.dispatchEvent(new CustomEvent("auth:session-refreshed", { detail: payload.data.token }));
      console.info("[AUTH] Token JWT renovado correctamente mediante /api/auth/refresh");
      return payload.data.token;
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private static getRefreshToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
  }

  private static expireSession(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:session-expired"));
    window.location.assign("/login?reason=session-expired");
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
