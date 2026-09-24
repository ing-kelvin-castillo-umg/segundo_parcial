import { ApiResponseDto } from "@/dtos/auth.dto";

// El navegador solo habla con Next.js: las rutas /api/... las atiende el BFF (src/app/api/[...path]/route.ts),
// que es quien conoce y contacta al backend. Por eso la base es relativa (mismo origen).
const API_BASE_URL = "";

// Evento global que avisa al AuthContext que la sesión ya no se puede renovar.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// Endpoints de sesión que nunca deben disparar un refresh automático (evita bucles).
const NO_REFRESH_ENDPOINTS = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"];

/**
 * Cliente HTTP del navegador.
 *
 * Los tokens viajan en cookies httpOnly manejadas por el BFF, así que aquí no se lee ni se envía
 * ningún token. Política de renovación: si una petición responde 401 (access token expirado),
 * se llama una sola vez a /api/auth/refresh y se reintenta la petición original. Si el refresh
 * también falla (refresh token expirado o revocado) se emite SESSION_EXPIRED_EVENT.
 */
export class ApiClient {
  // Refresh en curso compartido: si varias peticiones reciben 401 a la vez, se renueva una sola vez.
  private static refreshPromise: Promise<boolean> | null = null;

  static refreshSession(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        console.log("[AUTH] 🔄 Solicitando nuevo access token → POST /api/auth/refresh");
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { Accept: "application/json" },
          });
          if (!response.ok) {
            console.warn(`[AUTH] ❌ Refresh rechazado (${response.status}): refresh token expirado o revocado`);
            return false;
          }
          const body = await response.json();
          console.log(
            `[AUTH] ✅ Token renovado a las ${new Date().toLocaleTimeString()} — nuevo access token válido por ${
              (body?.data?.expiresIn ?? 0) / 1000
            }s (refresh token rotado)`
          );
          return true;
        } catch (error: any) {
          console.error("[AUTH] ❌ Error de red al renovar el token:", error.message);
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<ApiResponseDto<T>> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;
    const method = options.method || "GET";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const canRefresh = !isRetry && !NO_REFRESH_ENDPOINTS.includes(path.split("?")[0]);
      if (response.status === 401 && canRefresh) {
        console.warn(`[AUTH] ⚠️ 401 en ${method} ${path} → access token expirado`);
        const refreshed = await this.refreshSession();
        if (refreshed) {
          console.log(`[AUTH] 🔁 Reintentando ${method} ${path} con el nuevo token`);
          return this.request<T>(endpoint, options, true);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }
        throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${method} ${url}:`, error.message);
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
