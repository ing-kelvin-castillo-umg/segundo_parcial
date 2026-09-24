import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "";

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

  private static clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  private static redirectToLogin(): void {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  private static persistAuthResponse(auth: AuthResponseDto): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("token", auth.token);
    if (auth.refreshToken) {
      localStorage.setItem("refreshToken", auth.refreshToken);
    }
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: auth.username,
        fullName: auth.fullName || auth.username,
        email: auth.email,
        roles: auth.roles || [],
        enabled: true,
      }),
    );
  }

  private static async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      this.redirectToLogin();
      throw new Error("La sesion expiro. Inicia sesion nuevamente.");
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await response.json()) as ApiResponseDto<AuthResponseDto>;
    if (!response.ok) {
      this.clearSession();
      this.redirectToLogin();
      throw new Error(data?.message || "No fue posible renovar la sesion.");
    }

    this.persistAuthResponse(data.data);
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, allowRefresh = true): Promise<ApiResponseDto<T>> {
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

      if (response.status === 401 && allowRefresh && endpoint !== "/api/auth/refresh") {
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
