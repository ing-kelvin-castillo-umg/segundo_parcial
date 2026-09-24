import { ApiResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = ""; // Empty string forces browser to use relative paths, triggering Next.js middleware (BFF)

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
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

      // Interceptor Logic for 401 Unauthorized
      if (response.status === 401 && !url.includes('/api/auth/refresh')) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          console.warn(`[Interceptado] 401 Unauthorized en ${url}. Intentando refrescar token...`);
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newToken = refreshData.data.token;
              const newRefreshToken = refreshData.data.refreshToken;
              
              localStorage.setItem("token", newToken);
              localStorage.setItem("refreshToken", newRefreshToken);
              
              console.log("✅ [Éxito] Token JWT refrescado. Reintentando la petición original...");
              
              // Actualizar el header y reintentar
              headers["Authorization"] = `Bearer ${newToken}`;
              response = await fetch(url, {
                ...options,
                headers,
              });
            } else {
              console.error("❌ [Fallo] Refresh token inválido o expirado. Redirigiendo a login...");
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
              throw new Error("Sesión expirada");
            }
          } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            throw err;
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
