import { ApiResponseDto } from "@/dtos/auth.dto";
import { TokenManager } from "./token.manager";

// Todas las llamadas usan rutas relativas de Next.js (BFF); la URL del backend nunca llega al navegador.
const API_BASE_URL = "";

// Endpoints de autenticación: no llevan token ni disparan renovación automática.
const AUTH_ENDPOINTS = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"];

export class ApiClient {
  private static getToken(): string | null {
    return TokenManager.getToken();
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, retried = false): Promise<ApiResponseDto<T>> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => path.startsWith(e));

    let token = this.getToken();

    // Renovación preventiva: el access token ya venció o está por vencer.
    if (token && !isAuthEndpoint && TokenManager.isExpiring(token)) {
      const result = await TokenManager.refresh(token);
      // "expired": la sesión terminó (el dashboard redirige al login); la solicitud sigue sin token.
      token = result === "expired" ? null : this.getToken();
    }

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

      // Renovación reactiva: el backend rechazó el token por expirado. Se reintenta una sola vez.
      if (response.status === 401 && token && !isAuthEndpoint && !retried) {
        const expired = data?.code === "TOKEN_EXPIRED" || TokenManager.isExpiring(token);
        if (expired) {
          const result = await TokenManager.refresh(token);
          if (result === "refreshed") {
            return this.request<T>(endpoint, options, true);
          }
          if (result === "expired") {
            throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
          }
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
