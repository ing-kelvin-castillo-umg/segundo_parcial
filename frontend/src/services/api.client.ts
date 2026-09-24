import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

// The browser only communicates with Next.js route handlers. The handlers are
// responsible for reaching the internal Spring Boot service.
const API_BASE_URL = "";

export class ApiClient {
  private static refreshInFlight: Promise<string | null> | null = null;

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

      if (response.status === 401 && !retried && !endpoint.startsWith("/api/auth/")) {
        const renewedToken = await this.refreshAccessToken();
        if (renewedToken) {
          return this.request<T>(endpoint, options, true);
        }
      }

      const data = await this.parseResponse<T>(response);

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

  static async refreshSession(): Promise<AuthResponseDto> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!refreshToken) {
      throw new Error("La sesión ya no puede renovarse.");
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await this.parseResponse<AuthResponseDto>(response);

    if (!response.ok || !data.data?.token || !data.data?.refreshToken) {
      throw new Error(data?.message || "No fue posible renovar la sesión.");
    }

    return data.data;
  }

  static async logoutSession(): Promise<void> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    const token = this.getToken();

    if (!refreshToken) return;

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await this.parseResponse<null>(response);

    if (!response.ok) {
      throw new Error(data?.message || "No fue posible cerrar la sesión en el servidor.");
    }
  }

  static persistAuthResponse(auth: AuthResponseDto): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("token", auth.token);
    localStorage.setItem("refreshToken", auth.refreshToken);
    localStorage.setItem("accessTokenExpiresAt", String(auth.accessTokenExpiresAt));
    localStorage.setItem("user", JSON.stringify({
      username: auth.username,
      fullName: auth.fullName || auth.username,
      email: auth.email,
      roles: auth.roles || [],
      enabled: true,
    }));
  }

  static clearStoredSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiresAt");
    localStorage.removeItem("user");
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshSession()
        .then((auth) => {
          this.persistAuthResponse(auth);
          return auth.token;
        })
        .catch(() => {
          this.clearStoredSession();
          if (typeof window !== "undefined") {
            window.location.assign("/login?reason=session-expired");
          }
          return null;
        })
        .finally(() => {
          this.refreshInFlight = null;
        });
    }

    return this.refreshInFlight;
  }

  private static async parseResponse<T>(response: Response): Promise<ApiResponseDto<T>> {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<ApiResponseDto<T>>;
    }
    return { success: false, message: `Error HTTP ${response.status}: ${response.statusText}`, data: null as T };
  }
}
