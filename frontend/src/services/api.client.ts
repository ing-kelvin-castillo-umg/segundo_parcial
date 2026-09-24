import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "/api";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;

  private static getToken(): string | null {
    return typeof window === "undefined" ? null : localStorage.getItem("token");
  }

  private static expireSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiresAt");
    localStorage.removeItem("user");
    window.location.replace("/login?reason=expired");
  }

  static async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    const refreshToken = typeof window === "undefined" ? null : localStorage.getItem("refreshToken");
    if (!refreshToken) {
      this.expireSession();
      throw new Error("La sesión expiró. Inicia sesión nuevamente.");
    }

    const pending = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("No se pudo renovar la sesión");

        const payload = await response.json() as ApiResponseDto<AuthResponseDto>;
        if (!payload.data?.token || !payload.data?.refreshToken) {
          throw new Error("Respuesta de renovación inválida");
        }

        // A logout may have happened while the refresh request was in flight.
        if (localStorage.getItem("refreshToken") !== refreshToken) {
          const newerToken = localStorage.getItem("token");
          if (localStorage.getItem("refreshToken") && newerToken) return newerToken;
          throw new Error("La sesión cambió durante la renovación");
        }

        localStorage.setItem("token", payload.data.token);
        localStorage.setItem("refreshToken", payload.data.refreshToken);
        localStorage.setItem("accessTokenExpiresAt", String(Date.now() + payload.data.accessTokenExpiresInMs));
        window.dispatchEvent(new CustomEvent<string>("auth:token-refreshed", { detail: payload.data.token }));
        return payload.data.token;
      } catch (error) {
        if (localStorage.getItem("refreshToken") === refreshToken) {
          this.expireSession();
        }
        throw error;
      }
    })();

    this.refreshPromise = pending;
    try {
      return await pending;
    } finally {
      if (this.refreshPromise === pending) this.refreshPromise = null;
    }
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    try {
      let response = await fetch(url, { ...options, headers, cache: "no-store" });

      const mayRefresh = !endpoint.startsWith("/auth/login") && !endpoint.startsWith("/auth/refresh");
      const hasSession = typeof window !== "undefined" && !!localStorage.getItem("refreshToken");
      if (response.status === 401 && mayRefresh && hasSession) {
        const currentToken = this.getToken();
        const nextToken = currentToken && currentToken !== token
          ? currentToken
          : await this.refreshAccessToken();
        headers.set("Authorization", `Bearer ${nextToken}`);
        response = await fetch(url, { ...options, headers, cache: "no-store" });
        if (response.status === 401) this.expireSession();
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || `Error HTTP ${response.status}: ${response.statusText}`);
      }
      return data as ApiResponseDto<T>;
    } catch (error) {
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, error);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  }

  static put<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
